var dotenv = require('dotenv');
dotenv.load();

const fs = require('fs');
const pool = require("../server/pgClient").pool
const stationPool = require("../server/pgClient").stationPool
var DEBUGMODE = true;
const _log = require("./_log")
const getNoaaStations = require("../server/getNoaaStations")
const getMinMax = require("../server/getMinMax")
const getDataData = require("../server/getDateData")
const colors = require("./colors")


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

async function getTemps(lat, lng) {
  promise = new Promise(resolve => {
    getNoaaStations(lat, lng, stationPool)
      .then(stations => {
        // console.log('getTemps stations.length', stations.length)
        const N = 20
        const currentYear = new Date().getFullYear()

        let years = [...Array(N).keys()].map(i => currentYear - i - 1)

        let r = []
        let loop = 0
        while (loop < 3 && years.length > 0) {
          loop++
          for (si in stations) {
            console.log('si', si)
            station_ = stations[si]
            for (ssi in station_) {
              station = station_[ssi]
              console.log('station.mindate', new Date(station.mindate).getFullYear())
              console.log('station.maxdate', new Date(station.maxdate))
              for (year of range(new Date(station.mindate).getFullYear() + 1, new Date(station.maxdate).getFullYear() - 1)) {
                try {
                  console.log(`year: ${year}  station.name: ${station.name}`)
                  yi = years.indexOf(year)
                  console.log('yi', yi)
                  if (yi >= 0) {
                    console.log(`awaiting getMinMax for year ${year} station name ${station.name}`)
                    getMinMax(year, station)
                      .then(res => {
                        year = res.date
                        console.log(`getMinMax res return for year ${year} station name ${station.name} : ${res}`)
                        yi = years.indexOf(year)
                        if (yi >= 0) {
                          const spliced = years.splice(yi, 1)
                          console.log('spliced correct year?', spliced[0] == year, ' spliced: ' , spliced,  ' year: ', year, years.length)
                          r.push({ low: res.min, high: res.max, year })
                        }
                        if (years.length == 0) {
                          console.log('return r', r)
                          resolve(`{ "year": ${r}}`.replace('low:', '"low":').replace('high:', '"high":'))
                        }
                      })
                      .catch(err => {
                        console.log('getMimMax reject', err)
                      })
                  }
                }
                catch (err) {
                  console.log('getMimMax failed', err)
                }
              }
            }
          } // for si
        } // while loop
      }) // getNoaaStations.then
  }) // Promise
  return promise
}



async function writeHiLoToDb() {
  // console.log('pool', pool)
  let promise = new Promise((resolve, reject) => {

    try {
      pool.query("SELECT COUNT(*) AS c FROM zip")
        .then(res => {
          let rowCount = res.rows[0].c
          console.log('rowCount', rowCount)
          let rowsUpdated = 0
          while (rowCount > 0) {
            let rowsToGet = Math.min(rowCount, blksize)
            rowCount -= rowsToGet
            let query = `SELECT * FROM zip LIMIT ${rowsToGet} OFFSET ${res.rows[0].c - rowCount + rowsToGet}`
            rowCount = 0 // for debugging
            // console.log('query', query)
            pool.query(query)
              .then(res => {
                // console.log('SELECT * res', res)
                for (ri in res.rows) {
                  // console.log('ri', ri)
                  const row = res.rows[ri];
                  // console.log('row:', row, ' rowIndex:', ri)
                  getTemps(row.lat, row.lng)
                    .then(temps => {
                      console.log('getTemps stringify temps ', JSON.stringify([temps]))

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

                      pool.query(`UPDATE zip SET temps = '{ "temps": ${JSON.stringify([temps])} }' WHERE zip = ${row.zip} `)
                        .then(qr => {
                          console.log('update worked qr', JSON.stringify(qr, null, 2), 'rowCount', qr.rowCount)
                          rowsUpdated += qr.rowCount
                          if ((rowCount == 0) && (rowsUpdated >= 10)) {
                            console.log(`rowcode == 0 rowsUpdated: ${rowsUpdated} ___________________________________`)
                            resolve({ rowsUpdated })
                          }
                          // resolve({ qr })
                        })
                        .catch(err => {
                          // console.log(err.stack)
                          console.log('rejecting second')
                          reject('second ' + err)
                        })
                    })
                }
              })
              .catch(err => {
                console.log('first query failed ', err)
                reject("first" + err)
              })
          } // while rowcode
        }) // count query
    }
    catch (err) {
      console.log('try err', err)
    }

  })
  return promise
}

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
      console.log('x', x)
      const f = fs.createWriteStream('shit.txt');
      f.write('shit\n')
      f.write(`x: ${JSON.stringify(x, null, 2)}\n`)
      f.end()
    })
    .catch(err => {
      console.log('err', err)
      const f = fs.createWriteStream('shit.txt');
      f.write(`err: ${err}\n`)
      f.end()

    })

}
catch (err) {
  console.log('run err', err)
}