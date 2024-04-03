const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

//Define the following Schema: Exercise, user, log
//1) Exercise Schema
const Exercise_Schema = new Schema
  ({
    username: String,
    description: String,
    duration: Number,
    date: String
  })
//Define a virtual property for Exercise_Schema.formattedDate
Exercise_Schema.virtual('formattedDate').get(function () {
  return this.date ? this.date.toDateString() : null;
})

//2) User Schema
const User_Schema = new Schema({
  username: String
})
//3) Log Schema
const Log_Schema = new Schema
  ({
    username: String,
    count: Number,
    duration: Number,
    log: [{
      description: String,
      duration: Number,
      date: String
    }]
  })
//Define a virtual property for Log_Schema.formattedDate
Log_Schema.virtual('formattedDate').get(function () {
  return this.date ? this.date.toDateString() : null;
})

//Compile the Schemas into respective models
const Exercise = mongoose.model('Exercise', Exercise_Schema);
const User = mongoose.model('User', User_Schema);
const Log = mongoose.model('Log', Log_Schema);

//Export Modules
module.exports = {
  Exercise,
  User,
  Log
}

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/hello', (req, res) => {
  console.log('Hello World!');
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
