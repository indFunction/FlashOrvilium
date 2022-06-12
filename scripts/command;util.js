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
