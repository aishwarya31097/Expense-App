const mongoose = require('mongoose');
const currency = mongoose.Schema({
 
   currency: {type: String, required: true},

});
module.exports = mongoose.model('currency', currency);