
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'

const EthrDID = require('ethr-did');
const SignerProvider = require('ethjs-provider-signer');
const sign = require('ethjs-signer').sign;
const BN = require('bignumber.js');


const infura_endpoint = "https://ropsten.infura.io/v3/a17d809755ec478e8e8d99cf19570c28";

const identity1 = "did:ethr:0xB4CFd481e4999ec986f483c4C7a68c5B88473D85";
const identity2 = "did:ethr:0x28645c1F92754AA2f8CaDC6988006ed22Ec04470";
const privateKey1 = "0xd9bccd7490bf860adba6d85c341096d7f8e214898b97310e3395433862ec86c9";
const privateKey2 = "0x36edbc98c8864176e75399dc53310385fb251d921711379b8e1eba1d81be689e";

// we need to instantiate our own signing provider
// takes the address and signing private key 
function makeSigningHttpProvider(endpoint, address, key){
    const gasLimit = new BN('100000');
    const gasPrice = new BN('30000000000');
    return new SignerProvider(endpoint, 
        {signTransaction: (rawTx, cb) => cb(null, sign(Object.assign(rawTx,{gas: gasLimit, gasPrice: gasPrice}), key)),
         accounts: (cb) => cb(null, [address])});}

function makeEthrDID(did, key) {
    let address;
    [, , address] = did.split(":");
    return new EthrDID({address: address, 
                        privateKey: key,
                        provider: makeSigningHttpProvider(infura_endpoint, address, key)});}

//const ethrDid_1 = makeEthrDID(identity1, privateKey1);
const ethrDid_1 = makeEthrDID(identity1, privateKey2);

// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const ethrDidResolver = getResolver({ rpcUrl: infura_endpoint});
const didResolver = new Resolver(ethrDidResolver);

(async function() {
    try {
        
        const did = ethrDid_1.did;
        console.log(did);

        // You can also use ES7 async/await syntax
        const doc = await didResolver.resolve(did);
        
        console.log(doc);

        let address;
        [, , address] = identity1.split(":");
        await ethrDid_1.changeOwner(address);
        console.log("Owner: " + await ethrDid_1.lookupOwner());
    } catch (e) {
        console.error(e)
    }
})();



