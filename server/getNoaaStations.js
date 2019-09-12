const pool = require("./pgClient").pool
const _log = require("../util/_log")
const colors = require("../util/colors")


async function getNoaaStations(lat, lng) {
  _log('before')
  console.log(`wtf getNoaaStations lat ${lat}  lng ${lng}`)
  _log('after')
  const limit = 30
  let promise = new Promise((resolve, reject) => {
    pool
      .query(
        `select latitude, longitude from station group by latitude, longitude order by MIN(ABS(latitude - ${lat}) + ABS(longitude - ${lng})) limit ${limit};`
      )
      .then(res => {
        const stations = [];
        for (ri in res.rows) {
          console.log('getNoaaStations ri:', JSON.stringify(res.rows[ri], null,2))
          pool
            .query(
              `select * from station where ABS(latitude - ${
                res.rows[ri]["latitude"]
              }) < 0.001 and ABS(longitude - ${
                res.rows[ri]["longitude"]
              }) < 0.001`
            )
            .then(res => {
              // console.log('res.rows is array?', Array.isArray(res.rows))
              // _log(`res.rows[0] ${JSON.stringify(res.rows[0], null, 2)}`)
              // console.log("query worked");
              const r = new Set();
              for (row in res.rows) {
                r.add(res.rows[row]["stationid"]);
                _log(res.rows[row]["stationid"]);
                // console.log(row)
              }
              o = []
              r.forEach(station => { 
                o.push(res.rows.find(row => row['stationid'] == station))
              })              
              // console.log(colors.Blue  + `o:, ${o}` + colors.Reset);
              stations.push(o)
              _log(`stations length: ${stations.length}`)
              if (stations.length == limit)  {  // maximum of 30 station id sets
                _log(colors.Green + 'getNoaaStations resolving stations' + colors.Reset)
                // _log(stations)
                resolve(stations)
              }
  
            })
            .catch(err => {
              console.log("station id query failed:" + err);
              reject("station id query failed:" + err);
            });
        }
      })
      .catch(err => {
        console.log("failed:" + err);
        reject("find min query failed:" + err);
      });
  });
  return promise;
}

module.exports = getNoaaStations;
