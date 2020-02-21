const obyte = require('@olabs/obyte');
const storage = require('./src/storage');
const isBrowser = typeof window !== 'undefined';
const isRN = typeof navigator != 'undefined' && navigator.product === 'ReactNative';
let generator;
if (isBrowser && !isRN) {
    require('./src/generator');
    generator = window.generator
} else {
    generator = require('./src/generator');
}
let client;
let interval;

class Wallet {
    constructor(url, testnet = false) {
        if (!url && testnet) url = 'wss://obyte.org/bb-test';
        this.url = url;
        this.testnet = testnet;
        this.connected = false;
        this.api = null;
    }

    async init() {
        return storage.init(this.testnet);
    }

    connect(testnet) {
        if (testnet !== undefined) this.testnet = testnet;
        if (this.connected) return {error: 'already connected'};

        if (!client) {
            client = new obyte.Client(this.url, {
                testnet: this.testnet,
                reconnect: true
            });
            interval = setInterval(function () {
                client.api.heartbeat()
            }, 10 * 1000);
        }
        this.api = client.api;
        this.connected = true;
        return {ok: true};
    }

    close() {
        if (interval) clearInterval(interval);
        if (client) client.close();
        this.api = null;
        this.connected = false;
        client = null;
        return {ok: true};
    }

    async createWallet(password) {
        if (storage.hasAccount()) return Promise.resolve({error: 'Wallet has already been created'});
        if (password === undefined || typeof password !== "string") return Promise.resolve({error: 'Password required'});
        if (!generator) return Promise.resolve({error: 'Please add generator script'});
        let g = generator.generateSEED(this.testnet);
        await storage.saveAccount(g.address, g.pubkey, {privateKey: g.devicePrivKey}, password);
        return {ok: true, seed: g.seed, address: g.address, pubKey: g.pubkey};
    }

    async recoveryWallet(seed, password) {
        if (!seed) return Promise.resolve({error: 'Seed required'});
        if (password === undefined || typeof password !== "string") return Promise.resolve({error: 'Password required'});
        if (!generator) return Promise.resolve({error: 'Please add generator script'});
        let g = generator.getFromSEED(seed, this.testnet);
        await storage.saveAccount(g.address, g.pubkey, {privateKey: g.devicePrivKey}, password);
        return {ok: true, seed: g.seed, address: g.address, pubKey: g.pubkey};
    }

    getAddress() {
        return storage.getAddress();
    }

    async getBalance() {
        const address = storage.getAddress();
        if (!this.connected) return Promise.resolve({error: 'you are not connected. use "connect"'});
        if (!address) return Promise.resolve({error: 'You have no addresses. Perhaps you did not initialize the wallet.'});
        const balance = await this.api.getBalances([address]);
        if (balance && balance[address]) {
            return balance[address];
        } else {
            return [];
        }
    }

    async sendPayment(password, address, amount, asset) {
        if (!storage.hasAccount()) return Promise.resolve({error: 'You have no wallet. Perhaps you did not initialize the wallet.'});
        const account = storage.getAccount(password);
        if (account === 'Incorrect password') return Promise.resolve({error: 'Incorrect password'});
        let opts = {outputs: [{address, amount}]};
        if (asset) opts.asset = asset;
        try {
            let res = await client.post.payment(opts, {privateKey: account.privateKey, spend_unconfirmed: 'all'});
            return {ok: true, unit: res};
        } catch (e) {
            if (e.message.includes('empty array')) return Promise.resolve({error: 'insufficient funds'});
            else return Promise.resolve({error: e.message});
        }

    }

    async sendMultiPayment(password, outputs, asset) {
        if (!storage.hasAccount()) return Promise.resolve({error: 'You have no wallet. Perhaps you did not initialize the wallet.'});
        const account = storage.getAccount(password);
        if (account === 'Incorrect password') return Promise.resolve({error: 'Incorrect password'});
        let opts = {outputs: outputs};
        if (asset) opts.asset = asset;
        try {
            let res = await client.post.payment(opts, {privateKey: account.devicePrivKey, spend_unconfirmed: 'all'});
            return {ok: true, unit: res};
        } catch (e) {
            if (e.message.includes('empty array')) return Promise.resolve({error: 'insufficient funds'});
            else return Promise.resolve({error: e.message});
        }

    }

    async postDataInAA(password, aaAddress, data, amountInBytes) {
        if (!storage.hasAccount()) return Promise.resolve({error: 'You have no wallet. Perhaps you did not initialize the wallet.'});
        const account = storage.getAccount(password);
        if (account === 'Incorrect password') return Promise.resolve({error: 'Incorrect password'});
        try {
            let res = await client.post.postDataInAa({
                aa_address: aaAddress,
                data: data,
                amount_in_bytes: amountInBytes
            }, {privateKey: account.devicePrivKey, spend_unconfirmed: 'all'});
            return {ok: true, unit: res};
        } catch (e) {
            if (e.message.includes('empty array')) return Promise.resolve({error: 'insufficient funds'});
            else return Promise.resolve({error: e.message});
        }
    }

    async getRawHistory() {
        const address = storage.getAddress();
        if (!this.connected) return Promise.resolve({error: 'you are not connected. use "connect"'});
        if (!address) return Promise.resolve({error: 'You have no addresses. Perhaps you did not initialize the wallet.'});
        let witnesses = await client.api.getWitnesses();
        let h = await client.api.getHistory({witnesses, addresses: [address]});
        if (h && h.joints) {
            return h.joints;
        } else {
            return [];
        }
    }

    async getHistoryPayments() {
        const address = storage.getAddress();
        if (!this.connected) return Promise.resolve({error: 'you are not connected. use "connect"'});
        if (!address) return Promise.resolve({error: 'You have no addresses. Perhaps you did not initialize the wallet.'});
        let witnesses = await client.api.getWitnesses();
        let h = await client.api.getHistory({witnesses, addresses: [address]});
        if (h && h.joints) {
            let result = [];
            h.joints.forEach(v => {
                let p = {};
                p.send = !!v.unit.authors.find(r => r.address === address);
                let messages = v.unit.messages.filter(m => {
                    return m.app === 'payment';
                });
                p.outputs = {base: []};
                messages.forEach(m => {
                    if (m.payload.asset) {
                        if (!p.outputs[m.payload.asset]) p.outputs[m.payload.asset] = [];
                        p.outputs[m.payload.asset].push(m.payload.outputs);
                    } else {
                        p.outputs.base.push(m.payload.outputs);
                    }
                });
                p.fees = v.unit.headers_commission + v.unit.payload_commission;
                result.push(p);
            });
            return result;
        } else {
            return [];
        }
    }
}

if (isBrowser && !isRN) {
    window.Wallet = Wallet;
} else {
    module.exports = Wallet;
}