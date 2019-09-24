const getNoaaStations = require("../server/getNoaaStations")
const stationPool = require("../server/pgClient").stationPool
DEBUGMODE = true;
const _log = require("./_log")


getNoaaStations(35.95, -101.883, stationPool)
.then(stations => {
  _log('after get stations')
  _log(stations)
})