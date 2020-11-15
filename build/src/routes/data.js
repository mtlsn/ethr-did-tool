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
const repository_1 = require("../repository");
const utils_1 = require("../utils");
const did_resolver_1 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
const EthU = require("ethereumjs-util");
exports.dataRouter = (app) => {
    app.get('/data/me', requestUtils_1.ipRateLimited(60, 'me'), requestUtils_1.apiOnly, requestUtils_1.noValidatorAuthenticatedHandler(({ entity: { did } }) => __awaiter(this, void 0, void 0, function* () {
        const [entity, cypherIndexes] = yield Promise.all([
            repository_1.default.getMe(did),
            repository_1.default.getEncryptedIndexes(did),
        ]);
        const providerConfig = { rpcUrl: 'https://ropsten.infura.io/v3/91b0038d3b154f0a9b11212d29485594' };
        const didResolver = new did_resolver_1.Resolver(ethr_did_resolver_1.getResolver(providerConfig));
        const doc = yield didResolver.resolve(did);
        return {
            status: 200,
            body: {
                did: doc,
                dataCount: entity.data_count,
                deletedCount: entity.deleted_count,
                cypherIndexes: cypherIndexes
                    .filter(ci => ci && ci.cypherindex)
                    .map(ci => ({
                    cypherindex: ci.cypherindex.toString(),
                })),
            },
        };
    })));
    const getData = requestUtils_1.authenticatedHandler((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const body = req.params;
        const queryParams = req.query;
        const validator = new utils_1.ModelValidator(Object.assign({}, body, queryParams), { end: true, cypherindex: true });
        return validator.validate({
            start: utils_1.requiredNumber,
            end: utils_1.optionalNumber,
            cypherindex: (_name, value) => {
                if (value && typeof value === 'string' && utils_1.isNotEmpty(value)) {
                    return Buffer.from(value);
                }
                else {
                    return null;
                }
            },
        });
    }), ({ entity: { did }, start, end, cypherindex }) => __awaiter(this, void 0, void 0, function* () {
        const entities = yield repository_1.default.getData({ did, start, end, cypherindex });
        if (entities.length === 0)
            return { status: 404, body: {} };
        return {
            status: 200,
            body: yield Promise.all(entities.map((e) => __awaiter(this, void 0, void 0, function* () {
                let cyphertext = null;
                if (e.cyphertext) {
                    cyphertext = e.cyphertext.toString();
                }
                return {
                    id: e.id,
                    cyphertext,
                };
            }))),
        };
    }));
    app.get('/data/:start', requestUtils_1.ipRateLimited(60, 'get-data'), requestUtils_1.apiOnly, getData);
    app.get('/data/:start/:end', requestUtils_1.ipRateLimited(60, 'get-data'), requestUtils_1.apiOnly, getData);
    app.post('/data', requestUtils_1.ipRateLimited(60, 'post-data'), requestUtils_1.apiOnly, requestUtils_1.authenticatedAndAuthorizationThirdPartyHandler((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const validator = new utils_1.ModelValidator(body, { id: true, cypherindex: true });
        return validator.validate({
            id: utils_1.optionalNumber,
            cyphertext: (name, value) => {
                try {
                    if (!utils_1.isNotEmpty(value)) {
                        throw new Error(`cyphertext cannot be empty`);
                    }
                    return Buffer.from(value);
                }
                catch (err) {
                    throw new utils_1.ClientFacingError(`bad ${name} format`);
                }
            },
            cypherindex: (_name, value) => {
                if (value && typeof value === 'string' && utils_1.isNotEmpty(value)) {
                    return Buffer.from(value);
                }
                else {
                    return null;
                }
            },
        });
    }), ({ entity: { did }, id, cyphertext, cypherindex }) => __awaiter(this, void 0, void 0, function* () {
        const newId = yield repository_1.default.insertData({ did, cyphertext, id, cypherindex });
        if (newId === null)
            throw new utils_1.ClientFacingError('id not in sequence');
        return {
            status: 200,
            body: {
                id: newId,
            },
        };
    })));
    const deleteData = requestUtils_1.authenticatedHandler((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const validator = new utils_1.ModelValidator({
            start: req.params.start,
            end: req.params.end,
            signatures: req.body.signatures,
        }, { end: true, signatures: true });
        return validator.validate({
            start: utils_1.requiredNumber,
            end: utils_1.optionalNumber,
            signatures: (name, value, model) => __awaiter(this, void 0, void 0, function* () {
                const expectedLength = utils_1.udefCoalesce(model.end, model.start) - model.start + 1;
                if (value && value.length !== expectedLength) {
                    throw new utils_1.ClientFacingError(`too many or too few signatures`);
                }
                if (!value)
                    value = [];
                const ids = [...Array(expectedLength).keys()]
                    .map(Number)
                    .map(i => i + model.start);
                const { did } = req.entity;
                return {
                    signatures: value.map((s, i) => {
                        try {
                            const ethAddress = EthU.bufferToHex(utils_1.recoverEthAddressFromPersonalRpcSig(utils_1.dataDeletionMessage(ids[i]), s));
                            if (ethAddress !== did.replace('did:ethr:', '')) {
                                throw new utils_1.ClientFacingError(`invalid signature for id: ${ids[i]}`);
                            }
                        }
                        catch (err) {
                            console.log('DELETE /data signature validation error');
                            console.log(err);
                            if (err instanceof utils_1.ClientFacingError) {
                                throw err;
                            }
                            throw new utils_1.ClientFacingError(`bad signature format for id: ${ids[i]}`);
                        }
                        return s;
                    }),
                    ids,
                };
            }),
        });
    }), ({ entity: { did }, signatures: { signatures, ids } }) => __awaiter(this, void 0, void 0, function* () {
        return {
            status: 200,
            body: yield repository_1.default.deleteData(did, ids, signatures),
        };
    }));
    app.delete('/data/:start/:end', requestUtils_1.ipRateLimited(60, 'delete-data'), requestUtils_1.apiOnly, deleteData);
    app.delete('/data/:start', requestUtils_1.ipRateLimited(60, 'delete-data'), requestUtils_1.apiOnly, deleteData);
    const getDeletions = requestUtils_1.authenticatedHandler((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const validator = new utils_1.ModelValidator({
            start: req.params.start,
            end: req.params.end,
        }, { end: true });
        return validator.validate({ start: utils_1.requiredNumber, end: utils_1.optionalNumber });
    }), ({ entity: { did }, start, end }) => __awaiter(this, void 0, void 0, function* () {
        const result = yield repository_1.default.getDeletions(did, start, end);
        return {
            status: 200,
            body: result.map(r => {
                return {
                    id: r.data_id,
                    signature: r.signature,
                };
            }),
        };
    }));
    app.get('/deletions/:start/:end', requestUtils_1.ipRateLimited(60, 'deletions'), requestUtils_1.apiOnly, getDeletions);
    app.get('/deletions/:start', requestUtils_1.ipRateLimited(60, 'deletions'), requestUtils_1.apiOnly, getDeletions);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yb3V0ZXMvZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0Esa0RBT3dCO0FBQ3hCLDhDQUFnQztBQUNoQyxvQ0FTaUI7QUFDakIsK0NBQXdDO0FBQ3hDLHlEQUFnRDtBQUNoRCx3Q0FBdUM7QUFFMUIsUUFBQSxVQUFVLEdBQUcsQ0FBQyxHQUF3QixFQUFFLEVBQUU7SUFDckQsR0FBRyxDQUFDLEdBQUcsQ0FDTCxVQUFVLEVBQ1YsNEJBQWEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQ3ZCLHNCQUFPLEVBQ1AsOENBQStCLENBQUMsQ0FBTyxFQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBQyxFQUFDLEVBQUUsRUFBRTtRQUN4RCxNQUFNLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNoRCxvQkFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDZixvQkFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztTQUM5QixDQUFDLENBQUE7UUFDRixNQUFNLGNBQWMsR0FBRyxFQUFFLE1BQU0sRUFBRSwrREFBK0QsRUFBRSxDQUFBO1FBQ2xHLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVEsQ0FBQywrQkFBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7UUFFN0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBRTFDLE9BQU87WUFDTCxNQUFNLEVBQUUsR0FBRztZQUNYLElBQUksRUFBRTtnQkFDSixHQUFHLEVBQUUsR0FBRztnQkFDUixTQUFTLEVBQUUsTUFBTSxDQUFDLFVBQVU7Z0JBQzVCLFlBQVksRUFBRSxNQUFNLENBQUMsYUFBYTtnQkFDbEMsYUFBYSxFQUFFLGFBQWE7cUJBQ3pCLE1BQU0sQ0FBQyxFQUFFLENB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