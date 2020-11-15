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
        validated_at timestamp with time zone
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL21pZ3JhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7Ozs7Ozs7O0FBQ1oscUNBQW9DO0FBQ3BDLDJCQUF5QjtBQVF6QixNQUFNLFVBQVUsR0FBaUI7SUFDL0I7UUFDRSxJQUFJLEVBQUUsU0FBUztRQUNmLEVBQUUsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F5Q0Q7UUFDSCxJQUFJLEVBQUU7Ozs7OztLQU1MO0tBQ0Y7SUFFRDtRQUNFLElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsRUFBRSxFQUFFOztPQUVEO1FBQ0gsSUFBSSxFQUFFOztLQUVMO0tBQ0Y7SUFFRDtRQUNFLElBQUksRUFBRSxtQkFBbUI7UUFDekIsRUFBRSxFQUFFOztLQUVIO1FBQ0QsSUFBSSxFQUFFOztLQUVMO0tBQ0Y7Q0FDRixDQUFBO0FBRUQsU0FBc0IsRUFBRSxDQUFDLElBQVMsRUFBRSxPQUFnQixJQUFJOztRQUN0RCxNQUFNLE1BQU0sR0FBRyxJQUFJLFdBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMvQixNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUN0QixJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1FBRXpDLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FDaEIsZ0VBQWdFLENBQ2pFLENBQUE7UUFFRCxLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtZQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQy9CLDZDQUE2QyxFQUM3QyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FDakIsQ0FBQTtZQUVELElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLFNBQVE7YUFDVDtZQUNELElBQUksSUFBSSxPQUFPLENBQUMs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