var express = require('express');
var cors = require('cors');
require('dotenv').config()

var app = express();
var multer  = require('multer')
var upload = multer({ dest: 'upload/'})



app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single('upfile'), function (req, res) {
  // req.file is the `file` file
  // req.body will hold the text fields, if there were any
  res.json({ name: req.file.originalname,
type: req.file.mimetype,
size: req.file.size })
})


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
