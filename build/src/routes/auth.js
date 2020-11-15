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
const requestUtils_1 = require("../requestUtils");
const EthrDID = require('ethr-did');
const { Credentials, SimpleSigner } = require('uport-credentials');
const did_resolver_1 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
const DidRegistryContract = require('ethr-did-registry');
const Web3 = require("web3");
const ganache = require('ganache-cli');
const repository_1 = require("../repository");
const makeEthrDID = require('../../services/did-service/src/main');
const regularExpressions_1 = require("../regularExpressions");
const utils_1 = require("../utils");
const EthU = require("ethereumjs-util");
const utils_2 = require("../../src/utils");
exports.didRouter = (app) => {
    app.post('/did/create', requestUtils_1.ipRateLimited(20, 'create'), requestUtils_1.apiOnly, requestUtils_1.asyncHandler(() => __awaiter(this, void 0, void 0, function* () {
        const ethrDid = makeEthrDID.makeEthrDID('did:ethr:0xaDb95d020Ee1eFe0C1C8710bCa8A425A9DBd3FD0', 'b9c355945f865aa63d9eb5fba4e488c34ee8ea6df76284995c58fe99bd470381');
        const providerConfig = { rpcUrl: 'https://ropsten.infura.io/v3/91b0038d3b154f0a9b11212d29485594' };
        const didResolver = new did_resolver_1.Resolver(ethr_did_resolver_1.getResolver(providerConfig));
        const doc = yield didResolver.resolve(ethrDid.did);
        return doc;
    }), (didReg) => __awaiter(this, void 0, void 0, function* () {
        return {
            status: 200,
            body: {
                message: 'Did successfully created and on-chain',
                did: didReg
            },
        };
    })));
};
exports.signatureRouter = (app) => {
    app.post('/auth/sign-token', requestUtils_1.ipRateLimited(20, 'create'), requestUtils_1.apiOnly, requestUtils_1.asyncHandler((req) => __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const signature = utils_2.personalSign(body.accessToken, '0xb9c355945f865aa63d9eb5fba4e488c34ee8ea6df76284995c58fe99bd470381');
        return signature;
    }), (signature) => __awaiter(this, void 0, void 0, function* () {
        return {
            status: 200,
            body: {
                message: 'Signature of the token',
                signature: signature
            },
        };
    })));
};
exports.tokenRouter = (app) => {
    app.post('/auth/request-token', requestUtils_1.ipRateLimited(20, 'request-token'), requestUtils_1.apiOnly, requestUtils_1.asyncHandler((req) => __awaiter(this, void 0, void 0, function* () {
        const query = req.query;
        const validator = new utils_1.ModelValidator(query, { initialize: true });
        return validator.validate({
            did: requestUtils_1.didValidator,
            initialize: (_name, value) => utils_1.toBoolean(value),
        });
    }), ({ did, initialize }) => __awaiter(this, void 0, void 0, function* () {
        const token = yield repository_1.default.createAccessToken(did.toLowerCase(), true);
        return {
            status: 200,
            body: {
                token: token
            },
        };
    })));
    app.post('/auth/validate-token', requestUtils_1.ipRateLimited(20, 'validate-token'), requestUtils_1.apiOnly, requestUtils_1.asyncHandler((req) => __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const validator = new utils_1.ModelValidator(body);
        return validator.validate({
            accessToken: (name, value) => __awaiter(this, void 0, void 0, function* () {
                const uuidRegex = regularExpressions_1.default.auth.uuid;
                if (!uuidRegex.test(value)) {
                    throw new utils_1.ClientFacingError(`bad ${name} format`, 400);
                }
                return value;
            }),
            did: requestUtils_1.didValidator,
            signature: (name, value) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const ethAddress = EthU.bufferToHex(utils_1.recoverEthAddressFromPersonalRpcSig(body.accessToken, value));
                    if (ethAddress !== body.did.replace('did:ethr:', '').toLowerCase()) {
                        throw new utils_1.ClientFacingError('unauthorized', 401);
                    }
                    return value;
                }
                catch (err) {
                    console.log('validate-token signature validation error');
                    console.log(err);
                    if (err instanceof utils_1.ClientFacingError) {
                        throw err;
                    }
                    throw new utils_1.ClientFacingError(`bad ${name} format`, 400);
                }
            }),
        });
    }), ({ accessToken, signature }) => __awaiter(this, void 0, void 0, function* () {
        const expiresAt = yield repository_1.default.validateAccessToken(accessToken, signature);
        if (!expiresAt) {
            throw new utils_1.ClientFacingError('unauthorized', 401);
        }
        return {
            status: 200,
            body: { expiresAt },
        };
    })));
    const parseDID = requestUtils_1.createRequestValidator((req) => __awaiter(this, void 0, void 0, function* () {
        const query = req.query;
        const validator = new utils_1.ModelValidator(query);
        return validator.validate({
            did: requestUtils_1.didValidator,
        });
    }));
    app.post('/auth/blacklist', requestUtils_1.apiOnly, requestUtils_1.adminOnlyHandler(parseDID, ({ did }) => __awaiter(this, void 0, void 0, function* () {
        yield repository_1.default.addBlacklist(did);
        return {
            status: 200,
            body: {},
        };
    })));
    app.delete('/auth/blacklist', requestUtils_1.apiOnly, requestUtils_1.adminOnlyHandler(parseDID, ({ did }) => __awaiter(this, void 0, void 0, function* () {
        yield repository_1.default.removeBlacklist(did);
        return {
            status: 200,
            body: {},
        };
    })));
    app.post('/auth/admin', requestUtils_1.apiOnly, requestUtils_1.adminOnlyHandler(parseDID, ({ did }) => __awaiter(this, void 0, void 0, function* () {
        yield repository_1.default.addAdmin(did);
        return {
            status: 200,
            body: {},
        };
    })));
    app.delete('/auth/admin', requestUtils_1.apiOnly, requestUtils_1.adminOnlyHandler(parseDID, ({ did }) => __awaiter(this, void 0, void 0, function* () {
        yield repository_1.default.removeAdmin(did);
        return {
            status: 200,
            body: {},
        };
    })));
    app.post('/auth/entity', requestUtils_1.apiOnly, requestUtils_1.adminOnlyHandler(parseDID, ({ did }) => __awaiter(this, void 0, void 0, function* () {
        yield repository_1.default.addEntity(did.toLowerCase());
        return {
            status: 200,
            body: {},
        };
    })));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0Esa0RBT3dCO0FBRXhCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBRSxtQkFBbUIsQ0FBQyxDQUFBO0FBQ25FLCtDQUF3QztBQUN4Qyx5REFBZ0Q7QUFDaEQsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUV4RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3RDLDhDQUFnQztBQUNoQyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMscUNBQXFDLENBQUMsQ0FBQTtBQUVsRSw4REFBc0Q7QUFDdEQsb0NBS2lCO0FBQ2pCLHdDQUF1QztBQUN2QywyQ0FBNEM7QUFFL0IsUUFBQSxTQUFTLEdBQUcsQ0FBQyxHQUF3QixFQUFFLEVBQUU7SUFDcEQsR0FBRyxDQUFDLElBQUksQ0FDTixhQUFhLEVBQ2IsNEJBQWEsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQzNCLHNCQUFPLEVBQ1AsMkJBQVksQ0FDVixHQUFTLEVBQUU7UUFDVCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLHFEQUFxRCxFQUFFLGtFQUFrRSxDQUFDLENBQUE7UUFFbEssTUFBTSxjQUFjLEdBQUcsRUFBRSxNQUFNLEVBQUUsK0RBQStELEVBQUUsQ0FBQTtRQUNsRyxNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFRLENBQUMsK0JBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO1FBRTdELE1BQU0sR0FBRyxHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEQsT0FBTyxHQUFHLENBQUE7SUFDWixDQUFDLENBQUEsRUFFRCxDQUFPLE1BQU0sRUFBRSxFQUFFO1FBQ2YsT0FBTztZQUNMLE1BQU0sRUFBRSxHQUFHO1lBQ1gsSUFBSSxFQUFFO2dCQUNKLE9BQU8sRUFBRSx1Q0FBdUM7Z0JBQ2hELEdBQUcsRUFBRSxNQUFNO2FBQ1o7U0FDRixDQUFBO0lBQ0gsQ0FBQyxDQUFBLENBQ0YsQ0FDRixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRVksUUFBQSxlQUFlLEdBQUcsQ0FBQyxHQUF3QixFQUFFLEVBQUU7SUFDMUQsR0FBRyxDQUFDLElBQUksQ0FDTixrQkFBa0IsRUFDbEIsNEJBQWEsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQzNCLHNCQUFPLEVBQ1AsMkJBQVksQ0FDVixDQUFNLEdBQUcsRUFBQyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBRWhCLENBQUE7UUFFRCxNQUFNLFNBQVMsR0FBRyxvQkFBWSxDQUM1QixJQUFJLENBQUMsV0FBVyxFQUNoQixvRUFBb0UsQ0FDckUsQ0FBQTtRQUVELE9BQU8sU0FBUyxDQUFBO0lBQ2xCLENBQUMsQ0FBQSxFQUVELENBQU8sU0FBUyxFQUFFLEVBQUU7UUFDbEIsT0FBTztZQUNMLE1BQU0sRUFBRSxHQUFHO1lBQ1gsSUFBSSxFQUFFO2dCQUNKLE9BQU8sRUFBRSx3QkFBd0I7Z0JBQ2pDLFNBQVMsRUFBRSxTQUFTO2FBQ3JCO1NBQ0YsQ0FBQTtJQUNILENBQUMsQ0FBQSxDQUNGLENBQ0YsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVZLFFBQUEsV0FBVyxHQUFHLENBQUMsR0FBd0IsRUFBRSxFQUFFO0lBQ3RELEdBQUcsQ0FBQyxJQUFJLENBQ04scUJBQXFCLEVBQ3JCLDRCQUFhLENBQUMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxFQUNsQyxzQkFBTyxFQUNQLDJCQUFZLENBQ1YsQ0FBTSxHQUFHLEVBQUMsRUFBRTtRQUNWLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUEyQyxDQUFBO1FBQzdELE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQWMsQ0FBQyxLQUFLLEVBQUUsRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQTtRQUUvRCxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDeEIsR0FBRyxFQUFFLDJCQUFZO1lBQ2pCLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLGlCQUFTLENBQUMsS0FBSyxDQUFDO1NBRS9DLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQSxFQUVELENBQU8sRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLEVBQUUsRUFBRTtRQUMxQixNQUFNLEtBQUssR0FBRyxNQUFNLG9CQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBRW5FLE9BQU87WUFDTCxNQUFNLEVBQUUsR0FBRztZQUNYLElBQUksRUFBRTtnQkFDSixLQUFLLEVBQUUsS0FBSzthQUNiO1NBQ0YsQ0FBQTtJQUNILENBQUMsQ0FBQSxDQUNGLENBQ0YsQ0FBQTtJQUVELEdBQUcsQ0FBQyxJQUFJLENBQ04sc0JBQXNCLEVBQ3RCLDRCQUFhLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLEVBQ25DLHNCQUFPLEVBQ1AsMkJBQVksQ0FDVixDQUFNLEdBQUcsRUFBQyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBSWhCLENBQUE7UUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLHNCQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFMUMsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3hCLFdBQVcsRUFBRSxDQUFPLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDakMsTUFBTSxTQUFTLEdBQUcsNEJBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQTtnQkFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQzFCLE1BQU0sSUFBSSx5QkFBaUIsQ0FBQyxPQUFPLElBQUksU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFBO2lCQUN2RDtnQkFDRCxPQUFPLEtBQUssQ0FBQTtZQUNkLENBQUMsQ0FBQTtZQUNELEdBQUcsRUFBRSwyQkFBWTtZQUNqQixTQUFTLEVBQUUsQ0FBTyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQy9CLElBQUk7b0JBQ0YsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FDakMsMkNBQW1DLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FDN0QsQ0FBQTtvQkFFRCxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7d0JBQ2xFLE1BQU0sSUFBSSx5QkFBaUIsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUE7cUJBQ2pEO29CQUVELE9BQU8sS0FBSyxDQUFBO2lCQUNiO2dCQUFDLE9BQU8sR0FBRyxFQUFFO29CQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTJDLENBQUMsQ0FBQTtvQkFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtvQkFDaEIsSUFBSSxHQUFHLFlBQVkseUJBQWlCLEVBQUU7d0JBQ3BDLE1BQU0sR0FBRyxDQUFBO3FCQUNWO29CQUNELE1BQU0sSUFBSSx5QkFBaUIsQ0FBQyxPQUFPLElBQUksU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFBO2lCQUN2RDtZQUNILENBQUMsQ0FBQTtTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQSxFQUNELENBQU8sRUFBQyxXQUFXLEVBQUUsU0FBUyxFQUFDLEVBQUUsRUFBRTtRQUNqQyxNQUFNLFNBQVMsR0FBRyxNQUFNLG9CQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBRXhFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZCxNQUFNLElBQUkseUJBQWlCLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1NBQ2pEO1FBQ0QsT0FBTztZQUNMLE1BQU0sRUFBRSxHQUFHO1lBQ1gsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFDO1NBQ2xCLENBQUE7SUFDSCxDQUFDLENBQUEsQ0FDRixDQUNGLENBQUE7SUFFRCxNQUFNLFFBQVEsR0FBRyxxQ0FBc0IsQ0FBQyxDQUFNLEdBQUcsRUFBQyxFQUFFO1FBQ2xELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFzQixDQUFBO1FBQ3hDLE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUUzQyxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDeEIsR0FBRyxFQUFFLDJCQUFZO1NBQ2xCLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQSxDQUFDLENBQUE7SUFFRixHQUFHLENBQUMsSUFBSSxDQUNOLGlCQUFpQixFQUNqQixzQkFBTyxFQUNQLCtCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFPLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBRTtRQUN6QyxNQUFNLG9CQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzVCLE9BQU87WUFDTCxNQUFNLEVBQUUsR0FBRztZQUNYLElBQUksRUFBRSxFQUFFO1NBQ1QsQ0FBQTtJQUNILENBQUMsQ0FBQSxDQUFDLENBQ0gsQ0FBQTtJQUVELEdBQUcsQ0FBQyxNQUFNLENBQ1IsaUJBQWlCLEVBQ2pCLHNCQUFPLEVBQ1AsK0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQU8sRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFFO1FBQ3pDLE1BQU0sb0JBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDL0IsT0FBTztZQUNMLE1BQU0sRUFBRSxHQUFHO1lBQ1gsSUFBSSxFQUFFLEVBQUU7U0FDVCxDQUFBO0lBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FDSCxDQUFBO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FDTixhQUFhLEVBQ2Isc0JBQU8sRUFDUCwrQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBTyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUU7UUFDekMsTUFBTSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN4QixPQUFPO1lBQ0wsTUFBTSxFQUFFLEdBQUc7WUFDWCxJQUFJLEVBQUUsRUFBRTtTQUNULENBQUE7SUFDSCxDQUFDLENBQUEsQ0FBQyxDQUNILENBQUE7SUFFRCxHQUFHLENBQUMsTUFBTSxDQUNSLGFBQWEsRUFDYixzQkFBTyxFQUNQLCtCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFPLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBRTtRQUN6QyxNQUFNLG9CQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLE9BQU87WUFDTCxNQUFNLEVBQUUsR0FBRztZQUNYLElBQUksRUFBRSxFQUFFO1NBQ1QsQ0FBQTtJQUNILENBQUMsQ0FBQSxDQUFDLENBQ0gsQ0FBQTtJQUVELEdBQUcsQ0FBQyxJQUFJLENBQ04sY0FBYyxFQUNkLHNCQUFPLEVBQ1AsK0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQU8sRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFFO1FBQ3pDLE1BQU0sb0JBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7UUFDdkMsT0FBTztZQUNMLE1BQU0sRUFBRSxHQUFHO1lBQ1gsSUFBSSxFQUFFLEVBQUU7U0FDVCxDQUFBO0lBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIn0=