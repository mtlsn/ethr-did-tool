"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const aesjs = require("aes-js");
/**
 * Uses Node's crypto.randomBytes to generate an aes-js ByteSource of type num[]
 */
exports.getRandomKey = (keyLength = 256) => {
    const bytesLen = keyLength / 8;
    if ([16, 24, 32].indexOf(bytesLen) === -1) {
        throw new Error(`Invalid keyLength: ${keyLength.toString()}`);
    }
    const nums = [];
    const randBytes = crypto.randomBytes(bytesLen);
    for (const n of randBytes) {
        nums.push(n);
    }
    return nums;
};
// This function is only used for test purposes. Not for real data
exports.encryptAES = (text, key) => {
    const textBytes = aesjs.utils.utf8.toBytes(text);
    // The counter is optional, and if omitted will begin at 1
    const aesCtr = new aesjs.ModeOfOperation.ctr(key);
    const encryptedBytes = aesCtr.encrypt(textBytes);
    // To print or store the binary data, you may convert it to hex
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
};
exports.decryptAES = (encryptedHex, key) => {
    // When ready to decrypt the hex string, convert it back to bytes
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    const aesCtr = new aesjs.ModeOfOperation.ctr(key);
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    // Convert our bytes back into text
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC91dGxzL2Flcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFnQztBQUdoQyxnQ0FBK0I7QUFFL0I7O0dBRUc7QUFDVSxRQUFBLFlBQVksR0FBRyxDQUFDLFlBQW9CLEdBQUcsRUFBYyxFQUFFO0lBQ2xFLE1BQU0sUUFBUSxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUE7SUFDOUIsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUE7S0FDOUQ7SUFFRCxNQUFNLElBQUksR0FBYSxFQUFFLENBQUE7SUFDekIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUM5QyxLQUFLLE1BQU0sQ0FBQyxJQUFJLFNBQVMsRUFBRTtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2I7SUFDRCxPQUFPLElBQUksQ0FBQTtBQUNiLENBQUMsQ0FBQTtBQUVELGtFQUFrRTtBQUNyRCxRQUFBLFVBQVUsR0FBRyxDQUFDLElBQVksRUFBRSxHQUFlLEVBQVUsRUFBRTtJQUNsRSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEQsMERBQTBEO0lBQzFELE1BQU0sTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDakQsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUVoRCwrREFBK0Q7SUFDL0QsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQzlELE9BQU8sWUFBWSxDQUFBO0FBQ3JCLENBQUMsQ0FBQTtBQUVZLFFBQUEsVUFBVSxHQUFHLENBQUMsWUFBb0IsRUFBRSxHQUFlLEVBQVUsRUFBRTtJQUMxRSxpRUFBaUU7SUFDakUsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBRTVELGdFQUFnRTtJQUNoRSwrQ0FBK0M7SUFDL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNqRCxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBRXJELG1DQUFtQztJQUNuQyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDaEUsT0FBTyxhQUFhLENBQUE7QUFDdEIsQ0FBQyxDQUFBIn0=