let jwt = require('jsonwebtoken');
 const Token = require('./models/token.model');
let checkToken = (req, res, next) => {
  let token2 = req.body.token; // Express headers are auto converted to lowercase

console.log(token2);
Token.find({token:req.body.token,email_id:req.body.email_id}).then((token)=>{

console.log(token);
if(token!=null){
var mongotoken=token[0].token;
 console.log(mongotoken)
 if(mongotoken!=null){
    jwt.verify(token2, mongotoken,(decoded) => {
       // console.log(decoded);
     if (decoded){
        req.decoded = decoded;
        next();
      }
    });
  }
}
else{
  res.send("No token found");
}
}).catch(err => {
var mes={
    message:"token or emailid invalid  "
}
       

    res.status(400).send(mes);
});
}

module.exports = {
  checkToken: checkToken
}