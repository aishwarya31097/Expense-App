const mongoose = require('mongoose');
const expense = mongoose.Schema({
   image_url:{type: String},
   email_id:{type:String,required:true},
   category: {type: String},
   merchant_name: {type: String},
   total: {type: Number},
   description:{type:String},
   date:{type:String},
   expense_id:{type:String},
   CurrencyCode:{type:String},
   BillingPeriod:{type:String},
});
module.exports = mongoose.model('expense', expense);
