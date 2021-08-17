const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// User model
const User = require("../models/User");

var io = require("../app");

const { ensureAuthenticated } = require("../config/auth");

router.get("/", (req, res) => res.render("login"));
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    name: req.user.name
  });
});

router.get("/admin", ensureAuthenticated, (req, res) => {
  if(!req.user.isAdmin) {
    req.flash("error_msg", "ایڈمن کے علاوہ کسی کو اس صفحے کو دیکھنے کی اجازت نہیں ہے");
    res.redirect("/dashboard");    
  } else {
    res.render("admin", {
      name: req.user.name
    });
  }
});

router.get("/password", ensureAuthenticated, (req, res) => {
  res.render("password", {
    name: req.user.name
  });
});

router.post("/password", ensureAuthenticated, (req, res) => {
  const { name, password, password2 } = req.body;
  let errors = [];

  //Check required fields
  if (!password || !password2) {
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
    res.render("password", {
      errors,
      name
    });
  } else {
    bcrypt.genSalt(10, (err, salt) =>
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;

        // Set password to hashed
        let pass = hash;
        User.updateOne({ name: name }, { $set: { password: pass } }).exec(function(err) {
          if (err) {
            throw err;
          }
          req.flash(
            "success_msg",
            "پاس ورڈ تبدیل ہوگیا ہے الحمد للہ!"
          );
          res.redirect("/dashboard");
        });  
      })
    );
  }
});

// Download Chat
router.get("/download", ensureAuthenticated, function(req, res) {
  var file = __dirname + "/chatlog.txt";
  res.download(file); // Set disposition and send it.
});

module.exports = router;
