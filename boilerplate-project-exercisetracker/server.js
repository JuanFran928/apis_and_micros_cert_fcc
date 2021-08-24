const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require("body-parser");
const moment = require("moment");

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const exercisesSchema = mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: Date
});
const Exercises = mongoose.model('Exercises', exercisesSchema);


const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  log: [exercisesSchema]
}, { timestamps: true });
const User = mongoose.model('User', userSchema);


app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', function (req, res) {


  var user = new User({
    username: req.body.username
  });
  user.save(function (err, data) {
    if (err) { throw err; }
  });
  return res.json({
    username: user.username,
    _id: user._id
  });

});
//Mejorar esto
app.get('/api/users', function (req, res) {

  User.find({},'username __v', function (err, users) {
    return res.json(users);
  });
});

app.post('/api/users/:_id/exercises', function (req, res) {

  var fecha = "";
  if (!req.body.date) {
    fecha = Date.now();
  } else {
    fecha = req.body.date;
  }


  var datexD = new Date(fecha)
    .toDateString()
    .split(' ')
    .slice(0, 4)
    .join(' ')
    .replace(',', '');

  var exercises = new Exercises({
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: datexD
  });

  //Mejorar lo de devolver el error
  if (datexD == "Invalid Date") {
    return res.send(`Cast to date failed for value ${fecha} at path date`);

  }

  if (!req.params._id) {
    return res.send("Path `id` is required");
  }

  for (var key in req.body) {
    if (req.body[key] == '') {
      return res.send(`Path ${key} is required`);
    }
  }

  //Mejorar lo de devolver el error que devuelve mongoose
  if (isNaN(parseInt(req.body.duration))) {
    return res.send(`Cast to Number failed for value ${req.body.duration} at path duration`);
  }

  if (mongoose.isValidObjectId(req.params._id)) {

    /*
        User.find({ _id: req.params._id }, function (err, usuario) {
      if (err) { return; }
      if (usuario.length>0){
        var query = Exercises.find({ _id: req.params._id }).lean().limit(1); //Intentar hacer solo unaa query
        // Find the document
        query.exec(function (error, result) {
          if (error) { throw error; }
          // If the document doesn't exist
          if (!result.length) {
            excercises.save(function (err, datos) {
              if (err) { throw err; }
            });
          }
        });

        return res.json({
          _id: req.params._id,
          username: usuario[0].username,
          date: datexD,
          duration: parseInt(req.body.duration),
          description: req.body.description
        });
      } else { //no existe
        return res.send("Unknown userId");
      }
    });
    */
    User.findByIdAndUpdate({ _id: req.params._id }, { $push: { log: [exercises] } }, function (err, usuario) {
      if (err) { return; }

      return res.json({
        _id: req.params._id,
        username: usuario.username,
        date: datexD,
        duration: parseInt(req.body.duration),
        description: req.body.description
      });
    });
  } else {
    res.send("Id is not valid");
  }
});





app.get('/api/users/:_id/logs', function (req, res) {

  //req.query
  //createdAt: from, $lte: to

  //https://exercise-tracker.freecodecamp.rocks/api/users/5ec4b2f73acbce008888ea67/logs?from=2021-01-01&to=2021-08-01&count=4
  console.log(req.originalUrl);
    const userId = req.params._id;
    const fromDate = (req.query.from) ? new Date(req.query.from) : undefined;
    const toDate = (req.query.to) ? new Date(req.query.to) : undefined;
    const logLimit = (req.query.limit) ? Number(req.query.limit) : undefined;
    

    User.findById(userId, (err, foundUser) => {
      if (err) {
        console.log(err);
        return res.json({ error: err });
      }

      if (!logLimit && !fromDate && !toDate) {
        res.json({
          username: foundUser.username,
          _id: foundUser._id,
          log: foundUser.log,
          count: foundUser.log.length + 1
        });
      } else if (logLimit && fromDate && toDate) {
        let filteredExercises = [];
        if (moment(fromDate, "YYYY-MM-DD", true).isValid() &&
            moment(toDate, "YYYY-MM-DD", true).isValid) {
          filteredExercises = foundUser.log.map(exercise => {
            if (!(exercise.date >= fromDate && exercise.date <= toDate)) {
              return false;
            }
            return true;
          });
  
          let slicedExercises = [];
          if (logLimit) {
            slicedExercises = filteredExercises.slice(0, logLimit);
          } else {
            slicedExercises = filteredExercises.slice(0);
          }
  
          res.json({
            username: foundUser.username,
            _id: foundUser._id,
            log: slicedExercises,
            count: slicedExercises.length + 1
          });
        }
      } else if (!logLimit) {
        let filteredExercises = [];
        if (moment(fromDate, "YYYY-MM-DD", true).isValid() &&
            moment(toDate, "YYYY-MM-DD", true).isValid) {
          filteredExercises = foundUser.log.map(exercise => {
            if (!(exercise.date >= fromDate && exercise.date <= toDate)) {
              return false;
            }
            return true;
          });
  
          res.json({
            username: foundUser.username,
            _id: foundUser._id,
            log: filteredExercises,
            count: filteredExercises.length + 1
          });
        }
      } else if (!fromDate) {
        let filteredExercises = [];
        if (moment(toDate, "YYYY-MM-DD", true).isValid) {
          filteredExercises = foundUser.log.map(exercise => {
            if (!(exercise.date <= toDate)) {
              return false;
            }
            return true;
          });
  
          let slicedExercises = [];
          if (logLimit) {
            slicedExercises = filteredExercises.slice(0, logLimit);
          } else {
            slicedExercises = filteredExercises.slice(0);
          }
  
          res.json({
            username: foundUser.username,
            _id: foundUser._id,
            log: slicedExercises,
            count: slicedExercises.length + 1
          });
        }
      } else if (!toDate) {
        let filteredExercises = [];
        if (moment(fromDate, "YYYY-MM-DD", true).isValid()) {
          filteredExercises = foundUser.log.map(exercise => {
            if (!(exercise.date >= fromDate)) {
              return false;
            }
            return true;
          });
  
          let slicedExercises = [];
          if (logLimit) {
            slicedExercises = filteredExercises.slice(0, logLimit);
          } else {
            slicedExercises = filteredExercises.slice(0);
          }
  
          res.json({
            username: foundUser.username,
            _id: foundUser._id,
            log: slicedExercises,
            count: slicedExercises.length + 1
          });
        }
      }
    });
  
    
/*
    return res.json({
      _id: req.params._id,
      username: usuario.username,
      count: usuario.log.length,
      log: usuario.log
    });
*/
});

  



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

