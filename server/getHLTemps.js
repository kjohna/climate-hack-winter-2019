const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const _log = require("../util/_log")
const colors = require("../util/colors")


// function sleep(time) {
//   return new Promise(resolve => setTimeout(resolve, time));
// }

const getScore = (results, key) => {
  score = 0
  try {
    score = Math.min(new Set(results.filter(r => r.datatype == key).map(r => r.value)).size, 12)
    _log('getScore score', score)
  }
  catch (err) {
    // _log('score error ', err)
  }
  return score
}


const http = rateLimit(
  axios.create({
    headers: {
      get: {
        // can be common or any other method
        token: process.env.GOVV2
      }
    }
  }),
  { maxRequests: 2, perMilliseconds: 1100 }
);


async function getHLTemps(year, station, zip) {
  try {
    const stations = Array.isArray(station) ?
      station.map(s => s.stationid).toString().split(',').join('&')
      : station.stationid
    if (stations.indexOf('&') > 0)
      _log(`getHLTemps array for ${zip} year ${year} stations ${JSON.stringify(stations, null, 2)}`)
    else
      _log(`zip ${zip} year ${year} single station ${JSON.stringify(station, null, 2)}`)

    //    _log('getHLTemps year', year, 'station.stationid', station.stationid)
    urlMax = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${stations}&datasetid=GHCND&startdate=${year}-01-01&enddate=${year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMAX&limit=1000`
    urlMin = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${stations}&datasetid=GHCND&startdate=${year}-01-01&enddate=${year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMIN&limit=1000`

    url = urlMax

    recordsMax = await http.get(urlMax)
    // await sleep(200)
    recordsMin = await http.get(urlMin)
    let max = -100;
    let min = 100;
    let min_key = -1;

    // _log(recordsMax.data)
    // _log(recordsMin.data)
    let score = 0
    try {
      score = getScore(recordsMax.data.results, 'TMAX') + getScore(recordsMin.data.results, 'TMIN')
      max = Math.max(...recordsMax.data.results.map(r => r.value))
      min = Math.min(...recordsMin.data.results.map(r => r.value))
    }
    catch (err) { }


    // for (records of [recordsMax, recordsMin]) {
    //   // max_count = 0;
    //   // min_count = 0;
    //   _log('records', JSON.stringify(records.data.results, null, 2))
    //   for (const r of records.data.results) {
    //     //r = records.data.results[key];
    //     // console.log('r',JSON.stringify(r, null, 2))
    //     // console.log(`key keys ${Object.keys(key)}  key ${key}`)
    //     // console.log(`r keys ${Object.keys(r)}  key ${r}`)
    //     // if (r.attributes === "E") continue;
    //     if (r.datatype == "TMAX") {
    //       // max_count += 1;
    //       max = Math.max(max, r.value)
    //       // console.log(`TMAX found ${r.value}`)
    //     } else if (r.datatype == "TMIN") {
    //       // min_count += 1;
    //       min = Math.min(min, r.value)
    //       min_key = 0
    //       // min += r.value;
    //       // console.log(`${r.datatype} found   ${r.value}`)
    //     }
    //   }
    // }
    if (max > min) {
      _log(`resolving getHLTemps zip ${zip}  year ${year}  stations ${stations}  min ${min}  max ${max} score ${score}`)

      return { year, min, max, score }
    }
    else {
      console.log(`rejecting getMinMax zip ${zip} min ${min}  max ${max} url ${url}`)
      throw { err: "Min/Max not found", year, url }
    }

  }
  catch (err) {
    _log("zip", zip, "GHCND error", err.data, "for url", url)
    throw {
      err: `can't get station GHCND data err ${err} url ${url}  `, year, zip
    }
  }
}


// const isNull = function (obj) {
//   return obj == null;
// }

// async function getMinMax(stationsYears) {
//   const promise = new Promise((resolve, reject) => {
//     let station = null
//     let year = null
//     let years = null

//     while (stationsYears[0].years.length == 0 && stationsYears.length > 0) {
//       station = stationsYears.shift()
//     }
//     station = stationsYears[0]
//     if (!isNull(station)) {
//       // _log('station', JSON.stringify(station, null, 2), ' stationsYears.length ', stationsYears.length)
//       year = station.years.shift()
//       years = station.years
//     }
//     // while (stationsYears.length >= 0 && !isNull(station) && isNull(year)) {
//     //   const years = station.years
//     //   year = years.shift()
//     //   _log('start year', year)
//     //   _log('active_years', active_years)
//     //   let i = 30
//     //   while (active_years.indexOf(year) < 0 && years.length >= 0 && !isNull(year)) {
//     //     year = years.length > 0 ? years.shift() : null
//     //     if (first) {
//     //       _log(`in process year ${year}  years ${years}`)
//     //     }
//     //     if (--i == 0)
//     //       break
//     //   }

//     // if (year == undefined) year = null
//     // _log(`final year ${year}  years ${years}`)
//     // if (isNull(year) || active_years.indexOf(year) < 0) {
//     //   station = stationsYears.length > 0 ? stationsYears.shift() : null
//     // }

//     // }


//     // const date = new Date(date_)
//     // const year = date.getFullYear()
//     // console.log(`getMinMax date year ${year}`)
//     // _log(`getMinMax ${JSON.stringify(station, null, 2)}`)
//     // _log('GOVV2:', process.env.GOVV2)
//     if (isNull(station) || isNull(year)) {
//       return reject({ err: "no station/year - are we done?" })
//     }
//     // stationid=${station.stationid}
//     // const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=GHCND:USC00083909&datasetid=GHCND
//     // &startdate=${year}-01-01&enddate=${year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMAX,TMIN&limit=1000`;
//     const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${station.stationid}&datasetid=GHCND&startdate=${year}-01-01&enddate=${year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMAX,TMIN&limit=1000`;
//     //    console.log(`get MinMax year ${year} url ${url}`)

//     http
//       .get(url)
//       .then(records => {
//         // console.log('records keys', Object.keys(records))
//         // _log('records.data', JSON.stringify(records.data, null , 2))
//         // console.log('records.status', records.status)
//         // try {
//         //   _log('result length', records.data.results.length)
//         // }
//         // catch (err) {
//         //   _log('no records.data.results.length')
//         // }

//         let max = -100;
//         let min = 100;
//         // max_count = 0;
//         // min_count = 0;
//         let min_key = -1;
//         for (var key in records.data.results) {
//           r = records.data.results[key];
//           // console.log('r',JSON.stringify(r, null, 2))
//           // console.log(`key keys ${Object.keys(key)}  key ${key}`)
//           // console.log(`r keys ${Object.keys(r)}  key ${r}`)
//           // if (r.attributes === "E") continue;
//           if (r.datatype == "TMAX") {
//             // max_count += 1;
//             if (r.value > max) max = r.value;
//             // console.log(`TMAX found ${r.value}`)
//           } else if (r.datatype == "TMIN") {
//             // min_count += 1;
//             if (r.value < min) {
//               min = r.value;
//               min_key = key;
//             }
//             // min += r.value;
//             // console.log(`${r.datatype} found   ${r.value}`)
//           }
//         }
//         if (max > min) {
//           _log(`resolving getMinMax ${year} min ${min}  max ${max} min_key  ${min_key}`)
//           return resolve({ year, min, max, min_key })
//         }
//         else {
//           // console.log(`rejecting getMinMax min ${min}  max ${max} url ${url}`)
//           return reject({ err: "Min/Max not found", year, url })
//         }
//       })
//       .catch(err => {
//         // _log(`rejecting getMinMax`)
//         // _log(new Error().stack)
//         return reject({ err: `can't get station GHCND data url ${url}  err ${err}`, year, url })
//       })
//   })
//   return promise
// }

module.exports = getHLTemps 
