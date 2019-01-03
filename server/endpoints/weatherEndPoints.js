require('http')
const express = require('express');

const key = '244ec1ed01439cabd8b9f415cf9633ac'
const url =  'https://api.darksky.net/forecast/'

const weatherRouter = express.Router();

// 1918-01-02T22:54:00
weatherRouter.get('/:gps', function(req, res) {
    const { gps } = req.params;
  
    http.get({
      hostname:`{url}{key}/` 
      `Fifteen is ${five + ten} and not ${2 * five + ten}.`,
      port: 80,
      path: '/',
      agent: false  // create a new agent just for this one request
    }, (res) => {
      // Do stuff with response
    });
  });

  module.exports = weatherRouter;