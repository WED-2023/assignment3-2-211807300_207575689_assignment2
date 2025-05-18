var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

router.post("/Register", async (req, res, next) => {
  try {
    let user_details = {
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      country: req.body.country,
      password: req.body.password,
      confirm_password: req.body.confirm_password,
      email: req.body.email,
      profilePic: req.body.profilePic
    };
  
    
    // validate username
    if (
      user_details.username.length < 3 ||
      user_details.username.length > 8 ||
      !/^[A-Za-z]+$/.test(user_details.username)
    ) {
      return res.status(400).send("Username must be 3–8 English letters only.");
    }
    
    if (!user_details.username || !user_details.first_name || !user_details.last_name || !user_details.country || !user_details.password || !user_details.confirm_password || !user_details.email) {
        return res.status(400).send("Details missing!");
    }

    // validate password match
    if (user_details.password !== user_details.confirm_password) {
      return res.status(400).send("Passwords do not match.");
    }

    // validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_details.email)) {
      return res.status(400).send("Invalid email address.");
    }

    // validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{5,10}$/;
    if (!passwordRegex.test(user_details.password)) {
      return res.status(400).send("Password must be 5–10 characters, and include uppercase, lowercase, number, and special character.");
    }

    // check if username taken
    const users = await DButils.execQuery("SELECT username FROM users");
    if (users.find((x) => x.username === user_details.username)) {
      throw { status: 409, message: "Username taken" };
    }

    // hash password and insert
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );

    await DButils.execQuery(
      `INSERT INTO users (username, first_name, last_name, country, password, email, profilePic)
       VALUES ('${user_details.username}', '${user_details.first_name}', '${user_details.last_name}', '${user_details.country}', '${hash_password}', '${user_details.email}', '${user_details.profilePic}')`
    );

    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});


router.post("/Login", async (req, res, next) => {
  try {
    // check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    if (!users.find((x) => x.username === req.body.username))
      throw { status: 401, message: "Username or Password incorrect" };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.user_id;
    console.log("session user_id login: " + req.session.user_id);

    // return cookie
    res.status(200).send({ message: "login succeeded " , success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  console.log("session user_id Logout: " + req.session.user_id);
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;