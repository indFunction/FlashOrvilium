const displayElement = document.getElementById('orvilium');
const commandElement = document.getElementById('command');
const directoryElement = document.getElementById('directory');

let clockElement = undefined;

let currentDirectory = [];
let directInput = '';
let displayCache = undefined;
let intervalCommand = undefined;
let stopCommand = undefined;
let isFullScreenMode = false;
let isStepMode = false;

const tab = (indent) => '&nbsp'.repeat(indent);

commandElement.addEventListener('keydown', getCommand);

const typeList = [
    {
        id: 'string',
        name: '文字列'
    },
    {
        id: 'int',
        name: '整数'
    },
    {
        id: 'float',
        name: '数値'
    },
    {
        id: 'bool',
        name: '真偽'
    }
];

function getCommand(event) {
    switch (event.keyCode) {
        case 13:
            if (isStepMode) {
                intervalCommand();
            } else if (!event.shiftKey) {
                runCommand();
            }
            break;
        case 27:
            stopIntervalCommand();
            break;
        case 38:
            setCommandHistory(1);

            event.preventDefault();
            break;
        case 40:
            setCommandHistory(-1);

            event.preventDefault();
            break;
    }
}

function runCommand(specify) {
    if (isStepMode) {
        intervalCommand();

        return;
    }

    let command = [currentDirectory.join(' '), directInput, (specify || commandElement.value)].filter((item) => item != '').join(' ');
    const commandObject = sliceCommandArray(command, 1);

    if (command == '') return;

    addCommandHistories(specify || commandElement.value);
    deleteCommand();

    let commandName = commandObject.fixed[0];

    switch (commandName) {
        case 'lab':
            commandName = findLabCommand(command);
            break;
        case 'util':
            commandName = findUtilCommand(command);
            break;
    }

    if (commandName) commandName = findCommonCommand(command);

    if (commandName) {
        speakYou('<span class="arrow"></span>' + decorateCommandObject(commandObject));
        speakOrvilium(`残念だけれど、「${commandName}」というコマンドは分からないよ。\nコマンドが分からない場合は、「help」と言ってくれたら教えられるよ。`, 2);
    }

    displayElement.scrollTo(0, displayElement.scrollHeight);
}

function sliceCommandArray(command, argument) {
    const commandArray = identifyStringArray(command, /\x20/, ' ');

    let commandObject = {
        fixed: [],
        option: [],
        random: {
            use: false,
            need: 0,
            data: []
        }
    };

    let isEndCode = false;

    commandArray.map((itemA) => {
        if (itemA.startsWith('-')) {
            let option = {
                name: itemA.slice(1).split(':')[0],
                property: '',
                check: 2
            };

            if (itemA.indexOf(':') > -1) option.property = itemA.split(':')[1];

            commandObject.option.push(option);
        } else if (Number.isInteger(argument) && (argument < 0 || commandObject.fixed.length <= argument)) {
            commandObject.fixed.push(itemA);
        } else {
            if (!Number.isInteger(argument)) {
                const get = argument.find((itemB) => itemB.command == itemA);

                if (get != undefined && !isEndCode) {
                    commandObject.fixed.push(itemA);
                    isEndCode = get.end;

                    return;
                }
            }

            commandObject.random.data.push(itemA.replace(/\x20/g, '&nbsp;'));
        }
    });

    return commandObject;
}

function identifyStringArray(string, splitChar, joinChar) {
    if (splitChar == '"' || splitChar == `'`) return undefined;

    const array = string.split(splitChar);

    let res = [];
    let buf = '';
    let isSingleQuotation = false;

    array.map((item) => {
        if (buf == '') {
            if (item.startsWith('"') || item.startsWith(`'`)) {
                isSingleQuotation = item.startsWith(`'`);

                if ((!isSingleQuotation && item.endsWith('"')) || (isSingleQuotation && item.endsWith(`'`))) {
                    buf += joinChar + item;

                    res.push(isSingleQuotation ? buf.split(`'`)[1] : buf.split('"')[1]);
                } else {
                    buf = item;
                }
            } else {
                res.push(item);
            }
        } else {
            buf += joinChar + item;

            if ((!isSingleQuotation && item.endsWith('"')) || (isSingleQuotation && item.endsWith(`'`))) {
                res.push(isSingleQuotation ? buf.split(`'`)[1] : buf.split('"')[1]);

                buf = '';
            }
        }
    });

    return res;
}

