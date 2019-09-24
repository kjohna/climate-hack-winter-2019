
var streams = require('memory-streams');
// var assert = require('assert');

const getHLTemps = require("../server/getMinMax")
const _log = require("./_log")
const getNoaaStations = require("../server/getNoaaStations")
const stationPool = require("../server/pgClient").stationPool
const replaceAll = require('./replaceall')

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


async function getYearTemps(year, stations, zip) {
  const L = stations.length
  let i = 0
  let sleepMs = 100
  _log('L', L, 'year', year)

  // const promises = stations.map(async station => {
  //   try {
  //     const hlTemps = await getHLTemps(year, station, zip)
  //     return hlTemps
  //   }
  //   catch (err) {
  //     return null
  //   }
  // })

  // hls = await Promise.all(promises)

  // for (let i = 0; i < hls.length; i++)
  //   if (hls[i] != null)
  //     return hls[i]
  // _log("getYearTemps can't get year", year)
  // throw { err: `can't get year ${year}` }


  for (let i = 0; i < stations.length; i++) {
    station = stations[i]
    try {
      const hlTemps = await getHLTemps(year, station, zip)
      _log('returning hlTemps', hlTemps, 'for year', year, 'and zip', zip)
      return hlTemps
    }
    catch (err) {
      _log("getYearTemps error", err, year, station, zip)
      if (err.err.indexOf(429) >= 0) {
        _log("resetting for 429, trying station again")
        await sleep(2000)
        i -= 1
      }
    }
  }
}

String.prototype.replaceAll = function (target, replacement) {
  return this.split(target).join(replacement);
};


async function GetTemps(lat, lng, zip) {  // zip for debugging only
  try {
    _log('GetTemps', lat, lng, zip)
    stations = await getNoaaStations(lat, lng, stationPool)
    // _log('stations.length', stations.length)

    const N = 20
    const currentYear = new Date().getFullYear()
    let years = [...Array(N).keys()].map(i => currentYear - i - 1)

    try {
      const promises = years.map(async year => {
        const stationsYears = JSON.parse(JSON.stringify(stations)).map(s => {
          s['years'] = [...Array(new Date(s.maxdate).getFullYear() - new Date(s.mindate).getFullYear()).keys()].map(y =>
            y + new Date(s.mindate).getFullYear()).filter(y => y == year)
          return s
        }).filter(station => station.years.length != 0)
        try {
          const HL = await getYearTemps(year, stationsYears, zip)
          return HL
        }
        catch (err) {
          _log(`returning null for zip ${zip} year ${year} `)
          return null
        }
      })
      r = await Promise.all(promises)
      console.table(r)
      const writer = new streams.WritableStream();
      const myConsole = new console.Console(writer, writer);
      _log('return r')
      myConsole.log(r)
      let u = writer.toString().replaceAll('min', '"low"').replaceAll('max', '"high"').replaceAll('year', '"year"')
      // let s = writer.toString()
      // let t = writer.toString()
      // s = s.split('low').join('"low"')
      // _log('lows', s)
      // s = s.split('high').join('"high"')
      // _log('lowhighs', s)
      // s = s.split('year').join('"year"')
      // _log('GitTemps return', s)

      // t = replaceAll(t, 'low', '"low"')
      // _log('lowt', t)

      // t = replaceAll(t, 'high', '"high"')
      // _log('lowhight', t)
      // t = replaceAll(t, 'year', '"year"')
      // _log('t', t)
      // _log('s', s)

      return u

    }
    catch (err) {
      _log('GetTemps ', err)
      throw new Error({ err })
    }
  }
  catch (serr) {
    _log('Get Stations', err)
    throw new Error({ serr })
  }


  //   let loop = 0

  //   try {
  //     r = []
  //     for (let i = 0; i < N; i++) {
  //       year = years[i]

  //       const stationsYears = JSON.parse(JSON.stringify(stations)).map(s => {
  //         s['years'] = [...Array(new Date(s.maxdate).getFullYear() - new Date(s.mindate).getFullYear()).keys()].map(y =>
  //           y + new Date(s.mindate).getFullYear()).filter(y => y == year)
  //         return s
  //       }).filter(station => station.years.length != 0)

  //       // stations = JSON.parse(JSON.stringify(stationsYears))

  //       _log('await getYearTemps with year', year, loop++)
  //       hlTemps = await getYearTemps(year, stationsYears)
  //       r.push({ low: hlTemps.min, high: hlTemps.max, year })
  //     }
  //     _log('return r')
  //     console.table(r)
  //     const writer = new streams.WritableStream();
  //     const myConsole = new console.Console(writer, writer);
  //     // _log('return r')
  //     myConsole.log(r)
  //     return writer.toString().replaceAll('low:', '"low":').replaceAll('high:', '"high":').replaceAll('year', '"year"')
  //   }
  //   catch (err) {
  //     _log('GetTemps ', err)
  //     throw new Error({ err })
  //   }
  // }
  // catch (serr) {
  //   _log('Get Stations', err)
  //   throw new Error({ serr })
  // }
}

module.exports = GetTemps