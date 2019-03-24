
const express = require('express');

const axios = require('axios');

const url = 'https://api.darksky.net/forecast/'
const state_alert_url = "https://api.weather.gov/alerts/active/area/"
const fetch = require('node-fetch');

const weatherRouter = express.Router();

// 1918-01-02T22:54:00
weatherRouter.get('/:zip', function (req, res) {
  const { zip } = req.params;
  // console.log(`google map key ${process.env.GOOGLE_MAP}   ${process.env.DARK_SKY} ${zip} `)
  gurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${process.env.GOOGLE_MAP}`

  date = new Date()
  const ts = Math.round(date.getTime() / 1000);
  sd = 3600 * 24 * 365 // seconds in a year
  imax = 20;
  ra = []
  let lat = undefined
  let lng = undefined
  let short_state = undefined
  let alert_description = undefined
  axios
    .get(gurl)
    .then((zresponse) => {
      lat = zresponse.data.results[0].geometry.location.lat;
      lng = zresponse.data.results[0].geometry.location.lng;
      ac = zresponse.data.results[0].address_components;
      console.log('ac', ac.length)
      for (let i = 0; i < ac.length; i++) {
        if (ac[i].types[0] === "administrative_area_level_1") {
          short_state = ac[i].short_name;
          console.log('short state json',ac[i])
          break;
        }

      }
      console.log(`zresponse lat ${lat}`)
      console.log(`dark skys ${url}${process.env.DARK_SKY}/${lat},${lng}`)
      console.log(`alert url ${state_alert_url}${short_state}`)
      axios
        .get(`${state_alert_url}${short_state}`)
        .then(alert => {
          console.log('length of features',alert.data.features.length)
          // console.log(`alert data  ${JSON.stringify(alert.data.features['0'].properties.description, null, 2)}`)
          
          alert_description = (alert.data.features.length > 0 ? alert.data.features['0'].properties.description : 'None')
          axios
            .get(`${url}${process.env.DARK_SKY}/${lat},${lng}`)
            // .then(res => res.json())
            .then((cresponse) => {
              console.log(`currently data currently json ${JSON.stringify(cresponse.data.currently, null, 2)}`);
              const currently = { current: cresponse.data.currently, min: cresponse.data.daily.data[0].temperatureMin, max: cresponse.data.daily.data[0].temperatureMax }
              console.log(`currently: ${currently}`)
              console.log('dark skys alerts',cresponse.data.alerts)
              if (cresponse.data.alerts !== undefined) alert_description = cresponse.data.alerts[0].description;
              for (let i = 1; i <= imax; i++) {
                offset = i * sd
                axios
                  .get(`${url}${process.env.DARK_SKY}/${lat},${lng},${ts - offset}`)
                  .then((response) => {
                    if (response.data) {
                      date.setTime(response.data.daily.data[0].time * 1000);
                      j = ra.push({ date: date.getFullYear(), min: response.data.daily.data[0].temperatureMin, max: response.data.daily.data[0].temperatureMax })
                      if (j == imax) {
                        ra.sort(function (a, b) { return b.date - a.date });
                        // for (k = 1;k<=j;k++) {
                        //   console.log(`ra[${k-1}]: ${ra[k-1].date} ${ra[k-1].min} - ${ra[k-1].max}`)
                        // }
                        console.log(`200 alert ${alert_description}`)
                        console.log(`200 currently temperature: ${currently.current.temperature}`)
                        res.status(200).json({
                          min: currently.min, max: currently.max,
                          currently: currently.current, ra, location: { lat, lng },
                          alert: alert_description
                        });
                      }
                    }
                    else {
                      i -= 1
                    }
                  })
                  .catch((dserr) => {
                    console.log(`dserr: ${dserr}`)
                    res.status(500);
                  })
              }
            })
            .catch((err) => {
              console.log(`err: ${err}`)
              res.status(501)
            })
            .catch((err) => {
              console.log(`alert err: ${err}`)
              res.status(501)
            })
        })
        .catch((err) => {
          console.log(`"zip api" ${err}`);
          res.status(502);
        })
    })


})
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