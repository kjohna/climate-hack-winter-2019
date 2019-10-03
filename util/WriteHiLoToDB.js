
var dotenv = require('dotenv');
dotenv.load();

// const AsyncLock = require('async-lock');
// const lock = new AsyncLock();
Date.prototype.toTimestampString = function (target, replacement) {
  s = this.toISOString().replace('T', ' ').slice(0, -1)
  return s.slice(0, s.indexOf('.'))
}


DEBUGMODE = true;
const _log = require("./_log")

_log('are you working?')
console.log('is console.log working?')

// const fs = require('fs');
const pool = require("../server/pgClient").pool
var assert = require('assert');
const GetTemps = require('./GetTemps')
const GetTempsDS = require('./GetTempsDS')

const blksize = 10

const USEDS = (process.env.USEDS == 'true')
_log(`using ${USEDS ? 'dark skys' : 'noaa'}`)

async function WriteHiLoToDB() {
  res = await pool.query(USEDS ? "SELECT COUNT(*) AS c FROM zip WHERE status = 'failed' and attemptedBy = 'NOAA'" :
    "SELECT COUNT(*) AS c FROM zip WHERE status = 'untried'")
  const totalZips = parseInt(res.rows[0].c, 10)
  //let zipsProcessed = 0
  let rowCount = totalZips
  _log('rowCount', rowCount)
  process.stdout.write(`psw rowcount: ${rowCount}`)
  let rowsUpdated = 0
  const blocks = Math.ceil(totalZips / Number(blksize))
  _log('\nblocks', blocks)
  timestamp = new Date().toTimestampString()
  for (let blockCount = 0; blockCount < (USEDS ? Math.min(blocks, 42) : blocks); blockCount++) {
    try {
      let rowsInBlock = 0
      let rowsToGet = Math.min(rowCount, blksize)
      //rowsToGet = 1 // do one in the block
      let query = USEDS ? `SELECT * FROM zip WHERE status = 'failed' and attemptedBy = 'NOAA' LIMIT ${rowsToGet} OFFSET ${totalZips - rowCount}` :
        `SELECT * FROM zip WHERE status = 'untried' LIMIT ${rowsToGet} OFFSET ${totalZips - rowCount};`

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
          if (row.attemptedBy == (USEDS ? "DS" : "NOAA")) continue
          if (USEDS)
            temps = await GetTempsDS(row.lat, row.lng, row.zip)
          else
            temps = await GetTemps(row.lat, row.lng, row.zip)
          //}, function (err, ret, temps) {

          // _log('temps is array?', Array.isArray(JSON.parse(temps)))
          // if (JSON.parse(temps).every(m => m == null)) throw 'null temps'
          query = `UPDATE zip SET temps = '${temps}', status = 'done',
          attemptedBy = '${USEDS ? 'DS' : 'NOAA'}', datetime = '${timestamp}'
          WHERE zip = ${row.zip};`
          qr = await pool.query(query)
          assert(qr.rowCount == 1), 'bad update'
          rowsUpdated += qr.rowCount
          rowsInBlock += qr.rowCount
          process.stdout.write(`${row.zip} ${rowsUpdated} ${rowsInBlock} ${rowsToGet}`)
          //})
        }
        catch (err) {
          if (err.err == outOfTokens) throw err.err
          let error = `query ${query} `
          try {
            error += JSON.stringify(err, null, 2)
          }
          catch (err) {
            console.log(`circular error ${err}, ${error}`)
          }
          _log(`GetTemps Error ${error}, couldn't get zip ${row.zip}`)
          qr = await pool.query(`UPDATE zip SET status = 'failed', 
          attemptedBy = '${USEDS ? 'DS' : 'NOAA'}', datetime = '${timestamp}'
                                 WHERE zip = ${row.zip};`)
          assert(qr.rowCount == 1), 'bad update'
          rowsUpdated += qr.rowCount
        }
      }
    }
    catch (err) {
      if (err == outOfTokens) return err
      _log(`fatal query error ${err}`)
      throw err
    }
  }
  return 'done'
}

WriteHiLoToDB().then(v => {
  console.log(v)
})
