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
    try {
      _log(colors.Red + "in getDateData getStations" + colors.Reset )  
    }
    catch(err) {
      console.log('_log err', err)
    }
    let promise = new Promise((resolve, reject) => {
      try {
        _log(colors.Red + "in getDateData getStations Promise" + colors.Reset )  
      }
      catch(err) {
        console.log('_log err', err)
      }
      getNoaaStations(this.lat, this.lng)
      .then(stationSets => {
        this.stationSets = stationSets
        _log('got stations length:', this.stationSets.lenght)
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
    const promise = new Promise((resolve, reject) => {
      _log('this.stationSets === null', this.stationSets === null)
      if (this.stationSets === null) reject("couldn't get stations")
      let done = false
      _log('data stationSets', this.stationSets)
      try {
        _log('start try')
        for (const ss in this.stationSets) {
          _log('ss')
          for (const si in this.stationSets[ss]) {
            _log(si)
            if (this.stationSets[ss][si].mindate <= date && this.stationSets[ss][si].maxdate >= date) {
              done = true
              _log(`found year ${year}`)
              getMinMax(date, this.stationSets[ss][si])
              .then(minMax => {
                _log(`resolving minMax ${JSON.stringify(minMax, null, 2)}`)
                resolve(minMax)
              })
              .catch(err => {
                _log('getMinMax', err)
                reject("can't get minMax" + err)
              })
              break
            }
          } // for si
         if (done) break
        } // for ss
        // if (!done) reject("year not found")
      } 
      catch (err) {
        // _log(err.stack)
        _log(err)
        reject("fuck can't get stations err:", err)
      }
    }) // new promise 
    return promise
  } // async data
} // class getDateData

module.exports = getDateData;

