const utilCommandDictionary = [
    {
        command: 'noise',
        description: '乱数を生成します。（文字列の詳細については <a href="https://tools.m-bsys.com/data/" target="_blank" rel="noreferrer">https://tools.m-bsys.com/data/</a> などを参考に！）',
        end: true,
        option: [
            {
                name: 'l',
                type: 'int',
                description: '乱数の長さを指定します。初期値は32です。'
            },
            {
                name: 'r',
                type: 'int',
                description: '生成する個数を指定します。初期値は1です。'
            },
            {
                name: 'a',
                type: 'void',
                description: '使用する文字パターンに小文字の英字（a - z）を追加します。'
            },
            {
                name: 'A',
                type: 'void',
                description: '使用する文字パターンに大文字の英字（A - Z）を追加します。'
            },
            {
                name: 'n',
                type: 'void',
                description: '使用する文字パターンに数字（0 - 9）を追加します。'
            },
            {
                name: 's',
                type: 'void',
                description: '使用する文字パターンに記号（! - /，: - @，[ - `，{ - ~）を追加します。'
            },
            {
                name: 'k',
                type: 'void',
                description: '使用する文字パターンに半角カナ（ｦ - ﾟ）を追加します。'
            },
            {
                name: 'K',
                type: 'void',
                description: '使用する文字パターンに全角カタカナ（ァ - ヶ）を追加します。'
            },
            {
                name: 'H',
                type: 'void',
                description: '使用する文字パターンに全角ひらがな（ぁ - ん）を追加します。'
            },
            {
                name: 'u',
                type: 'void',
                description: '文字パターンの重複を許可します。（確率が均一ではなくなります。）'
            },
            {
                name: 'e',
                type: 'void',
                description: '使用する文字パターンを出力します。'
            }
        ],
        random: {
            need: 0,
            description: [
                '使用する文字パターンを指定します。'
            ]
        }
    },
    {
        command: 'count',
        description: '文字列に対する文字数や行数などの統計情報を出力します。',
        end: true,
        option: [
            {
                name: 'nr',
                type: 'void',
                description: '改行を削除して処理を行います。'
            },
            {
                name: 'ns',
                type: 'void',
                description: '半角空白を削除して処理を行います。'
            },
            {
                name: 'nS',
                type: 'void',
                description: '全角空白を削除して処理を行います。'
            },
            {
                name: 'i',
                type: 'void',
                description: '詳細な情報を表示します。'
            },
            {
                name: 'r',
                type: 'int',
                description: '指定したバイト数で改行した際の行数を出力します。'
            },
            {
                name: 'R',
                type: 'int',
                description: '指定した文字数で改行した際の行数を出力します。'
            }
        ],
        random: {
            need: 1,
            description: [
                '使用する文字パターンを指定します。'
            ]
        }
    }
];

