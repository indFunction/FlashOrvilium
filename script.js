const style = [
    '/style/terminal.css'
];

style.map((item) => {
    const styleElement = document.createElement('link');

    styleElement.href = item;
	styleElement.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(styleElement);
});

document.write(`
    <div id="FlashApplication">
        <div id="orvilium" class="hideName"></div>
        <div id="user">
            <div class="information">
                <div id="directory">ロビー</div>
                <div id="clock">****.**.** **:**:**</div>
            </div>
            <form class="command" onkeypress="if (event.keyCode == 13) {if (event.shiftKey == true) {event.returnValue = true;} else {event.returnValue = false;}}" onsubmit="return false;">
                <button class="buttonA" onclick="copyCommand()">取写</button>
                <button class="buttonB" onclick="pasteCommand()">書写</button>
                <button class="buttonC" onclick="deleteCommand()">削除</button>
                <button class="buttonD" onclick="runCommand()">実行</button>
                <button class="buttonE" onclick="stopIntervalCommand()">停止</button>
                <textarea type="text" id="command"></textarea>
            </form>
        </div>
    </div>
`);

const scripts = [
    '/scripts/command.js',
    '/scripts/display.js',
    '/scripts/history.js',
    '/scripts/utility.js',
    '/scripts/command;common.js',
    '/scripts/command;lab.js',
    '/scripts/command;util.js'
];

scripts.map((item) => {
    const scriptElement = document.createElement('script');

    scriptElement.src = item;

    document.body.appendChild(scriptElement);
});
