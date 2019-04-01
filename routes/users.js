const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/user');

// Login page
router.get('/login', (req, res) =>
  res.render('login', {
    title: 'login'
  }));

// Register page
router.get('/register', (req, res) =>
  res.render('register', {
    title: 'register'
}));

// Handle registration
router.post('/register', (req, res) => {
  const {username, email, password, passwordConf} = req.body;
  let errors = [];

  // Check passwords match
  if(password !== passwordConf) {
    errors.push({msg: 'Passwords do not match'});
  }

  // Check password length
  if(password.length < 6) {
    errors.push({msg: 'Password should be at least 6 characters'});
  }

  if(errors.length > 0) {
    res.render('register', {
      errors,
      username,
      email,
      password,
      passwordConf,
      title: 'register'
    });
  }

  else {

    User.findOne({username: username})
        .then(user => {
          if(user) {
            // User exists
            errors.push({msg: 'Account already exists with this username'});
            res.render('register', {
              errors,
              username,
              email,
              password,
              passwordConf,
              title: 'register'
            });
          }

        });

    User.findOne({email: email})
        .then(user => {
          if(user) {
            // User exists
            errors.push({msg: 'Account already exists with this email address'});
            res.render('register', {
              errors,
              username,
              email,
              password,
              passwordConf,
              title: 'register'
            });
          }

          else {
            const newUser = new User({
              username,
              email,
              password
            });

            // Encrypt password
            bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) throw err;

                // Encrypt password
                newUser.password = hash;

                // Save user
                newUser.save()
                  .then(user => {
                    req.flash('success_msg', 'You are now registered and can login in!!');
                    res.redirect('/users/login');
                  })
                  .catch(err => console.log(err));
            }));

          }
        });
  }

});

// Handle login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Handle logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
