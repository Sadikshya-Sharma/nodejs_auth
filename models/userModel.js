const conn = require("../config/database");
const bcrypt = require("bcrypt");

class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static async create(user, callback) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      if (!User.isValidEmail(user.email)) {
        callback({ message: 'Invalid email format' }, null);
        return;
      }

      const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      conn.query(query, [user.username, user.email, hashedPassword], (err, res) => {
        if (err) {
          console.log("error: ", err);
          callback(err, null);
          return;
        }

        const insertedId = res.insertId;
        const insertedUser = new User({ id: insertedId, ...user });

        console.log("created user: ", insertedUser);
        callback(null, insertedUser);
      });
    } catch (err) {
      console.log("error: ", err);
      throw err;
    }
  }

  static async findByEmail(email, callback) {
    const query = "SELECT id, username, email, password FROM users WHERE email = ?";
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
}

module.exports = User;
