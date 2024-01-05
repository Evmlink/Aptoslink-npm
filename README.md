# AptosLink Npm

This repo is to build a browser base light wallet in Aptos .

Which allows users to send out `Cash gift` easily by web link .

## Feature

- Use `@aptos-labs/ts-sdk` to make pair generate in Aptos chain .

- Add Aptos txns to make  simple transactions .

- Add encryption of private key , Allows to send with password .

# Basic Installation instructions
```bash
npm install @AptosLink/api
```
Import Instructions
```js
import { Aptoslink } from '@aptoslink';
```
Create a Aptoslink with encryption
```js
return AptosLink.create("/","http://localhost:8080/","Happy Birthday !",true,"").then((aptoslink: AptosLink) => {
});
```
Create a Aptoslink without encryption
```js
test("returns valid AptosLink", () => {
  return AptosLink.create("/","http://localhost:8080/","Happy Birthday !",false,"").then((aptoslink: AptosLink) => {
  });
})
```
Decode the link and withdraws the money from wallet | transfer money from wallet
```js
return AptosLink.fromLink('http://localhost:8080/MHhhODY5ODZhOWRmODAyYzc5NTAwMmI4Njg4YWM4ZmRlMGQzOTJlMWUyMzE0NjQ5MTIxMzRlNjFmYzYwNGM4YzJl/SGFwcHkgQmlydGhkYXkgIQ==/').then(async (aptoslink: AptosLink) => {
  console.log(aptoslink.keypair.privateKey.toString())
  await AptosLink.transfer(aptoslink,"testnet",100000,'0x5a6a33557e4ed68ad4f78dc71a2fdbc5e07b18530074c1b43078ebe45d305cfd')
});
```