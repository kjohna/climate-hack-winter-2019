
var dotenv = require('dotenv');
dotenv.load();

const AsyncLock = require('async-lock');
const alock = new AsyncLock();


DEBUGMODE = true;
const _log = require("./_log")

_log('are you working?')
console.log('is console.log working?')




const fs = require('fs');
const pool = require("../server/pgClient").pool
var streams = require('memory-streams');
var assert = require('assert');

const stationPool = require("../server/pgClient").stationPool
const getNoaaStations = require("../server/getNoaaStations")
// const getMinMax = require("../server/getMinMax").getMinMax
const GetTemps = require('./GetTemps')
// const getDataData = require("../server/getDateData")
const colors = require("./colors")
const lock = require("./lock")
// const replaceAll = require("./replaceall")
String.prototype.replaceAll = function (target, replacement) {
  return this.split(target).join(replacement);
};

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


const getTempsLock = lock()
const getTempsKey = "Temps"

const getZipQueryLock = lock()
const getZipQueryKey = "ZipQuery"

const getMinMaxLock = lock()
const getMinMaxKey = "MinMax"


var logFile = fs.createWriteStream('log.txt', { flags: 'w' });
var logConsole = new console.Console(logFile, logFile);


const blksize = 10

function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

const testRange = () => {
  for (let i of range(1, 10)) {
    console.log(i)
  }
}








async function getTemps(lat, lng, zip) {  // zip for debugging only
  promise = new Promise((resolve, reject) => {
    // _log(`getTemps before get station lat ${lat}  lng ${lng}`)
    getNoaaStations(lat, lng, stationPool)
      .then(stations => {
        _log('after get stations')
        // for (si in stations) {
        //   for (ssi in stations[si]) {
        //     totalStations++
        //   }
        // }
        const N = 20
        const currentYear = new Date().getFullYear()

        let years = [...Array(N).keys()].map(i => currentYear - i - 1)

        stationsYears = JSON.parse(JSON.stringify(stations)).map(s => {
          s['years'] = [...Array(new Date(s.maxdate).getFullYear() - new Date(s.mindate).getFullYear()).keys()].map(y =>
            y + new Date(s.mindate).getFullYear()).filter(y => years.includes(y))
          return s
        }).filter(station => station.years.length != 0)

        stations = JSON.parse(JSON.stringify(stationsYears))

        _log('zip ' + zip.toString() + ' stationsYears[0]', JSON.stringify(stationsYears[0]), ' stationsYears.length ', stationsYears.length)

        let totalStations = stations.length

        const loops = 3
        totalStations_ = totalStations
        totalStations_ *= loops
        stationCallCount = 0
        _log('getTemps totalStations_', totalStations_)
        let r = []
        let loop = 0
        while (loop < loops && years.length > 0) {
          loop++
          _log(`zip ${zip} loop: ${loop}, stationsYears.length ${stationsYears.length}`)
          // for (si in stations) {
          //   // console.log('si', si)
          //   station_ = stations[si]
          //   _log('station_', station_, typeof station_)
          //   _log('station', station_.Result)
          let sleepMs = 10
          let done = null

          for (ssi in stations) {
            station = stations[ssi]
            // _log('station.mindate', new Date(station.mindate).getFullYear())
            // _log('station.maxdate', new Date(station.maxdate.slice(0, 4)))
            // _log('station.years', station.years)
            for (year of station.years) {
              try {
                // _log(`zip ${zip} year: ${year}  station.name: ${station.name}`)
                // _log(`awaiting getMinMax for year ${year} station name ${station.name}`)
                sleep(sleepMs).then(() => {
                  getMinMaxLock.acquire(getMinMaxKey)
                    .then(getMinMaxValue => {
                      if (done != null) return done
                      // yi = years.indexOf(year)
                      // console.log('yi', yi)
                      yi = years.length >= 0 ? 0 : -1
                      assert(yi >= 0), 'no more years left'
                      if (yi >= 0) {
                        year = years.splice(yi, 1)
                        // assert(spliced == year), 'bad years array'



                        getMinMax(stationsYears)
                          .then(res => {
                            sleepMs = 10
                            stationCallCount++
                            // year = res.date
                            _log(`getMinMax res return for year ${res.year} ${JSON.stringify(res, null, 2)} zip ${zip}`)
                            // yi = years.indexOf(year)
                            // if (yi >= 0) {
                            // const spliced = years.splice(yi, 1)
                            // _log('spliced correct year?', spliced[0] == year, ' spliced: ', spliced, ' year: ', year, years.length)
                            try {
                              const gri = r.findIndex(d => d.year == res.year)
                              assert(gri < 0), 'duplicate year'
                              if (gri < 0) {
                                r.push({ low: res.min, high: res.max, year: res.year })
                              }
                              stationsYears.forEach(station => station.years.filter(y => y != res.year))
                              L = stationsYears.length
                              stationsYears.filter(station => station.years.length > 0)
                              stationCallCount += (L - stationsYears.length)
                              _log(`zip ${zip} r length ${r.length}   years.length ${years.length}   stationCallCount ${stationCallCount}   totalStations_ ${totalStations_}`)
                              // }
                              if (r.length == N || years.length == 0 || stationsYears.length == 0) {
                                // var reader = new streams.ReadableStream(r)
                                // console.log('return r', reader.read().toString().replace('low:', '"low":').replace('high:', '"high":').replace('year', '"year"'))
                                if (r.length == 0) {
                                  done = reject('no Min/Max for zip ' + zip.toString())
                                  return done
                                }
                                r.sort(function (a, b) {
                                  return b.year - a.year;
                                });

                                var writer = new streams.WritableStream();
                                var myConsole = new console.Console(writer, writer);
                                // _log('return r')
                                myConsole.log(r)
                                _log(`zip ${zip}` + ' return r\n', writer.toString().replaceAll('low:', '"low":').replaceAll('high:', '"high":').replaceAll('year', '"year"'))
                                done = resolve(writer.toString().replaceAll('low:', '"low":').replaceAll('high:', '"high":').replaceAll('year', '"year"'))
                                return done
                              }
                            }
                            finally {
                              getMinMaxLock.release(getMinMaxKey, getMinVaxValue);
                            }
                          }) // getMinMax resolve
                          .catch(err => {
                            // _log('getMimMax bad station/year', err)
                            years.unshift(err.year)
                            stationCallCount--
                            // _log('err keys', Object.keys(err))
                            // return reject({ err })
                            // if (err.err == 'Min/Max not found') continue
                            // return reject({ err })
                            try {
                              if (err.err.indexOf(429)) {
                                sleepMs = 2000
                              }
                            }
                            catch (ierr) {
                              _log('429 index exception err keys', Object.keys(err))
                              _log(JSON.stringify(err, null, 2))
                            }
                            finally {
                              try {
                                if (stationsYears.length == 0 || years.length == 0) {
                                  if (r.length == 0) {
                                    done = reject('no Min/Max for zip ' + zip.toString())
                                    return done
                                  }
                                  r.sort(function (a, b) {
                                    return b.year - a.year;
                                  });

                                  var writer = new streams.WritableStream();
                                  var myConsole = new console.Console(writer, writer);
                                  // _log('return r')
                                  myConsole.log(r)
                                  _log(`catch zip ${zip}` + ' return r\n', writer.toString().replaceAll('low:', '"low":').replaceAll('high:', '"high":').replaceAll('year', '"year"'))
                                  done = resolve(writer.toString().replaceAll('low:', '"low":').replaceAll('high:', '"high":').replaceAll('year', '"year"'))
                                  return done
                                }
                              }
                              finally {
                                getMinMaxLock.release(getMinMaxKey, getMinMaxValue);
                              }
                            }
                            // continue // try next years then next station  
                          })  // getMinMax catch
                      } // yi >= 0
                    }) // getMimMaxLock
                }) // sleep  
              } // for year of station.years try 
              catch (err) {
                console.log('getMimMax failed', err)
                _log('stack', (new Error).stack)
                return reject({ err })
              }
            } // fo year of station years
          } // for ssi in stations
        } // while loop
      }) // getNoaaStations.then
  }) // Promise
  return promise
}



