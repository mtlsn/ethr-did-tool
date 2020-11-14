'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("./database");
const pg_1 = require("pg");
const migrations = [
    {
        name: 'initial',
        up: `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      create table entities (
        did text primary key,
        data_count integer not null default 0,
        deleted_count integer not null default 0,
        blacklisted boolean not null default false
      );

      create table data (
        id integer not null,
        did text references entities not null,
        cyphertext bytea null,
        primary key (id, did)
      );

      create table deletions (
        id integer not null,
        data_id integer not null,
        did text references entities not null,
        signature text null,
        primary key (id, did),
        foreign key (data_id, did) references data
      );

      create table access_token (
        uuid uuid default gen_random_uuid() primary key,
        did text not null references entities,
        validated_at timestamp with time zone,
        role integer not null 
      );
      create table ip_call_count
      (
        ip varchar(39) not null,
        created_at timestamp default now() not null,
        updated_at timestamp default now() not null,
        endpoint varchar(50) not null,
        minute smallint default date_part('minute'::text, CURRENT_TIMESTAMP) not null,
        count integer default 1 not null,
        constraint ip_call_count_pkey primary key (ip, endpoint)
      );
      `,
        down: `
      drop table if exists ip_call_count;
      drop table  if exists access_token;
      drop table if exists deletions;
      drop table if exists data;
      drop table if exists entities;
    `,
    },
    {
        name: 'access-control',
        up: `
      alter table entities add column admin boolean default false not null;
      `,
        down: `
      alter table entities drop column admin;
    `,
    },
    {
        name: 'encrypted-indexes',
        up: `
    alter table data add column cypherindex bytea null;
    `,
        down: `
    alter table data drop column cypherindex;
    `,
    },
];
function up(conf, logs = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new pg_1.Client(conf);
        yield client.connect();
        logs && console.log('running migrations');
        yield client.query(`create table if not exists migrations (name text primary key);`);
        for (const migration of migrations) {
            const result = yield client.query(`select name from migrations where name = $1`, [migration.name]);
            if (result.rowCount !== 0) {
                continue;
            }
            logs && console.log('running ' + migration.name);
            try {
                yield client.query('BEGIN');
                yield client.query(`insert into migrations values ($1);`, [migration.name]);
                yield client.query(migration.up);
                yield client.query('COMMIT');
            }
            catch (e) {
                yield client.query('ROLLBACK');
                throw e;
            }
        }
        yield client.end();
    });
}
exports.up = up;
function down(conf, logs = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new pg_1.Client(conf);
        yield client.connect();
        logs && console.log('reverting migrations');
        yield client.query(`create table if not exists migrations (name text primary key);`);
        const reversed = migrations.slice().reverse();
        for (const migration of reversed) {
            const result = yield client.query(`select name from migrations where name = $1`, [migration.name]);
            if (result.rowCount === 0) {
                continue;
            }
            logs && console.log('reverting ' + migration.name);
            try {
                yield client.query('BEGIN');
                yield client.query(`delete from migrations where name = $1;`, [migration.name]);
                yield client.query(migration.down);
                yield client.query('COMMIT');
            }
            catch (e) {
                yield client.query('ROLLBACK');
                throw e;
            }
        }
        yield client.end();
    });
}
exports.down = down;
process.on('unhandledRejection', reason => {
    throw reason;
});
if (!module.parent) {
    up(config[process.env.NODE_ENV]).catch(e => {
        throw e;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21pZ3JhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7Ozs7Ozs7O0FBQ1oscUNBQW9DO0FBQ3BDLDJCQUF5QjtBQVF6QixNQUFNLFVBQVUsR0FBaUI7SUFDL0I7UUFDRSxJQUFJLEVBQUUsU0FBUztRQUNmLEVBQUUsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BMENEO1FBQ0gsSUFBSSxFQUFFOzs7Ozs7S0FNTDtLQUNGO0lBRUQ7UUFDRSxJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLEVBQUUsRUFBRTs7T0FFRDtRQUNILElBQUksRUFBRTs7S0FFTDtLQUNGO0lBRUQ7UUFDRSxJQUFJLEVBQUUsbUJBQW1CO1FBQ3pCLEVBQUUsRUFBRTs7S0FFSDtRQUNELElBQUksRUFBRTs7S0FFTDtLQUNGO0NBQ0YsQ0FBQTtBQUVELFNBQXNCLEVBQUUsQ0FBQyxJQUFTLEVBQUUsT0FBZ0IsSUFBSTs7UUFDdEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDL0IsTUFBTSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDdEIsSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUV6QyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQ2hCLGdFQUFnRSxDQUNqRSxDQUFBO1FBRUQsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7WUFDbEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUMvQiw2Q0FBNkMsRUFDN0MsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQ2pCLENBQUE7WUFFRCxJQUFJLE1BQU0sQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO2dCQUN6QixTQUFRO2FBQ1Q7WUFDRCxJQUFJLElBQUksT0FBTyxDQUFD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