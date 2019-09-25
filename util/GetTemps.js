
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




async function getYearTemps(year, stations, d, zip) {
  // const L = stations.length
  // let i = 0
  // let sleepMs = 100
  // _log('L', L, 'year', year)
  let consecutive_429s = 0
  const max_429s = 3
  // const currentYear = new Date().getFullYear()
  // let years = [...Array(N).keys()].map(i => {
  //   return { min: null, max: null, year: currentYear - i - 1 }
  // })

  // const addHL = (years,hlTemp) => {
  //   h1years = h1Temp.filter((d,i) => years[i].min == null)
  //   years = years.filter(d => d.min == null).map((d,i) =>  {
  //     if (h1years[i] != null && h1years[i] != undefined ) {
  //       if (d.min == null || d.min == 100)  d.min = h1years[i].min
  //       if (d.max == null) d.max = h1years[i].max
  //     }
  //     return d
  //   })
  // }

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
      // _log('returning hlTemps', hlTemps, 'for year', year, 'and zip', zip)
      consecutive_429s = 0
      if (h1Temps != undefined && h1Temps != null) return hlTemps
    }
    catch (err) {
      // _log("getYearTemps error", err, year, station.stationid, zip)
      if (err.err.indexOf(429) >= 0) {
        if (++consecutive_429s < max_429s) {
          //  _log("resetting for 429, trying station again")
          await sleep(2000)
          i -= 1
        } // else go on to the next station
      }
      else {
        consecutive_429s = 0
      }
    }
  }
  return undefined
}

String.prototype.replaceAll = function (target, replacement) {
  return this.split(target).join(replacement);
};


async function GetTemps(lat, lng, zip) {  // zip for debugging only
  try {
    // _log('GetTemps', lat, lng, zip)
    stations = await getNoaaStations(lat, lng, stationPool)
    // _log('stations.length', stations.length)

    const N = 20
    const currentYear = new Date().getFullYear()
    let years = [...Array(N).keys()].map(i => currentYear - i - 1)
    let throwable = []
    try {
      const promises = years.map(async year => {
        const stationsYears = JSON.parse(JSON.stringify(stations)).map(s => {
          s['years'] = [...Array(new Date(s.maxdate).getFullYear() - new Date(s.mindate).getFullYear()).keys()].map(y =>
            y + new Date(s.mindate).getFullYear()).filter(y => y == year)
          return s
        }).filter(station => station.years.length != 0)
        try {
          const HL = await getYearTemps(year, stationsYears, zip)
          if (HL == undefined) {
            throwable.push(year)
          }
          return HL
        }
        catch (err) {
          _log(`returning null for zip ${zip} year ${year} `)
          throwable.push(year)
          return null
        }
      })
      r = await Promise.all(promises)
      _log('\ntable for ' + zip)
      console.table(r)
      if (throwable.length > 0) {
        throw ({ nullyears: throwable })
      }
      const writer = new streams.WritableStream();
      const myConsole = new console.Console(writer, writer);
      // _log('return r')
      myConsole.log(r)
      let u = writer.toString().replaceAll('min', '"low"').replaceAll('max', '"high"').replaceAll('year', '"year"')
      return u
    }
    catch (err) {
      _log('GetTemps ', err)
      throw err
    }
  }
  catch (serr) {
    _log('Get Stations', serr)
    throw { err: serr }
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