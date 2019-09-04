const express = require("express");

const axios = require("axios");
const rateLimit = require("axios-rate-limit");

const imax = 20;
const http = rateLimit(
  axios.create({
    headers: {
      get: {
        // can be common or any other method
        token: process.env.GOVV2
      }
    }
  }),
  { maxRequests: 1, perMilliseconds: 400 }
);

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
  for (let i = 0;i<imax;i++) {
    if (ra[i] === null) {
      return false
    }
  }
  return true
}

function yearDone(ra, year) {
  return ra[year - 1] !== null
}
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

weatherRouter.get("/:zip", function(req, res) {
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

  ra = new Array(imax).fill(null)
  console.log('ra.length', ra.length)
  
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
                axios
                  .all([
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 1},${lng - 0.05 * 1},${lat + 0.1 * 1},${lng +
                        0.05 * 1}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 2},${lng - 0.05 * 2},${lat + 0.1 * 2},${lng +
                        0.05 * 2}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 3},${lng - 0.05 * 3},${lat + 0.1 * 3},${lng +
                        0.05 * 3}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 4},${lng - 0.05 * 4},${lat + 0.1 * 4},${lng +
                        0.05 * 4}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 5},${lng - 0.05 * 5},${lat + 0.1 * 5},${lng +
                        0.05 * 5}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 6},${lng - 0.05 * 6},${lat + 0.1 * 6},${lng +
                        0.05 * 6}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 7},${lng - 0.05 * 7},${lat + 0.1 * 7},${lng +
                        0.05 * 7}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 8},${lng - 0.05 * 8},${lat + 0.1 * 8},${lng +
                        0.05 * 8}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 9},${lng - 0.05 * 9},${lat + 0.1 * 9},${lng +
                        0.05 * 9}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 10},${lng - 0.05 * 10},${lat + 0.1 * 10},${lng +
                        0.05 * 10}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 11},${lng - 0.05 * 11},${lat + 0.1 * 11},${lng +
                        0.05 * 11}`
                    ),
                    http.get(
                      `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=${lat -
                        0.1 * 12},${lng - 0.05 * 12},${lat + 0.1 * 12},${lng +
                        0.05 * 12}`
                    )
                  ])
                  .then(
                    axios.spread(
                      (s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12) => {
                        const stations_sets = [
                          s1,
                          s2,
                          s3,
                          s4,
                          s5,
                          s6,
                          s7,
                          s8,
                          s9,
                          s10,
                          s11,
                          s12
                        ];
                        let sleepMS = 0
                        for (let yearOffset = 1; yearOffset <= imax; yearOffset++) {
                          if (done) {
                            console.log('just after for break')
                            break
                          }
                          if (error) {
                            console.log("error return from i loop");
                            return;
                          }

                          if (yearDone(ra, yearOffset)) {
                            console.log(`${yearOffset} done`)                            
                            continue
                          }
                          sleepMS++
                          console.log(`${yearOffset} not done`)

                          sleep(sleepMS * 300).then(() => {
                            if (done) {
                              console.log('just after sleep return')
                              return
                            }                            
                            if (error) {
                              console.log("error return from sleep");
                              return;
                            }
                            console.log(`sleep zip ${zip} year ${year} yearOffset ${yearOffset}`)
                            const stations = [];
                            for (ss in stations_sets) {
                              if (done) {
                                console.log('just after for ss return')
                                return
                              }                               
                              // console.log(
                              //   `ss ${ss} stations_sets[ss].data.results ${JSON.stringify(
                              //     stations_sets[ss].data.results,
                              //     null,
                              //     2
                              //   )}`
                              // );
                              for (si in stations_sets[ss].data.results) {
                                if (done) {
                                  console.log('just after for si break')
                                  break
                                }
                                // console.log('after si ra.length', ra.length)
                                const s = stations_sets[ss].data.results[si];
                                // console.log(`s ${JSON.stringify(
                                //   s,
                                //   null,
                                //   2
                                // )} year ${year} i ${i}
                                //       Number(s.mindate.substring(4)) ${Number(
                                //         s.mindate.substring(0, 4)
                                //       )}`);
                                if (
                                  Number(s.mindate.substring(0, 4)) <=
                                    year - yearOffset &&
                                  Number(s.maxdate.substring(0, 4)) >=
                                    year - yearOffset + 1
                                ) {
                                  stations.push(s.id); // try to get records here, if none continue
                                }
                              }
                              // console.log("stations", stations);
                              if (stations.length === 0) {
                                // res.status(404).json({
                                //   error: `weather station not found for year ${year}`
                                // });
                                // error = true;
                                return;
                              }
                              const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?stationid=${stations.join(
                                ","
                              )}&datasetid=GHCND&startdate=${year -
                                yearOffset}-01-01&enddate=${year -
                                yearOffset +
                                1}-01-01&includeAttributes=true&format=json&datatypeid=TMAX,TMIN&limit=1000`;
                              http
                                .get(url)
                                .then(records => {
                                  if (done) {
                                    // console.log ('.get.then return')
                                    throw radone
                                    // return
                                  }
                                  // sleep(i * 250).then(() => {
                                  // if (records.length == 0) {
                                  console.log("url", url);
                                  // console.log(
                                  //   `type records.data ${typeof records.data}  keys ${Object.keys(
                                  //     records.data
                                  //   )} 
                                  //   records.data ${JSON.stringify(
                                  //     records.data
                                  //   )}`
                                  // );

                                  // if (records.data.results === undefined) {
                                  //   console.log('no data')
                                  //   return
                                  // }

                                  // }
                                  // else {
                                  // console.log(
                                  //   `type records.data ${typeof records.data} records.data ${JSON.stringify(
                                  //     records.data
                                  //   )}  keys ${Object.keys(
                                  //     records.data
                                  //   )} length data ${records.data.length}   `
                                  // );
                                  // console.log(
                                  //   `records.data keys ${Object.keys(
                                  //     records.data
                                  //   )}`
                                  // );
                                  try {
                                    console.log(
                                      `records.data.results.length ${
                                        records.data.results.length
                                      }`
                                    );
                                  } catch (err) {
                                    console.log("no data");
                                    return;
                                  }

                                  // }
                                  max = -100;
                                  min = 100;
                                  // max_count = 0;
                                  // min_count = 0;
                                  min_key = -1;
                                  for (var key in records.data.results) {
                                    r = records.data.results[key];
                                    // console.log(`key keys ${Object.keys(key)}  key ${key}`)
                                    // console.log(`r keys ${Object.keys(r)}  key ${r}`)
                                    // if (r.attributes === "E") continue;
                                    if (r.datatype == "TMAX") {
                                      // max_count += 1;
                                      if (max < r.value) max = r.value;
                                      // console.log(`TMAX found ${r.value}`)
                                    } else if (r.datatype == "TMIN") {
                                      // min_count += 1;
                                      if (min > r.value) {
                                        min = r.value;
                                        min_key = key;
                                      }
                                      // min += r.value;
                                      // console.log(`${r.datatype} found   ${r.value}`)
                                    }
                                  }
      
                                  // d = (max > 150) ? 10 : 1
                                  const d = 10

                                  
                                  min_ = min * 1.8 / d + 32;
                                  max_ = max * 1.8 / d + 32;
                                  console.log(`i ${yearOffset} year ${year - yearOffset} raw min ${min} ${min_} max ${max} ${max_} min_key ${min_key} records.data.results[min_key]
                                  ${JSON.stringify(
                                    records.data.results[min_key],
                                    null,
                                    2
                                  )}`);                                  
                                  // const history_url = `https://www.ncei.noaa.gov/access/services/data/v1?&
                                  // boundingBox=${north},${west},${south},${east}&dataset=monthly-summaries&
                                  //dataTypes=MLY-TMAX-NORMAL,MLY-TMIN-NORMAL&
                                  //startDate=${startDate}&endDate=${endDate}&includeAttributes=true&format=json`;

                                  // .get(`${url}${process.env.DARK_SKY}/${lat},${lng},${ts - offset}`)
                                  // startDate = new Date(year - i, month - 1, day);
                                  // syear = startDate.getFullYear();
                                  // smonth = startDate.getMonth();
                                  // sday = startDate.getDate();
                                  // startDate = `{year} `;
                                  // const endDate = new Date(year - i, month, day);
                                  // if (response.data) {
                                  //   date.setTime(response.data.daily.data[0].time * 1000);
                                  // years_done[i] = true
                                  console.log('yearDone test (should be false)', yearDone(ra, yearOffset))
                                  ra[yearOffset - 1] = {
                                    date: (year - yearOffset).toString(),
                                    min: min_,
                                    max: max_,
                                    zip
                                  };
                                  console.log('yearDone test (should be true)', yearDone(ra, yearOffset))
                                  done = isDone(ra)
                                  // console.log(
                                  //   `i ${i} j ${j} ra.length ${
                                  //     ra.length
                                  //   } imax ${imax}`
                                  // );
                                  if (done) {
                                    ra.sort(function(a, b) {
                                      return b.date - a.date;
                                    });
                                    // for (k = 1;k<=j;k++) {
                                    //   console.log(`ra[${k-1}]: ${ra[k-1].date} ${ra[k-1].min} - ${ra[k-1].max}`)
                                    // }
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
                                    catch(err){}
                                  } // if j == imax
                                  // console.log('returning after res(200)')
                                  return
                                  // })
                                })
                                .catch(err => {
                                  if (err === radone) {
                                    // console.log('returning radone from ds err')
                                    return err
                                  }
                                  if (err.message != undefined && err.message.indexOf('503')) {
                                    return
                                  }
                                  const throttle = (err.message !== undefined &&  err.message.indexOf('429') >= 0)
                                  if (!throttle) {
                                    try {
                                      console.log(`ds err: ${JSON.stringify(err, null, 2)}`);
                                      console.log(`err short name ${err.short_name} short state ${err.short_state}`)
                                    }
                                    catch(e){}


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
                              if (done) {
                                console.log('for ss break')
                                break;
                              }
                            } // for ss in stations_sets
                            if (done) {
                              console.log('for sleep return')
                              return
                            }
                          }); // for sleep
                          if (done) {
                            console.log('for i break')
                            break;
                          }
                        } // for i < imax
                      }
                    ) // stations spread
                  ); // for stations all
              }) // [f, fg, fh] spread
            ) // for [f, fg, fh] all
            .catch(err => {
              console.log(`before alert err: ${err}`);
              console.log(`stack: ${err.stack}`);
              res.status(501);
            })
            .catch(err => {
              console.log(`alert err: ${err}`);
              console.log(`stack: ${err.stack}`);
              res.status(501);
            })
            .catch(err => {
              console.log(`alert get base url err: ${err}`);
              console.log(`stack: ${err.stack}`);
              res.status(501);
            });
        });
      })
      .catch(err => {
        console.log(`"zip api" ${err}`);
        console.log(`stack: ${err.stack}`);
        var vDebug = "";
        for (var prop in err) {
          vDebug += "property: " + prop + " value: [" + err[prop] + "]\n";
        }
        vDebug += "toString(): " + " value: [" + err.toString() + "]";
        console.log(vDebug);
        console.log(`stack: ${err.stack}`);
        res.status(502);
      });
  })
  .catch(err => {
    if (err === radone) {
      console.log('radone return')
      return 
    }
  });
});
//   const weatherData = weather
//     .getTimeMachine("Brooklyn Bridge", "+3y"
//     // .getTimeMachine(zip, `+${i}y`
//     // , null, null, [
//       // , "", "",
//       // "minutely",
//       // "hourly",
//       // "currently",
//       // "alerts",
//       // "flags"
//     //
//     )
//     .then(response => {
//       // json = JSON.parse(response)
//       //console.log(JSON.stringify(response, null, 2))
//       console.log('in response')
//       console.log(response)
//     })
//     .catch(error => {
//       console.log('in error')
//       console.log(`error ${error}`);
//     });
//   print('past weather data')
//   print(weatherData)
// }
// })
// http.get({
//   hostname:`${url}${key}/`
//   port: 80,
//   path: '/',
//   agent: false  // create a new agent just for this one request
// },
// (res) => {
//   // Do stuff with response
// });
// });

module.exports = weatherRouter;
