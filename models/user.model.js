const mongoose = require('mongoose');

const user = mongoose.Schema({
   email_id: {type: String, required: true,unique:true},
   password: {type: String, required: true,selected:false},
   first_name: {type: String,required: true},
   last_name:{type: String,required: true},
   // CurrencyCode:{type:String}
});

module.exports = mongoose.model('User', user);