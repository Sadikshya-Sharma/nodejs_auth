const conn = require("../config/database");
const bcrypt = require("bcrypt");

class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.image = user.image;
    this.address = user.address;
    this.contact_num = user.contact_num;
    
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static async create(user, callback) {
    try {
      const { id, username, email, password } = user;
      const hashedPassword = await bcrypt.hash(password, 10);

      if (!User.isValidEmail(email)) {
        callback({ message: 'Invalid email format' }, null);
        return;
      }

      const query = "INSERT INTO users ( id, username, email, password) VALUES (?, ?, ?, ?)";
      conn.query(query, [id, username, email, hashedPassword], (err, res) => {
        if (err) {
          console.log("error: ", err);
          callback(err, null);
          return;
        }

        const insertedUser = new User({ id: res.insertId, username, email });

        console.log("created user: ", insertedUser);
        callback(null, insertedUser);
      });
    } catch (err) {
      console.log("error: ", err);
      throw err;
    }
  }

  static async findByEmail(email, callback) {
    const query = "SELECT id, username, email, password,  image, address, contact_num FROM users WHERE email = ?";
    await conn.query(query, [email], (err, res) => {
      if (err) {
        console.log("error: ", err);
        callback(err, null);
        return;
      }

      if (res.length === 0) {
        callback(null, null);
        return;
      }

      const user = new User(res[0]);
      callback(null, user);
    });
  }

  static async findAll(callback) {
    const query = "SELECT id, username, email, image, address, contact_num FROM users";

    conn.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        callback(err, null);
        return;
      }

      const users = res.map((userData) => new User(userData));
      callback(null, users);
    });
  }

  static async findById(id, callback) {
    const query = "SELECT id, username, email, image, address, contact_num FROM users WHERE id = ?";

    conn.query(query, [id], (err, res) => {
      if (err) {
        console.log("error: ", err);
        callback(err, null);
        return;
      }

      if (res.length === 0) {
        callback(null, null);
        return;
      }

      const user = new User(res[0]);
      callback(null, user);
    });
  }

  static async update(user, callback) {
    const userId = user.id;
    delete user.id; // Remove the 'id' field from the user object

    // Check if the 'password' field is provided and not empty
    if (user.password && user.password.trim() !== '') {
      // If the user intends to change their password, hash the new password before updating
      user.password = await bcrypt.hash(user.password, 10);
    } else {
      // If the 'password' field is not provided or empty, remove it from the update object
      delete user.password;
    }

    // Generate the SQL query based on the provided fields in the 'user' object
    let query = "UPDATE users SET ";
    const values = [];

    // Check if each field is provided and add it to the query and values array
    for (const field in user) {
      if (user.hasOwnProperty(field)) {
        query += `${field}=?, `;
        values.push(user[field]);
      }
    }

    // Remove the trailing comma and space from the query
    query = query.slice(0, -2);

    // Add the WHERE condition to the query to update the specific user
    query += " WHERE id=?";

    // Add the user's ID as the last value in the values array
    values.push(userId);

    conn.query(query, values, (err, res) => {
      if (err) {
        console.log("error: ", err);
        callback(err, null);
        return;
      }

      // Return the updated user object
      const updatedUser = new User({ id: userId, ...user });
      callback(null, updatedUser);
    });
  }
}

module.exports = User;
