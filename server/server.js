// Require all the installs
var express = require('express');
var cors = require('cors')
var passport = require('passport');
var session = require('express-session');
var passportSteam = require('passport-steam');
require('dotenv').config()
var SteamStrategy = passportSteam.Strategy;
const { pool, query } = require("./db");
const db = require('./db');
var app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// Let's set a port
var port = process.env.PORT

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new SteamStrategy({
    returnURL: process.env.site_url + 'api/v1/auth/steam/return',
    realm: process.env.site_url,
    apiKey: 'B14DD3E47A70AC859EE73AB2C656CB34'
}, function (identifier, profile, done) {
    process.nextTick(function () {
        profile.identifier = identifier;
        return done(null, profile);
    });
}
));

app.use(session({
    store: new (require('connect-pg-simple')(session))({
        pool: pool,
        tableName: "session"
    }),
    secret: 'Whatever_You_Want',
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 3600000, secure: process.env.NODE_ENV == "production"
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//routes
app.get('/api/v1', (req, res) => {
    res.send(req.user);
});
app.get("/api/v1/user", (req, res) => {
    if (req.session.user) {
        res.send(req.session.user);
    }
    else {
        res.send(false);
    }
});

app.get('/api/v1/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) {
    res.redirect('/')
});

app.get('/api/v1/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), async function (req, res) {
    req.session.user = req.user

    res.redirect(process.env.front_url)
    /* try {
        console.log("happend")
        const users = await query("SELECT * FROM users");
        console.log(users.rows.find(element => element.id === req.session.user.id))
        if (users.rows.find(element => element.id === req.session.user.id)) {
            console.log("true")
        };

    }
    catch (err) { console.log(err) } */
});
app.post("/api/v1/logout", (req, res) => {
    req.session.destroy();
    res.send("ended")
});
// Spin up the server
app.listen(port, () => {
    console.log('Listening, port ' + port);
});