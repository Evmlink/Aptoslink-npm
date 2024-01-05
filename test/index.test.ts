import { AptosLink } from "../src";

//Encryption
test("returns valid AptosLink", () => {
  return AptosLink.create("/","http://localhost:8080/","Happy Birthday !",true,"").then((aptoslink: AptosLink) => {
    expect(typeof aptoslink.url.hash).toBe('string');
  });
})
//Ecryption test
test("matches website", () => {
  return AptosLink.fromLink('http://localhost:8080/UnZ2QTVqTTBOY1VQT1hZVEluOGZMRStPSmhvZGozWXJtTER6UVo3Nk9zbmhrM0E2NE5XZ2FOZmVpNiswZWdvcDBmOHVIbXBNSTJTbldzQkRTTWJtTXBzWEF5S3E1eU5Wdm4vUStqZy9yclU9/SGFwcHkgQmlydGhkYXkgIQ==/90786755/').then((aptoslink: AptosLink) => {
    expect(aptoslink.keypair.accountAddress.toString()).toMatch('0x06bc28fe8a4d10a4d6318f0f39a46a9dd7ad5101eec525e51e078ff9a7eb2380');
  });
})
//Unencrypted
test("returns valid AptosLink", () => {
  return AptosLink.create("/","http://localhost:8080/","Happy Birthday !",false,"").then((aptoslink: AptosLink) => {
    console.log(aptoslink)
    console.log(aptoslink.keypair.accountAddress.toString())
  });
})
//Unecrypted test
test("matches website", () => {
  return AptosLink.fromLink('http://localhost:8080/MHhhODY5ODZhOWRmODAyYzc5NTAwMmI4Njg4YWM4ZmRlMGQzOTJlMWUyMzE0NjQ5MTIxMzRlNjFmYzYwNGM4YzJl/SGFwcHkgQmlydGhkYXkgIQ==/').then((aptoslink: AptosLink) => {
    expect(aptoslink.keypair.accountAddress.toString()).toMatch('0x2567fdfd6b3b3f94da4057e6a5a0567e876fbfb460f6a4b4d86e572609a570c9');
   
  });
})
/**
 * Test the wallet model 
 */
test("balance check", () => {
  return AptosLink.fromLink('http://localhost:8080/MHhhODY5ODZhOWRmODAyYzc5NTAwMmI4Njg4YWM4ZmRlMGQzOTJlMWUyMzE0NjQ5MTIxMzRlNjFmYzYwNGM4YzJl/SGFwcHkgQmlydGhkYXkgIQ==/').then(async (aptoslink: AptosLink) => {
    const bal =await AptosLink.balance(aptoslink,"testnet")
    console.log(bal[1].data.coin.value)
  });
})

/**
 * Transaction test
 */
test("transaction check", () => {
  return AptosLink.fromLink('http://localhost:8080/MHhhODY5ODZhOWRmODAyYzc5NTAwMmI4Njg4YWM4ZmRlMGQzOTJlMWUyMzE0NjQ5MTIxMzRlNjFmYzYwNGM4YzJl/SGFwcHkgQmlydGhkYXkgIQ==/').then(async (aptoslink: AptosLink) => {
    console.log(aptoslink.keypair.privateKey.toString())
    // await AptosLink.transfer(aptoslink,"testnet",100000,'0x5a6a33557e4ed68ad4f78dc71a2fdbc5e07b18530074c1b43078ebe45d305cfd')
  });
})