const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const authRoutes = require('./routes/userRoute');

const app = express();

app.use(express.json());
app.use(bodyParser.json());
 
app.use(bodyParser.urlencoded({
    extended: true
}));
 
app.use(cors());

app.use('/api', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;


