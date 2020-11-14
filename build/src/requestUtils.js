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
const repository_1 = require("./repository");
const regularExpressions_1 = require("./regularExpressions");
const environment_1 = require("./environment");
const utils_1 = require("./utils");
const did_common_typescript_1 = require("@decentralized-identity/did-common-typescript");
const EthU = require("ethereumjs-util");
// this helps typescript infer the types
function createRequestValidator(validator) {
    return validator;
}
exports.createRequestValidator = createRequestValidator;
function asyncHandler(validator, handler) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const parameters = yield validator(req, res, next);
            const result = yield handler(parameters);
            res.status(result.status).json(result.body);
        }
        catch (err) {
            return next(err);
        }
    });
}
exports.asyncHandler = asyncHandler;
function authenticatedHandler(validator, handler) {
    return [
        exports.authorized,
        (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const parameters = yield validator(req, res, next);
                const result = yield handler(Object.assign({}, parameters, { entity: req.entity }));
                res.status(result.status).json(result.body);
            }
            catch (err) {
                return next(err);
            }
        }),
    ];
}
exports.authenticatedHandler = authenticatedHandler;
function adminOnlyHandler(validator, handler) {
    return authenticatedHandler(validator, (params) => __awaiter(this, void 0, void 0, function* () {
        if (!(yield repository_1.default.isAdmin(params.entity.did))) {
            throw new utils_1.ClientFacingError('unauthorized', 401);
        }
        return handler(params);
    }));
}
exports.adminOnlyHandler = adminOnlyHandler;
exports.noValidator = (_req, _res) => __awaiter(this, void 0, void 0, function* () { });
function noValidatorAuthenticatedHandler(handler) {
    return authenticatedHandler(exports.noValidator, handler);
}
exports.noValidatorAuthenticatedHandler = noValidatorAuthenticatedHandler;
const ethrDidDocumentTmpl = (ethAddress) => ({
    '@context': 'https://w3id.org/did/v1',
    id: `did:ethr:${ethAddress}`,
    publicKey: [
        {
            id: `did:ethr:${ethAddress}#owner`,
            type: 'Secp256k1VerificationKey2018',
            controller: `did:ethr:${ethAddress}`,
            ethereumAddress: ethAddress,
        },
    ],
    authentication: [
        {
            type: 'Secp256k1SignatureAuthentication2018',
            publicKey: `did:ethr:${ethAddress}#owner`,
        },
    ],
});
/**
 * Simplified "resolver", that just uses a template to avoid unnecessary performance issues.
 */
class EthereumDIDResolver {
    resolve(did) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!did.startsWith('did:ethr:') ||
                !EthU.isValidAddress(did.replace('did:ethr:', ''))) {
                throw Error('unable to resolve did document');
            }
            const didDocument = ethrDidDocumentTmpl(did.replace('did:ethr:', ''));
            return {
                didDocument: new did_common_typescript_1.DidDocument(didDocument),
            };
        });
    }
}
exports.EthereumDIDResolver = EthereumDIDResolver;
/**
 * Validates dids by resolving to a did document.
 * Supported formats:
 * - did:ethr:0x...
 */
function didValidator(name, did) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { didDocument } = yield new EthereumDIDResolver().resolve(did);
            return didDocument.id;
        }
        catch (err) {
            console.log(`didValidator error: ${err}`);
            throw new utils_1.ClientFacingError(`bad ${name} format`);
        }
    });
}
exports.didValidator = didValidator;
exports.apiOnly = (req, res, next) => {
    if (typeof req.body === 'undefined' ||
        (Object.keys(req.body).length === 0 && req.body.constructor === Object)) {
        return next();
    }
    const ct = req.header('Content-Type');
    if (typeof ct === 'string' && ct.trimLeft().startsWith('application/json')) {
        return next();
    }
    else {
        // 415 = Unsupported media type
        return res.status(415).end();
    }
};
exports.authorized = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const auth = req.header('Authorization');
        if (!auth)
            return res.status(401).end();
        const basicAuthRegex = regularExpressions_1.default.requestUtils.basicAuth;
        const matches = basicAuthRegex.exec(auth);
        if (!matches)
            return res.status(401).end();
        const entity = yield repository_1.default.checkAccessToken(matches[1]);
        if (!entity) {
            return res.status(401).end();
        }
        req.entity = entity;
        return next();
    }
    catch (err) {
        next(err);
    }
});
function ipRateLimited(maxPerMinute, endpoint) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const disable = environment_1.env.disableRateLimiting();
            if (disable)
                return next();
            const count = yield repository_1.default.updateCallCount(req.ip, endpoint);
            if (count > maxPerMinute) {
                console.log('IP rate limited violation');
                return res.status(429).end();
            }
            return next();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.ipRateLimited = ipRateLimited;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdFV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JlcXVlc3RVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBTUEsNkNBQTBDO0FBQzFDLDZEQUFxRDtBQUNyRCwrQ0FBaUM7QUFDakMsbUNBQXlDO0FBQ3pDLHlGQU1zRDtBQUN0RCx3Q0FBdUM7QUFrQnZDLHdDQUF3QztBQUN4QyxTQUFnQixzQkFBc0IsQ0FBSSxTQUE4QjtJQUN0RSxPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDO0FBRkQsd0RBRUM7QUFFRCxTQUFnQixZQUFZLENBQzFCLFNBQThCLEVBQzlCLE9BQW1EO0lBRW5ELE9BQU8sQ0FBTyxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCLEVBQUUsRUFBRTtRQUMvRCxJQUFJO1lBQ0YsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUNsRCxNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUN4QyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzVDO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNqQjtJQUNILENBQUMsQ0FBQSxDQUFBO0FBQ0gsQ0FBQztBQWJELG9DQWFDO0FBRUQsU0FBZ0Isb0JBQW9CLENBQ2xDLFNBQTJDLEVBQzNDLE9BQXVFO0lBRXZFLE9BQU87UUFDTCxrQkFBVTtRQUNWLENBQU8sR0FBeUIsRUFBRSxHQUFhLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ3JFLElBQUk7Z0JBQ0YsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FB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