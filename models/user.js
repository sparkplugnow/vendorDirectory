var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')

var UserSchema = mongoose.Schema({
    created_at: Date,
    name: String,
    username: String,
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    avatar: {
        path: {
            type: String,
            // required: true,
            trim: true
        },
        name: {
            type: String,
            trim: true
        }
    },
    password: String,
    password2: String,
    role: String,
    admin: Boolean
});
var User = module.exports = mongoose.model('user', UserSchema);

UserSchema.pre('save', (next) => {
    const currentDate = new Date();

    if (!this.created_at) 
        this.created_at = currentDate;
    
    next();
});

//hash password
module.exports.createUser = (user, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            // Store hash in your password DB.
            user.password = hash;
            user.save(callback);
        });
    });
}
//custom functions for accessing the database
module.exports.getUserByUsername = (username, callback) => {
    var query = {
        username: username
    };
    User.findOne(query, callback);
}
module.exports.getUserByEmail = (email, callback) => {
    var query = {
        email: email
    };
    User.findOne(query, callback);
}
module.exports.comparePassword = (password, hash, callback) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
        if (err) 
            throw err;
        callback(null, isMatch);
    });
}
module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) 
            throw err;
        callback(null, isMatch);
    });
}
module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}