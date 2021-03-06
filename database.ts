import {udefCoalesce} from './src/utils'
import * as fs from 'fs'

const ca = '/var/run/secrets/pg_ca'

export const production = {
  user: udefCoalesce(process.env.POSTGRES_USER, 'postgres'),
  password: process.env.POSTGRES_PASSWORD,
  host: udefCoalesce(process.env.POSTGRES_HOST, 'productiondb'),
  port: udefCoalesce(process.env.POSTGRES_PORT, 5432),
  database: udefCoalesce(process.env.POSTGRES_DATABASE, 'postgres'),
  ssl: fs.existsSync(ca) ? {ca: fs.readFileSync(ca)} : undefined,
}
export const mocha = {
  user: udefCoalesce(process.env.POSTGRES_USER, 'postgres'),
  password: process.env.POSTGRES_PASSWORD,
  host: 'localhost',
  port: 5434,
  database: udefCoalesce(process.env.POSTGRES_DATABASE, 'thedude'),
}
export const development = {
  user: udefCoalesce(process.env.POSTGRES_USER, 'postgres'),
  password: process.env.POSTGRES_PASSWORD,
  host: 'host.docker.internal',
  database: udefCoalesce(process.env.POSTGRES_DATABASE, 'thedude'),
}
