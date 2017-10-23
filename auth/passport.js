const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const log = require('../libs/log')(module);
const User = require('../models/user');
const AccessToken = require('../models/accessToken');
const RefreshToken = require('../models/refreshToken');
const config = require('../config');


/*function errFn(cb, err) {
	if (err) {
		log.error(err.message); 
		return cb(err); 
	}
}*/

function generateToken(user, done) {
	//let errorHandler = errFn.bind(undefined, done);
	//let accessToken;
	//let refreshToken;
	//let accessTokenValue;
	//let refreshTokenValue;

	new Promise((resolve, reject) => {
		AccessToken.remove({username : user.username}, (err) => {
			if (err) reject(err);
			resolve();
		});
	})
		.then(() => {
			return new Promise((resolve, reject) => {
				RefreshToken.remove({username : user.username}, (err) => {
					if (err) reject(err);
					resolve();
				});
			});
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				let accessTokenValue = crypto.randomBytes(32).toString('hex');
				let accessToken = new AccessToken({
					username: user.username,
					token: accessTokenValue
				});
				accessToken.save((err) => {
					if (err) reject(err);

					resolve();
				});
			});
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				let refreshTokenValue = crypto.randomBytes(32).toString('hex');
				let refreshToken = new RefreshToken({
					username: user.username,
					token: refreshTokenValue
				});
				refreshToken.save((err) => {
					if (err) reject(err);
					resolve();
				});
			});
		})
		.then(() => {
			done(null, user);
		})
		.catch((err) => {
			log.error(err.message)
			done(err);
		});


	//AccessToken.remove({username : user.username}, errorHandler);
	//RefreshToken.remove({username : user.username}, errorHandler);

	//accessTokenValue = crypto.randomBytes(32).toString('hex');
	//refreshTokenValue = crypto.randomBytes(32).toString('hex');

	/*accessToken = new AccessToken({
		username: user.username,
		token: accessTokenValue
	});
	refreshToken = new RefreshToken({
		username: user.username,
		token: refreshTokenValue
	});*/

	/*accessToken.save(errorHandler);
	refreshToken.save((err) => {
		if (err) {
			log.error(err.message); 
			done(err); 
		}
		done(null, user);
	});*/
}


passport.use(new LocalStrategy((username, password, done) => {
	User.findOne({ username: username }, (err, user) => {
		if (err) {
			return done(err);
		}
		if (!user) {
			return done(null, false, { message: 'Incorrect username.' });
		}
		if (!user.checkPassword(password)) {
			return done(null, false, { message: 'Incorrect password.' });
		}
		generateToken(user, done);
	});
}));

passport.use(new BearerStrategy((tokenValue, done) => {
	AccessToken.findOne({token: tokenValue}, (err, token) => {
		if (err) {
			log.error(err.message);
			return done(err);
		}
		if (!token) {
			return done(null, false, { message: 'Incorrect token.' });
		}
		if (Math.round((Date.now() - token.created) / 1000 ) > config.get('auhtorization:tokenLife')) {
			return done(null, false, { message: 'Token is foul.' });
		}
		User.findOne({username: token.username}, (err, user) => {
			if (err) {
				log.error(err.message);
				return done(err);
			}
			if (!user) {
				return done(null, false, { message: 'Incorrect token.' });
			}
			done(null, user);
		});
	});
}));

module.exports = passport;