const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');


const productSchema = mongoose.Schema({
  product:String,
  image:String,
  userid:{
    type:mongoose.Schema.Types.ObjectId, ref:"auth"
  },
  like:[{
    type:Array,
    default:0
  }]
});


module.exports = mongoose.model("product", productSchema);