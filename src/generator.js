const isBrowser = typeof window !== 'undefined';
const isRN = typeof navigator != 'undefined' && navigator.product === 'ReactNative';
const {getChash160} = require('@olabs/obyte/lib/utils');
const {publicKeyCreate} = require('secp256k1');
const bip39 = require('bip39');
const bip32 = require('bip32');
const random = require('randombytes/index');

function getDataFromMnemonic(mnemonic, testnet) {
    const path = testnet ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
    const node = bip32.fromSeed(Buffer.from(bip39.mnemonicToSeedSync(mnemonic.toString()), 'hex'));
    const devicePrivKey = node.derivePath(path).privateKey;
    const pubkey = publicKeyCreate(devicePrivKey, true).toString('base64');
    const definition = ['sig', {pubkey}];
    const address = getChash160(definition);
    return {
        devicePrivKey: devicePrivKey.toString('hex'),
        pubkey,
        address
    }
}

function generateSEED(testnet) {
    let mnemonic = bip39.generateMnemonic(null, random);
    while (!bip39.validateMnemonic(mnemonic)) {
        mnemonic = bip39.generateMnemonic(null, random);
    }
    const {devicePrivKey, pubkey, address} = getDataFromMnemonic(mnemonic, testnet);
    return {
        seed: mnemonic,
        devicePrivKey,
        pubkey,
        address
    };
}

function getFromSEED(seed, testnet) {
    if (!bip39.validateMnemonic(seed)) throw new Error('Incorrect seed');
    const {devicePrivKey, pubkey, address} = getDataFromMnemonic(seed, testnet);

    return {
        seed,
        devicePrivKey,
        pubkey,
        address
    };
}

if (isBrowser && !isRN) {
    window.generator = {generateSEED, getFromSEED};
} else {
    module.exports = {
        generateSEED,
        getFromSEED
    };
}