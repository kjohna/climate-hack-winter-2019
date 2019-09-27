
var dotenv = require('dotenv');
dotenv.load();

const AsyncLock = require('async-lock');
const lock = new AsyncLock();


DEBUGMODE = true;
const _log = require("./_log")

_log('are you working?')
console.log('is console.log working?')

// const fs = require('fs');
const pool = require("../server/pgClient").pool
// var streams = require('memory-streams');
var assert = require('assert');


// const stationPool = require("../server/pgClient").stationPool
// const getNoaaStations = require("../server/getNoaaStations")
// const getMinMax = require("../server/getMinMax").getMinMax
const GetTemps = require('./GetTemps')
// const getDataData = require("../server/getDateData")
// const colors = require("./colors")
// const lock = require("./lock")
// const replaceAll = require("./replaceall")
// String.prototype.replaceAll = function (target, replacement) {
//   return this.split(target).join(replacement);
// };

// function sleep(time) {
//   return new Promise(resolve => setTimeout(resolve, time));
// }

//var logFile = fs.createWriteStream('log.txt', { flags: 'w' });
//var logConsole = new console.Console(logFile, logFile);


const blksize = 10



async function WriteHiLoToDB() {
  res = await pool.query("SELECT COUNT(*) AS c FROM zip WHERE temps IS NULL")
  const totalZips = parseInt(res.rows[0].c, 10)
  let zipsProcessed = 0
  let rowCount = totalZips
  _log('rowCount', rowCount)
  process.stdout.write(`psw rowcount: ${rowCount}`)
  let rowsUpdated = 0
  const blocks = 1 // Math.ceil(totalZips / Number(blksize))
  _log('\nblocks', blocks)
  for (blockCount = 0; blockCount < blocks; blockCount++) {
    try {
      let rowsToGet = Math.min(rowCount, blksize)
      //rowsToGet = 1 // do one in the block
      let query = `SELECT * FROM zip WHERE status != 'done' LIMIT ${rowsToGet} OFFSET ${totalZips - rowCount};`
      rowCount -= rowsToGet
      // rowCount = 0 // for debugging
      //  _log('\nquery', query)
      let res = await pool.query(query)
      // for (row of res.rows) {
      for (let ri = 0; ri < res.rows.length; ri++) {
        try {
          row = res.rows[ri]
          _log('row:', row)
          // lock.acquire('GetTemps', function (cb) {
          temps = await GetTemps(row.lat, row.lng, row.zip)
          //}, function (err, ret, temps) {

          // _log('temps is array?', Array.isArray(JSON.parse(temps)))
          // if (JSON.parse(temps).every(m => m == null)) throw 'null temps'
          qr = await pool.query(`UPDATE zip SET temps = '${temps}', status = 'done' WHERE zip = ${row.zip} `)
          assert(qr.rowCount == 1), 'bad update'
          rowsUpdated += qr.rowCount
          process.stdout.write(`${row.zip} ${rowsUpdated} ${rowsToGet}`)
          //})
        }
        catch (err) {
          _log(`GetTemps Error ${err}, couldn't get zip ${row.zip}`)
          qr = await pool.query(`UPDATE zip SET status = 'failed' WHERE zip = ${row.zip} `)
          assert(qr.rowCount == 1), 'bad update'
          rowsUpdated += qr.rowCount
        }
      }
    }
    catch (err) {
      _log(`fatal query error ${err}`)
      throw err
    }
  }
}

WriteHiLoToDB()
