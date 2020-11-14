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
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../.env.debug') });
const assert = require("assert");
const node_fetch_1 = require("node-fetch");
const pg_1 = require("pg");
const migrations_1 = require("../migrations");
const db = require("../database");
const utils_1 = require("../src/utils");
const aes_1 = require("./utls/aes");
const uuidv4_1 = require("uuidv4");
const url = 'http://localhost:3001';
describe('Data', () => {
    let client;
    let users;
    let firstUserAddress;
    let firstUser;
    let secondUserAddress;
    let secondUser;
    function createDid(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield node_fetch_1.default(`${url}/did/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const body = yield response.json();
            user.accessToken = body.token;
        });
    }
    function requestToken(user, initialize = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield node_fetch_1.default(`${url}/auth/request-token?did=${user.did}&initialize=${initialize}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const body = yield response.json();
            user.accessToken = body.token;
        });
    }
    function validateToken(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: user.accessToken,
                    signature: utils_1.personalSign(user.accessToken, user.privateKey),
                    did: user.did,
                }),
            });
        });
    }
    function getMe(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return node_fetch_1.default(`${url}/data/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        });
    }
    function getData({ token, start, end, cypherindex, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryParams = (cypherindex
                ? `?cypherindex=${encodeURIComponent(cypherindex)}`
                : '').trim();
            return node_fetch_1.default(`${url}/data/${start}/${utils_1.udefCoalesce(end, '')}${queryParams}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        });
    }
    function postData({ token, cyphertext, id, cypherindex, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return node_fetch_1.default(`${url}/data`, {
                method: 'POST',
                body: JSON.stringify({ id, cyphertext, cypherindex }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        });
    }
    function deleteData(token, start, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return node_fetch_1.default(`${url}/data/${start}/${utils_1.udefCoalesce(opts.end, '')}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    signatures: opts.signatures,
                }),
            });
        });
    }
    function getDeletions(token, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            return node_fetch_1.default(`${url}/deletions/${start}/${utils_1.udefCoalesce(end, '')}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        });
    }
    before(() => __awaiter(this, void 0, void 0, function* () {
        client = new pg_1.Client(db.mocha);
        yield client.connect();
        yield migrations_1.down(db.mocha, false);
        yield migrations_1.up(db.mocha, false);
        // User setup
        firstUserAddress = '0xba35e4f63bce9047464671fcbadbae41509c4b8e';
        firstUser = {
            privateKey: '0x6fba3824f0d7fced2db63907faeaa6ffae283c3bf94072e0a3b2940b2b572b65',
            did: `did:ethr:${firstUserAddress}`,
            aesKey: aes_1.getRandomKey(),
            indexNonce: `${uuidv4_1.default()}:${uuidv4_1.default()}`,
            data: [
                { id: 0, text: 'user1data0' },
                { id: 1, text: 'user1data1' },
                { id: 2, text: 'user1data2', type: 'user1data2-type-1' },
                { id: 3, text: 'user1data3', type: 'user1data3-type-2' },
            ],
            accessToken: '',
        };
        secondUserAddress = '0x33fc5b05705b91053e157bc2b2203f17f532f606';
        secondUser = {
            privateKey: '0x57db064025480c5c131d4978dcaea1a47246ad33b7c45cf757eac37db1bbe20e',
            did: `did:ethr:${secondUserAddress}`,
            aesKey: aes_1.getRandomKey(),
            indexNonce: `${uuidv4_1.default()}:${uuidv4_1.default()}`,
            data: [
                { id: 0, text: 'user2data0' },
                { id: 1, text: 'user2data1' },
                { id: 2, text: 'user2data2' },
                { id: 3, text: 'user2data3', type: 'user2data3-type' },
            ],
            accessToken: '',
        };
        users = [firstUser, secondUser];
        yield requestToken(firstUser, true);
        yield validateToken(firstUser);
        let response = yield node_fetch_1.default(`${url}/debug/set-env/ALLOW_ANONYMOUS/true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${firstUser.accessToken}`,
            },
        });
        yield requestToken(secondUser);
        yield validateToken(secondUser);
        response = yield node_fetch_1.default(`${url}/debug/set-env/ALLOW_ANONYMOUS/false`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${firstUser.accessToken}`,
            },
        });
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield client.end();
    }));
    it('should return the did and 0 for the data and deleted count', () => __awaiter(this, void 0, void 0, function* () {
        for (const user of users) {
            const response = yield getMe(user.accessToken);
            const body = yield response.json();
            assert.equal(body.did.id, user.did);
            assert.equal(body.dataCount, 0);
            assert.equal(body.deletedCount, 0);
            assert.equal(response.status, 200);
        }
    }));
    describe('after spamming an endpoint', () => __awaiter(this, void 0, void 0, function* () {
        let response;
        before(() => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 65; i++) {
                response = yield getMe(firstUser.accessToken);
            }
        }));
        after(() => __awaiter(this, void 0, void 0, function* () {
            yield client.query('delete from ip_call_count;');
        }));
        it('should hit a rate limit', () => {
            assert.equal(response.status, 429);
        });
    }));
    context('after inserting some data', () => {
        before(() => __awaiter(this, void 0, void 0, function* () {
            for (const user of users) {
                for (const data of user.data) {
                    const plaintext = JSON.stringify(data);
                    const message = aes_1.encryptAES(plaintext, user.aesKey);
                    const getCypherIndex = () => {
                        if (typeof data.type === 'undefined') {
                            return undefined;
                        }
                        const plaintextIndex = JSON.stringify({
                            nonce: user.indexNonce,
                            type: data.type,
                        });
                        const cypherindex = aes_1.encryptAES(plaintextIndex, user.aesKey);
                        return cypherindex;
                    };
                    // only specify the id sometimes to test with or without it
                    const requestData = {
                        token: user.accessToken,
                        cyphertext: message,
                        id: data.id % 2 === 0 ? data.id : undefined,
                        cypherindex: getCypherIndex(),
                    };
                    // console.log({requestData})
                    const response = yield postData(requestData);
                    // console.log({response})
                }
            }
        }));
        it('should return the number of data objects for each user', () => __awaiter(this, void 0, void 0, function* () {
            for (const user of users) {
                const response = yield getMe(user.accessToken);
                const body = yield response.json();
                assert.equal(body.dataCount, user.data.length);
                assert.equal(body.deletedCount, 0);
            }
        }));
        it('can verify the returned data', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield getData({
                token: firstUser.accessToken,
                start: 0,
                end: firstUser.data.length - 1,
            });
            const body = yield response.json();
            assert.equal(body[0].id, 0);
            assert.equal(body.length, firstUser.data.length);
            const decrypted = yield aes_1.decryptAES(body[0].cyphertext, firstUser.aesKey);
            const data = JSON.parse(decrypted);
            assert.equal(data.id, firstUser.data[0].id);
            assert.equal(data.text, firstUser.data[0].text);
        }));
        it('should not return data outside of the index range', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield getData({
                token: firstUser.accessToken,
                start: 0,
                end: firstUser.data.length - 2,
            });
            const body = yield response.json();
            assert.equal(body[0].id, 0);
            assert.equal(body.length, firstUser.data.length - 1);
        }));
        it('should not return data outside of the index range', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield getData({
                token: firstUser.accessToken,
                start: 5,
                end: firstUser.data.length - 2,
            });
            const body = yield response.json();
            assert.equal(response.status, 404);
            assert.deepStrictEqual(body, {});
        }));
        it('can retrieve data by index and verify it', () => __awaiter(this, void 0, void 0, function* () {
            const indexedData = firstUser.data
                .filter(d => typeof d.type !== 'undefined')
                .sort(d => d.id);
            for (const d of indexedData) {
                const plaintextIndex = JSON.stringify({
                    nonce: firstUser.indexNonce,
                    type: d.type,
                });
                const cypherindex = aes_1.encryptAES(plaintextIndex, firstUser.aesKey);
                const response = yield getData({
                    token: firstUser.accessToken,
                    start: d.id,
                    cypherindex,
                });
                const body = yield response.json();
                const decrypted = yield aes_1.decryptAES(body[0].cyphertext, firstUser.aesKey);
                const data = JSON.parse(decrypted);
                assert.equal(data.id, d.id);
                assert.equal(data.text, d.text);
            }
        }));
        it('should not return data outside of the index range with the cypherindex', () => __awaiter(this, void 0, void 0, function* () {
            const outsidePlaintextIndex = JSON.stringify({
                nonce: firstUser.indexNonce,
                type: firstUser.data[2].type,
            });
            const outsideCypherindex = aes_1.encryptAES(outsidePlaintextIndex, firstUser.aesKey);
            const response = yield getData({
                token: firstUser.accessToken,
                start: 0,
                cypherindex: outsideCypherindex,
            });
            const body = yield response.json();
            assert.equal(response.status, 404);
            assert.deepStrictEqual(body, {});
        }));
        it('should not return data outside from another did with the cypherindex', () => __awaiter(this, void 0, void 0, function* () {
            const outsidePlaintextIndex = JSON.stringify({
                nonce: secondUser.indexNonce,
                type: secondUser.data[3].type,
            });
            const outsideCypherindex = aes_1.encryptAES(outsidePlaintextIndex, secondUser.aesKey);
            const response = yield getData({
                token: firstUser.accessToken,
                start: 0,
                cypherindex: outsideCypherindex,
            });
            const body = yield response.json();
            assert.equal(response.status, 404);
            assert.deepStrictEqual(body, {});
        }));
        it('can get a range of data in order', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield getData({
                token: secondUser.accessToken,
                start: secondUser.data.length - 2,
                end: secondUser.data.length - 1,
            });
            const body = (yield response.json());
            assert.equal(body.length, 2);
            body.forEach((blob, i) => __awaiter(this, void 0, void 0, function* () {
                const expectedId = secondUser.data.length - 2 + i;
                const decrypted = yield aes_1.decryptAES(blob.cyphertext, secondUser.aesKey);
                const data = JSON.parse(decrypted);
                assert.equal(expectedId, blob.id);
                assert.equal(expectedId, data.id);
            }));
        }));
        it('should return 404 if the data does not exist', () => __awaiter(this, void 0, void 0, function* () {
            const response = yield getData({
                token: firstUser.accessToken,
                start: firstUser.data.length,
            });
            assert.equal(response.status, 404);
        }));
        it('cannot insert data out of order', () => __awaiter(this, void 0, void 0, function* () {
            const message = aes_1.encryptAES('test', firstUser.aesKey);
            const response = yield postData({
                token: firstUser.accessToken,
                cyphertext: message,
                id: firstUser.data.length + 1,
            });
            const body = yield response.json();
            assert.equal(response.status, 400);
            assert.equal(body.error, 'id not in sequence');
        }));
        it('should not let too few signatures be passed if passed', () => __awaiter(this, void 0, void 0, function* () {
            const signatures = [];
            const response = yield deleteData(secondUser.accessToken, 0, { signatures });
            const body = yield response.json();
            assert.equal(response.status, 400);
            assert.equal(body.error, 'too many or too few signatures');
        }));
        it('should not let a bad signature be used to delete', () => __awaiter(this, void 0, void 0, function* () {
            const id = 0;
            const signatures = [
                utils_1.personalSign(utils_1.dataDeletionMessage(id + 1), secondUser.privateKey),
            ];
            const response = yield deleteData(secondUser.accessToken, id, { signatures });
            const body = yield response.json();
            assert.equal(response.status, 400);
            assert.equal(body.error, `invalid signature for id: ${id}`);
        }));
        context('after deleting some data', () => {
            let start;
            let end;
            before(() => __awaiter(this, void 0, void 0, function* () {
                // delete the first data for user1
                yield deleteData(firstUser.accessToken, 0);
                // delete the last 2 data for user2 with signatures
                start = secondUser.data.length - 2;
                end = secondUser.data.length - 1;
                const signatures = yield Promise.all([start, end].map((id) => __awaiter(this, void 0, void 0, function* () {
                    return utils_1.personalSign(utils_1.dataDeletionMessage(id), secondUser.privateKey);
                })));
                yield deleteData(secondUser.accessToken, start, {
                    end,
                    signatures,
                });
            }));
            it('should update deleted count for the users', () => __awaiter(this, void 0, void 0, function* () {
                let response = yield getMe(secondUser.accessToken);
                let body = yield response.json();
                assert.equal(body.dataCount, secondUser.data.length);
                assert.equal(body.deletedCount, 2);
                response = yield getMe(firstUser.accessToken);
                body = yield response.json();
                assert.equal(body.dataCount, firstUser.data.length);
                assert.equal(body.deletedCount, 1);
            }));
            it('should return expected deletions', () => __awaiter(this, void 0, void 0, function* () {
                let response = yield getDeletions(secondUser.accessToken, 0, 1);
                let body = (yield response.json());
                assert.equal(body.length, 2);
                assert.equal(body[0].id, start);
                assert.equal(body[1].id, end);
                response = yield getDeletions(firstUser.accessToken, 0);
                body = yield response.json();
                assert.equal(body.length, 1);
                assert.equal(body[0].id, 0);
            }));
            it('should return null for the data', () => __awaiter(this, void 0, void 0, function* () {
                let response = yield getData({ token: secondUser.accessToken, start, end });
                let body = (yield response.json());
                assert.equal(body.length, 2);
                assert.equal(body[0].cyphertext, null);
                assert.equal(body[1].cyphertext, null);
                response = yield getData({ token: firstUser.accessToken, start: 0 });
                body = yield response.json();
                assert.equal(body.length, 1);
                assert.equal(body[0].cyphertext, null);
            }));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsNkJBQTRCO0FBQzVCLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUMsQ0FBQyxDQUFBO0FBQ3ZFLGlDQUFnQztBQUNoQywyQ0FBMEM7QUFDMUMsMkJBQXlCO0FBQ3pCLDhDQUFzQztBQUN0QyxrQ0FBaUM7QUFDakMsd0NBQTRFO0FBRTVFLG9DQUErRDtBQUMvRCxtQ0FBMkI7QUFFM0IsTUFBTSxHQUFHLEdBQUcsdUJBQXVCLENBQUE7QUFpQm5DLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ3BCLElBQUksTUFBYyxDQUFBO0lBQ2xCLElBQUksS0FBYyxDQUFBO0lBQ2xCLElBQUksZ0JBQXdCLENBQUE7SUFDNUIsSUFBSSxTQUFnQixDQUFBO0lBQ3BCLElBQUksaUJBQXlCLENBQUE7SUFDN0IsSUFBSSxVQUFpQixDQUFBO0lBRXJCLFNBQWUsU0FBUyxDQUFDLElBQVc7O1lBQ2xDLE1BQU0sUUFBUSxHQUFHLE1BQU0sb0JBQUssQ0FDMUIsR0FBRyxHQUFHLGFBQWEsRUFDbkI7Z0JBQ0UsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsT0FBTyxFQUFFLEVBQUMsY0FBYyxFQUFFLGtCQUFrQixFQUFDO2FBQzlDLENBQ0YsQ0FBQTtZQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFBO1lBQ2xDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtRQUMvQixDQUFDO0tBQUE7SUFFRCxTQUFlLFlBQVksQ0FBQyxJQUFXLEVBQUUsYUFBc0IsS0FBSzs7WUFDbEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxvQkFBSyxDQUMxQixH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