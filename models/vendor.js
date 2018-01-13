var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')

var VendorSchema = mongoose.Schema({name: String, description: String, users: Array, images: Array})

var Vendor = module.exports = mongoose.model('vendor', vendorSchema);