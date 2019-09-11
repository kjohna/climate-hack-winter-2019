const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const _log = require("../util/_log")
const colors = require("../util/colors")

const http = rateLimit(
  axios.create({
    headers: {
      // get: {
      //   // can be common or any other method
      //   token: process.env.GOVV2
      // }
    }
  }),
  { maxRequests: 1, perMilliseconds: 400 }
);



async function getMinMax(date_, station) {
  const date = new Date(date_)
  const year = date.getFullYear()
  //_log(`getMinMax date year ${year}`) 
  //  station ${JSON.stringify(station, null, 2)}`)
  let promise = new Promise((resolve, reject) => {
    const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${station.stationid}&datasetid=GHCND
    &startdate=${year}-01-01&enddate=${year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMAX,TMIN&limit=1000`;
    _log(`get MinMax year ${year} url ${url}`)

    // const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${stations.join(
    //   ","
    // )}&datasetid=GHCND&startdate=${date.year}-01-01&enddate=${date.year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMAX,TMIN&limit=1000`;
    http
      .get(url)
      .then(records => {
        // console.log('records.data keys', Object.keys(records.data))

        let max = -100;
        let min = 100;
        // max_count = 0;
        // min_count = 0;
        let min_key = -1;z
        for (var key in records.data.results) {
          r = records.data.results[key];
          _log('r',JSON.stringify(r, null, 2))
          // console.log(`key keys ${Object.keys(key)}  key ${key}`)
          // console.log(`r keys ${Object.keys(r)}  key ${r}`)
          // if (r.attributes === "E") continue;
          if (r.datatype == "TMAX") {
            // max_count += 1;
            if (max > r.value) max = r.value;
            // console.log(`TMAX found ${r.value}`)
          } else if (r.datatype == "TMIN") {
            // min_count += 1;
            if (min < r.value) {
              min = r.value;
              min_key = key;
            }
            // min += r.value;
            // console.log(`${r.datatype} found   ${r.value}`)
          }
        }
        resolve({date, min, max, min_key})        
      })
      .catch(err => {
        reject("can't get station GHCND data:", err)
      })
  })
  return promise
}

module.exports = getMinMax