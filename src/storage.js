const isBrowser = typeof window !== 'undefined';
const isRN = typeof navigator != 'undefined' && navigator.product === 'ReactNative';
const SimpleCrypto = require("simple-crypto-js").default;
let AsyncStorage;
if (isRN) {
    const rn = require('react-native');
    AsyncStorage = rn.AsyncStorage;
}

let fs;
if (!isBrowser && !isRN) {
    fs = require('fs').promises;
}

let path = !isBrowser ? './storage' : null;
let testnet = false;
let pref = '_main';
let data = {};

function setPath(_path) {
    if (isBrowser) return 'the browser uses localstorage';
    path = _path;
}

async function init(_testnet) {
    if (_testnet) {
        testnet = _testnet;
        pref = '_test';
    }
    if (isBrowser && !isRN) {
        data = {
            address: localStorage.getItem('address' + pref),
            account: localStorage.getItem('account' + pref)
        };
    } else if (isRN) {
        data = {
            address: await AsyncStorage.getItem('address' + pref),
            account: await AsyncStorage.getItem('account' + pref)
        };
    } else {
        try {
            data = JSON.parse((await fs.readFile(path + pref)).toString());
        } catch (e) {
            data = {};
        }
    }
}

function getAddress() {
    return data.address || null;
}

async function saveAddress(address) {
    data.address = address;
    if (isBrowser && !isRN) {
        localStorage.setItem('address' + pref, address);
    } else if (isRN) {
        await AsyncStorage.setItem('address' + pref, address);
    }
}

function getPubKey() {
    return data.pubkey || null;
}

async function savePubKey(pubkey) {
    data.pubkey = pubkey;
    if (isBrowser && !isRN) {
        localStorage.setItem('pubkey' + pref, pubkey);
    } else if (isRN) {
        await AsyncStorage.setItem('pubkey' + pref, pubkey);
    }
}

function hasAccount() {
    return !!data.account;
}

function getAccount(password) {
    if (!data.account) return null;
    if (!password) return {error: 'please unlock wallet'};
    let d;
    try {
        const simpleCrypto = new SimpleCrypto(password);
        d = simpleCrypto.decrypt(data.account);
        console.error('q', d);
        d = JSON.parse(d);
        if(d.privateKey) d.privateKey = Buffer.from(d.privateKey, 'hex');
    } catch (e) {

    }
    return d ? d : 'Incorrect password';
}

async function saveAccount(address, pubkey, account, password) {
    const simpleCrypto = new SimpleCrypto(password);
    data.account = simpleCrypto.encrypt(JSON.stringify(account));
    data.pubkey = pubkey;
    await saveAddress(address);
    await savePubKey(pubkey);
    if (isBrowser && !isRN) {
        localStorage.setItem('account' + pref, data.account);
    } else if (isRN) {
        await AsyncStorage.setItem('account' + pref, data.account);
    } else {
        await fs.writeFile(path + pref, JSON.stringify(data));
    }
    return {ok: true};
}


module.exports = {
    setPath,
    init,
    getAddress,
    hasAccount,
    getAccount,
    saveAccount,
    getPubKey
};