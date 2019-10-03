
var streams = require('memory-streams')
var schedule = require('node-schedule')
// var assert = require('assert');

TOKEN = process.env.GOVV2_0

const getHLTemps = require("../server/getHLTemps")
const _log = require("./_log")
const colors = require("./colors")
const getNoaaStations = require("../server/getNoaaStations")
const stationPool = require("../server/pgClient").stationPool
// const replaceAll = require('./replaceall')

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const allTokens = [process.env.GOVV2_0, process.env.GOVV2_1, process.env.GOVV2_2, process.env.GOVV2_3, process.env.GOVV2_4]
let tokens = Array.from(allTokens)

// var j = schedule.scheduleJob({ hour: 00, minute: 01 }, function () { // NOAA reset at midnight
//   tokens = Array.from(allTokens)
// });

let tokenIndex = 0
outOfTokens = 'out of tokens'
swapToken = () => {
  _log('swapToken at ', tokenIndex)
  if (++tokenIndex >= tokens.length) tokenIndex = 0
  TOKEN = tokens[tokenIndex]
  return tokens.length > 1
}
killToken = () => {
  _log('killing token at ', tokenIndex)
  tk = tokens.splice(tokenIndex, 1)
  if (tokens.length == 0) throw outOfTokens
  if (tokenIndex >= tokens.length) tokenIndex = 0
  TOKEN = tokens[tokenIndex]
  assert(tk != TOKEN), "TOKEN didn't change"
  _log(`old token ${tk}, new TOKEN ${TOKEN}`)
}
const dayMessage = 'This token has reached its temporary request limit of 10000 per day.'


async function getYearTemps(year, stations, zip) {
  let consecutive_429s = 0
  const max_429s = 3

  if (zip < 10000) {
    //    _log('using PR all stations together')
    return await getHLTemps(year, stations, zip)
  }
  // else
  //   _log('one station at a time')
  // _log('station ids', stations.map(s => s.stationid))
  let max_score = -1
  let highScoreHL = null
  for (let i = 0; i < stations.length; i++) {
    station = stations[i]
    try {
      _log(`${colors.Cyan}await for zip ${zip}  year ${year} station stationid ${station.stationid}${colors.Reset}`)
      const hlTemps = await getHLTemps(year, station, zip)
      consecutive_429s = 0
      if (hlTemps != undefined && hlTemps != null) {
        score = hlTemps.score
        if (score > 20) {
          _log(colors.Green + 'returning hlTemps', hlTemps, 'for year', year, 'and zip', zip, colors.Reset)
          return { year: hlTemps.year, min: hlTemps.min, max: hlTemps.max }
        }
        if (score > max_score) {
          max_score = score
          highScoreHL = { year: hlTemps.year, min: hlTemps.min, max: hlTemps.max }
        }
      }
    }
    catch (err) {
      _log(colors.Yellow, "getYearTemps error", err.err, year, station.stationid, zip, colors.Reset)
      try {
        if (err.err.indexOf('429') >= 0) {
          if (++consecutive_429s < max_429s) {
            _log(colors.Yellow + "resetting token for 429, trying station again" + colors.Reset)
            if (err.err.indexOf(dayMessage) >= 0) killToken()
            else if (!swapToken())
              await sleep(2000)
            i -= 1
          } // else go on to the next station
        }
        else {
          consecutive_429s = 0
        }
      }
      catch (err) {
        consecutive_429s = 0
        if (err == outOfTokens)
          _log(colors.Red + 'thowing for end of day on all tokens' + colors.Reset)
        if (err == outOfTokens) throw err
      }
    }
  }
  if (highScoreHL != null) return highScoreHL
  _log(colors.Red + `year ${year} not found for zip ${zip}` + colors.Reset)
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
      _log(colors.Cyan + '\ntable for ' + zip + colors.Reset)
      r = []
      for (let yi = 0; yi < years.length; yi++) {
        try {
          year = years[yi]
          const stationsYears = JSON.parse(JSON.stringify(stations)).map(s => {
            s['years'] = [...Array(new Date(s.maxdate).getFullYear() - new Date(s.mindate).getFullYear()).keys()].map(y =>
              y + new Date(s.mindate).getFullYear()).filter(y => y == year)
            return s
          }).filter(station => station.years.length != 0)
          const HL = await getYearTemps(year, stationsYears, zip)
          if (HL == undefined) {
            _log(colors.Red + 'pushing throwable' + colors.Reset)
            throwable.push(year)
            break
          }
          else
            //            _log('not pushing throwable for ', HL)
            r.push(HL)
        }
        catch (err) {
          _log('thowing outoftokens')
          if (err == outOfTokens) throw err
          _log(`returning null ${JSON.stringify(err, null, 2)} for zip ${zip} year ${year} ${err.stack}`)
          throwable.push(year)
          break
          // throw throwable
        }
      }
      if (throwable.length > 0) {
        throw ({ nullyears: throwable })
      }
      console.table(r)
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