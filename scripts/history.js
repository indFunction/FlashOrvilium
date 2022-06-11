let commandCache = '';
let commandHistories = [];
let commandHistorySelectNum = -1;

function setCommandHistory(num) {
    if (commandHistorySelectNum == -1) commandCache = commandElement.value;

    if ((num > 0 && commandHistorySelectNum + num < commandHistories.length) || (num < 0 && commandHistorySelectNum + num >= -1)) {
        commandHistorySelectNum += num;

        const set = commandHistorySelectNum != -1 ? commandHistories[commandHistorySelectNum] : commandCache;

        commandElement.value = set;
        commandElement.focus();
        commandElement.setSelectionRange(0, set.length);
    } else if (num == 0) {
        commandHistorySelectNum = -1;

        commandCache = '';
    }
}

function addCommandHistories(command) {
    commandHistories.splice(0, 0, command);
    commandHistories = [...new Set(commandHistories)];

    setCommandHistory(0);
}

function showCommandHistories(n) {
    const listAlignDigits = Math.log10(commandHistories.length - 1) + 1;

    let res = [];

    if (n === false) {
        for (let i in commandHistories) res.push(`${String(i).padStart(listAlignDigits, '0')} … ${commandHistories[i]}`);
    } else {
        const id = n >= 0 ? n : commandHistories.length + n;

        if (id >= 0 && id < commandHistories.length) {
            res.push(`${String(id).padStart(listAlignDigits, '0')} … ${commandHistories[id]}`);
        } else {
            speakOrvilium(`${id}番目の履歴は存在しないよ。`, 2);

            return;
        }
    }

    speakOrvilium(res.join('\n'));
}

function runCommandHistories(n) {
    const id = n >= 0 ? n : commandHistories.length + n;

    if (id >= 0 && id < commandHistories.length) {
        if (id != 0) {
            runCommand(commandHistories[id]);
        } else {
            speakOrvilium('無限ループは恐ろしいよ。', 2);
        }
    } else {
        speakOrvilium(`${id}番目の履歴は存在しないよ。`, 2);
    }
}

function clearCommandHistories(n) {
    if (n === false) {
        commandCache = '';
        commandHistories = [];
        commandHistorySelectNum = -1;

        speakOrvilium('全ての履歴を削除したよ。', 0);
    } else {
        const id = n >= 0 ? n : commandHistories.length + n;

        if (id >= 0 && id < commandHistories.length) {
            commandCache = '';
            commandHistories.splice(id, 1);
            commandHistorySelectNum = -1;

            speakOrvilium(`${id}番目の履歴を削除したよ。`, 0);
        } else {
            speakOrvilium(`${id}番目の履歴は存在しないよ。`, 2);
        }
    }
}
