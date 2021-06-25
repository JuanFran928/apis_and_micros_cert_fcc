// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var moment = require('moment'); 
// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


// your first API endpoint... 
app.get("/api/:date", function (req, res) {
  //var momento = moment(parseInt(req.params.date)).valueOf();
  var dateUrl = req.params.date; 
  console.log(dateUrl);
  if(dateUrl.match(/\d{5,}/)){
    dateX = new Date(parseInt(dateUrl));

  } else{
    dateX = new Date(dateUrl);
  }

  if (dateX == "Invalid Date"){
    res.json({
      error: "Invalid Date"
    });
  } else {
    res.json({
      unix: dateX.getTime(),
      utc: dateX.toUTCString()
    });
  }
});


app.get("/api/", function (req, res) {
  res.json({
    unix: Date.now(),
    utc: new Date( Date.now() ).toUTCString()
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
