# owallet.js

Very lightweight Obyte wallet. It works everywhere where you can run JS.

<br>

<sub>If something didn't work - write me, I'll fix it :)</sub>

!!! Support only single address wallet and does not support private assets !!!

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
<script src="https://unpkg.com/owallet.js@0.0.5/dist/owallet.all.min.js"></script>
```
wallet and generator (separately). Generator needs only for creating and recovery wallet.
```html
<script src="https://unpkg.com/owallet.js@0.0.5/dist/owallet.generator.min.js"></script>
<script src="https://unpkg.com/owallet.js@0.0.5/dist/owallet.lib.min.js"></script>
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
Optional arguments
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
Optional argument
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
Create and save wallet
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
return obyte address
```javascript
w.getAddress();
```

<br>

##### getBalance
return balance
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

Optional argument
- asset (string)

<br>

##### sendMultiPayment
```javascript
await w.sendMultiPayment('password', [{address: '5Q7MD7AHC2MSNGSHHBHPKVHPD2VFDB22', amount: 1234}]);
```
Required arguments
- password (string)
- outputs (array)

Optional argument
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
return history from hub
```javascript
await w.getRawHistory();
```

<br>

##### getHistoryPayments
return prepared payment history
```javascript
await w.getHistoryPayments()
```

Questions? Help is needed? @xjenek - telegram, xJeneK#3181 - discord