function findCommandName(commandName, dictionaryObject) {
    return dictionaryObject.find((item) => item.command == commandName) != undefined;
}

function getCommandOption(optionObject, commandName, optionName, dictionaryObject) {
    const dictionaryItem = dictionaryObject.find((item) => item.command == commandName);
    if (dictionaryItem == undefined) return undefined;

    const optionItem = dictionaryItem.option.find((item) => item.name == optionName);
    if (dictionaryItem == undefined) return undefined;

    let res = undefined;

    if (optionObject && optionObject.length > 0) {
        const get = optionObject.find((item) => item.name == optionName);

        if (get != undefined) res = optionItem.type != 'void' ? get.property : true;
    }

    return res;
}

function normalizeCommandObject(command, dictionaryObject) {
    let commandObject = sliceCommandArray(command, dictionaryObject);

    const dictionaryItem = dictionaryObject.find((item) => item.command == commandObject.fixed.slice(-1)[0]);

    let warningLog = [];
    let errorLog = [];

    normalizeCommandOption(commandObject, dictionaryItem, warningLog, errorLog);
    normalizeCommandRandom(commandObject, dictionaryItem, warningLog, errorLog);

    speakYou('<span class="arrow"></span>' + decorateCommandObject(commandObject));

    warningLog.map((item) => speakOrvilium(item, 1));
    errorLog.map((item) => speakOrvilium(item, 2));

    commandObject.option = commandObject.option.filter((item) => item.check != 2);
    commandObject.random.data = commandObject.random.use ? commandObject.random.data : [];

    return commandObject;
}

function normalizeCommandOption(commandObject, dictionaryItem, warningLog, errorLog) {
    commandObject.option.map((itemA) => {
        const get = dictionaryItem.option ? dictionaryItem.option.find((itemB) => itemB.name == itemA.name) : undefined;
        const optionName = itemA.name;
        const optionProperty = itemA.property;

        if (get != undefined) {
            const optionType = get.type;

            if (optionType != 'void') {
                const optionTypeName = typeList.find((item) => item.id == optionType).name;

                if (optionProperty != '') {
                    let buf = undefined;
                    let isCorrectType = false;

                    switch (optionType) {
                        case 'string':
                            buf = optionProperty;
                            isCorrectType = true;
                            break;
                        case 'int':
                            buf = Number(optionProperty);
                            isCorrectType = Number.isInteger(buf);
                            break;
                        case 'float':
                            buf = Number(optionProperty);
                            isCorrectType = !isNaN(buf);
                            break;
                        case 'bool':
                            buf = ['true', 't', 'yes', 'y', '1'].includes(optionProperty) ? true : ['false', 'f', 'no', 'n', '0'].includes(optionProperty) ? false : null;
                            isCorrectType = buf != null;
                            break;
                    }

                    if (isCorrectType) {
                        itemA.property = buf;
                        itemA.check = 0;
                    } else {
                        errorLog.push(`オプション「${optionName}」に指定できるのは${optionTypeName}型の引数だよ。`);

                        itemA.check = 2;
                    }
                } else {
                    errorLog.push(`オプション「${optionName}」には${optionTypeName}型の引数が必要だよ。`);

                    itemA.check = 2;
                }
            } else {
                if (optionProperty == '') {
                    itemA.check = 0;
                } else {
                    warningLog.push(`オプション「「${optionName}」に引数は不要だよ。`);

                    itemA.check = 1;
                }
            }
        } else {
            errorLog.push(`「${optionName}」というオプションは分からないよ。`);

            itemA.check = 2;
        }

        return itemA;
    });
}

