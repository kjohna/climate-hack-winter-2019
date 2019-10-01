DEBUGMODE = true;
var dotenv = require('dotenv');
dotenv.load();

const _log = require("./_log")

const USEDS = (process.env.USEDS == 'true')
_log(`using ${USEDS ? 'dark skys' : 'noaa'}, USEDS: ${USEDS}`)

_log(process.env.GOVV2_1)
TOKEN = process.env.GOVV2_1
_log('value TOKEN', TOKEN)

const getHLTemps = require("../server/getHLTemps")
// const stationPool = require("../server/pgClient").stationPool
const stationid = "GHCND:USC00083909"
const emptyStationId = "USC00412621"
const pr_00606_stationid = "GHCND:RQC00665911"
const pr_good_stationid = "GHCND:RQC00665807"
const nyc_10001 = "GHCND:USC00283704"
const JFK_stationid = "GHCND:USW00094789"


_log('test Set', new Set([1, 2, 3, 1, 4, 3]).size)

/*
GHCND:USW00094728&GHCND:USC00284339&GHCND:USW00014732&GHCND:USC00283704&GHCND:USW00094741&GHCND:USC00305796&GHCND:USC00284931&GHCND:USW00014734&GHCND:USC00300961&GHCND:USC00286146&GHCND:USC00289832&GHCND:US1NJBG0017&GHCND:USC00287865&GHCND:USC00281335&GHCND:USW00094789&GHCND:USC00305380&GHCND:USC00282768&GHCND:USC00284887&GHCND:USC00305377&GHCND:USC00309270&GHCND:USC00282023&GHCND:USW00054743&GHCND:USC00289317&GHCND:USC00285503&GHCND:USC00287393&GHCND:US1NJUN0007&GHCND:USC00307587
*/


// const currentYear = new Date().getFullYear()
// const N = 20
// // const active_years = [...Array(N).keys()].map(i => currentYear - i - 1)
// // active_years.splice(-3, 3)
// years = [...Array(17).keys()].map(y => currentYear - 17 + y - 3)
// // _log('active_years', active_years)
// _log('years', years)
// const stationsYears = [{
//   stationid,
//   years
// }]
//getHLTemps(2000, [{ stationid: pr_good_stationid }, { stationid: pr_00606_stationid }], 606)
getHLTemps(2018, { stationid: JFK_stationid }, 10001)
  .then(o => {
    _log(JSON.stringify(o, null, 2))
    getHLTemps(2002, { stationid: pr_good_stationid }, 606)
      .then(o2 => {
        _log(JSON.stringify(o2, null, 2))
      })
      .catch(err => {
        _log(`typeof: ${typeof err.err}`)
        _log(Object.keys(err))

        _log('|' + err.err + '|', new Error().stack)
        _log(err)
      })
  })
  .catch(err => {
    _log(`typeof: ${typeof err.err}`)
    _log(Object.keys(err))

    _log('|' + JSON.stringify(err.err, null, 2) + '|', new Error().stack)
    _log(err)
  })

