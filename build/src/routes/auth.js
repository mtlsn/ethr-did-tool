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
        // const DidRegistryContract = require('ethr-did-registry')
        // let networkId = 1 // Mainnet
        // let DidReg = web3.eth.contract(DidRegistryContract.abi)
        // return DidReg.at(DidRegistryContract.networks[networkId].address)
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
        const signature = utils_2.personalSign(token, '0xe36b2e5c2207c03aff7c160d8b313713a0fa1a36fd9596244ca50155449c7c79');
        return {
            status: 200,
            body: {
                token: token,
                signature: signature
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yb3V0ZXMvYXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0Esa0RBT3dCO0FBRXhCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBRSxtQkFBbUIsQ0FBQyxDQUFBO0FBQ25FLCtDQUF3QztBQUN4Qyx5REFBZ0Q7QUFDaEQsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUV4RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3RDLDhDQUFnQztBQUNoQyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMscUNBQXFDLENBQUMsQ0FBQTtBQUVsRSw4REFBc0Q7QUFDdEQsb0NBS2lCO0FBQ2pCLHdDQUF1QztBQUN2QywyQ0FBNEM7QUFFL0IsUUFBQSxTQUFTLEdBQUcsQ0FBQyxHQUF3QixFQUFFLEVBQUU7SUFDcEQsR0FBRyxDQUFDLElBQUksQ0FDTixhQUFhLEVBQ2IsNEJBQWEsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQzNCLHNCQUFPLEVBQ1AsMkJBQVksQ0FDVixHQUFTLEVBQUU7UUFDVCwyREFBMkQ7UUFFM0QsK0JBQStCO1FBQy9CLDBEQUEwRDtRQUMxRCxvRUFBb0U7UUFFcEUsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxxREFBcUQsRUFBRSxrRUFBa0UsQ0FBQyxDQUFBO1FBRWxLLE1BQU0sY0FBYyxHQUFHLEVBQUUsTUFBTSxFQUFFLCtEQUErRCxFQUFFLENBQUE7UUFDbEcsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBUSxDQUFDLCtCQUFXLENBQUMsY0FB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