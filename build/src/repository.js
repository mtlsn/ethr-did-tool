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
const config = require("../database");
const logger_1 = require("./logger");
const pg_1 = require("pg");
const environment_1 = require("./environment");
const EthU = require("ethereumjs-util");
const utils_1 = require("./utils");
const pool = new pg_1.Pool(environment_1.env.nodeEnv() === 'production' ? config.production : config.development);
pool.on('error', (err, client) => {
    logger_1.persistError(err.message, err.stack);
});
class Repo {
    static transaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                const result = yield callback(client);
                yield client.query('COMMIT');
                return result;
            }
            catch (e) {
                yield client.query('ROLLBACK');
                throw e;
            }
            finally {
                client.release();
            }
        });
    }
    static query(callback, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let newClient = false;
            if (client === null || client === undefined) {
                client = yield pool.connect();
                newClient = true;
            }
            try {
                const result = yield callback(client);
                return result;
            }
            finally {
                if (newClient) {
                    client.release();
                }
            }
        });
    }
    static getDeletions(did, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`
        select data_id, signature
        from deletions
        where 1=1
          and id >= $2 and ($3::integer is null or id <= $3::integer)
          and did = $1::text
        order by id;
      `, [did, start, utils_1.udefCoalesce(end, null)]);
            return result.rows;
        });
    }
    static in(count, starting = 0) {
        let query = `(`;
        const ids = [...Array(count).keys()].map(Number).map(i => i + starting);
        ids.forEach(id => {
            query += `$${id},`;
        });
        return query.slice(0, -1) + ')';
    }
    static values(types, rowCount) {
        let query = ``;
        const rows = [...Array(rowCount).keys()].map(Number);
        rows.forEach(row => {
            query += `(`;
            types.forEach((type, i) => {
                query += `$${row * types.length + i + 1}::${type},`;
            });
            query = query.slice(0, -1) + '),';
        });
        return query.slice(0, -1);
    }
    static deleteData(did, ids, signatures) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transaction((client) => __awaiter(this, void 0, void 0, function* () {
                const newDeletions = yield client.query(`update data set cyphertext = null where did = $1::text and cyphertext is not null and id in ${this.in(ids.length, 2)} returning id;`, [did, ...ids]);
                const newCount = yield client.query(`
          update entities set deleted_count = deleted_count + $2
          where did = $1::text
          returning deleted_count, data_count;`, [did, newDeletions.rowCount]);
                if (newDeletions.rowCount > 0) {
                    const query = `
          insert into deletions
          (did,           id,        data_id,   signature) values ${this.values(['text', 'integer', 'integer', 'text'], newDeletions.rowCount)};`;
                    const values = newDeletions.rows
                        .map((row, i) => [
                        did,
                        newCount.rows[0].deleted_count - (newDeletions.rowCount - i),
                        row.id,
                        utils_1.udefCoalesce(signatures[i], null),
                    ])
                        .reduce((v1, v2) => v1.concat(v2), []);
                    yield client.query(query, values);
                }
                return {
                    deletedCount: newCount.rows[0].deleted_count,
                    dataCount: newCount.rows[0].data_count,
                };
            }));
        });
    }
    static insertData({ did, cyphertext, id, cypherindex, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transaction((client) => __awaiter(this, void 0, void 0, function* () {
                const result = yield client.query(`
          update entities set data_count = data_count + 1
          where did = $1::text and ($2::integer is null or data_count = $2::integer)
          returning data_count - 1 as id;
        `, [did, utils_1.udefCoalesce(id, null)]);
                if (result.rowCount === 0) {
                    return null;
                }
                const newId = result.rows[0].id;
                yield client.query(`
          insert into data (
            did,
            id,
            cyphertext,
            cypherindex
          ) values (
            $1,
            $2,
            $3,
            $4
          );
        `, [did, newId, cyphertext, cypherindex]);
                return newId;
            }));
        });
    }
    static getData({ did, start, end, cypherindex, }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield pool.query(`
        select id, cyphertext
        from data
        where 1=1
          and id >= $2 and id <= coalesce($3::integer, $2)
          and did = $1::text
          and (coalesce($4, null) is null OR cypherindex = $4::bytea)
        order by id;
      `, [did, start, utils_1.udefCoalesce(end, null), utils_1.udefCoalesce(cypherindex, null)]);
                return result.rows;
            }
            catch (err) {
                console.log({ err });
                throw err;
            }
        });
    }
    static getEncryptedIndexes(did) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield pool.query(`
        select cypherindex
        from data
        where 1=1
          and did = $1::text
          and cypherindex is not null
        order by id;
        `, [did]);
                return result.rows;
            }
            catch (err) {
                console.log({ err });
                throw err;
            }
        });
    }
    static getMe(did) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`select did, data_count, deleted_count from entities where did = $1::text;`, [did]);
            if (result.rowCount === 0) {
                throw new Error('could not find entity');
            }
            return result.rows[0];
        });
    }
    static getEntity(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`
      select e.did, e.blacklisted
      from entities e
        join access_token a on e.did = a.did
      where a.uuid = $1;
    `, [token]);
            if (result.rowCount === 0) {
                return null;
            }
            return result.rows[0];
        });
    }
    static createAccessToken(did, initialize = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transaction((client) => __awaiter(this, void 0, void 0, function* () {
                if (initialize === true) {
                    yield client.query(`
          insert into entities
          (did, admin) select $1::text, true
          where (select count(*) from entities) = 0
        `, [did]);
                }
                const created = yield client.query(`
        insert into entities
        (did) values ($1::text)
        on conflict(did) do nothing
        returning gen_random_uuid() as uuid;
      `, [did]);
                const allowAnonymous = environment_1.env.allowAnonymous();
                if (created.rows.length > 0 && !allowAnonymous) {
                    yield client.query(`ROLLBACK;`);
                    // return fake uuid to prevent attackers from
                    // figuring out which keys exist in the database
                    return created.rows[0].uuid;
                }
                const token = yield client.query(`
        insert into access_token (did) values ($1) returning uuid;
      `, [did]);
                return token.rows[0].uuid;
            }));
        });
    }
    static validateAccessToken(token, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            const ethAddress = EthU.bufferToHex(utils_1.recoverEthAddressFromPersonalRpcSig(token, signature));
            return this.transaction((client) => __awaiter(this, void 0, void 0, function* () {
                const result = yield client.query(`
        update access_token set validated_at = now()
        where 1=1
          and uuid = $1
          and did = $2
          and validated_at is null
        returning did, date_part('epoch',now() + ($3 || ' seconds')::interval)::int as expires_at;
        `, [token, `did:ethr:${ethAddress}`, environment_1.env.tokenExpirationSeconds()]);
                const row = result.rows[0];
                if (!row) {
                    return null;
                }
                return row.expires_at;
            }));
        });
    }
    static checkAccessToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`
      select e.did
      from access_token at
        join entities e on e.did = at.did
      where 1=1
        and uuid = $1
        and validated_at between now() - ($2 || ' seconds')::interval and now()
        and e.blacklisted = false;
    `, [token, environment_1.env.tokenExpirationSeconds()]);
            if (result.rowCount !== 1) {
                return null;
            }
            return result.rows[0];
        });
    }
    static fetchAdminToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`
      select e.did
      from access_token at
        join entities e on e.admin = true
      where 1=1
        and uuid = $1
        and validated_at between now() - ($2 || ' seconds')::interval and now()
        and e.blacklisted = false;
    `, [token, environment_1.env.tokenExpirationSeconds()]);
            if (result.rowCount !== 1) {
                return null;
            }
            return result.rows[0];
        });
    }
    static updateCallCount(ip, endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`
    insert into "ip_call_count" as existing
    (ip   ,endpoint) values
    ($1  ,$2)
    on conflict(ip, endpoint) do update set
      count = case
        when
          existing.minute <> EXTRACT(MINUTE FROM current_timestamp)
          or current_timestamp - existing.updated_at > interval '1 minute'
        then 1
        else existing.count + 1
      end,
      minute = default,
      updated_at = default
    returning count;
    `, [ip, endpoint]);
            return result.rows[0].count;
        });
    }
    static addBlacklist(did) {
        return __awaiter(this, void 0, void 0, function* () {
            return pool.query(`
      insert into entities
      (did, blacklisted) values ($1::text, true)
      on conflict(did) do update set blacklisted = true;
    `, [did]);
        });
    }
    static removeBlacklist(did) {
        return __awaiter(this, void 0, void 0, function* () {
            return pool.query(`
      update entities
      set blacklisted = false
      where did = $1::text;
    `, [did]);
        });
    }
    static addAdmin(did) {
        return __awaiter(this, void 0, void 0, function* () {
            return pool.query(`
      insert into entities
      (did, admin) values ($1::text, true)
      on conflict(did) do update set admin = true;
    `, [did]);
        });
    }
    static removeAdmin(did) {
        return __awaiter(this, void 0, void 0, function* () {
            return pool.query(`
      update entities
      set admin = false
      where did = $1::text;
    `, [did]);
        });
    }
    static addEntity(did) {
        return __awaiter(this, void 0, void 0, function* () {
            return pool.query(`
      insert into entities
      (did) values ($1::text)
      on conflict(did) do nothing;
    `, [did]);
        });
    }
    static isAdmin(did, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.query((c) => __awaiter(this, void 0, void 0, function* () {
                return c.query(`
        select 1 from entities
        where did = $1::text and admin = true;
      `, [did]);
            }), client);
            return result.rows.length === 1;
        });
    }
}
exports.default = Repo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXBvc2l0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxzQ0FBcUM7QUFDckMscUNBQXFDO0FBQ3JDLDJCQUErQztBQUMvQywrQ0FBaUM7QUFDakMsd0NBQXVDO0FBQ3ZDLG1DQUF5RTtBQUV6RSxNQUFNLElBQUksR0FBRyxJQUFJLFNBQUksQ0FDbkIsaUJBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQ3hFLENBQUE7QUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUMvQixxQkFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEtBQU0sQ0FBQyxDQUFBO0FBQ3ZDLENBQUMsQ0FBQyxDQUFBO0FBTUYsTUFBcUIsSUFBSTtJQUNoQixNQUFNLENBQU8sV0FBVyxDQUFJLFFBQTRDOztZQUM3RSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUNuQyxJQUFJO2dCQUNGLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtnQkFDM0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUE7Z0JBQ3JDLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDNUIsT0FBTyxNQUFNLENBQUE7YUFDZDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDOUIsTUFBTSxDQUFDLENBQUE7YUFDUjtvQkFBUztnQkFDUixNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7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