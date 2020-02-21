# owallet.js

##### Very lightweight Obyte wallet. It works everywhere where you can run JS.
<sub>If somewhere it didn't work, write, I'll fix it :)</sub>

!!! Support only single address wallet !!!

## How to start?

### Node.js
```bash
$ yarn add owallet.js
```
index.js
```javascript
const Wallet = require('owallet.js');
const w = new Wallet(null, true); // testnet

(async () => {
    await w.init();
    w.connect();
    console.log(await w.createWallet('password'));
    console.log(w.getAddress());
    console.log(await w.getBalance());
})();
```

### Browser
#### CDN
wallet + generator
```html
<script src="https://unpkg.com/owallet.js@0.0.1/dist/owallet.all.min.js"></script>
```
wallet and generator (separately). Generator is needed only for creating and recovery wallet.
```html
<script src="https://unpkg.com/owallet.js@0.0.1/dist/owallet.generator.min.js"></script>
<script src="https://unpkg.com/owallet.js@0.0.1/dist/owallet.lib.min.js"></script>
```



#### build
```bash
$ git clone https://github.com/olabs-org/owallet.js
$ cd owallet.js
$ yarn
$ yarn all
$ yarn generator
$ yarn lib
```

See CDN.

### Functions

##### Create
```javascript
const w = new Wallet();
```
Optionals arguments
- hub url (wss://obyte.org/bb)
- testnet (boolean)

<br>

##### init
Initializes work with storage
```javascript
await w.init();
```

<br>

##### connect
Connect to hub
```javascript
w.connect();
```
Optionals argument
- testnet (need for change network)

Change network:
```javascript
w.close();
w.connect(true);
await w.init();    
```

<br>

##### close
Close connection to hub
```javascript
w.close()
```

<br>

##### createWallet
Creates and saves wallet
```javascript
await w.createWallet('password');
```
Required argument
- password (string)

<br>

##### recoveryWallet
Recover and save wallet
```javascript
await w.recoveryWallet('gospel oak horn excite wheat mountain remove embody school confirm fossil mad', 'password');
```
Required arguments
- Seed (string)
- password (string)

<br>

##### getAddress
Returns obyte address
```javascript
w.getAddress();
```

<br>

##### getBalance
Returns balance
```javascript
await w.getBalance();
```

<br>

##### sendPayment
```javascript
await w.sendPayment('password', '5Q7MD7AHC2MSNGSHHBHPKVHPD2VFDB22', 1234);
```
Required arguments
- password (string)
- address (string)
- amount (string)

Optionals argument
- asset (string)

<br>

##### sendMultiPayment
```javascript
await w.sendMultiPayment('password', [{address: '5Q7MD7AHC2MSNGSHHBHPKVHPD2VFDB22', amount: 1234}]);
```
Required arguments
- password (string)
- outputs (array)

Optionals argument
- asset (string)

<br>

##### postDataInAA
Publishes data in AA
```javascript
await w.postDataInAA('test', 'RQ46GHBRQWJJMWLZTVF2GH4A5QOLXFOV', {'var': 'qwerty'}, 11000)
```
Required arguments
- password (string)
- aa address (string)
- data (object)
- amount (number > 10000)

<br>

##### getRawHistory
Returns history from hub
```javascript
await w.getRawHistory();
```

<br>

##### getHistoryPayments
Returns prepared payment history
```javascript
await w.getHistoryPayments()
```

Questions? Help is needed? @xjenek
