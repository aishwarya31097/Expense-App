const mongoose = require('mongoose');

const Firebase = mongoose.Schema({
   
   email_id:{type: String, required: true,unique:true},
   fireUserId:{type:String,required:true}
});
module.exports = mongoose.model('Firebase', Firebase);
