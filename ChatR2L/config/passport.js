const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('../models/User');

module.exports = function(passport) {
	passport.use(
		new LocalStrategy({ usernameField: 'name'}, (name, password, done) => {


		// Match User
		User.findOne({ name: name })
		 .then(user => {
		 	if(!user) {
		 		return done(null, false, { message: 'اس نام سے کوئی آئی ڈی موجود نہیں ہے'});
		 	}

			if(!user.isApproved) {
				return done(null, false, { message: 'ابھی تک اس آئی ڈی کی منظوری نہیں ملی'});
			}

		 // Match password
		 bcrypt.compare(password, user.password, (err, isMatch) => {
		 	if(err) throw err;

		 	if(isMatch) {
		 		return done(null, user);
		 	} else {
		 		return done(null, false, { message: 'پاسورڈ غلط ڈالا گیا!'});
		 	}
		 });
		 })
		 .catch(err => console.log(err));
	})
  );

  passport.serializeUser((user, done) => {
  done(null, user.id);
	});

  passport.deserializeUser((id, done) => {
	  User.findById(id, (err, user) => {
	    done(err, user);
	  });
	});
}
