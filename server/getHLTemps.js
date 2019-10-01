const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const _log = require("../util/_log")
const colors = require("../util/colors")


// token = process.env.GOVV2_0


// function sleep(time) {
//   return new Promise(resolve => setTimeout(resolve, time));
// }

const getScore = (results, key) => {
  score = 0
  try {
    score = Math.min(new Set(results.filter(r => r.datatype == key).map(r => r.value)).size, 12)
    // _log('getScore score', score)
  }
  catch (err) {
    // _log('score error ', err)
  }
  return score
}

// console.log('type DEBUGMODE', typeof DEBUGMODE)
// console.log('value DEBUGMODE', DEBUGMODE)

// console.log('type token', typeof TOKEN)
// console.log(`value token |${TOKEN}|`)


const http = rateLimit(
  axios.create({
    headers: {
      get: {
        // can be common or any other method
        token: TOKEN
      }
    }
  }),
  { maxRequests: 2, perMilliseconds: 1100 }
);
// http.interceptors.request.use(
//   async (config) => {
//     const token = await getToken(); // slightly longer running function than example above
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

http.interceptors.request.use(
  function (config) {
    const token = TOKEN
    if (token) config.headers.get.token = `${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

async function getHLTemps(year, station, zip) {
  try {
    // console.log('http', http)
    const stations = Array.isArray(station) ?
      //station.map(s => s.stationid).toString()
      station.map(s => s.stationid).toString().split(',').join('&')
      : station.stationid
    // if (stations.indexOf('&') > 0)
    //   _log(`getHLTemps array for ${zip} year ${year} stations ${JSON.stringify(stations, null, 2)}`)
    // else
    //   _log(`zip ${zip} year ${year} single station ${JSON.stringify(station, null, 2)}`)

    //    _log('getHLTemps year', year, 'station.stationid', station.stationid)
    // urlMax = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${stations}&datasetid=GHCND&startdate=${year}-01-01&enddate=${year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMAX&limit=1000`
    // urlMin = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${stations}&datasetid=GHCND&startdate=${year}-01-01&enddate=${year + 1}-01-01&includeAttributes=true&format=json&datatypeid=TMIN&limit=1000`
    urlMinMax = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${stations}&datasetid=GHCND&startdate=${year}-01-01&enddate=${year + 1}-01-01&includeAttributes=false&format=json&datatypeid=TMIN,TMAX&limit=1000`

    url = urlMinMax

    recordsMinMax = await http.get(urlMinMax)
    // await sleep(200)
    // recordsMin = await http.get(urlMin)
    let max = -100;
    let min = 100;
    // let min_key = -1;

    // _log(recordsMax.data)
    // _log(recordsMin.data)
    let score = 0
    try {
      score = getScore(recordsMinMax.data.results, 'TMAX') + getScore(recordsMinMax.data.results, 'TMIN')
      max = Math.max(...recordsMinMax.data.results.filter(r => r.datatype == 'TMAX').map(r => r.value))
      min = Math.min(...recordsMinMax.data.results.filter(r => r.datatype == 'TMIN').map(r => r.value))
    }
    catch (err) { }

    if (max > min) {
      // _log(`resolving getHLTemps zip ${zip}  year ${year}  stations ${stations}  min ${min}  max ${max} score ${score}`)

      return { year, min, max, score }
    }
    else {
      console.log(`rejecting getMinMax zip ${zip} min ${min}  max ${max} url ${url}`)
      throw { err: "Min/Max not found", year, url }
    }

  }
  catch (err) {
    ejson = 'circular'
    try {
      ejson = JSON.stringify(err, null, 2)
    }
    catch (err) { }
    _log(`zip ${zip} GHCND error ${ejson} for url ${url} =>>>>>`, err.response.data)
    throw {
      err: `can't get station GHCND data err ${err.response.data.status}  ${err.response.data.message}url ${url} `, year, zip
    }
  }
}



module.exports = getHLTemps 
