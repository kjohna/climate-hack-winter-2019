
const express = require('express');

const axios = require('axios');

const url = 'https://api.darksky.net/forecast/'


const weatherRouter = express.Router();

// 1918-01-02T22:54:00
weatherRouter.get('/:zip', function (req, res) {
  const { zip } = req.params;
  // console.log(`google map key ${process.env.GOOGLE_MAP}   ${process.env.DARK_SKY} ${zip} `)
  date = new Date()
  const ts = Math.round(date.getTime() / 1000);
  sd = 3600 * 24 * 365 // seconds in a year
  imax = 20
  ra = []
  axios
    .get(`https://www.zipcodeapi.com/rest/${process.env.ZIP}/info.json/${zip}/degrees`)
    .then((zresponse) => {
      console.log(`zresponse ${JSON.stringify(cresponse)}`)
      axios
        .get(`${url}${process.env.DARK_SKY}/${zresponse.data.lat},${zresponse.data.lng}`)
        .then((cresponse) => {
          console.log(`currently data currently json ${JSON.stringify(cresponse.data.currently, null, 2)}`);
          const currently = { current: cresponse.data.currently, min: cresponse.data.daily.data[0].temperatureMin, max: cresponse.data.daily.data[0].temperatureMax }
          console.log(`currently data: ${cresponse.data}`)
          for (i = 1; i <= imax; i++) {
            offset = i * sd
            axios
              .get(`${url}${process.env.DARK_SKY}/${zresponse.data.lat},${zresponse.data.lng},${ts - offset}`)
              .then((response) => {
                if (response.data) {
                  date.setTime(response.data.daily.data[0].time * 1000);
                  j = ra.push({ date: date.getFullYear(), min: response.data.daily.data[0].temperatureMin, max: response.data.daily.data[0].temperatureMax })
                  if (j == imax) {
                    ra.sort(function (a, b) { return b.date - a.date });
                    // for (k = 1;k<=j;k++) {
                    //   console.log(`ra[${k-1}]: ${ra[k-1].date} ${ra[k-1].min} - ${ra[k-1].max}`)
                    // }
                    console.log("200 currently xxx")
                    console.log(`200 currently temperature: ${currently.current.temperature}`)
                    res.status(200).json({min: currently.min, max: currently.max, currently: currently.current, ra: ra });
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

    })
    .catch((err) => {
      console.log(`"zip api" ${err}`);
      res.status(502);
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