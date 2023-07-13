const mongoose = require('mongoose');

const tempuser = mongoose.Schema({
   email_id: {type: String, required: true,unique:true},
   password: {type: String, required: true,selected:false},
   first_name: {type: String,required: true},
   last_name:{type: String,required: true},
   active: {
      type: Boolean,
      default: false
  },
  activeToken: String,
  activeExpires: String,
});

module.exports = mongoose.model('tempuser', tempuser);
