const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');



// Room model
const Room = require('../models/room');

// User modesl
const User = require('../models/user');

// Home page
router.get('/', (req, res) =>  {
  if(req.user) {
    res.redirect('/dashboard');
  }

  else {
    res.render('home', {
      title: 'home'
    })
  }
});

// Dashboard page
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    username: req.user.username,
    title: 'dashboard'
}));

router.get('/query', ensureAuthenticated, (req, res) => {

  var roomList = [];

  Room.find({}, function(err, rooms) {

    rooms.forEach(function(room) {
      roomList.push({"room_id":room.room_id, "creater":room.creater});
    });

    res.send(roomList);

  });

});

router.get('/getUserPreference', ensureAuthenticated, (req, res) => {

  var preferenceList = [];
  var username = req.user.username;

  User.findOne({username: username})
      .then(user => {
        preferenceList.push({"p_distance":user.p_distance, "p_price":user.p_price, "p_rate":user.p_rate});
        res.send(preferenceList);
      });

});

router.put('/updateUserPreference', function(req,res){
    const data = req.body;

    User.findOne({username: data.username})
        .then(user => {

          if(user) {
            user.p_distance = data.p_distance;
            user.p_price = data.p_price;
            user.p_rate = data.p_rate;

            user.save()
              .then(doc => {
                console.log(doc)
                res.send('updated successfully');
              })
              .catch(err => {
                console.error(err)
              })

          }
        })
});

router.post('/dashboard', (req, res) => {
  const creater = req.user.username;
  var roomID = req.body.roomID;
  console.log("POST");

  Room.findOne({room_id: roomID})
      .then(room => {
        if(room) {
          // User already has one or more rooms
          // Add new room for the user

          room.room_id = roomID + ((Math.random() * creater.length) + 1);
          room.save()
            .then(doc => {
              console.log(doc)
              res.send('new room created successfully');
            })
            .catch(err => {
              console.error(err)
            })


        }

        else {
          const newRoom = new Room({
            room_id: roomID,
            creater: creater
          });

          newRoom.save()
            .then(doc => {
              console.log(doc)
              res.send('new room created successfully');
            })
            .catch(err => {
              console.error(err)
            })

        }
      });

});

module.exports = router;
