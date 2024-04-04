const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bodyParser = require('body-parser')


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

//Middleware Body parser
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/hello', (req, res) => {
  console.log('Hello World!');
});

//Post Request to create a new user
app.post('/api/users', async function (req, res) {
  try {
    let { username } = req.body
    console.log(username);
    //Save the username to the database
    const user = new User({
      username: username
    })
    await user.save()
    // Log success message
    console.log(`User: ${user} saved successfully`);

    res.json(user)
  } catch (err) {
    console.log(`Error: ${err}`), console.log(err);
  }
})

//Get Request to get a list of all users
app.get('/api/users', async function (req, res) {
  try {
    const users = await User.find({})
    res.json(users)
  } catch (err) {
    console.log(`Error: ${err}`), console.log(err);
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
