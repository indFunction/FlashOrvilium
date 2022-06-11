function speakYou(text) {
    displayElement.insertAdjacentHTML(
        'beforeend',
        `
            <div class="user">
                <div class="name">　　　　貴方</div>
                <div class="message">${('' + text).replace(/\r?\n/g, '<br />')}</div>
            </div>
        `
    );
}

function speakOrvilium(text, res) {
    let className = 'message';

    switch (res) {
        case 1:
            className += ' textWarning';
            break;
        case 2:
            className += ' textError';
            break;
    }

    displayElement.insertAdjacentHTML(
        'beforeend',
        `
            <div class="orvilium">
                <div class="name">オヴィリアム</div>
                <div class="${className}">${('' + text).replace(/\r?\n/g, '<br />')}</div>
            </div>
        `
    );
}

function decorateCommandObject(commandObject) {
    let res = [];

    commandObject.fixed.map((item) => res.push(`<span class="commandFixed">${item}</span>`));
    commandObject.option.map((item) => res.push(`<span class="${item.check == 1 ?
        'commandOption commandNone' : item.check == 2 ?
            'commandOption commandNone' : 'commandOption'
        }">-${item.name}${item.property !== '' ? ':' + item.property : ''}</span>`));
    commandObject.random.data.map((item, index) => res.push(`<span class="${!commandObject.random.use ?
        'commandRandom commandNone' : index < commandObject.random.need ?
            'commandRandomA' : 'commandRandomB'
        }">"${item}"</span>`));

    return res.join(' ');
}

function putCommandList(command, dictionaryObject) {
    let res = [];

    if (command == '') {
        dictionaryObject.map((item) => res.push(getCommandItem(item)));
    } else {
        const get = dictionaryObject.find((item) => item.command == command);

        if (get != undefined) {
            res.push(getCommandItem(get));
        } else {
            speakOrvilium(`残念だけれど、「${command}」というコマンドは分からないよ。`, 2);

            return;
        }
    }

    speakOrvilium(res.join('\n'), 0);
}

function getCommandItem(dictionaryItem) {
    let res = '';

    res += `${dictionaryItem.command} … ${dictionaryItem.description}\n`;

    if (dictionaryItem.option && dictionaryItem.option.length > 0) {
        dictionaryItem.option.map((itemA) => {
            res += (
                `&nbsp;&nbsp;&nbsp;&nbsp;<span class="commandOption">-${itemA.name}` +
                (itemA.type != 'void' ? `:&lt;${typeList.find((itemB) => itemB.id == itemA.type).name}&gt` : '') +
                ` … ${itemA.description}</span>\n`
            );
        });
    }

    if (dictionaryItem.random && dictionaryItem.random.description.length > 0) {
        const listAlignDigits = Math.log10(dictionaryItem.random.description.length - 1) + 1;

        dictionaryItem.random.description.map((item, index) => {
            res += `&nbsp;&nbsp;&nbsp;&nbsp;<span class="${index < dictionaryItem.random.need ? 'commandRandomA' : 'commandRandomB'}">&lt;ランダム${String(index).padStart(listAlignDigits, '0')}&gt; … ${item}</span>\n`;
        });
    }

    return res;
}

function setClock() {
    if (!clockElement) {
        clockElement = document.getElementById('clock');
    } else {
        clockElement.innerHTML = getStringDate(new Date());
    }
}

setInterval(setClock, 1000);
