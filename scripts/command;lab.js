const labCommandDictionary = [
    {
        command: 'gol',
        description: 'ライフゲームを生成します。',
        end: true,
        option: [
            {
                name: 'g',
                type: 'int',
                description: '生成する世代数を設定します。初期値は100です。'
            },
            {
                name: 's',
                type: 'int',
                description: '生成する速度（ミリ秒）を設定します。初期値は100です。'
            },
            {
                name: 'x',
                type: 'int',
                description: '空間の横幅を設定します。初期値は32です。'
            },
            {
                name: 'y',
                type: 'int',
                description: '空間の縦幅を設定します。初期値は32です。'
            },
            {
                name: 'r',
                type: 'int',
                description: '条件を確定する範囲（半径）を設定します。初期値は1です。'
            },
            {
                name: 'as',
                type: 'int',
                description: '生存条件に含まれるセルの最小値を設定します。初期値は3です。'
            },
            {
                name: 'ae',
                type: 'int',
                description: '生存条件に含まれるセルの最大値を設定します。初期値は4です。'
            },
            {
                name: 'bs',
                type: 'int',
                description: '誕生条件に含まれるセルの最小値を設定します。初期値は3です。'
            },
            {
                name: 'be',
                type: 'int',
                description: '誕生条件に含まれるセルの最大値を設定します。初期値は3です。'
            },
            {
                name: 'l',
                type: 'void',
                description: '断片的な空間に設定します。'
            },
            {
                name: 'p',
                type: 'void',
                description: '手動で再生します。'
            },
            {
                name: 'f',
                type: 'void',
                description: '画面から不要な要素を排除して（全画面で）再生します。'
            }
        ],
        random: {
            need: 0,
            description: [
                'シード値を指定します。'
            ]
        }
    }
];

function findLabCommand(command) {
    const commandDictionaries = [].concat(
        generalCommandDictionary,
        labCommandDictionary,
        roomCommandDictionary
    );

    const commandName = sliceCommandArray(command, 2).fixed[1];

    if (commandName != undefined && !findCommandName(commandName, commandDictionaries)) return commandName;

    const commandObject = normalizeCommandObject(command, commandDictionaries);

    switch (commandName) {
        case 'gol':
            generateGameOfLife(commandObject.option, commandObject.random.data);
            break;
        case 'help':
            putCommandList(commandObject.random.data, labCommandDictionary);
            break;
        case 'ret':
            returnDirectory(roomCommandDictionary);
            break;
        default:
            enterDirectory(commandObject.fixed.slice(0, 1), roomCommandDictionary);
            break;
    }

    return '';
}

// Function

