const mongoose = require('mongoose');
const category = mongoose.Schema({
   email_id:{type:String,required:true},
   category: {type: String, required: true,unique:true},

});
module.exports = mongoose.model('category', category);