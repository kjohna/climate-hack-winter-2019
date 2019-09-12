const express = require("express");

const axios = require("axios");
//const rateLimit = require("axios-rate-limit");
const getDateData = require("../getDateData")
const colors = require("../../util/colors")


const imax = 20;


// const url = "https://api.darksky.net/forecast/";
const state_alert_url = "https://api.weather.gov/alerts/active/area/";
const zone_alert_url = "https://api.weather.gov/alerts/active/zone/";
const fetch = require("node-fetch");
//const history_url = `https://www.ncei.noaa.gov/access/services/data/v1?&boundingBox=${north},${west},${south},${east}&dataset=monthly-summaries&dataTypes=MLY-TMAX-NORMAL,MLY-TMIN-NORMAL&startDate=${startDate}&endDate=${endDate}&includeAttributes=true&format=json`;
//const history_url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data/?zip=${zip}&datasetid=GSOY&startdate=2009-01-01&enddate=2018-01-01&includeAttributes=true&format=json&datatypeid=TMAX,TMIN&limit=1000`;
//const current_base_url = `https://api.weather.gov/points/${lat},${log}`;
// (N,W,S,E)   yyyy-mm-ddT00:00:00Z   +=.66 for N/S  +=0.5 for E/W
const weatherRouter = express.Router();
const fs = require("fs");
// const data=fs.readFileSync('nws-zones.json', 'utf8');
// const nws_zones = JSON.parse(data);

// 1918-01-02T22:54:00

const taxios = axios.create({
  headers: {
    get: {
      // can be common or any other method
      token: process.env.GOVV2
    }
  }
});

function isDone(ra) {
  return ra.length == imax
}

