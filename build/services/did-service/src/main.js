"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const did_resolver_1 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
const EthrDID = require('ethr-did');
const SignerProvider = require('ethjs-provider-signer');
const sign = require('ethjs-signer').sign;
const BN = require('bignumber.js');
const infura_endpoint = "https://ropsten.infura.io/v3/91b0038d3b154f0a9b11212d29485594";
const identity1 = "did:ethr:0xB4CFd481e4999ec986f483c4C7a68c5B88473D85";
const identity2 = "did:ethr:0x28645c1F92754AA2f8CaDC6988006ed22Ec04470";
const privateKey1 = "0xd9bccd7490bf860adba6d85c341096d7f8e214898b97310e3395433862ec86c9";
const privateKey2 = "0x36edbc98c8864176e75399dc53310385fb251d921711379b8e1eba1d81be689e";
// we need to instantiate our own signing provider
// takes the address and signing private key 
function makeSigningHttpProvider(endpoint, address, key) {
    const gasLimit = new BN('100000');
    const gasPrice = new BN('30000000000');
    return new SignerProvider(endpoint, { signTransaction: (rawTx, cb) => cb(null, sign(Object.assign(rawTx, { gas: gasLimit, gasPrice: gasPrice }), key)),
        accounts: (cb) => cb(null, [address]) });
}
exports.makeEthrDID = (did, key) => {
    let address;
    [, , address] = did.split(":");
    return new EthrDID({ address: address,
        privateKey: key,
        provider: makeSigningHttpProvider(infura_endpoint, address, key) });
};
//const ethrDid_1 = makeEthrDID(identity1, privateKey1);
const ethrDid_1 = exports.makeEthrDID(identity1, privateKey2);
// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const ethrDidResolver = ethr_did_resolver_1.getResolver({ rpcUrl: infura_endpoint });
const didResolver = new did_resolver_1.Resolver(ethrDidResolver);
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const did = ethrDid_1.did;
            console.log(did);
            // You can also use ES7 async/await syntax
            const doc = yield didResolver.resolve(did);
            console.log(doc);
            let address;
            [, , address] = identity1.split(":");
            yield ethrDid_1.changeOwner(address);
            console.log("Owner: " + (yield ethrDid_1.lookupOwner()));
        }
        catch (e) {
            console.error(e);
        }
    });
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NlcnZpY2VzL2RpZC1zZXJ2aWNlL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSwrQ0FBdUM7QUFDdkMseURBQStDO0FBRS9DLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUN4RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUduQyxNQUFNLGVBQWUsR0FBRywrREFBK0QsQ0FBQztBQUV4RixNQUFNLFNBQVMsR0FBRyxxREFBcUQsQ0FBQztBQUN4RSxNQUFNLFNBQVMsR0FBRyxxREFBcUQsQ0FBQztBQUN4RSxNQUFNLFdBQVcsR0FBRyxvRUFBb0UsQ0FBQztBQUN6RixNQUFNLFdBQVcsR0FBRyxvRUFBb0UsQ0FBQztBQUV6RixrREFBa0Q7QUFDbEQsNkNBQTZDO0FBQzdDLFNBQVMsdUJBQXVCLENBQUMsUUFBZ0IsRUFBRSxPQUFlLEVBQUUsR0FBVztJQUMzRSxNQUFNLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsQyxNQUFNLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUV2QyxPQUFPLElBQUksY0FBYyxDQUFDLFFBQVEsRUFDOUIsRUFBQyxlQUFlLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQyxFQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkgsUUFBUSxFQUFFLENBQUMsRUFBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7QUFBQSxDQUFDO0FBRTFDLFFBQUEsV0FBVyxHQUFHLENBQUMsR0FBVyxFQUFFLEdBQVcsRUFBRSxFQUFFO0lBQ3BELElBQUksT0FBTyxDQUFDO0lBQ1osQ0FBQyxFQUFFLEFBQUQsRUFBRyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTztRQUNoQixVQUFVLEVBQUUsR0FBRztRQUNmLFFBQVEsRUFBRSx1QkFBdUIsQ0FBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUFBLENBQUMsQ0FBQTtBQUU1Rix3REFBd0Q7QUFDeEQsTUFBTSxTQUFTLEdBQUcsbUJBQVcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFdEQsaUpBQWlKO0FBQ2pKLE1BQU0sZUFBZSxHQUFHLCtCQUFXLENBQUMsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDLENBQUMsQ0FBQztBQUNoRSxNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFbEQsQ0FBQzs7UUFDRyxJQUFJO1lBRUEsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWpCLDBDQUEwQztZQUMxQyxNQUFNLEdBQUcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVqQixJQUFJLE9BQU8sQ0FBQztZQUNaLENBQUMsRUFBRSxBQUFELEVBQUcsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQyxNQUFNLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUcsTUFBTSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUEsQ0FBQyxDQUFDO1NBQzFEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ25CO0lBQ0wsQ0FBQztDQUFBLENBQUMsRUFBRSxDQUFDIn0=