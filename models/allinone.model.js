const mongoose = require('mongoose');
const allinone = mongoose.Schema({
   image_url:{type: String, required: true},
   category: {type: String, required: true},
   merchant_name: {type: String, required: true},
   total: {type: Number, required: true},
   date:{type:String,required:true},
   CurrencyCode:{type:String},
   BillingPeriod:{type:String},
   extracted_category: {type: String, required: true},
   extracted_merchant_name: {type: String, required: true},
   extracted_total: {type: Number, required: true},
   extracted_date:{type:String,required:true},
   extracted_CurrencyCode:{type:String},
   extracted_BillingPeriod:{type:String}
});
module.exports = mongoose.model('allinone', allinone);