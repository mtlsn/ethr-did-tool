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
function authenticatedAndAuthorizationThirdPartyHandler(validator, handler) {
    return [
        exports.authorizedPostToAdmin,
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
exports.authenticatedAndAuthorizationThirdPartyHandler = authenticatedAndAuthorizationThirdPartyHandler;
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
exports.authorizedPostToAdmin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
        const adminEntity = yield repository_1.default.fetchAdminToken(matches[1]);
        if (!adminEntity) {
            return res.status(401).end();
        }
        req.entity = adminEntity;
        return next();
    }
    catch (err) {
        next(err);
    }
});
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