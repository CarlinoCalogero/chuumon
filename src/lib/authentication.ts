const MAX_INTEGER = 20;

function getRandomString() {
    // base 36 (0-9a-z):
    return Math.random().toString(36).slice(2); // remove `0.`
}

function getRandomInt() {
    return Math.floor(Math.random() * MAX_INTEGER);
}

export function createToken() {

    let loops = getRandomInt();
    let result = '';

    for (let count = 0; count < loops; count++) {
        result = `${result}${getRandomString()}`
    }

    return result;
}