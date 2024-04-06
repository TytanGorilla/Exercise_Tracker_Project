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

//Define the User Schema
const User_Schema = new Schema({
  username: String,
  log: []
})
//Define an Exercise Schema
const Exercise_Schema = new Schema({
  description: String,
  duration: Number,
  date: String,
  userid: String
})

//Compile the Schemas into model
const User = mongoose.model('User', User_Schema);
const Exercise = mongoose.model('Exercise', Exercise_Schema);

//Export Modules
module.exports = {
  User,
  Exercise
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

//Post request /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', async function (req, res) {
  try {
    //Function to parse & format inputted dates 1990-01-01 to Mon Jan 01 1990
    function formatDate(inputDate) {
      // Parse the input date string into a Date object
      const date = new Date(inputDate);

      // Define arrays to map numeric values to string representations
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Extract day of the week, month, day of the month, and year
      const dayOfWeek = daysOfWeek[date.getDay()];
      const month = monthsOfYear[date.getMonth()];
      const dayOfMonth = ('0' + date.getDate()).slice(-2); // Ensure two digits for day of month
      const year = date.getFullYear();

      // Assemble the formatted date string
      const formattedDate = `${dayOfWeek} ${month} ${dayOfMonth} ${year}`;

      return formattedDate;
    }

    const { description, duration, date } = req.body;
    const userId = req.params._id;

    // Find the user by _id
    let user = await User.findById(userId);
    //console.log(user);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new exercise object
    const exercise = new Exercise({
      description: description,
      duration: parseInt(duration),
      date: date ? formatDate(date) : formatDate(new Date()),
      userid: userId
    })
    //Save newly created exercise to database
    await exercise.save();
    //Insert exercise into log: []
    user.log.push(exercise);
    //Save user to database
    await user.save();
    console.log(user);
    // Return the updated user object in the response
    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
      _id: user._id
    });
  } catch (err) {
    console.error('Error adding exercise:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Get request /api/users/:_id/logs
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;


    // Retrieve the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Retrieve the exercise input that matches the user ID

    let exercises = await Exercise.find({ userid: userId });
    let counted = exercises.length;
    //console.log(`These are the exercises ${exercises}`);
    //Prepare for populating field values by using count & .length of the Log to ascertain number of exercises

    // Filter exercise log based on 'from' and 'to' dates if provided
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      exercises = exercises.filter(exercise => {
        const exerciseDate = new Date(exercise.date);
        return exerciseDate >= fromDate && exerciseDate <= toDate;
      });
    }

    // Apply limit if provided
    if (limit) {
      exercises = exercises.slice(0, parseInt(limit));
    }

    //js array.map()
    let logs = {
      username: user.username,
      count: counted,
      _id: user.id,
      log: exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date
      }))
    };

    console.log(logs)
    // Return the updated user object in the response
    res.json(logs);

  } catch (err) {
    console.error('Error retrieving exercise log:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