function normalizeCommandRandom(commandObject, dictionaryItem, warningLog, errorLog) {
    if (!dictionaryItem.random) {
        if (commandObject.random.data.length > 0) {
            commandObject.random.data = concatSurplusArray(commandObject.random.data, 1, ' ');

            warningLog.push('ランダムは使われないよ。');
        }

        return;
    } else {
        commandObject.random.use = true;
        commandObject.random.need = dictionaryItem.random.need;
    }

    const existLength = commandObject.random.data.length;
    const needLength = dictionaryItem.random.need;
    const useLength = dictionaryItem.random.description.length;

    if (existLength == needLength || existLength >= useLength) {
        commandObject.random.data = concatSurplusArray(commandObject.random.data, useLength, ' ');

        if (existLength != needLength && existLength != useLength) warningLog.push(`${useLength}項目以降のランダムは結合されたよ。`);
    } else {
        errorLog.push('ランダムの数が少ないよ。');
    }
}

function concatSurplusArray(array, length, splitChar) {
    if (array.length <= length) return array;

    let res = [];
    let buf = [];

    array.map((item, index) => {
        if (index < length - 1) {
            res.push(item);
        } else {
            buf.push(item);
        }
    });

    res.push(buf.join(splitChar));

    return res;
}

function enterDirectory(directoryArray, dictionaryObject) {
    let buf = [];

    directoryArray.map((itemA, index) => {
        const roomName = dictionaryObject.find((itemB) => itemB.command == itemA).name;

        buf.push(roomName);

        if (currentDirectory[index] != itemA) {
            speakOrvilium(`部屋「${roomName}」へ入室したよ。`, 0);
        } else {
            speakOrvilium('最終的に元の部屋に戻ったよ。', 1);
        }
    });

    currentDirectory = directoryArray;

    directoryElement.innerHTML = buf.join(' > ');
}

function returnDirectory(dictionaryObject) {
    if (dictionaryObject == undefined) {
        if (currentDirectory.length > 0) {
            currentDirectory = [];

            speakOrvilium('ロビーに戻ったよ。', 0);
        } else {
            speakOrvilium('既にロビーに居るよ。', 1);
        }
    } else {
        if (currentDirectory.length > 0) {
            const roomName = dictionaryObject.find((item) => item.command == currentDirectory.slice(-1)[0] && currentDirectory.pop()).name;

            speakOrvilium(`部屋「${roomName}」を退室したよ。`, 0);
        } else {
            speakOrvilium('最終的にロビーに戻ったよ。', 1);
        }
    }

    directoryElement.innerHTML = currentDirectory.length != 0 ? currentDirectory.join(' > ') : 'ロビー';
}

function startIntervalCommand(commandA, commandB, tick) {
    if (isFullScreenMode) cacheUpDisplay();

    intervalCommand = isStepMode ? commandA : setInterval(commandA, tick);
    stopCommand = commandB;
}

function stopIntervalCommand() {
    if (isStepMode) {
        intervalCommand = undefined;
        isStepMode = false;
    } else {
        clearInterval(intervalCommand);
    }

    if (isFullScreenMode) {
        cacheBackDisplay();

        isFullScreenMode = false;
    }

    if (stopCommand) {
        stopCommand();

        stopCommand = undefined;
    }

    displayElement.scrollTo(0, displayElement.scrollHeight);
}

function cacheUpDisplay() {
    if (displayCache == undefined) {
        displayCache = displayElement.innerHTML;

        displayElement.innerHTML = '';
    }
}

function cacheBackDisplay() {
    if (displayCache != undefined) {
        displayElement.innerHTML = displayCache;
        displayElement.scrollTo(0, displayElement.scrollHeight);

        displayCache = undefined;
    }
}
