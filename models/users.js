var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var userModel = require('../helpers/userModel');

//user schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        unique:true,
        index: true
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    password: {
        type: String
    },
    password2: {
        type: String
}

})

//create a model of the schema
var User = module.exports = mongoose.model('User', UserSchema);



