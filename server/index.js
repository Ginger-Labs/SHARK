"use strict";
exports.__esModule = true;
var express = require("express");
var app = express();
var port = 3000;
app.get('/detect', function (req, res) {
    res.send('hello world!');
});
app.listen(port, function () { return console.log("server running on port " + port); });
