DEBUGMODE = true;
var dotenv = require('dotenv');
dotenv.load();

const getNoaaStations = require("../server/getNoaaStations")
const stationPool = require("../server/pgClient").stationPool
const _log = require("./_log")


getNoaaStations(35.95, -101.883, stationPool)
  .then(stations => {
    _log('after get stations')
    _log(JSON.stringify(stations, null, 2))
    _log(typeof stations)
    _log(stations.length)

  })
  .catch(err => {
    _log('err ', err)
  })