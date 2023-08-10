const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const path = require('path'); // Require the 'path' module

// Serve static files from the 'assets' directory


const authRoutes = require('./routes/userRoute');

const app = express();

app.use(express.json());
app.use(bodyParser.json());
 
app.use(bodyParser.urlencoded({
    extended: true
}));
 
app.use(cors());

app.use('/', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
app.use(express.static(path.join(__dirname, 'assets/images')));


module.exports = app;