function generateGameOfLife(optionObject, randomArray) {
    const generateNum = getCommandOption(optionObject, 'gol', 'g', labCommandDictionary);
    const speed = getCommandOption(optionObject, 'gol', 's', labCommandDictionary);
    const sizeX = getCommandOption(optionObject, 'gol', 'x', labCommandDictionary);
    const sizeY = getCommandOption(optionObject, 'gol', 'y', labCommandDictionary);
    const checkRadius = getCommandOption(optionObject, 'gol', 'r', labCommandDictionary);
    const aliveMinCells = getCommandOption(optionObject, 'gol', 'as', labCommandDictionary);
    const aliveMaxCells = getCommandOption(optionObject, 'gol', 'ae', labCommandDictionary);
    const bornMinCells = getCommandOption(optionObject, 'gol', 'bs', labCommandDictionary);
    const bornMaxCells = getCommandOption(optionObject, 'gol', 'be', labCommandDictionary);
    const isLimitedSpace = getCommandOption(optionObject, 'gol', 'l', labCommandDictionary);
    const isStep = getCommandOption(optionObject, 'gol', 'p', labCommandDictionary);
    const isFullScreen = getCommandOption(optionObject, 'gol', 'f', labCommandDictionary);

    clearInterval(intervalCommand);

    let property = {
        generateNum: 100,
        speed: 100,
        sizeX: 32,
        sizeY: 32,
        checkRadius: 1,
        aliveMinCells: 3,
        aliveMaxCells: 4,
        bornMinCells: 3,
        bornMaxCells: 3,
        isLimitedSpace: false,
    };

    let statistics = {
        generation: 0,
        aliveCells: 0,
        deadCells: 0
    };

    let cells = undefined;

    const fixValueRange = (val, mode, min, max) => {
        if (isNaN(val)) return undefined;

        if (mode < 0 || mode > 2) mode = 0;
        if (min > max) max = min;

        if (val < min && (mode == 0 || mode == 1)) {
            return min;
        } else if (val > max && (mode == 0 || mode == 2)) {
            return max;
        } else {
            return val;
        }
    };

    if (generateNum) {
        const buf = fixValueRange(generateNum, 1, -1, 0);

        property.generateNum = buf;

        if (buf == -1) speakOrvilium('生と死は循環するけれど、一方的な流れに逆らうことはできないよ。もしくは、永遠かな。', 1);
    }

    if (speed) {
        const buf = fixValueRange(speed, 1, 0, 0);

        property.speed = buf;

        if (speed != buf) speakOrvilium('ライフゲームの世代交代は不可逆だから、前の世代を求めることは至難の業だよ。', 1);
    }

    if (sizeX) {
        const buf = fixValueRange(sizeX, 1, 3, 0);

        property.sizeX = buf;

        if (sizeX != buf) speakOrvilium('天邪空間は現代にまだ存在しないよ。勝手ながら、横幅を3に設定したよ。', 1);
    }

    if (sizeY) {
        const buf = fixValueRange(sizeY, 1, 3, 0);

        property.sizeY = buf;

        if (sizeY != buf) speakOrvilium('天邪空間は現代にまだ存在しないよ。勝手ながら、縦幅を3に設定したよ。', 1);
    }

    if (checkRadius) {
        const size = property.sizeX < property.sizeY ? property.sizeX : property.sizeY;
        const buf = fixValueRange(checkRadius, 0, 1, size - 1);

        property.checkRadius = buf;

        if (checkRadius != buf) speakOrvilium(`条件範囲は狭すぎても広すぎても駄目だよ。勝手ながら、半径を${buf}に設定したよ。`, 1);
    }

    if (aliveMinCells || aliveMaxCells) {
        const radiusFill = Math.pow(1 + property.checkRadius * 2, 2);
        let bufA = fixValueRange(aliveMinCells, 0, 0, radiusFill);
        let bufB = fixValueRange(aliveMaxCells, 0, 0, radiusFill);
        let bufC = 0;

        if (bufA != undefined && bufB != undefined && bufA > bufB) {
            bufC = bufA;
            bufA = bufB;
            bufB = bufC;

            speakOrvilium('天邪空間は現代にまだ存在しないよ。勝手ながら、生存条件の最小値と最大値を入れ替えたよ。', 1);
        }

        if (bufA != undefined) {
            property.aliveMinCells = bufA;

            if (bufA != aliveMinCells) speakOrvilium(`生存条件の最小値は、範囲条件の半径が${property.checkRadius}だから、設定可能な値は0から${radiusFill}までだよ。`, 1);
        }

        if (bufB != undefined) {
            property.aliveMaxCells = bufB;

            if (bufB != aliveMaxCells) speakOrvilium(`生存条件の最大値は、範囲条件の半径が${property.checkRadius}だから、設定可能な値は0から${radiusFill}までだよ。`, 1);
        }
    }

    if (bornMinCells || bornMaxCells) {
        const radiusFill = Math.pow(1 + property.checkRadius * 2, 2);
        let bufA = fixValueRange(bornMinCells, 0, 0, radiusFill);
        let bufB = fixValueRange(bornMaxCells, 0, 0, radiusFill);
        let bufC = 0;

        if (bufA != undefined && bufB != undefined && bufA > bufB) {
            bufC = bufA;
            bufA = bufB;
            bufB = bufC;

            speakOrvilium('天邪空間は現代にまだ存在しないよ。勝手ながら、誕生条件の最小値と最大値を入れ替えたよ。', 1);
        }

        if (bufA != undefined) {
            property.bornMinCells = bufA;

            if (bufA != bornMinCells) speakOrvilium(`誕生条件の最小値は、範囲条件の半径が${property.checkRadius}だから、設定可能な値は0から${radiusFill}までだよ。`, 1);
        }

        if (bufB != undefined) {
            property.bornMaxCells = bufB;

            if (bufB != bornMaxCells) speakOrvilium(`誕生条件の最小値は、範囲条件の半径が${property.checkRadius}だから、設定可能な値は0から${radiusFill}までだよ。`, 1);
        }
    }

    if (isLimitedSpace != undefined) property.isLimitedSpace = isLimitedSpace;

    isStepMode = isStep != undefined;
    isFullScreenMode = isFullScreen != undefined;

    const displayCells = (cells, property, statistics) => {
        let res = '';

        for (let y = 0; y < property.sizeY; y++) {
            for (let x = 0; x < property.sizeX; x++) {
                res += cells[y][x] ? '■' : '□';
            }

            res += '\n';
        }

        if (isFullScreenMode) clearLog();

        speakOrvilium(res, 0);

        speakOrvilium(`世代：${statistics.generation}\n生存：${statistics.aliveCells}\n死滅：${statistics.deadCells}`, 0);

        if (!isFullScreenMode) displayElement.scrollTo(0, displayElement.scrollHeight);
    };

    const countDeadOrAlive = (cells, posX, posY, property) => {
        let life = 0;

        if (property.isLimitedSpace) {
            const sX = (posX < property.checkRadius ? 0 : posX - property.checkRadius);
            const eX = (posX >= property.sizeX - property.checkRadius ? property.sizeX - 1 : posX + property.checkRadius);
            const sY = (posY < property.checkRadius ? 0 : posY - property.checkRadius);
            const eY = (posY >= property.sizeY - property.checkRadius ? property.sizeY - 1 : posY + property.checkRadius);

            for (let y = sY; y <= eY; y++) {
                for (let x = sX; x <= eX; x++) {
                    if (cells[y][x]) life++;
                }
            }
        } else {
            const sX = (posX < property.checkRadius ? property.sizeX + posX - property.checkRadius : posX - property.checkRadius);
            const sY = (posY < property.checkRadius ? property.sizeY + posY - property.checkRadius : posY - property.checkRadius);

            for (let y = 0; y <= property.checkRadius * 2; y++) {
                const rY = y + sY - (y + sY < property.sizeY ? 0 : property.sizeY);

                for (let x = 0; x <= property.checkRadius * 2; x++) {
                    const rX = x + sX - (x + sX < property.sizeX ? 0 : property.sizeX);

                    if (cells[rY][rX]) life++;
                }
            }
        }

        return life;
    };

    const checkDeadOrAlive = (cells, posX, posY, property) => {
        const life = countDeadOrAlive(cells, posX, posY, property);

        if (cells[posY][posX]) {
            return life >= property.aliveMinCells && life <= property.aliveMaxCells;
        } else {
            return life >= property.bornMinCells && life <= property.bornMaxCells;
        }
    };

    const generateNextCells = (isInitial, cells, property, statistics) => {
        let res = [];

        for (let y = 0; y < property.sizeY; y++) {
            res.push([]);

            for (let x = 0; x < property.sizeX; x++) {
                res[y].push(null);
            }
        }

        statistics.aliveCells = 0;
        statistics.deadCells = 0;

        for (let y = 0; y < property.sizeY; y++) {
            for (let x = 0; x < property.sizeX; x++) {
                res[y][x] = isInitial ? xors.getNextInt(0, 1) : checkDeadOrAlive(cells, x, y, property);

                if (res[y][x]) {
                    statistics.aliveCells++;
                } else {
                    statistics.deadCells++;
                }
            }
        }

        statistics.generation++;

        return res;
    };

    const playGameOfLife = () => {
        if (property.generateNum >= 0 && statistics.generation >= property.generateNum) {
            stopIntervalCommand();
        } else {
            cells = generateNextCells(cells == undefined, cells, property, statistics);

            displayCells(cells, property, statistics);
        }
    };

    const stopGameOfLife = () => {
        speakOrvilium('ライフゲームの生成を終了したよ。', 0);
    };

    if (isStepMode) property.speed = 0;

    speakOrvilium(`ライフゲームの規則
        &nbsp;&nbsp;&nbsp;&nbsp;生成する世代数：${property.generateNum}世代
        &nbsp;&nbsp;&nbsp;&nbsp;生成する速度：${property.speed}ms
        &nbsp;&nbsp;&nbsp;&nbsp;空間のサイズ：${property.sizeX} * ${property.sizeY}セル
        &nbsp;&nbsp;&nbsp;&nbsp;空間の種類：${property.isLimitedSpace ? '断片的' : '連続的'}
        &nbsp;&nbsp;&nbsp;&nbsp;条件範囲・半径：${property.checkRadius}セル
        &nbsp;&nbsp;&nbsp;&nbsp;生存条件：${property.aliveMinCells} ~ ${property.aliveMaxCells}セル
        &nbsp;&nbsp;&nbsp;&nbsp;誕生条件：${property.bornMinCells} ~ ${property.bornMaxCells}セル
        &nbsp;&nbsp;&nbsp;&nbsp;再生方法：${isStepMode ? '手動再生' : '自動再生'}
        &nbsp;&nbsp;&nbsp;&nbsp;描画方法：${isFullScreenMode ? '全画面表示' : 'コンソール表示'}`, 0);

    speakOrvilium('ライフゲームの生成を開始するよ。', 0);

    if (randomArray.length != 0) {
        sha256(randomArray[0]).then((hash) => {
            xors.seedInitial(parseInt(hash, 16));

            startIntervalCommand(playGameOfLife, stopGameOfLife, property.speed);
        });
    } else {
        xors.seedInitial(parseInt(Math.random() * 1000000000));

        startIntervalCommand(playGameOfLife, stopGameOfLife, property.speed);
    }
}
