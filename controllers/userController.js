const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
  // Validate request data
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const { username, email, password } = req.body;

  try {
    // Check if the email already exists in the database
    User.findByEmail(email, async (err, user) => {
      if (err) {
        res.status(500).json({ status: false, message: "Error occurred while retrieving user data." });
        return;
      }

      if (user) {
        // User with the provided email already exists
        res.status(409).json({ status: false, message: "User with this email already exists." });
        return;
      }

      // If the user doesn't exist, proceed with registration
      // Create a new User instance with default values for image, address, and contact_num
      const newUser = new User({
        username: username,
        email: email,
        password: password
      });

      // Save the user in the database
      User.create(newUser, (err, createdUser) => {
        if (err) {
          res.status(500).json({
            status: false,
            message: err.message || "Some error occurred while registering the user.",
          });
        } else {
          // User was successfully created in the database
          res.json({
            status: true,
            message: "Registration successful!",
            user: {
              id: createdUser.id,
              username: createdUser.username,
              email: createdUser.email,
            },
          });
        }
      });
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Some error occurred while registering the user." });
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
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET, // Replace with your actual access token secret
        { expiresIn: "7d" } // Token expiration time (7days)
      );

      res.json({
        status: true,
        message: "Login successful!",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          image: user.image,
          address: user.address,
          contact_num: user.contact_num,
          
        },
        token: token,
        expiresIn: "7d",
      });
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Some error occurred while logging in." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Retrieve all users from the database
    User.findAll((err, users) => {
      if (err) {
        res.status(500).json({ status: false, message: "Error occurred while retrieving users data." });
        return;
      }

      res.json({
        status: true,
        users: users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          image: user.image,
          address: user.address,
          contact_num: user.contact_num,
          
        }))
      });
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Some error occurred while retrieving users data." });
  }
};

exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    // Find the user by their ID in the database
    User.findById(userId, (err, user) => {
      if (err) {
        res.status(500).json({ status: false, message: "Error occurred while retrieving user data." });
        return;
      }

      if (!user) {
        res.status(404).json({ status: false, message: "User not found." });
        return;
      }

      res.json({
        status: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          image: user.image,
          address: user.address,
          contact_num: user.contact_num,
        
        }
      });
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Some error occurred while retrieving user data." });
  }
};


exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email,  address, contact_num } = req.body; // Extract date_of_birth from req.body
  

  try {
    // Check if the user exists in the database
    User.findById(userId, async (err, user) => {
      if (err) {
        res.status(500).json({ status: false, message: "Error occurred while retrieving user data." });
        return;
      }

      if (!user) {
        res.status(404).json({ status: false, message: "User not found." });
        return;
      }

      // Update only the fields that are provided in the request
      if (username !== undefined) {
        user.username = username;
      }

      if (email !== undefined) {
        user.email = email;
      }

      if (req.file && req.file.filename) {
        user.image = req.file.filename;
      }

      if (address !== undefined) {
        user.address = address;
      }

      if (contact_num !== undefined) {
        user.contact_num = contact_num;
      }

     

      // Save the updated user in the database
      User.update(user, (err, updatedUser) => {
        if (err) {
          res.status(500).json({ status: false, message: "Error occurred while updating user information." });
        } else {
          res.json({
            status: true,
            message: "User information updated successfully!",
            user: {
              id: updatedUser.id,
              username: updatedUser.username,
              email: updatedUser.email,
              userimage: updatedUser.image,
              address: updatedUser.address,
              contact_num: updatedUser.contact_num,
        
            },
          });
        }
      });
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Some error occurred while updating user information." });
  }
};
