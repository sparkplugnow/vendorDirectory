var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')

var categoriesSchema = mongoose.Schema({name: String})

var Category = module.exports = mongoose.model('category', categorySchema);