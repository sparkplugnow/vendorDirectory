var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')

var AdminSchema = mongoose.Schema({
    date: Date,
    name: String,
    username: String,
    email: String,
    password: String,
    password2: String,
    role: String,
    admin: Boolean
});
var Admin = module.exports = mongoose.model('Admin', AdminSchema);

AdminSchema.pre('save', (next) => {
    this.date = new Date();
    next()
})
//hash password
module.exports.createAdmin = (admin, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(admin.password, salt, (err, hash) => {
            // Store hash in your password DB.
            admin.password = hash;
            admin.save(callback);
        });
    });
}
//custom functions for accessing the database
module.exports.getUserByUsername = (username, callback) => {
    var query = {
        username: username
    };
    Admin.findOne(query, callback);
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
    Admin.findById(id, callback);
}