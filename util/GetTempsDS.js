var streams = require('memory-streams');
const axios = require("axios");
//const rateLimit = require("axios-rate-limit");
const _log = require("./_log")

String.prototype.replaceAll = function (target, replacement) {
  return this.split(target).join(replacement);
};


async function GetTempsDS(lat, lng, zip) {
  const url = 'https://api.darksky.net/forecast/'
  const N = 20
  let date = new Date()
  const sd = 3600 * 24 * 365 // seconds in a year
  const ts = Math.round(date.getTime() / 1000)
  const r = []

  for (let i = 0; i < N; i++) {
    offset = i * sd
    try {
      res = await axios.get(`${url}${process.env.DARK_SKY}/${lat},${lng},${ts - offset}`)
      date.setTime(res.data.daily.data[0].time * 1000)
      r.push({ year: date.getFullYear(), min: res.data.daily.data[0].temperatureMin, max: res.data.daily.data[0].temperatureMax })
    }
    catch (err) {
      _log(`zip ${zip} dark skys error ${err}`)
      throw err
    }
  }
  _log('r for zip ', zip)
  console.table(r)
  const writer = new streams.WritableStream()
  const myConsole = new console.Console(writer, writer)
  // _log('return r')
  myConsole.log(r)
  let u = writer.toString().replaceAll('min', '"low"').replaceAll('max', '"high"').replaceAll('year', '"year"')
  return u
}

module.exports = GetTempsDS 