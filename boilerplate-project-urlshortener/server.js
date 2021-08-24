require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const dns = require('dns');

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    required: true
  }
});

const Url = mongoose.model('Url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));


app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());


app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl', function (req, res) {
  const urlToSearch = req.body.url;
//var lc = urlToSearch.toLowerCase();
try{
  const urlObject = new URL(urlToSearch);
  if (['http:', 'https:'].indexOf(urlObject.protocol) < 0) {
    res.json({ error: 'invalid url' });
    return;
  }
   

  dns.lookup(urlObject.hostname, () => {
    var query = Url.find({ original_url: urlToSearch }).lean().limit(1); //Intentar hacer solo unaa query

    // Find the document
    query.exec(function (error, result) {
      if (error) { throw error; }
      // If the document doesn't exist
      if (!result.length) {
        Url.find({}).sort({ "short_url": -1 }).limit(1).exec(function (err, someValue) { //te da el ultimo valor
          if (err) return next(err);
          var shortUrl = someValue[0].short_url;
          var url = new Url({
            original_url: urlToSearch,
            short_url: shortUrl + 1
          });
          url.save(function (err, data) {
            if (err) { throw error; }
          });
          res.json(url);
        });


      }
      // If the document does exist
      else {
        res.json(result);
      }
    });
});

} catch(error){
  res.json({ error: 'invalid url' });
}
});


app.get('/api/shorturl/:number/',function(req, res, next) {
  Url.findOne({ short_url: req.params.number }, function(err, data){
    if (err) {
      console.log(err);
      return;
    }
      res.redirect(data.original_url);
  });
});



// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
