DEBUGMODE = true;
var dotenv = require('dotenv');
dotenv.load();

const getHLTemps = require("../server/getMinMax")
// const stationPool = require("../server/pgClient").stationPool
const _log = require("./_log")

_log(process.env.GOVV2)

const stationid = "GHCND:USC00083909"
const emptyStationId = "USC00412621"
const pr_00606_stationId = "GHCND:RQC00665911"
pr_good_stationid = "GHCND:RQC00665807"
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
getHLTemps(2000, { stationid: pr_good_stationid }, 606)
  .then(o => {
    _log(JSON.stringify(o, null, 2))
    getHLTemps(2001, { stationid: pr_good_stationid }, 606)
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

    _log('|' + err.err + '|', new Error().stack)
    _log(err)
  })

