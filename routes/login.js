const express = require('express');
const passport = require('../auth/passport');
const router = express.Router();
const log = require('../libs/log')(module);

const AccessToken = require('../models/accessToken');
const RefreshToken = require('../models/refreshToken');

router.post('/', 
	passport.authenticate('local', { session: false }),
	(req, res) => {
		let accessToken;
		let refreshToken;
		AccessToken.findOne({username: req.user.username}, (err, token) => {
			accessToken = token.token;
			RefreshToken.findOne({username: req.user.username}, (err, token) => {
				refreshToken = token.token;
				res.json({
					accessToken: accessToken,
					refreshToken: refreshToken
				});
			});
		});
	}
);

module.exports = router;