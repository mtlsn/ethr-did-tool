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
const EthU = require("ethereumjs-util");
const wallet = require("ethereumjs-wallet");
const sleep = (miliseconds) => new Promise(resolve => setTimeout(resolve, miliseconds));
// this can be used as a sort of async worker that lives within the same process
function attempt(callback, attempts = 1, errorDelayMs = 0, delayedStartMs = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sleep(delayedStartMs);
        try {
            const result = yield callback();
            return result;
        }
        catch (error) {
            if (attempts === 1)
                throw error;
            yield sleep(errorDelayMs);
            return attempt(callback, attempts - 1, errorDelayMs);
        }
    });
}
exports.attempt = attempt;
class ModelValidator {
    constructor(model, allowMissing = {}) {
        this.model = model;
        this.allowMissing = allowMissing;
    }
    validateProp(name, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = this.model[name];
            if (!this.allowMissing[name] && value === undefined) {
                throw new ClientFacingError(`missing ${name}`);
            }
            const validated = yield callback(name, value, this.model);
            return validated === undefined ? value : validated;
        });
    }
    validate(validators) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const validator in validators) {
                this.model[validator] = yield this.validateProp(validator, validators[validator]);
            }
            return this.model;
        });
    }
}
exports.ModelValidator = ModelValidator;
class ClientFacingError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}
exports.ClientFacingError = ClientFacingError;
function notUndefined(value) {
    if (value === undefined)
        return false;
    return true;
}
exports.notUndefined = notUndefined;
function udefCoalesce(value, ...replacements) {
    if (notUndefined(value))
        return value;
    for (const replacement of replacements) {
        if (notUndefined(replacement))
            return replacement;
    }
    throw new Error('could not replace value');
}
exports.udefCoalesce = udefCoalesce;
function requiredNumber(name, value) {
    try {
        value = Number(value);
        if (isNaN(value))
            throw new Error('');
        return value;
    }
    catch (err) {
        throw new ClientFacingError(`bad ${name} format`);
    }
}
exports.requiredNumber = requiredNumber;
function optionalNumber(name, value) {
    return value === undefined ? value : requiredNumber(name, value);
}
exports.optionalNumber = optionalNumber;
function dataDeletionMessage(id) {
    return `delete data id ${id}`;
}
exports.dataDeletionMessage = dataDeletionMessage;
function toBoolean(value) {
    if (typeof value === 'boolean')
        return value;
    if (value === undefined || value === null)
        return false;
    if (['true', 'True', 'TRUE'].indexOf(value) !== -1)
        return true;
    if (Number(value) === 1)
        return true;
    return false;
}
exports.toBoolean = toBoolean;
function recoverEthAddressFromDigest(digest, rpcSig) {
    // Extract the signature parts so we can recover the public key
    const sigParts = EthU.fromRpcSig(rpcSig);
    // Recover public key from the hash of the message we constructed and the signature the user provided
    const recoveredPubkey = EthU.ecrecover(digest, sigParts.v, sigParts.r, sigParts.s);
    // Convert the recovered public key into the corresponding ethereum address
    const recoveredAddress = wallet.fromPublicKey(recoveredPubkey).getAddressString();
    const zerox = '0x';
    return new Buffer(recoveredAddress.startsWith(zerox)
        ? recoveredAddress.substring(zerox.length)
        : recoveredAddress, 'hex');
}
function recoverEthAddressFromPersonalRpcSig(signedText, rpcSig) {
    // Hash the text the same way web3 does with the weird "Ethereum Signed Message" text
    const hashed = EthU.hashPersonalMessage(EthU.toBuffer(signedText));
    return recoverEthAddressFromDigest(hashed, rpcSig);
}
exports.recoverEthAddressFromPersonalRpcSig = recoverEthAddressFromPersonalRpcSig;
function personalSign(message, privateKey) {
    const sig = EthU.ecsign(EthU.hashPersonalMessage(EthU.toBuffer(message)), EthU.toBuffer(privateKey));
    return EthU.toRpcSig(sig.v, sig.r, sig.s);
}
exports.personalSign = personalSign;
exports.isNotEmpty = (value) => value.replace(/\s+/g, '') !== '';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHdDQUF1QztBQUN2Qyw0Q0FBMkM7QUFFM0MsTUFBTSxLQUFLLEdBQUcsQ0FBQyxXQUFtQixFQUFFLEVBQUUsQ0FDcEMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUE7QUFFMUQsZ0ZBQWdGO0FBQ2hGLFNBQXNCLE9BQU8sQ0FDM0IsUUFBMEIsRUFDMUIsV0FBbUIsQ0FBQyxFQUNwQixlQUF1QixDQUFDLEVBQ3hCLGlCQUF5QixDQUFDOztRQUUxQixNQUFNLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUMzQixJQUFJO1lBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLEVBQUUsQ0FBQTtZQUMvQixPQUFPLE1BQU0sQ0FBQTtTQUNkO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxJQUFJLFFBQVEsS0FBSyxDQUFDO2dCQUFFLE1BQU0sS0FBSyxDQUFBO1lBQy9CLE1BQU0sS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQ3pCLE9BQU8sT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFBO1NBQ3JEO0lBQ0gsQ0FBQztDQUFBO0FBZkQsMEJBZUM7QUFvQkQsTUFBYSxjQUFjO0lBQ3pCLFlBQW1CLEtBQVEsRUFBUyxlQUFxQyxFQUFFO1FBQXhELFVBQUssR0FBTCxLQUFLLENBQUc7UUFBUyxpQkFBWSxHQUFaLFlBQVksQ0FBMkI7SUFBRyxDQUFDO0lBRWxFLFlBQVksQ0FDdkIsSUFBTyxFQUNQLFFBQTRCOztZQUU1QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFB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