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
const environment_1 = require("../src/environment");
const utils_1 = require("../src/utils");
const uuidv4_1 = require("uuidv4");
const url = 'http://localhost:3001';
describe('Auth', () => __awaiter(this, void 0, void 0, function* () {
    let adminPrivateKey;
    let adminAddress;
    let adminDid;
    let adminAccessToken;
    let userPrivateKey;
    let userAddress;
    let userDid;
    let client;
    before(() => __awaiter(this, void 0, void 0, function* () {
        client = new pg_1.Client(db.mocha);
        yield client.connect();
        yield migrations_1.down(db.mocha, false);
        yield migrations_1.up(db.mocha, false);
        adminPrivateKey =
            '0x6fba3824f0d7fced2db63907faeaa6ffae283c3bf94072e0a3b2940b2b572b65';
        adminAddress = '0xba35e4f63bce9047464671fcbadbae41509c4b8e';
        adminDid = `did:ethr:${adminAddress}`;
        userPrivateKey =
            '0x57db064025480c5c131d4978dcaea1a47246ad33b7c45cf757eac37db1bbe20e';
        userAddress = '0x33fc5b05705b91053e157bc2b2203f17f532f606';
        userDid = `did:ethr:${userAddress}`;
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield client.end();
    }));
    it('should return 400 on bad did format', () => __awaiter(this, void 0, void 0, function* () {
        const badResponse = yield node_fetch_1.default(`${url}/auth/request-token?did=${adminDid + 'A'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        assert.equal(badResponse.status, 400);
    }));
    it('should not create an entity if initialize is not passed', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield node_fetch_1.default(`${url}/auth/request-token?did=${adminDid}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        assert.equal(response.status, 200);
        const result = yield client.query(`select count(*) from entities`);
        assert.strictEqual(parseInt(result.rows[0].count, 10), 0);
    }));
    describe('after requesting a token for the first time', () => __awaiter(this, void 0, void 0, function* () {
        let response;
        let body;
        let signature;
        before(() => __awaiter(this, void 0, void 0, function* () {
            response = yield node_fetch_1.default(`${url}/auth/request-token?did=${adminDid}&initialize=true`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            body = yield response.json();
            adminAccessToken = body.token;
            signature = utils_1.personalSign(adminAccessToken, adminPrivateKey);
        }));
        it('should have returned returned a token', () => __awaiter(this, void 0, void 0, function* () {
            assert.equal(response.status, 200);
        }));
        it('should return 400 on bad uuid format', () => __awaiter(this, void 0, void 0, function* () {
            const badResponse = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: adminAccessToken + 'a',
                    signature,
                    did: adminDid,
                }),
            });
            assert.equal(badResponse.status, 400);
            assert.equal((yield badResponse.json()).error, 'bad accessToken format');
        }));
        it('should return 400 on bad signature format', () => __awaiter(this, void 0, void 0, function* () {
            const badResponse = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: adminAccessToken,
                    signature: 'asdfasdf',
                    did: adminDid,
                }),
            });
            assert.equal(badResponse.status, 400);
            assert.equal((yield badResponse.json()).error, 'bad signature format');
        }));
        it('should return 400 on bad did format', () => __awaiter(this, void 0, void 0, function* () {
            const badResponse = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: adminAccessToken,
                    signature,
                    did: 'asdfasdfasdf',
                }),
            });
            assert.equal(badResponse.status, 400);
            assert.equal((yield badResponse.json()).error, 'bad did format');
        }));
        it('should return 401 on unknown uuid', () => __awaiter(this, void 0, void 0, function* () {
            const badResponse = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: uuidv4_1.default(),
                    signature,
                    did: adminDid,
                }),
            });
            assert.equal(badResponse.status, 401);
            assert.equal((yield badResponse.json()).error, 'unauthorized');
        }));
        // TODO: Discuss test
        it('should return 400 if no did is passed for validate-token', () => __awaiter(this, void 0, void 0, function* () {
            const badResponse = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: adminAccessToken,
                    signature,
                }),
            });
            assert.equal(badResponse.status, 400);
            assert.equal((yield badResponse.json()).error, 'missing did');
        }));
        it('should return 401 if signature is invalid', () => __awaiter(this, void 0, void 0, function* () {
            const badSignature = utils_1.personalSign(adminAccessToken, '0x192197a2979231078848ec643dae5f0cd96ac19f4ed1b86d1fe857ce6d04c51d');
            const badResponse = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: adminAccessToken,
                    signature: badSignature,
                    did: adminDid,
                }),
            });
            assert.equal(badResponse.status, 401);
            assert.equal((yield badResponse.json()).error, 'unauthorized');
        }));
        it('should return 401 if did of key passed does not match token', () => __awaiter(this, void 0, void 0, function* () {
            const diffDid = 'did:ethr:0xe6f8bff681505f5ae812ee5aca755469bbfde525';
            const badResponse = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: adminAccessToken,
                    signature,
                    did: diffDid,
                }),
            });
            assert.equal(badResponse.status, 401);
            assert.equal((yield badResponse.json()).error, 'unauthorized');
        }));
        it('should not be able to access a protected endpoint before the token is validated', () => __awaiter(this, void 0, void 0, function* () {
            const badResponse = yield node_fetch_1.default(`${url}/data/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminAccessToken}`,
                },
            });
            assert.equal(badResponse.status, 401);
        }));
        it('should not create another entity if an different user trys to sign up', () => __awaiter(this, void 0, void 0, function* () {
            const newResponse = yield node_fetch_1.default(`${url}/auth/request-token?did=${userDid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            assert.equal(newResponse.status, 200);
            const result = yield client.query(`select count(*) from entities`);
            assert.equal(result.rows[0].count, 1);
        }));
        describe('after validating the token', () => __awaiter(this, void 0, void 0, function* () {
            before(() => __awaiter(this, void 0, void 0, function* () {
                response = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        accessToken: adminAccessToken,
                        signature,
                        did: adminDid,
                    }),
                });
            }));
            it('should return OK', () => __awaiter(this, void 0, void 0, function* () {
                assert.equal(response.status, 200);
            }));
            it('should return 401 if passing the same key again', () => __awaiter(this, void 0, void 0, function* () {
                const badResponse = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        accessToken: adminAccessToken,
                        signature,
                        did: adminDid,
                    }),
                });
                assert.equal(badResponse.status, 401);
                assert.equal((yield badResponse.json()).error, 'unauthorized');
            }));
            describe('after setting ALLOW_ANONYMOUS set to true and requesting a new token with a different key', () => __awaiter(this, void 0, void 0, function* () {
                let userAccessToken;
                let resetResponse;
                before(() => __awaiter(this, void 0, void 0, function* () {
                    response = yield node_fetch_1.default(`${url}/debug/set-env/ALLOW_ANONYMOUS/true`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${adminAccessToken}`,
                        },
                    });
                    response = yield node_fetch_1.default(`${url}/auth/request-token?did=${userDid}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    body = yield response.json();
                    userAccessToken = body.token;
                    signature = utils_1.personalSign(userAccessToken, userPrivateKey);
                    console.log(signature);
                    response = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            accessToken: userAccessToken,
                            signature,
                            did: userDid,
                        }),
                    });
                    response = yield node_fetch_1.default(`${url}/data/me`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${userAccessToken}`,
                        },
                    });
                    resetResponse = yield node_fetch_1.default(`${url}/debug/set-env/ALLOW_ANONYMOUS/false`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${adminAccessToken}`,
                        },
                    });
                }));
                it('should return OK', () => __awaiter(this, void 0, void 0, function* () {
                    assert.equal(response.status, 200);
                    assert.equal(resetResponse.status, 200);
                }));
                it('should not let a non admin add/remove a blacklist', () => __awaiter(this, void 0, void 0, function* () {
                    const badResponse = yield node_fetch_1.default(`${url}/auth/blacklist?did=${adminDid}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${userAccessToken}`,
                        },
                    });
                    assert.equal(badResponse.status, 401);
                }));
                describe('after adding the user as an admin', () => __awaiter(this, void 0, void 0, function* () {
                    before(() => __awaiter(this, void 0, void 0, function* () {
                        yield node_fetch_1.default(`${url}/auth/admin?did=${userDid}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${adminAccessToken}`,
                            },
                        });
                    }));
                    describe('after the user creates a new entity for his friend', () => __awaiter(this, void 0, void 0, function* () {
                        let friendPrivateKey;
                        let friendAddress;
                        let friendDid;
                        before(() => __awaiter(this, void 0, void 0, function* () {
                            friendPrivateKey =
                                'ee0aa74c226c769c5afe8d3cf5559d3963832e1f987ac6e8ab4e513b2b72c18c';
                            friendAddress = '0x95e7717b69f9ed45fb5f939d5b17f64b52840166';
                            friendDid = `did:ethr:${friendAddress}`;
                            response = yield node_fetch_1.default(`${url}/auth/entity?did=${friendDid}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${userAccessToken}`,
                                },
                            });
                        }));
                        it('should return ok', () => __awaiter(this, void 0, void 0, function* () {
                            assert.equal(response.status, 200);
                        }));
                        describe('after the friend creates a new token', () => __awaiter(this, void 0, void 0, function* () {
                            before(() => __awaiter(this, void 0, void 0, function* () {
                                response = yield node_fetch_1.default(`${url}/auth/request-token?did=${friendDid}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${userAccessToken}`,
                                    },
                                });
                            }));
                            it('should return ok', () => __awaiter(this, void 0, void 0, function* () {
                                assert.equal(response.status, 200);
                            }));
                            it('should have created the access token', () => __awaiter(this, void 0, void 0, function* () {
                                const result = yield client.query(`select count(*) from access_token where did = $1::text;`, [friendDid]);
                                assert.equal(result.rows[0].count, 1);
                            }));
                        }));
                    }));
                    describe('after the user removes himself as an admin', () => __awaiter(this, void 0, void 0, function* () {
                        before(() => __awaiter(this, void 0, void 0, function* () {
                            response = yield node_fetch_1.default(`${url}/auth/admin?did=${userDid}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${userAccessToken}`,
                                },
                            });
                        }));
                        it('should return 200', () => __awaiter(this, void 0, void 0, function* () {
                            assert.equal(response.status, 200);
                        }));
                        it('should once again not let be able to create new entities', () => __awaiter(this, void 0, void 0, function* () {
                            const did = 'did:ethr:0x1b777c767e9f787ec3575ef15261b5691b0c9ffc';
                            const badResponse = yield node_fetch_1.default(`${url}/auth/blacklist?did=${did}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${userAccessToken}`,
                                },
                            });
                            assert.equal(badResponse.status, 401);
                            const result = yield client.query(`select count(*) from entities where did = $1::text;`, [did]);
                            assert.equal(result.rows[0].count, 0);
                        }));
                    }));
                }));
                describe('after requesting another token', () => __awaiter(this, void 0, void 0, function* () {
                    before(() => __awaiter(this, void 0, void 0, function* () {
                        response = yield node_fetch_1.default(`${url}/auth/request-token?did=${adminDid}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                        });
                        body = yield response.json();
                        adminAccessToken = body.token;
                        signature = utils_1.personalSign(adminAccessToken, adminPrivateKey);
                    }));
                    it('should have returned returned a token', () => __awaiter(this, void 0, void 0, function* () {
                        assert.equal(response.status, 200);
                    }));
                    describe('after validating the second token', () => __awaiter(this, void 0, void 0, function* () {
                        before(() => __awaiter(this, void 0, void 0, function* () {
                            response = yield node_fetch_1.default(`${url}/auth/validate-token`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    accessToken: adminAccessToken,
                                    signature,
                                    did: adminDid,
                                }),
                            });
                        }));
                        it('should have returned returned a token', () => __awaiter(this, void 0, void 0, function* () {
                            assert.equal(response.status, 200);
                        }));
                        it('should be able to access a protected endpoint', () => __awaiter(this, void 0, void 0, function* () {
                            const goodResponse = yield node_fetch_1.default(`${url}/data/me`, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${adminAccessToken}`,
                                },
                            });
                            assert.equal(goodResponse.status, 200);
                        }));
                        it('should not be able to access a protected endpoint with a bad token', () => __awaiter(this, void 0, void 0, function* () {
                            const badResponse = yield node_fetch_1.default(`${url}/data/me`, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${uuidv4_1.default()}`,
                                },
                            });
                            assert.equal(badResponse.status, 401);
                        }));
                        describe('after blacklisting the user did', () => __awaiter(this, void 0, void 0, function* () {
                            before(() => __awaiter(this, void 0, void 0, function* () {
                                yield node_fetch_1.default(`${url}/auth/blacklist?did=${userDid}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${adminAccessToken}`,
                                    },
                                });
                            }));
                            it('should not be able to access a protected endpoint with blacklisted token', () => __awaiter(this, void 0, void 0, function* () {
                                const badResponse = yield node_fetch_1.default(`${url}/data/me`, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${userAccessToken}`,
                                    },
                                });
                                assert.equal(badResponse.status, 401);
                            }));
                            describe('after unblacklisting the did', () => __awaiter(this, void 0, void 0, function* () {
                                before(() => __awaiter(this, void 0, void 0, function* () {
                                    yield node_fetch_1.default(`${url}/auth/blacklist?did=${userDid}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${adminAccessToken}`,
                                        },
                                    });
                                }));
                                it('should be able to access a protected endpoint with unblacklisted token', () => __awaiter(this, void 0, void 0, function* () {
                                    const goodResponse = yield node_fetch_1.default(`${url}/data/me`, {
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${userAccessToken}`,
                                        },
                                    });
                                    assert.equal(goodResponse.status, 200);
                                }));
                            }));
                        }));
                        describe('after the token expires', () => __awaiter(this, void 0, void 0, function* () {
                            before(() => __awaiter(this, void 0, void 0, function* () {
                                yield client.query(`update access_token set validated_at = validated_at - ($2 || ' seconds')::interval where uuid = $1;`, [adminAccessToken, environment_1.env.tokenExpirationSeconds()]);
                            }));
                            it('should not be able to access a protected endpoint with an expired token', () => __awaiter(this, void 0, void 0, function* () {
                                const badResponse = yield node_fetch_1.default(`${url}/data/me`, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${adminAccessToken}`,
                                    },
                                });
                                assert.equal(badResponse.status, 401);
                            }));
                        }));
                    }));
                }));
            }));
        }));
    }));
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvYXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsNkJBQTRCO0FBQzVCLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUMsQ0FBQyxDQUFBO0FBQ3ZFLGlDQUFnQztBQUNoQywyQ0FBMEM7QUFDMUMsMkJBQXlCO0FBQ3pCLDhDQUFzQztBQUN0QyxrQ0FBaUM7QUFDakMsb0RBQXNDO0FBQ3RDLHdDQUF5QztBQUN6QyxtQ0FBMkI7QUFFM0IsTUFBTSxHQUFHLEdBQUcsdUJBQXVCLENBQUE7QUFFbkMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFTLEVBQUU7SUFDMUIsSUFBSSxlQUF1QixDQUFBO0lBQzNCLElBQUksWUFBb0IsQ0FBQTtJQUN4QixJQUFJLFFBQWdCLENBQUE7SUFDcEIsSUFBSSxnQkFBd0IsQ0FBQTtJQUM1QixJQUFJLGNBQXNCLENBQUE7SUFDMUIsSUFBSSxXQUFtQixDQUFBO0lBQ3ZCLElBQUksT0FBZSxDQUFBO0lBQ25CLElBQUksTUFBYyxDQUFBO0lBRWxCLE1BQU0sQ0FBQyxHQUFTLEVBQUU7UUFDaEIsTUFBTSxHQUFHLElBQUksV0FBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUM3QixNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUN0QixNQUFNLGlCQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUMzQixNQUFNLGVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRXpCLGVBQWU7WUFDYixvRUFBb0UsQ0FBQTtRQUN0RSxZQUFZLEdBQUcsNENBQTRDLENBQUE7UUFDM0QsUUFBUSxHQUFHLFlBQVksWUFBWSxFQUFF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