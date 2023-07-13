const mongoose = require('mongoose');
const extracted = mongoose.Schema({
    image_name:{type:String,required:true},
    image_url:{type:String,required:true},
    category:{type:String},
    merchant_name:{type:String},
    date:{type:String},
    total:{type:String},
    CurrencyCode:{type:String},
    BillingPeriod:{type:String}


});
module.exports = mongoose.model('extracted', extracted);
