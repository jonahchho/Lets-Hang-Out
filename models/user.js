const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
//The first argument is the singular name of the collection that will be created for the model
//(Mongoose will create the database collection for the above model User above)

//The second argument is the schema you want to use in creating the model.

module.exports = User;
