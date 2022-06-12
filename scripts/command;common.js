const generalCommandDictionary = [
    {
        command: 'help',
        description: 'コマンドの説明を一覧で表示します。',
        end: true,
        random: {
            need: 0,
            description: [
                'コマンドを指定します。'
            ]
        }
    },
    {
        command: 'ret',
        description: '部屋を退出します。',
        end: true
    }
];

const commonCommandDictionary = [
    {
        command: 'style',
        description: '画面のデザインを変更します。',
        end: true,
        option: [
            {
                name: 'n',
                type: 'bool',
                description: '名前の有無を指定します。'
            },
            {
                name: 's',
                type: 'int',
                description: 'フォントサイズを指定します。'
            },
            {
                name: 'c',
                type: 'bool',
                description: 'カラーの有無を指定します。'
            },
            {
                name: 'r',
                type: 'void',
                description: 'デザインを初期化します。'
            }
        ]
    },
    {
        command: 'echo',
        description: '文字列を返します。',
        end: true,
        option: [
            {
                name: 'r',
                type: 'int',
                description: '繰り返す回数を指定します。'
            }
        ],
        random: {
            need: 1,
            description: [
                '返す文字列を指定します。'
            ]
        }
    },
    {
        command: 'clear',
        description: 'ログを初期化します。',
        end: true
    },
    {
        command: 'his',
        description: 'コマンド履歴を表示します。',
        end: true,
        option: [
            {
                name: 'c',
                type: 'void',
                description: 'コマンド履歴を初期化します。'
            },
            {
                name: 's',
                type: 'int',
                description: 'n番目の履歴を表示します。'
            },
            {
                name: 'd',
                type: 'int',
                description: 'n番目の履歴を実行します。'
            },
            {
                name: 'r',
                type: 'int',
                description: 'n番目の履歴を削除します。'
            }
        ]
    }
];

const roomCommandDictionary = [
    {
        command: 'lab',
        name: '実験室',
        description: '部屋「実験室」にてコマンドを実行します。',
        end: false
    },
    {
        command: 'util',
        name: 'ユーティリティー',
        description: '部屋「ユーティリティー」にてコマンドを実行します。',
        end: false
    }
];

function findCommonCommand(command) {
    const commandDictionaries = [].concat(
        generalCommandDictionary,
        commonCommandDictionary,
        roomCommandDictionary
    );

    let commandObject = sliceCommandArray(command, commandDictionaries);

    const commandName = commandObject.fixed.slice(-1)[0] || commandObject.random.data.slice(-1)[0];

    if (commandObject.fixed.length == 0 || !findCommandName(commandName, commandDictionaries)) return commandName;

    commandObject = normalizeCommandObject(command, commandDictionaries);

    switch (commandName) {
        case 'style':
            customStyle(commandObject.option);
            break;
        case 'echo':
            echoText(commandObject.option, commandObject.random.data);
            break;
        case 'clear':
            clearLog();
            break;
        case 'his':
            operateHistory(commandObject.option);
            break;
        case 'help':
            putCommandList(commandObject.random.data, commandDictionaries);
            break;
        case 'ret':
            returnDirectory(undefined);
            break;
    }

    return '';
}

// Function

function echoText(optionObject, randomArray) {
    if (randomArray.length != 0) {
        const repeat = getCommandOption(optionObject, 'echo', 'r', commonCommandDictionary);

        if (repeat <= 0) speakOrvilium(`負の値を指定しても${65536 + repeat}や${4294967296 + repeat}にはならないよ。`, 1);

        for (let i = 0; ((!repeat || repeat <= 0) && i < 1) || (repeat > 0 && i < repeat); i++) speakOrvilium(randomArray[0], 0);
    } else {
        speakOrvilium('えーっと…虚無を呟くことは無理かな…。', 2);
    }
}

function customStyle(optionObject) {
    const name = getCommandOption(optionObject, 'style', 'n', commonCommandDictionary);
    const size = getCommandOption(optionObject, 'style', 's', commonCommandDictionary);
    const color = getCommandOption(optionObject, 'style', 'c', commonCommandDictionary);
    const reset = getCommandOption(optionObject, 'style', 'r', commonCommandDictionary);

    if (name == undefined && size == undefined && color == undefined && reset == undefined) {
        speakOrvilium('今のスタイルが丁度良いかな。', 1);
    } else {
        if (name != undefined) {
            if (name) {
                displayElement.classList.remove('hideName');

                speakOrvilium('名前を表示したよ。', 0);
            } else {
                displayElement.classList.add('hideName');

                speakOrvilium('名前を非表示にしたよ。', 0);
            }
        }

        if (size != undefined) {
            displayElement.style.fontSize = `${size}px`;

            speakOrvilium(`フォントサイズを${size}pxに変更したよ。`, 0);
        }

        if (color != undefined) {
            if (color) {
                displayElement.classList.remove('monoColor');

                speakOrvilium('画面に色を付けたよ。', 0);
            } else {
                displayElement.classList.add('monoColor');

                speakOrvilium('画面の色を抜いたよ。', 0);
            }
        }

        if (reset != undefined) {
            displayElement.classList.add('hideName');
            displayElement.style.fontSize = '16px';
            displayElement.classList.remove('monoColor');

            speakOrvilium('スタイルを初期化したよ。', 0);
        }
    }
}

function clearLog() {
    displayElement.innerHTML = '';
}

function operateHistory(optionObject) {
    const clearAllHistories = getCommandOption(optionObject, 'his', 'c', commonCommandDictionary);
    const showHistoryId = getCommandOption(optionObject, 'his', 's', commonCommandDictionary);
    const runHistoryId = getCommandOption(optionObject, 'his', 'd', commonCommandDictionary);
    const removeHistoryId = getCommandOption(optionObject, 'his', 'r', commonCommandDictionary);

    if (showHistoryId == undefined && runHistoryId == undefined && removeHistoryId == undefined && clearAllHistories == undefined) {
        showCommandHistories(false);
    } else {
        if (clearAllHistories != undefined) clearCommandHistories(false);
        if (showHistoryId != undefined) showCommandHistories(showHistoryId);
        if (runHistoryId != undefined) runCommandHistories(runHistoryId);
        if (removeHistoryId != undefined) clearCommandHistories(removeHistoryId);
    }
}
