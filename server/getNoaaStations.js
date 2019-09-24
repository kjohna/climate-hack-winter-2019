const pool = require("./pgClient").pool
const _log = require("../util/_log")
const colors = require("../util/colors")


async function getNoaaStations(lat, lng, p = pool) {
  _log(`wtf getNoaaStations lat ${lat}  lng ${lng}`)
  const limit = 150
  let promise = new Promise((resolve, reject) => {
    p
      .query(
        `SELECT latitude, longitude, stationid FROM station 
        WHERE SUBSTRING(stationid FOR 6) = 'GHCND:'
        GROUP BY latitude, longitude, stationid
        ORDER BY MIN(ABS(latitude - ${lat}) * 1.2  + ABS(longitude - ${lng})), stationid 
        LIMIT ${limit};`
      )
      .then(res => {
        //resolve(res.rows)
        const stations = [];
        for (ri in res.rows) {
          //   _log('getNoaaStations ri:', JSON.stringify(res.rows[ri], null, 2))
          // }
          p
            .query(`SELECT * FROM station WHERE stationid = '${res.rows[ri].stationid}'`)
            // .query(
            //   `select * from station where ABS(latitude - ${
            //   res.rows[ri]["latitude"]
            //   }) < 0.001 and ABS(longitude - ${
            //   res.rows[ri]["longitude"]
            //   }) < 0.001`
            // )
            .then(res_ => {
              stations.push(res_.rows[0])
              //stations.push(res_)
              // _log('res.rows is array?', Array.isArray(res.rows))
              // _log(`res.rows[0] ${JSON.stringify(res.rows[0], null, 2)}`)
              // // console.log("query worked");
              // const r = new Set();
              // for (row in res.rows) {
              //   r.add(res.rows[row]["stationid"]);
              //   _log(res.rows[row]["stationid"]);
              //   // console.log(row)
              // }
              // o = []
              // r.forEach(station => {
              //   o.push(res.rows.find(row => row['stationid'] == station))
              // })
              // // console.log(colors.Blue  + `o:, ${o}` + colors.Reset);
              // stations.push(o)
              // _log(`stations length: ${stations.length}`)
              if (stations.length == limit) {  // maximum of limit station id sets
                _log(colors.Green + 'getNoaaStations resolving stations' + colors.Reset)
                // _log(stations)
                return resolve(stations)
              }

            })
            .catch(err => {
              console.log("station id query failed:" + err);
              return reject("station id query failed:" + err);
            });
        }// for ri
      })
      .catch(err => {
        console.log("failed:" + err);
        return reject("find min query failed:" + err);
      });
  }); // new promise
  return promise;
}

module.exports = getNoaaStations;
