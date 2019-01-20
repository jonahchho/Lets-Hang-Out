const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

// Passport config
require('./config/passport')(passport);

//connect to MongoDB
mongoose.connect('mongodb://localhost:27017/letsHangOut', { useNewUrlParser: true });
const db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log("Connected to mongoDB!");
});

// To load static files
app.use(express.static('css'));
app.use(express.static('js'));

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

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
