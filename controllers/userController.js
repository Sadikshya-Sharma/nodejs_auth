const User = require("../models/userModel"); // Adjust the path as needed
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  // Validate request data
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const { username, email, password } = req.body;

  // Create a new User instance
  const newUser = new User({
    
    username: username,
    email: email,
    password: password,
  });

  try {
    // Save the user in the database
    User.create(newUser, (err, user) => {
      if (err) {
        // Check for unique constraint violation (duplicate email)
        if (err.code === "ER_DUP_ENTRY") {
          res.status(409).json({
            status: false,
            message: "User with this email already exists",
          });
        } else {
          res.status(500).json({
            status: false,
            message: err.message || "Some error occurred while registering the user.",
          });
        }
      } else {
        // User was successfully created in the database
        res.json({
          status: true,
          message: "Registration successful!",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Some error occurred while registering the user.",
    });
  }
};


exports.login = async (req, res) => {
  // Validate request data
  if (!req.body) {
    res.status(400).json({ message: "Content can not be empty!" });
    return;
  }

  const { email, password } = req.body;

  try {
    // Find the user with the provided email in the database
    User.findByEmail(email, async (err, user) => {
      if (err) {
        res.status(500).json({ status: false, message: "Error occurred while retrieving user data." });
        return;
      }

      if (!user) {
        // User with the provided email not found
        res.status(404).json({ status: false, message: "User not found with the provided email." });
        return;
      }

      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        // Incorrect password
        res.status(401).json({ status: false, message: "Invalid email or password." });
        return;
      }

      // Generate a JSON Web Token (JWT) for authentication
      // const expiresIn = 604800;
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,  // Replace with your actual access token secret
        { expiresIn: "7d" } // Token expiration time (7days)
      );

      res.json({
        status: true,
        message: "Login successful!",
        
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
          token: token,
          
          expiresIn: "7d" ,
        
      });
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Some error occurred while logging in." });
  }
};
