module.exports = {
	ensureAuthenticated: function(req, res, next) {
		if(req.isAuthenticated()) {
			return next();
		}

		req.flash('error_msg', 'برائے مہربانی لاگ ان کریں');
		res.redirect('/users/login');
	}
}
