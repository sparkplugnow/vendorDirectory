let mongoose = require("mongoose");

const UploadSchema = mongoose.Schema({
  title: String,
  description: String,
  owner: String,
  category:String,
  files:[],
  // path: {
  //   type: String,
  //   required: true,
  //   trim: true
  // },
  // name: {
  //   type: String,
  //   trim: true
  // }
},{timestamps:true});

const Upload = mongoose.model("Upload", UploadSchema);

module.exports = Upload;
