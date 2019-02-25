const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  room_id: {
    type: Number,
    unique: true,
    required: true
  },
  creater: {
    type: String,
    required: true,
    trim: true
  }
});

const Room = mongoose.model('Room', RoomSchema);
//The first argument is the singular name of the collection that will be created for the model
//(Mongoose will create the database collection for the above model User above)

//The second argument is the schema you want to use in creating the model.

module.exports = Room;
