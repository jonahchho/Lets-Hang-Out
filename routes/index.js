const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

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

module.exports = router;
