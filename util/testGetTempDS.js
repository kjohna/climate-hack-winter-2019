const GetTempsDS = require('./GetTempsDS')
var dotenv = require('dotenv');
dotenv.load();

// const AsyncLock = require('async-lock');
// const lock = new AsyncLock();


DEBUGMODE = true;
const _log = require("./_log")

async function testGetTempDS() {
  lat = 40.5070853
  lng = -74.2443436
  zip = 10576

  try {
    res = await GetTempsDS(lat, lng, zip)
    _log(JSON.stringify(res, null, 2))
  }
  catch (err) {
    _log('ds err ', err)
  }
}

testGetTempDS()

