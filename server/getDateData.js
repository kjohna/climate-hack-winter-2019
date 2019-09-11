// import { rejects } from "assert";
const _log = require("../util/_log")
const getNoaaStations = require("./getNoaaStations")
const getMinMax = require("./getMinMax")
const colors = require("../util/colors")


class getDateData {
  constructor(zip, lat, lng) {
    this.zip = zip
    this.lat = lat
    this.lng = lng
  }
  async getStations() {
    let promise = new Promise((resolve, reject) => {

      _log(colors.Red + "in getDateData constuctor" + colors.Reset )  
      getNoaaStations(this.lat, this.lng)
      .then(stationSets => {
        this.stationSets = stationSets
        resolve(this)
      })
      .catch(err => {
        this.stationSets = null
        reject("couldn't get stations:" + err)
      })
    })
    return promise  
  } 
  async data(date) {
    console.log(`data date`, date)
    let promise = new Promise((resolve, reject) => {
      if (this.stationSets === null) reject("couldn't get stations")
      let done = false
      // _log('data stationSets', this.stationSets)
      try {
        for (const ss in this.stationSets) {
          for (const si in this.stationSets[ss]) {
            if (this.stationSets[ss][si].mindate <= date && this.stationSets[ss][si].maxdate >= date) {
              done = true
              getMinMax(date, this.stationSets[ss][si])
              .then(minMax => {
                _log(`resolving minMax ${JSON.stringify(minMax, null, 2)}`)
                resolve(minMax)
              })
              .catch(err => {
                reject("can't get minMax" + err)
              })
            }
          if (done) break
          }
        if (done) break
        }
        if (!done) reject("year not found")
      }
      catch (err) {
        _log(err.stack)
        reject("can't get stations err:", err)
      }
    })
    return promise
  }
}

module.exports = getDateData;

