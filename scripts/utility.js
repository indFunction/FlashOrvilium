function copyCommand() {
    if (!navigator.clipboard) return;

    navigator.clipboard.writeText(commandElement.value)
        .then(() => {
            //
        })
        .catch(err => {
            console.log('Something went wrong!', err);
        });
}

function pasteCommand() {
    if (!navigator.clipboard) return;

    alert('セキュリティーの問題より、この機能は利用できません！');

    /*

    navigator.clipboard.readText()
        .then(() => {
            clipText => commandElement.value = clipText;
        })
        .catch(err => {
            console.log('Something went wrong!', err);
        });

    */
}

function deleteCommand() {
    commandElement.value = '';
}

function getStringDate(date) {
    return [
        String(date.getFullYear()).padStart(4, '0'),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('.') + ' ' + [
        String(date.getHours()).padStart(2, '0'),
        String(date.getMinutes()).padStart(2, '0'),
        String(date.getSeconds()).padStart(2, '0')
    ].join(':');
}

async function sha256(text) {
    const uint8 = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', uint8);
    return Array.from(new Uint8Array(digest)).map((v) => v.toString(16).padStart(2, '0')).join('');
}

let xors = {
    x: 123456789,
    y: 362436069,
    z: 521288629,
    w: 0
};

xors.seed = (seed) => {
    xors.w = seed;
};

xors.seedInitial = (seed) => {
    xors.x = 123456789;
    xors.y = 362436069;
    xors.z = 521288629;
    xors.w = seed;
};

xors.getNext = () => {
    let t = xors.x ^ (xors.x << 11);

    xors.x = xors.y;
    xors.y = xors.z;
    xors.z = xors.w;

    return xors.w = (xors.w ^ (xors.w >>> 19)) ^ (t ^ (t >>> 8));
};

xors.getNextInt = (min, max) => {
    const r = Math.abs(xors.getNext());

    return min + (r % (max - min + 1));
};

function generateRandomString(charset, length) {
    let res = '';

    for (let i = 0; i < length; i++) res += charset.substr(Math.random() * charset.length, 1);

    return res;
}

function escapeHTML(text) {
    return text.replace(
        /["&'<>]/g,
        char => ({
            '"': '&quot;',
            '&': '&amp;',
            '\'': '&#39;',
            '<': '&lt;',
            '>': '&gt;',
            ' ': '&nbsp;'
        }[char])
    );
}
