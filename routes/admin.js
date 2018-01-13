var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStategy = require('passport-local').Strategy;
var passportConfig = require('../config/passport.js');

//Schemas
var User = require('../models/user');
var Admin = require('../models/admin');


const getRouteFn = (route) => {
    router.get(`/${route}`, (req, res) => res.send(`${route} admin page`))
}

getRouteFn('login')
getRouteFn('/')
getRouteFn('update')
getRouteFn('register')

router.get('/dashboard', (req, res, next) => {
    res.json({user: req.user});
});

router.post('/register', (req, res) => {
    const {name,username, password, password2, email} = req.body;

    var newAdmin = new Admin({name,username, password, email, role: 'admin', admin: true});
    Admin.findOne({
        email: req.body.email
    }, (err, existingUser) => {
        if (err) {
            return next(err);
        }
        if (existingUser) {
        
            return res.redirect('/admin/create');
        }
        Admin.createAdmin(newAdmin, (err, admin) => {
            if (err) {
                console.error(err)
            }
            res.redirect('/admin/login');
        });
    })
});


/****UPDATE USER */
router.post('/update', (req, res, next) => {
    Admin.findById(req.user.id, (err, user) => {
        if (err) {
            console.error(err)
        }
        var {name, username, email} = req.body;
    
            user.name = name,
            user.username = username,
            user.email = email,
            user.save((err) => {
                if (err) {
                    console.error(err);
                    return res.redirect('/update');
                }
                res.redirect('/dashboard');
            });
        });
    })
passportConfig.passportAdmin();

router.post('/login', passport.authenticate('admin-local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    failureFlash: true
}), function (req, res) {
    res.redirect('/admin/login');
});

//logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/admin/login');
});

function isAdmin(req, res, next) {
    if (!req.user.admin) {
        res.redirect('/')
    } else 
        (next())
}

module.exports = router;