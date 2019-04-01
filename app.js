const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 8080;

server.listen(PORT, console.log(`Server started on port ${PORT}`));

// Passport config
require('./config/passport')(passport);

//connect to MongoDB
mongoose.connect('mongodb://localhost:27017/letsHangOut', { useNewUrlParser: true });
const db = mongoose.connection;

// Room model
const Room = require('./models/room');

//handle mongo error
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log("Connected to mongoDB!");
});

// To load static files
app.use(express.static('css'));
app.use(express.static('js'));
app.use(express.static('fonts'));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// BodyParser
app.use(express.urlencoded({extended: true}));

// Express session
app.use(session({
  secret: 'It is a secret',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 600 * 10000 }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// Chatroom

io.on('connection', (socket) => {

  var addedUser = false;

  socket.on('create room', function (data) {

    addedUser = true;

    socket.roomID = data.roomID;
    socket.username = data.username;

    socket.join(socket.roomID);

  });

  socket.on('join room', function (data) {

    Room.findOne({room_id: data.roomID})
        .then(room => {
          if(room) {

            /*
            if(data.roomID != curRoom && curRoom != 0) {

              socket.leave(curRoom);

              socket.broadcast.to(curRoom).emit('user left', {
                // To Do
              });
              
            }
            */

            addedUser = true;

            socket.join(data.roomID);

            socket.roomID = data.roomID;
            socket.username = data.username;

            socket.broadcast.to(socket.roomID).emit('user joined', {
              numUsers: io.sockets.adapter.rooms[socket.roomID].length,
              username: socket.username
            });

            /*
            for (socketID in io.sockets.adapter.rooms[curRoom].sockets) {
               const nickname = io.sockets.connected[socketID].username;
               console.log(nickname);
            }
            */

          }

          else {
            socket.emit('empty room', false);
          }

        });

  });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
  // we tell the client to execute 'new message'
    socket.broadcast.to(socket.roomID).emit('new message', {
      username: socket.username,
      message: data.message
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.to(socket.roomID).emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.to(socket.roomID).emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('leave room', () => {

    if(addedUser) {

      addedUser = false;

      socket.leave(socket.roomID);

      if(typeof io.sockets.adapter.rooms[socket.roomID] === "undefined") {
        // echo globally that this client has left
        socket.broadcast.to(socket.roomID).emit('user left', {
          username: socket.username,
          numUsers: 0
        });
      }

      else {
        // echo globally that this client has left
        socket.broadcast.to(socket.roomID).emit('user left', {
          username: socket.username,
          numUsers: io.sockets.adapter.rooms[socket.roomID].length
        });
      }

    }

  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {

    if(addedUser) {

      addedUser = false;

      socket.leave(socket.roomID);

      if(typeof io.sockets.adapter.rooms[socket.roomID] === "undefined") {
        // echo globally that this client has left
        socket.broadcast.to(socket.roomID).emit('user left', {
          username: socket.username,
          numUsers: 0
        });
      }

      else {
        // echo globally that this client has left
        socket.broadcast.to(socket.roomID).emit('user left', {
          username: socket.username,
          numUsers: io.sockets.adapter.rooms[socket.roomID].length
        });
      }

    }

  });

});
