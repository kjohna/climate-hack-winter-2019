const express = require("express");

const testRouter = express.Router();

testRouter.get("/:zip", function (req, res) {
  console.log('test fuck:' + new Date().getTime().toLocaleString())
  res.status(200).json({
    hello: "hi"
  })

})

module.exports = testRouter
