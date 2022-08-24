const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://localhost/authauth");

const createrSchema = mongoose.Schema({
    user : String,
    username : String,
    password : String,
    
    mypost:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"product"
  }],
  image: ["./images/upload"]
});

createrSchema.plugin(plm);

module.exports = mongoose.model("auth", createrSchema);