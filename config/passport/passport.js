const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcryptjs');
const passport = require('koa-passport');

const User = require('../../models/user');


    passport.use(
        new LocalStrategy({}, (email, password, done) => {
            User.findOne({where: {email: email}})
                .then(user => {

                    if (!user) {
                        return done(null, false, {message: 'Email not registered'})
                    }
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, {message: 'Password incorrect'});

                        }
                    })
                })
                .catch(err => console.log(err));
        })
    );
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findOne({where :{id}})
            .then((user) => {
                done(null,user);
            })
    });


    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'jwt_secret'
    }, (jwtPayload, done)=> {
        User.findOne({where: {id: jwtPayload.id}})
            .then(user => {
                return done(null, user);
            })
            .catch(err => {
                return done(err);
            })
    }));