async function writeHiLoToDb() {
  // console.log('pool', pool)
  let promise = new Promise((resolve, reject) => {
    try {
      pool.query("SELECT COUNT(*) AS c FROM zip WHERE temps IS NULL")
        .then(res => {
          const totalZips = res.rows[0].c
          let zipsProcessed = 0
          let rowCount = totalZips
          _log('rowCount', rowCount)
          process.stdout.write(`psw rowcount: ${rowCount}`)
          let rowsUpdated = 0
          const blocks = Math.ceil(totalZips / Number(blksize))
          _log('\nblocks', blocks)
          for (blockCount = 0; blockCount < blocks; blockCount++) {
            //rowCountInterval = setInterval(() => {
            getZipQueryLock.acquire(getZipQueryKey)
              .then(zipKeyQueryValue => {
                try {
                  let rowsToGet = Math.min(rowCount, blksize)
                  let query = `SELECT * FROM zip WHERE zip.temps IS NULL LIMIT ${rowsToGet} OFFSET ${totalZips - rowCount}`
                  rowCount -= rowsToGet
                  // rowCount = 0 // for debugging
                  //  _log('\nquery', query)
                  pool.query(query)
                    .then(res => {
                      // _log('SELECT * res', JSON.stringify(res.rows, null, 2), ' length ', res.rows.length)
                      ris = [...Array(res.rows.length).keys()]
                      _log('ris.length ', ris.length, ' ris ', ris)
                      for (ri in res.rows) {
                        getTempsLock.acquire(getTempsKey)
                          .then(getTempsValue =>
                          // alock.acquire('row', () => 
                          {
                            try {
                              if (ris.length == 0) {
                                _log('ris.length == resolve')
                              } else {
                                // _log('ris', ris)
                                ri_ = ris.shift()
                                const row = res.rows[ri_];
                                // _log('row:', row, ' ri_:', ri_)
                                GetTemps(row.lat, row.lng, row.zip)
                                  .then(temps => {
                                    //  _log('getTemps temps ', temps)

                                    //             const test = `
                                    // {
                                    //   "years": [{
                                    //       "low": 10,
                                    //       "high": 20,
                                    //       "year": 1999
                                    //     },
                                    //     {
                                    //       "low": 11,
                                    //       "high": 21,
                                    //       "year": 2000
                                    //     }
                                    //   ]
                                    // }
                                    // `
                                    // const ltest = '{"years": [{"low": 10, "high": 20, "year": 1999},{"low": 11, "high": 21, "year": 2000}]}'
                                    // const low = '"low"'
                                    // const high = '"high"'
                                    // const year = '"year"'

                                    pool.query(`UPDATE zip SET temps = '${temps}' WHERE zip = ${row.zip} `)
                                      .then(qr => {
                                        //  _log(row.zip + ' update worked qr', JSON.stringify(qr, null, 2), 'rowCount', qr.rowCount)
                                        try {
                                          rowsUpdated += qr.rowCount
                                          process.stdout.write(`${row.zip} ${rowsUpdated} ${rowsToGet}`)
                                          // _log(`${row.zip} updated ${rowsUpdated} ${rowsToGet}`)
                                        }
                                        finally {
                                          try {
                                            if (++zipsProcessed == totalZips)
                                            // if (ris.length == 0) // test one block
                                            //                                      test one
                                            {
                                              _log(`rowcode == 0 rowsUpdated: ${rowsUpdated} ___________________________________`)
                                              return resolve({ rowsUpdated })
                                            }
                                          }
                                          finally {
                                            //  _log('releasing getTempsKey')
                                            getTempsLock.release(getTempsKey, getTempsValue);
                                            if (ris.length == 0) {
                                              // _log('releasing getZipQueryKey')
                                              getZipQueryLock.release(getZipQueryKey, zipKeyQueryValue);
                                            }
                                          }
                                        }

                                        // resolve({ qr })
                                      })
                                      .catch(err => {
                                        //                                  _log(err.stack)
                                        _log('rejecting second', err)
                                        return reject('failed second ' + err)
                                      })
                                  })
                                  .catch(err => {
                                    try {
                                      _log(`${row.zip} failed ${JSON.stringify(err, null, 2)}`)
                                      process.stdout.write(`${row.zip} failed ${err}`)
                                      if (++zipsProcessed == totalZips) {
                                        _log(`rowcode == 0 rowsUpdated: ${rowsUpdated} ___________________________________`)
                                        return resolve({ rowsUpdated })
                                      }
                                    }
                                    finally {
                                      //                                  _log('releasing getTempsKey')
                                      getTempsLock.release(getTempsKey, getTempsValue);

                                      if (ris.length == 0) {
                                        //                                    _log('releasing getZipQueryKey')
                                        getZipQueryLock.release(getZipQueryKey, zipKeyQueryValue);
                                      }
                                    }

                                  })
                              } // ris.length == 0 else
                            } // try
                            finally {
                              //                          _log('getTempLock finally')
                            }
                          }) // alock
                          .then(() => { }) // release "row"
                      } // for ri

                    }) // blksize querry
                    .catch(err => {
                      console.log('blksize first query failed ', err)
                      return reject("first" + err)
                      _log('stack', (new Error).stack)

                    })

                } // try
                finally {
                  //                _log('getZipQueryLock finally')
                }
              }) // getZipQueryLock
            // }, 60000) // setInterval 
          } // while rowcode
        }) // count query
    } // try
    catch (err) {
      _log('try err', err)
      _log('stack', (new Error).stack)
    }

  }) // new Promise
  return promise
} // eof

// const test = `
//   [{
//       "low": 10,
//       "high": 20,
//       "year": 1999
//     },
//     {
//       "low": 11,
//       "high": 21,
//       "year": 2000
//     }
//   ]
// `
// console.log(JSON.parse(test))


try {
  writeHiLoToDb()
    .then(x => {
      logFile.close()
      console.log('x', x)
      const f = fs.createWriteStream('shit.txt');
      f.write('shit\n')
      f.write(`x: ${JSON.stringify(x, null, 2)}\n`)
      f.end()
    })
    .catch(err => {
      logFile.close()
      console.log('err', err)
      const f = fs.createWriteStream('shit.txt');
      f.write(`err: ${err}\n`)
      f.end()

    })

}
catch (err) {
  logFile.close()
  console.log('run err', err)
}

// module.exports = logConsole

