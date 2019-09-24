//const DATABASE_URL = "postgres://cbzzmuglaifvrs:79cd4150369272dc8afc938b4c8c85430cf8c5f30a3916d9ec45a51f7b08729e@ec2-174-129-225-9.compute-1.amazonaws.com:5432/da4fit45q0u0p0"
// const pg = require("pg");
const { Pool } = require('pg');
// const dotenv = require('dotenv').config({ path: '/home/mark/lambda/climate-hack-winter-2019/kenneth/climate-hack-winter-2019' })

console.log('type DEBUGMODE', typeof DEBUGMODE)
console.log('value DEBUGMODE', DEBUGMODE)


// const DATABASE_URL = process.env.DATABASE_URL
// const DATABASE_URL = "postgres://juwwvohcorbolo:ce3d8c3e671044f8e15c880db71ce26146826e3f126da53a55788f7f0a7a54ae@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d4l0sqaog7kpe0"
const gd = () => {
  return process.env.DATABASE_URL
}
const gs = () => {
  return process.env.STATION_DATABASE_URL
}

// console.log('STATION_DATABASE_URL', gs())

const d = {
  user: 1,
  password: 2,
  host: 3,
  port: 4,
  database: 5
}
const re = /postgres\:\/\/(\w+)\:([a-z0-9]+)@([^:]+)\:(\d+)\/(\w+)/g
const a = re.exec(gd())
re.lastIndex = 0
const b = re.exec(gs())
// console.log('b', b)

module.exports = {
  // pgClient:
  // new pg.Client({
  // client: 'pg',
  // connection: {
  //   user: a[d.user],
  //   password: a[d.password],
  //   database: a[d.database],
  //   host: a[d.host],
  //   port: a[d.port],
  //   ssl: true
  // }
  // }),
  pool: new Pool({
    user: a[d.user],
    password: a[d.password],
    database: a[d.database],
    host: a[d.host],
    port: a[d.port],
    ssl: true
  }),
  stationPool: new Pool({
    user: b[d.user],
    password: b[d.password],
    database: b[d.database],
    host: b[d.host],
    port: b[d.port],
    ssl: true
  })

}