// function yearDone(ra, year) {
//   return ra[year - 1] !== null
// }
function scheduleRequests(axiosInstance, intervalMs) {
  let lastInvocationTime = undefined;

  const scheduler = config => {
    const now = Date.now();
    if (lastInvocationTime) {
      lastInvocationTime += intervalMs;
      const waitPeriodForThisRequest = lastInvocationTime - now;
      if (waitPeriodForThisRequest > 0) {
        return new Promise(resolve => {
          setTimeout(() => resolve(config), waitPeriodForThisRequest);
        });
      }
    }

    lastInvocationTime = now;
    return config;
  };

  axiosInstance.interceptors.request.use(scheduler);
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

weatherRouter.get("/:zip", function (req, res) {
  console.log('in weatherRouter.get for zip ')

  let error = false;
  const { zip } = req.params;

  console.log(`google map key ${process.env.GOOGLE_MAP}  ${zip} `);
  gurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${
    process.env.GOOGLE_MAP
    }`;

  scheduleRequests(axios, 300);

  const d = new Date();
  const year = d.getFullYear();
  // const month = d.getMonth();
  // const day = d.getDate();

  // const ts = Math.round(date.getTime() / 1000);
  // sd = 3600 * 24 * 365; // seconds in a year

  // ra = new Array(imax).fill(null)
  // console.log('ra.length', ra.length)
  ra = []

  let lat = undefined;
  let lng = undefined;
  let short_state = undefined;
  let alert_description = undefined;
  const radone = new Error('ra = 20 done')
  // years_done = Array(20).map(() => false)
  axios.get(gurl).then(zresponse => {
    lat = zresponse.data.results[0].geometry.location.lat;
    lng = zresponse.data.results[0].geometry.location.lng;
    west = lat - 0.66;
    east = lat + 0.66;
    north = lng + 0.5;
    south = lng - 0.5;
    ac = zresponse.data.results[0].address_components;
    console.log("ac", ac.length);
    for (let i = 0; i < ac.length; i++) {
      if (ac[i].types[0] === "administrative_area_level_1") {
        short_state = ac[i].short_name;
        console.log("short state json", ac[i]);
        break;
      }
    }
    console.log(`zresponse lat ${lat} lng ${lng}`);
    // console.log(`dark skys ${url}${process.env.DARK_SKY}/${lat},${lng}`)
    console.log(`alert url ${state_alert_url}${short_state}`);
    axios
      .get(`${state_alert_url}${short_state}`)
      .then(alert => {
        console.log("length of features", alert.data.features.length);
        // console.log(`alert data  ${JSON.stringify(alert.data.features['0'].properties.description, null, 2)}`)

        alert_description =
          alert.data.features.length > 0
            ? alert.data.features["0"].properties.description
            : "None";
        console.log(`alert_description: ${alert_description}`);
        taxios.get(`https://api.weather.gov/points/${lat},${lng}`).then(cbu => {
          console.log(
            `cbu: ${Object.keys(cbu.data.properties)}   ${JSON.stringify(
              cbu.data.properties,
              null,
              2
            )}`
          );
          axios
            .all([
              axios.get(cbu.data.properties.forecast),
              axios.get(cbu.data.properties.forecastHourly),
              axios.get(cbu.data.properties.forecastGridData)
            ])
            .then(
              axios.spread((f, fh, fg) => {
                console.log(`f keys ${Object.keys(f)} ${f}`);
                console.log(`fh keys ${Object.keys(fh)} ${fh}`);
                console.log(
                  `fg keys ${Object.keys(
                    fg.data.properties.relativeHumidity
                  )} ${fg.data.properties.relativeHumidity}`
                );
                const currently = {
                  current: {
                    temperature: 2,
                    humidity:
                      fg.data.properties.relativeHumidity.values[0].value / 100
                  },
                  min: 1,
                  max: 3
                };
                for (let i = 0; i < 2; i++) {
                  console.log(
                    `currently p ${JSON.stringify(
                      f.data.properties.periods[i].detailedForecast,
                      null,
                      2
                    )}`
                  );
                  m = f.data.properties.periods[i].detailedForecast.match(
                    /(high|low)\s(near|around)\s(\d+)/
                  );
                  if (m != null) {
                    console.log(
                      `m[0] ${m[0]} m[1] ${m[1]}  m[2] ${m[2]} m[3] ${m[3]}`
                    );
                    if (m[1] == "high") {
                      currently.max = Number(m[3]);
                    } else {
                      currently.min = Number(m[3]);
                    }
                  }
                }
                console.log(
                  `fh.data.properties.periods[0] ${JSON.stringify(
                    fh.data.properties.periods[0],
                    null,
                    2
                  )}`
                );

                currently.current.temperature = Number(
                  fh.data.properties.periods[0].temperature
                );
                currently.current.icon = Number(
                  fh.data.properties.periods[0].icon
                );
                done = false;
                stations = new getDateData(zip, lat, lng)
                stations.getStations()
                  .then(stations => {
                    _log(colors.Green + "getStations then" + colors.Reset)
                    for (yearOffset = -1; yearOffset <= imax; yearOffset++) {
                      sleep(yearOffset * 400).then(() => {
                        stations.data(new Date(year - yearOffset, 0, 1))
                          .then(dateData => {

                            // }
                            console.log(`dateData`, JSON.stringify(dateData, null, 2))
                            min = dateData.min
                            max = dateData.max
                            min_key = dateData.min_key
                            // d = (max > 150) ? 10 : 1
                            const d = 10


                            min_ = min * 1.8 / d + 32;
                            max_ = max * 1.8 / d + 32;
                            console.log(`i  year ${dataDate.date.year} raw min ${min} ${min_} max ${max} ${max_} min_key ${min_key} records.data.results[min_key]
                                  ${JSON.stringify(
                              records.data.results[min_key],
                              null,
                              2
                            )}`);
                            ra.push({ date: dateData.date, min: _min, max: _max, zip })
                            //console.log('yearDone test (should be true)', yearDone(ra, yearOffset))

                            if (done) {
                              ra.sort(function (a, b) {
                                return b.date - a.date;
                              });
                              console.log(
                                `200 alert ${alert_description}`
                              );
                              console.log(
                                `200 currently temperature: ${
                                currently.current.temperature
                                }
                        humidity: ${currently.current.humidity}
                        ra[0]: ${JSON.stringify(ra[0], null, 2)}
                        `
                              );
                              try {
                                res.status(200).json({
                                  min: currently.min,
                                  max: currently.max,
                                  currently: currently.current,
                                  ra,
                                  location: { lat, lng },
                                  alert: alert_description
                                });
                              }
                              catch (err) { }
                            } // if j == imax
                            // console.log('returning after res(200)')
                            return
                            // })
                          })
                          .catch(err => {
                            const throttle = (err.message !== undefined && err.message.indexOf('429') >= 0)
                            if (!throttle) {
                              try {
                                console.log(`ds err: ${JSON.stringify(err, null, 2)} stack ${err.stack}`);
                                console.log(`err short name ${err.short_name} short state ${err.short_state}`)
                              }
                              catch (e) { }


                              console.log(
                                `ds err message ${err.message} name ${err.name} stack: ${
                                err.stack
                                }`

                              );
                            }
                            if (throttle) {
                              console.log(`throttling i ${yearOffset}`)
                              yearOffset -= 1;
                              sleep(500);
                            }
                            else {
                              res.status(500).json({
                                error: err.message
                              })
                              return
                            }
                            // continue
                          });
                      }) // sleep
                      if (done) {
                        console.log('for ss break')
                         break;
                      }

                    } // for yearoffset
                  }) // getDateData constructor 

                if (done) {
                  console.log('for sleep return')
                  return
                }
              })   // axious spread
            )
        }) // get api.weather

      }) // get state alerr

  })  // get gurl
}) // end of weatherRouter.get


module.exports = weatherRouter;
