const DATABASE_URL = "postgres://cbzzmuglaifvrs:79cd4150369272dc8afc938b4c8c85430cf8c5f30a3916d9ec45a51f7b08729e@ec2-174-129-225-9.compute-1.amazonaws.com:5432/da4fit45q0u0p0"
// const pg = require("pg");
const { Pool } = require('pg');

let d = {
  'user' : 1,
  'password': 2,
  'host': 3,
  'port': 4,
  'database': 5
}
let re = /postgres\:\/\/(\w+)\:([a-z0-9]+)@([^:]+)\:(\d+)\/(\w+)/g
let a = re.exec(DATABASE_URL)
// console.log(a)

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
  })
}
