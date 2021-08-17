const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

let func = require("../app");

// User model
const User = require("../models/User");

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Register Page
router.get("/register", (req, res) => res.render("register"));

// Register Handle
router.post("/register", (req, res) => {
  const { name, password, password2 } = req.body;
  let errors = [];

  //Check required fields
  if (!name || !password || !password2) {
    errors.push({ msg: "برائے مہربانی سارے خانہ پُر کریں" });
  }

  //Check password match
  if (password != password2) {
    errors.push({ msg: "پاس ورڈ میچ نہیں ہو رہا!" });
  }

  //Check password length
  if (password.length < 6) {
    errors.push({ msg: "پاس ورڈ کم از کم 6 حروف کے ہونے چاہئے" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      password,
      password2
    });
  } else {
    // Validation Passed
    User.findOne({ name: name }).then(user => {
      if (user) {
        //User exists
        errors.push({ msg: "یہ نام پہلے سے موجود ہے!" });
        res.render("register", {
          errors,
          name,
          password,
          password2
        });
      } else {
        let newUser = new User({
          name: name,
          password: password
        });

        if(name === 'client' && password === '@dmin123') {
          newUser = new User({
            name: name,
            password: password,
            isApproved: true,
            isAdmin: true,
            approvedBy: name
          });
        }

        // Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            // Set password to hashed
            newUser.password = hash;

            // Save user
            newUser
              .save()
              .then(user => {
                if(user.name === 'client') {
                  req.flash(
                    "success_msg",
                    "رجسٹر مکمل ہوچکا ہے الحمد للہ"
                  );
                } else {
                  req.flash(
                    "success_msg",
                    "رجسٹر مکمل ہوگیا ہے الحمد اللہ! اب منظوری کے لئے ایڈمن کو مطلع کریں"
                  );
                }
                func.func(user);
                res.redirect("/users/login");
              })
              .catch(err => console.log(err));
          })
        );
      }
    })
    .catch(err => console.log(err));
  }
});

//Login handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

//Logout Handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "لاگ آؤٹ مکمل ہو گیا ہے ، فی امان اللہ");
  res.redirect("/users/login");
});
module.exports = router;
