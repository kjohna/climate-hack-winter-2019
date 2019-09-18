const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const _log = require("../util/_log")
const colors = require("../util/colors")

const http = rateLimit(
  axios.create({
    headers: {
      get: {
        // can be common or any other method
        token: process.env.GOVV2
      }
    }
  }),
  { maxRequests: 20, perMilliseconds: 600 }
);



async function getMinMax(year, station) {
  // const date = new Date(date_)
  // const year = date.getFullYear()
  console.log(`getMinMax date year ${year}`)
  //  station ${JSON.stringify(station, null, 2)}`)
  let promise = new Promise((resolve, reject) => {
    // stationid=${station.stationid}
    const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=GHCND:USC00083909&datasetid=GHCND
    &startdate=${year}-01-01&enddate=${year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMAX,TMIN&limit=1000`;
    console.log(`get MinMax year ${year} url ${url}`)

    // const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${stations.join(
    //   ","
    // )}&datasetid=GHCND&startdate=${date.year}-01-01&enddate=${date.year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMAX,TMIN&limit=1000`;
    http
      .get(url)
      .then(records => {
        console.log('records keys', Object.keys(records))
        console.log('records.data.results[0]', records.data.results[0])
        console.log('records.status', records.status)


        let max = -100;
        let min = 100;
        // max_count = 0;
        // min_count = 0;
        let min_key = -1;
        for (var key in records.data.results) {
          r = records.data.results[key];
          // console.log('r',JSON.stringify(r, null, 2))
          // console.log(`key keys ${Object.keys(key)}  key ${key}`)
          // console.log(`r keys ${Object.keys(r)}  key ${r}`)
          // if (r.attributes === "E") continue;
          if (r.datatype == "TMAX") {
            // max_count += 1;
            if (r.value > max) max = r.value;
            // console.log(`TMAX found ${r.value}`)
          } else if (r.datatype == "TMIN") {
            // min_count += 1;
            if (r.value < min) {
              min = r.value;
              min_key = key;
            }
            // min += r.value;
            // console.log(`${r.datatype} found   ${r.value}`)
          }
        }
        if (max > min) {
          console.log(`resolving getMinMax ${year} min ${min}  max ${max} min_key  ${min_key}`)
          resolve({ "date": year, min, max, min_key })
        }
        else {
          console.log(`rejecting getMinMax min ${min}  max ${max}`)
          reject({ err: "Min/Max not found" })
        }
      })
      .catch(err => {
        reject(`can't get station GHCND data url ${url}  err ${err}  `)
      })
  })
  return promise
}

module.exports = getMinMax