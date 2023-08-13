const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const conn = require("../config/database");


const sendMail = require('../middleware/sendmail');

const randomstring = require('randomstring');


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

exports.getLoggedInUser = async (req, res) => {
  const userId = req.userId; // Use the user ID from the request object

  try {
    // Find the user by their ID in the database
    User.findById(userId, (err, user) => {
      if (err) {
        res.status(500).json({ status: false, message: 'Error occurred while retrieving user data.' });
        return;
      }

      if (!user) {
        res.status(404).json({ status: false, message: 'User not found.' });
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
        },
      });
    });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Some error occurred while retrieving user data.' });
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


exports.forgetpassword = (req, res) => {
  const { email } = req.body;

  if (!User.isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  User.findByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Generate a 4-digit random number (OTP)
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Delete any existing password reset records for the same email
    const deleteQuery = "DELETE FROM password_reset WHERE email = ?";
    conn.query(deleteQuery, [user.email], (deleteErr, deleteRes) => {
      if (deleteErr) {
        console.log('Error deleting existing records:', deleteErr);
        return res.status(500).json({ error: 'Error deleting existing records' });
      }

      // Store the new OTP and email in the password_resets table
      const insertQuery = "INSERT INTO password_reset (email, otp, created_at) VALUES (?, ?, NOW())";
      conn.query(insertQuery, [user.email, otp], (insertErr, insertRes) => {
        if (insertErr) {
          console.log('Error storing OTP:', insertErr);
          return res.status(500).json({ error: 'Error storing OTP' });
        }

        console.log('OTP stored successfully');

        // Construct the email content
        const mailSubject = 'Password Reset';
        const content = `<p>Hi, ${user.username}, Your reset password OTP is: ${otp}</p>`;

        // Send the email using the sendMail function
        sendMail(user.email, mailSubject, content)
          .then(() => {
            console.log('Email sent successfully');
            res.status(200).json({ message: 'Password reset instructions sent successfully' });
          })
          .catch((sendMailError) => {
            console.log('Error sending email:', sendMailError);
            res.status(500).json({ error: 'Error sending email' });
          });
      });
    });
  });
};



exports.resetPassword = (req, res) => {
  const { otp, newPassword, confirmPassword } = req.body;

  if (!otp || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'OTP, new password, and confirm password are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New password and confirm password do not match' });
  }

  // Verify the OTP and retrieve the associated email
  const selectQuery = "SELECT email FROM password_reset WHERE otp = ? AND created_at > NOW() - INTERVAL 5 MINUTE";
  conn.query(selectQuery, [otp], (selectErr, selectRes) => {
    if (selectErr) {
      console.log('Error verifying OTP:', selectErr);
      return res.status(500).json({ error: 'Error verifying OTP' });
    }

    if (selectRes.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired OTP' });
    }

    const email = selectRes[0].email;

    // Hash the new password
    bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.log('Error hashing password:', hashErr);
        return res.status(500).json({ error: 'Error hashing password' });
      }

      // Update the user's password in the database
      const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
      conn.query(updateQuery, [hashedPassword, email], (updateErr, updateRes) => {
        if (updateErr) {
          console.log('Error updating password:', updateErr);
          return res.status(500).json({ error: 'Error updating password' });
        }

        // Delete the used OTP from the password_resets table
        const deleteQuery = "DELETE FROM password_reset WHERE otp = ?";
        conn.query(deleteQuery, [otp], (deleteErr, deleteRes) => {
          if (deleteErr) {
            console.log('Error deleting OTP:', deleteErr);
            return res.status(500).json({ error: 'Error deleting OTP' });
          }

          res.status(200).json({ message: 'Password reset successful' });
        });
      });
    });
  });
};