function findUtilCommand(command) {
    const commandDictionaries = [].concat(
        generalCommandDictionary,
        utilCommandDictionary,
        roomCommandDictionary
    );

    const commandName = sliceCommandArray(command, 2).fixed[1];

    if (commandName != undefined && !findCommandName(commandName, commandDictionaries)) return commandName;

    const commandObject = normalizeCommandObject(command, commandDictionaries);

    switch (commandName) {
        case 'noise':
            generateNoise(commandObject.option, commandObject.random.data);
            break;
        case 'count':
            countRandom(commandObject.option, commandObject.random.data);
            break;
        case 'help':
            putCommandList(commandObject.random.data, utilCommandDictionary);
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

function generateNoise(optionObject, randomArray) {
    const noiseLength = getCommandOption(optionObject, 'noise', 'l', utilCommandDictionary);
    const noiseRow = getCommandOption(optionObject, 'noise', 'r', utilCommandDictionary);
    const useLowerAlphabet = getCommandOption(optionObject, 'noise', 'a', utilCommandDictionary);
    const useUpperAlphabet = getCommandOption(optionObject, 'noise', 'A', utilCommandDictionary);
    const useNumber = getCommandOption(optionObject, 'noise', 'n', utilCommandDictionary);
    const useSymbol = getCommandOption(optionObject, 'noise', 's', utilCommandDictionary);
    const useKana = getCommandOption(optionObject, 'noise', 'k', utilCommandDictionary);
    const useKatakana = getCommandOption(optionObject, 'noise', 'K', utilCommandDictionary);
    const useHiragana = getCommandOption(optionObject, 'noise', 'H', utilCommandDictionary);
    const unevenness = getCommandOption(optionObject, 'noise', 'u', utilCommandDictionary);
    const exportRandomString = getCommandOption(optionObject, 'noise', 'e', utilCommandDictionary);

    let useRandomString = '';

    if (
        !useLowerAlphabet &&
        !useUpperAlphabet &&
        !useNumber &&
        !useSymbol &&
        !useKana &&
        !useKatakana &&
        !useHiragana &&
        randomArray.length == 0
    ) {
        useRandomString = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    } else {
        if (useLowerAlphabet) useRandomString += 'abcdefghijklmnopqrstuvwxyz';

        if (useUpperAlphabet) useRandomString += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        if (useNumber) useRandomString += '0123456789';

        if (useSymbol) useRandomString += '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

        if (useKana) useRandomString += 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ';

        if (useKatakana) useRandomString += 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ';

        if (useHiragana) useRandomString += 'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをん';
    }

    if (randomArray.length != 0) useRandomString += randomArray[0];

    if (!unevenness) useRandomString = [...new Set(useRandomString.split(''))].join('');

    if (!exportRandomString) {
        for (let i = 0; noiseRow ? i < noiseRow : i < 1; i++) {
            const noise = escapeHTML(generateRandomString(useRandomString, noiseLength ? noiseLength : 32));

            speakOrvilium(noise, 0);
        }
    } else {
        speakOrvilium(useRandomString, 0);
    }
}

function countRandom(optionObject, randomArray) {
    const noReturn = getCommandOption(optionObject, 'count', 'nr', utilCommandDictionary);
    const noSpaceHan = getCommandOption(optionObject, 'count', 'ns', utilCommandDictionary);
    const noSpaceZen = getCommandOption(optionObject, 'count', 'nS', utilCommandDictionary);
    const showInformation = getCommandOption(optionObject, 'count', 'i', utilCommandDictionary);
    const returnLineByteLength = getCommandOption(optionObject, 'count', 'r', utilCommandDictionary);
    const returnLineStringLength = getCommandOption(optionObject, 'count', 'R', utilCommandDictionary);

    let text = randomArray[0].replace(/&nbsp;/g, ' ');

    if (noReturn) text = text.replace(/\n/g, '');
    if (noSpaceHan) text = text.replace(/\x20/g, '');
    if (noSpaceZen) text = text.replace(/\u3000/g, '');

    const stringLength = text.length;

    if (showInformation) {
        const enter = (text.match(/\n/g) || []).length;
        const spaceHan = (text.match(/\x20/g) || []).length;
        const spaceZen = (text.match(/\u3000/g) || []).length;
        const commaHan = (text.match(/,/g) || []).length;
        const periodHan = (text.match(/\./g) || []).length;
        const commaZen = (text.match(/\u3001/g) || []).length;
        const periodZen = (text.match(/\u3002/g) || []).length;
        let lengthHan = 0;
        let lengthZen = 0;

        for (let i = 0; i < stringLength; i++) text[i].match(/[ -~｡-ﾟ]/) ? lengthHan++ : lengthZen++;

        const lengthByte = lengthHan + lengthZen * 2;
        const lengthLowerAlphabetHan = (text.match(/[a-z]/g) || []).length;
        const lengthUpperAlphabetHan = (text.match(/[A-Z]/g) || []).length;
        const lengthAlphabetHan = lengthLowerAlphabetHan + lengthUpperAlphabetHan;
        const lengthLowerAlphabetZen = (text.match(/[\uFF41-\uFF5A]/g) || []).length;
        const lengthUpperAlphabetZen = (text.match(/[\uFF21-\uFF3A]/g) || []).length;
        const lengthAlphabetZen = lengthLowerAlphabetZen + lengthUpperAlphabetZen;
        const lengthAlphabet = lengthAlphabetHan + lengthAlphabetZen;
        const lengthNumberHan = (text.match(/\d/g) || []).length;
        const lengthNumberZen = (text.match(/[\uFF10-\uFF19]/g) || []).length;
        const lengthNumber = lengthNumberHan + lengthNumberZen;
        const lengthSymbolHan = (text.match(/[!-/:-@[-`{-~]/g) || []).length;
        const lengthSymbolZen = (text.match(/[\uFF01-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF5E]/g) || []).length;
        const lengthSymbol = lengthSymbolHan + lengthSymbolZen;

        speakOrvilium(`文字数：${stringLength}
            ${tab(4)}改行を除く：${stringLength - enter}
                ${tab(8)}文章行数：${enter + 1}
                ${tab(8)}改行回数：${enter}
            ${tab(4)}空白を除く：${stringLength - (enter + spaceHan + spaceZen)}
                ${tab(8)}半角空白：${spaceHan}
                ${tab(8)}全角空白：${spaceZen}
            ${tab(4)}句切を除く：${stringLength - (enter + spaceHan + spaceZen)}
                ${tab(8)}半角句点：${commaHan}
                ${tab(8)}半角読点：${periodHan}
                ${tab(8)}全角句点：${commaZen}
                ${tab(8)}全角読点：${periodZen}
            ${tab(4)}データ長：${lengthByte}
                ${tab(8)}半角文字：${lengthHan}
                ${tab(8)}全角文字：${lengthZen}
            ${tab(4)}英字：${lengthAlphabet}
                ${tab(8)}半角英字：${lengthAlphabetHan}
                    ${tab(12)}小文字半角英字：${lengthLowerAlphabetHan}
                    ${tab(12)}大文字半角英字：${lengthUpperAlphabetHan}
                ${tab(8)}全角英字：${lengthAlphabetZen}
                    ${tab(12)}小文字全角英字：${lengthLowerAlphabetZen}
                    ${tab(12)}大文字全角英字：${lengthUpperAlphabetZen}
            ${tab(4)}数字：${lengthNumber}
                ${tab(8)}半角数字：${lengthNumberHan}
                ${tab(8)}全角数字：${lengthNumberZen}
            ${tab(4)}記号：${lengthSymbol}
                ${tab(8)}半角記号：${lengthSymbolHan}
                ${tab(8)}全角記号：${lengthSymbolZen}`, 0);
    } else {
        speakOrvilium(`テキストの長さは${stringLength}文字だよ。`, 0);
    }

    if (returnLineByteLength) {
        let res = '';
        let lineBuffer = 0;
        let lineCounter = 1;

        for (let i = 0; i < stringLength; i++) {
            const addByte = text[i].match(/[ -~｡-ﾟ]/) ? 1 : 2;

            lineBuffer += addByte;

            if (lineBuffer > returnLineByteLength) {
                res += '\n';
                lineCounter++;
                lineBuffer = addByte;
            } else if (text[i] == '\n') {
                lineBuffer = 0;
                lineCounter++;
            }

            res += text[i];
        }

        speakOrvilium(`\n${returnLineByteLength}バイトで折り返した場合の行数は${lineCounter}行だよ。
            ${sof(returnLineByteLength)}
            ${res}
            ${eof(returnLineByteLength)}`, 0);
    }

    if (returnLineStringLength) {
        let res = '';
        let lineBuffer = 0;
        let lineCounter = 1;

        for (let i = 0; i < stringLength; i++) {
            lineBuffer++;

            if (lineBuffer > returnLineStringLength) {
                res += '\n';
                lineCounter++;
                lineBuffer = 1;
            } else if (text[i] == '\n') {
                lineBuffer = 0;
                lineCounter++;
            }

            res += text[i];
        }

        speakOrvilium(`\n${returnLineStringLength}文字で折り返した場合の行数は${lineCounter}行だよ。
            ${sof(returnLineStringLength * 2)}
            ${res}
            ${eof(returnLineStringLength * 2)}`, 0);
    }
}
