DEBUGMODE = true;
var dotenv = require('dotenv');
dotenv.load();

const getMinMax = require("../server/getMinMax")
// const stationPool = require("../server/pgClient").stationPool
const _log = require("./_log")

const stationid = "GHCND:USC00083909"
const emptyStationId = "USC00412621"
const currentYear = new Date().getFullYear()
const N = 20
// const active_years = [...Array(N).keys()].map(i => currentYear - i - 1)
// active_years.splice(-3, 3)
years = [...Array(17).keys()].map(y => currentYear - 17 + y - 3)
// _log('active_years', active_years)
_log('years', years)
const stationsYears = [{
  stationid,
  years
}]
getMinMax(stationsYears)
  .then(o => {
    _log(JSON.stringify(o, null, 2))
  })
  .catch(err => {
    _log(`typeof: ${typeof err.err}`)
    _log(Object.keys(err))

    _log('|' + err.err + '|', new Error().stack)
    _log(err)
  })

