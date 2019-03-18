const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');



// Room model
const Room = require('../models/room');

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

// Render messenger view in dashboard page
router.get('/dashboard-messaging', ensureAuthenticated, (req, res) => {

  res.render('dashboard-messaging', {
    username: req.user.username,
    title: 'dashboard-messaging',
  })

});

router.get('/query', ensureAuthenticated, (req, res) => {

  var roomList = [];

  Room.find({}, function(err, rooms) {

    rooms.forEach(function(room) {
      roomList.push({"room_id":room.room_id, "creater":room.creater});
    });

    res.send(roomList);

  });

});

router.post('/dashboard-messaging', (req, res) => {
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
            })
            .catch(err => {
              console.error(err)
            })

        }
      });

      res.end('It worked!');

});

module.exports = router;
