import * as apt from "@aptos-labs/ts-sdk";
import CryptoJS from 'crypto-js'

const DEFAULT_PASSWORDLENGTH = 8; //The length of encryption number

//To generate a totally new account
const randomPrivateKey = () => {
  const acc = apt.Account.generate();
  return acc.privateKey.toString();
}
//Recover account from seeds
const seedToAccount = (seed:string) => {
  const privateKey = new apt.Ed25519PrivateKey(seed);
  return apt.Account.fromPrivateKey({privateKey})
}
//Base encryption with CBC-Pkcs7
const aesEncrypt = (message:any, key:any) => {
  const iv = CryptoJS.enc.Utf8.parse(key);
  key = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(JSON.stringify(message)),key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return Buffer.from(encrypted.toString()).toString('base64');
}
//Base decryption with same method
const decryptByDES = (ciphertext:any, key:any) => {
  const iv = CryptoJS.enc.Utf8.parse(key);
  key = CryptoJS.enc.Utf8.parse(key);
  ciphertext=Buffer.from(ciphertext,"base64").toString()
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
});
  const ret = (decrypted.toString(CryptoJS.enc.Utf8)).split('"');
  return ret[1]
}
//Create a init link for a random address
const aesCreate = async (msg:any,pwd:string) => {
    let seed = (pwd=="")?ranStr(DEFAULT_PASSWORDLENGTH):pwd;
    const ret =  aesEncrypt(
      msg,
      seed
    )
    return {
      "data":ret,
      "key":seed
    }
}
/**
 * The rules of Url :
 * {origin}/{path}/{chainID}/{secretKey}/{Password}/{Message}
 */
const urlEncode = (data:string,msg:string,pwd:string) =>
{
  let str =  ''
  if(data && data.length > 0)
  {
    str+=data+"/";
  }
  if(msg && msg.length > 0)
  {
    str+=msg+"/";
  }
  if(pwd && pwd.length > 0)
  {
    str+=pwd+"/";
  }
  return str;
}
const urlDecode = (pathname:string) =>
{
  let obj = {
    privateKey:'',
    message:"",
    encrypt:{
      isEncrypt:true,
      pwd:"",
    }
  };
  const param = pathname;
  if(pathname.length>1)
  {
    const _p = param.split("/");
    // console.log(_p)
    if(_p.length>0)
    {
      let sec = "";
      let key = "";
      let msg = "";
      if(_p.length>2)
      {
        sec = _p[1];
      }

      if(_p.length>3)
      {
        msg = _p[2];
      }
      if(_p.length>=4)
      {
        key = _p[3];
      }
      // console.log(sec,key)
      if(sec.length>0 && key.length>0)
      {
        //have encrypt . make ecrypt
       
        obj = {
          privateKey:decryptByDES(sec,key),
          message:msg,
          encrypt:{
            isEncrypt:true,
            pwd:key,
          }
        }
      }else if (sec.length>0)
      {
        //not encrypt
        obj = {
          privateKey:Buffer.from(sec,"base64").toString(),
          message:msg,
          encrypt:{
            isEncrypt:false,
            pwd:"",
          }
        }
      }
    }
  }
  return obj;
}
//Random Number String
const ranStr = (length: number) =>   {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export class AptosLink {
  url: URL;
  keypair: any;
  msg:string;
  encrypt:any;
  //Init this object 
  private constructor(url: URL, keypair: any , msg:string , encrypt:any) {
    this.url = url;
    this.keypair = keypair;
    this.msg = msg;
    this.encrypt = encrypt;
  }
  /**
   * Create a new wallet | new link
   * 
   * @param _path 
   * @param _origin 
   * @param _isEncrypt 
   * @param _chainId 
   * @param _msg 
   * @returns 
   */
  public static async create(_path:any,_origin:any,_msg:any,_isEncrypt:boolean,pwd:string): Promise<AptosLink> {
    const link = new URL(_path,_origin);
    const sk = randomPrivateKey()
    const kp = await seedToAccount(
      sk
    )
    const hashData = {
      isEncrypt : _isEncrypt,
      data : {
        data:"",
        key:""
      }
    }
    if(_isEncrypt)
    {
      hashData.data = await aesCreate(sk,pwd);
    }else{
      hashData.data = {
          data:Buffer.from(sk).toString("base64"),
          key:""
      }
    }
    link.href+=urlEncode(hashData.data.data,Buffer.from(_msg).toString("base64"),hashData.data.key);
    const aptlink = new AptosLink(link, kp,Buffer.from(_msg).toString("base64"),{isEncrypt:_isEncrypt,pwd:pwd});
    return aptlink;
  }

  /**
   * Recover from url
   * 
   * @param url 
   * @returns 
   */
  public static async fromUrl(url: URL): Promise<any> {
    const dec = urlDecode(url.pathname);
    let keypair ;
    try{
      keypair = seedToAccount(dec.privateKey);
    }catch(e)
    {
      console.log(e)
    }
    const aptoslink = new AptosLink(url, keypair,dec.message,dec.encrypt);
    return aptoslink
  }
  public static async fromLink(link: string): Promise<AptosLink> {
    const url = new URL(link);
    return this.fromUrl(url);
  }

  public static async balance(aptoslink:AptosLink,network:string) : Promise<any>{
    const aptos = new apt.Aptos(
      {
          network:network
      }  as apt.AptosConfig
    );
    return await aptos.getAccountResources(aptoslink.keypair)
  }

  public static async transfer(aptoslink:AptosLink,network:string , amount:number , target : string)
  {
      const aptos = new apt.Aptos(
          {
              network:network
          } as apt.AptosConfig
      );
      const transaction = await aptos.transferCoinTransaction({
        sender: aptoslink.keypair,
        recipient: target,
        amount: amount
      });
      const pendingTransaction = await aptos.signAndSubmitTransaction({ signer: aptoslink.keypair, transaction });
      return pendingTransaction
  }
}