const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');
let middleware = require('./middleware');
const User = require('./models/user.model');
const Token = require('./models/token.model');
const expense = require('./models/expense.model');
const allinone = require('./models/allinone.model');
const category = require('./models/category.model');
const currency = require('./models/currency.model');
const extracted = require('./models/extracted.model');
const Firebase = require('./models/Firebase.model');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path= require('path');
const fs = require("fs");
const restify = require("restify");
var upload = require('express-fileupload');
var request = require('request');
var crypto = require('crypto');
var url = require('url');
const tempuser = require('./models/tempUser.model');

// const {Storage} = require("@google-cloud/storage");
// const CLOUD_BUCKET = "billspls";
// const storage = new Storage({
//     projectId: 'feisty-reality-198404',
//     keyFilename: __dirname+'/My First Project-0b79a6a5469a.json'
//   })
//   const bucket = storage.bucket(CLOUD_BUCKET);



app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(upload());
app.use(cors());

mongoose.Promise = global.Promise;


mongoose.connect('mongodb://localhost:27011/Ind', { useNewUrlParser: true }, () => {

    console.log('connected');
});



app.post('/uploadImage', middleware.checkToken, (req, res) => {
    console.log(req.files);
    var file = req.files.image,
        name = file.name;
    type = file.mimetype;
    // path=file.path;
    console.log(name);
    console.log(type);

    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 10;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    var finalname = name.replace(/\s+/g, '-').toLowerCase().replace(",", "").replace("!", "-").replace("@", "-").replace("#", "-").replace("$", "-").replace("%", "-").replace("^", "-").replace("&", "-").replace("*", "-").replace("(", "-").replace(")", "-").replace("-", "-").replace("_", "-").replace(",", "-").replace("/", "-").replace(";", "-").replace("'", "-").replace(":", "-").replace("{", "-").replace("}", "-").replace("[", "-").replace("]", "-").replace("=", "-").replace("+", "-").replace("|", "-").replace(/"/g, "'").replace(/\\\//g, "");
    const gcsname = randomstring + finalname;
    console.log(gcsname);
    var uploadpath = __dirname + '/public/uploads/' + gcsname;
    file.mv(uploadpath, function (err) {

        console.log("File Uploaded", finalname);

        request.post({
            url: 'http://34.80.186.153:5008/uploadReceipt',
            form: {
                ImageURL: uploadpath
            }

        });

        res.json({
            success: true,
            image_name: 'http://34.80.186.153:4004/public/uploads/'+gcsname,


        })
        if (err) {
            var test = {
                message: "file not uploaded"
            }
            res.status(400).send(test);
        }
    });
});


app.get('/public/uploads/:filename', function (req, res) {
    console.log(req.params.filename);
    var Filename = req.params.filename;
    res.sendFile(path.join(__dirname + '/public/uploads/' + Filename));
});
// process.on('uncaughtException', function(err) {
//     console.log('Caught exception: ' + err);
//   });

app.post('/getExtractedData', (req, res) => {
    const newExtracted = new extracted();
    console.log(req.body);

    var image_name = req.body.image_name;
    console.log(image_name);
    newExtracted.image_name = req.body.image_name;
    newExtracted.image_url = req.body.image_url
    newExtracted.category = req.body.receipt_type,
        newExtracted.merchant_name = req.body.VendorName,
        newExtracted.date = req.body.Date,
        newExtracted.total = req.body.Total,
        newExtracted.CurrencyCode = req.body.CurrencyCode,
        newExtracted.BillingPeriod = req.body.BillingPeriod

    newExtracted.save().then(userSaved => {

        var test = {
            message: "User Created Successfully",

        }

        res.send(test);
    });

});


app.post('/FetchExtractedData', middleware.checkToken, (req, res) => {
    if (req.body.image_name != "" || req.body.image_name != undefined) {
        extracted.findOne({ image_name: req.body.image_name }).then((user) => {
            console.log(user);

            var test = {
                image_url: user.image_url,
                category: user.category,
                merchant_name: user.merchant_name,
                date: user.date,
                total: user.total,
                CurrencyCode: user.CurrencyCode,
                BillingPeriod: user.BillingPeriod
            }
            if (user) {
                res.send(test);
            }
        }).catch((err) => {
            var test3 = {
                message: "Data could not be fetched"
            }
            res.send(test3)
        })
    }
    else {
        var test3 = {
            message: "Data could not be fetched"
        }
        res.send(test3)
    }
});

// app.post('/signup', (req, res) => {
//     const newUser = new User();
//     var r = Math.floor(10000 + Math.random() * 9000);

//     newUser.email_id = req.body.email_id;
//     newUser.password = req.body.password;
//     newUser.first_name = req.body.first_name;
//     newUser.last_name = req.body.last_name;
//     // newUser.CurrencyCode=req.body.CurrencyCode;
//     if (newUser.first_name != "" && newUser.last_name != "") {
//         bcrypt.genSalt(10, (err, salt) => {

//             bcrypt.hash(newUser.password, salt, (err, hash) => {
//                 if (err) return err;
//                 newUser.password = hash;


//                 const newToken = new Token();

//                 var firstname = newUser.first_name;
//                 var lastname = newUser.last_name;


//                 secret = firstname + lastname;


//                 module.exports = {
//                     secret: secret
//                 }

//                 let token = jwt.sign({ email_id: newUser.email_id },



//                     secret,
//                     {
//                         expiresIn: '24h'
//                     });


//                 newUser.save().then(userSaved => {

//                     var test = {
//                         message: "User Created Successfully",
//                         token: token
//                     }
//                     res.send(JSON.stringify(test));
//                     newToken.token = token;
//                     newToken.email_id = newUser.email_id;
//                     newToken.save().then(userSaved => {
//                         console.log("token added to collection");
//                     });





//                 }).catch(err => {

//                     var test2 = {
//                         message: "Email ID already exists"
//                     }

//                     res.status(400).send(JSON.stringify(test2));
//                 });
//             });


//         });
//     }
//     else {
//         var test3 = {
//             message: "firstname and lastname must be given"
//         }
//         res.status(400).send(test3);
//     }
// });

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    // socketTimeout: 5000,
    auth: {
        user: 'in-d@intainft.com',
        pass: 'Welcome@123'
    }
});
var  mailOptions, host, link;


app.post('/signup', (req, res) => {
    const newUser = new tempuser();
    var r = Math.floor(10000 + Math.random() * 9000);

    newUser.email_id = req.body.email_id;
    newUser.password = req.body.password;
    newUser.first_name = req.body.first_name;
    newUser.last_name = req.body.last_name;
    // rand=Math.floor((Math.random() * 100) + 54);
User.findOne({ email_id:  req.body.email_id }).then((user) => {
console.log(user);
if(user==null){
    if (newUser.first_name != "" && newUser.last_name != "") {
        bcrypt.genSalt(10, (err, salt) => {

            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) return err;
                newUser.password = hash;
                crypto.randomBytes(20, function (err, buf) {
                    const newToken = new Token();

                    var firstname = newUser.first_name;
                    var lastname = newUser.last_name;


                    secret = firstname + lastname;


                    module.exports = {
                        secret: secret
                    }

                    let token = jwt.sign({ email_id: newUser.email_id },



                        secret,
                        {
                            expiresIn: '24h'
                        });
                    // Ensure the activation code is unique.
                    newUser.activeToken = token;
                    var d= Date.now() +30 * 60 * 1000;
                    // Set expiration time is 24 hours.
                    newUser.activeExpires =d;
                newUser.save().then(userSaved => {
                    console.log("temp user saved");
                    // rand = Math.floor((Math.random() * 100) + 54);
                    host = req.get('host');;
                    link = "https://" + req.get('host')+ '/api' + "/verify?email_id=" + req.body.email_id+"&active="+newUser.activeToken ;
                    mailOptions = {

                        to: req.body.email_id,
                        subject: "Please validate your BillsPls login",
                        
                        html: "Welcome to BillsPls!<br><br>Happy to have you on board. Please click the link to get yourself verified. <br><br> <a href=" + link + "> Click here </a> <br><br>By clicking on the above link<br><br>- You can sign-in again any device, anywhere in future<br>- Extract attributes automatically from your receipts on-the-go<br>- Currency conversion happens seamlessly for expenses from different countries<br>- Export multiple expenses as a pdf for your AP reimbursement procedures<br>Have a nice day!<br><br>- Team BillsPls",
                 
                    }
                    console.log(mailOptions);

                    smtpTransport.sendMail(mailOptions, function (error, response) {
                        if (error) {
                            console.log(error);
                            res.end("mail not sent");
                        } else {
                            console.log("Message sent: " + response.message);
                            res.end("success");
                        }
                    });
                }).catch(err => {

                    var test2 = {
                        message: "Email ID already exists"
                    }
                    console.log("email already exist");
                    res.status(400).send(JSON.stringify(test2));
                });

            });
        });
        });
    }
}
else{
    var test2 = {
        message: "Email ID already exists"
    }
    console.log("email already exist");
    res.status(400).send(JSON.stringify(test2));
}
}).catch(err => {

    var test2 = {
        message: "Email ID already exists"
    }
    console.log("email already exist");
    res.status(400).send(JSON.stringify(test2));
});
});

app.get('/verify', function (req, res) {
    const newUser = new User();
    var queryobj = url.parse(req.url, true).query;
    console.log(queryobj);
    // console.log("hii" + queryobj.id);
    console.log("hii" + queryobj.active);
    tempuser.findOne({ email_id:queryobj.email_id,activeToken: queryobj.active}).then((tempuser) => {
console.log(tempuser);
var date=Date.now() +1*60*1000;
var e=parseInt(tempuser.activeExpires);

var d=parseInt(date);
console.log(e,d);
if(e>d){
    console.log("hii");
                tempuser.active = true;
    console.log(req.protocol + "://" + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        console.log("Domain is matched. Information is from Authentic email");
        //  console.log(rand);
        //   console.log(typeof(rand));
      
       
            
        // if (queryobj.id == rand) {
            console.log("email is verified");
            console.log(queryobj.email_id);
            // tempuser.findOne({ email_id: queryobj.email_id }).then((tempuser) => {
            //     console.log(tempuser);

                newUser.email_id = tempuser.email_id;
                newUser.password = tempuser.password;
                newUser.first_name = tempuser.first_name;
                newUser.last_name = tempuser.last_name;
                if (newUser.first_name != "" && newUser.last_name != "") {




                    const newToken = new Token();

                    var firstname = newUser.first_name;
                    var lastname = newUser.last_name;


                    secret = firstname + lastname;


                    module.exports = {
                        secret: secret
                    }

                    let token = jwt.sign({ email_id: newUser.email_id },



                        secret,
                        {
                            expiresIn: '24h'
                        });


                    newUser.save().then(userSaved => {

                        // var test = {
                        //     message: "User Created Successfully",
                        //     token: token
                        // }
                        // res.send(JSON.stringify(test));
                        newToken.token = token;
                        newToken.email_id = newUser.email_id;
                        newToken.save().then(userSaved => {
                            console.log("token added to collection");




    tempuser.deleteOne({ email_id: newUser.email_id })
    .then((docs) => {
       console.log("deleted");

    }).catch((err) => {
        console.log(" could not delete");
    });
                        });





                    }).catch(err => {

                        var test2 = {
                            message: "Email ID already exists"
                        }

                        res.status(400).send(JSON.stringify(test2));
                    });



                }
                else {
                    var test3 = {
                        message: "firstname and lastname must be given"
                    }
                    res.status(400).send(test3);
                }

            // });
            res.end("Email " + mailOptions.to + " has been Successfully verified! Please login into the App.");
        //}
        // else {
        //     console.log("email is not verified");
        //     res.end("<h1>Bad Request</h1>");
        // }
    }
  
  

    else {
        res.end("<h3>Request is from unknown source");
    }
        }
        else{
            res.end("Your link has expired");
            tempuser.deleteOne({ email_id: newUser.email_id })
    .then((docs) => {
       console.log("deleted");

    }).catch((err) => {
        console.log(" could not delete");
    });

}
}).catch(err => {

    res.end("Email already verified");
});
});


app.post('/login', (req, res) => {
    console.log("API Hit");
    var message;
    User.findOne({ email_id: req.body.email_id }).then((user) => {
        console.log("hiiii");
        console.log(user);

        if (req.body.email_id != "" && req.body.password != "") {
            console.log("hello");
	    console.log("email id " + req.body.email_id + "password" + req.body.password);

            bcrypt.compare(req.body.password, user.password, (err, matched) => {

                const newToken = new Token();

                var first_name = user.first_name;
                var last_name = user.last_name;

                secret = first_name + last_name;
                // result.data=secret;
                // result.emit('update');
                //    console.log(secret);


                module.exports = {
                    secret: secret
                }

                let token = jwt.sign({ email_id: user.email_id },



                    secret,
                    {
                        expiresIn: '24h' // expires in 24 hours            
                    });

                newToken.token = token;
                newToken.email_id = req.body.email_id;
                newToken.save().then(userSaved => {
                    console.log("token added to collection");
                });

                if (err) return err;
                if (matched) {
                    var test = {
                        message: "User Login Successful",
                        token: token
                    }

                    res.send(JSON.stringify(test));

                } else {


                    var test2 = {
                        message: "Email ID and password not matched"
                    }

                    res.status(400).send(JSON.stringify(test2));

                }
            });
        }
        else {
            var test3 = {
                message: "user details not filled"
            }
            res.status(400).send(test3);
        }
    }).catch((err) => {
        var test2 = {
            message: "Email ID and password not matched"
        }
        res.status(400).send(test2);
    });
});



app.post('/logout', middleware.checkToken, (req, res) => {

    Token.deleteOne({ token: req.body.token, email_id: req.body.email_id })
        .then((docs) => {
            var test = {
                message: "logout successfully"
            }

            res.send(test);

        }).catch((err) => {
            var test2 = {
                message: "cannot find token or token expired"
            }
            res.status(400).send(test2);
        });
});



app.post('/generateOtp', (req, res) => {
    console.log("API Hit");
    var message;
    var transporter = nodemailer.createTransport(
        {
            service: 'gmail',

            auth: {
                user: 'in-d@intainft.com',
                pass: 'Welcome@123'
            }
        });
    var toemailid = req.body.email_id;
    var otp = Math.floor(1000 + Math.random() * 900);
    var mailOptions = {
        from: 'in-d@intainft.com',
        to: toemailid,
        subject: 'Email Verification OTP',
        text: 'Your Email Verification OTP is:' + otp
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        var response = {
            email_id: toemailid,
            otp: otp
        }
        res.send(response);
    })
//.catch((err) => {
//        var response = {
//            message: "error while sending"
//        }
//        res.status(400).send(response);
//    });


});


app.post('/resetPassword', (req, res) => {

    // template.find({ tempid: req.body.tempid }).then((temp1)=>{
    User.find({ email_id: req.body.email_id }).then((user1) => {

        if (req.body.otp == req.body.user_otp && req.body.otp != "" && req.body.user_otp != "") {

            var password = req.body.password;
            if (req.body.password != "") {
                bcrypt.genSalt(10, (err, salt) => {

                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) return err;
                        password = hash;

                        User.updateOne({ email_id: req.body.email_id }, { $set: { password: password } }, { new: true }).then((docs) => {
                            var test = {
                                message: "Password updated Successfully",

                            }
                            // var temp2=temp1[0].tempid;
                            // console.log(temp2);
                            if (req.body.email_id == user1[0].email_id) {

                                res.send(test);
                            } else {
                                var test2 = {
                                    message: "Password update not successful"
                                }
                                res.send(test2)
                            }
                        }).catch((err) => {
                            var test3 = {
                                message: "Password update not successful"
                            }
                            res.status(400).send(test3)
                        })
                    });
                });

            }
            else {
                var test3 = {
                    message: "password is must"
                }
                res.status(400).send(test3);
            }
        }
        else {
            var response = {
                message: "OTP doesn't match"
            }
            res.status(400).send(response);
        }

    });


});

app.post('/updatePassword', middleware.checkToken, (req, res) => {
    User.findOne({ email_id: req.body.email_id }).then((user) => {
        console.log("hiiii");
        console.log(user);

        if (user) {
            console.log("hello");

            bcrypt.compare(req.body.password, user.password, (err, matched) => {

                if (matched) {
                    var newpassword = req.body.new_password;
                    // console.log(newpassword);
                    if (newpassword != "") {
                        bcrypt.genSalt(10, (err, salt) => {

                            bcrypt.hash(newpassword, salt, (err, hash) => {
                                if (err) return err;
                                newpassword = hash;

                                User.updateOne({ email_id: req.body.email_id }, { $set: { password: newpassword } }, { new: true }).then((docs) => {
                                    var test = {
                                        message: "Password updated Successfully",

                                    }

                                    if (req.body.email_id == user.email_id) {

                                        res.send(test);
                                    } else {
                                        var test2 = {
                                            message: "Password update not successful"
                                        }
                                        res.send(test2)
                                    }
                                }).catch((err) => {
                                    var test3 = {
                                        message: "Password update not successful"
                                    }
                                    res.status(400).send(test3)
                                })
                            });
                        })
                    }
                    else {
                        console.log("true");
                        var test3 = {
                            message: "Password is a must"
                        }
                        res.status(400).send(test3)
                    }
                }
                else {
                    console.log("false");
                    var test3 = {
                        message: "Password did not match"
                    }
                    res.status(400).send(test3)
                }




            });
        }
        else {

            var test3 = {
                message: "Password update not successful"
            }
            res.status(400).send(test3)
        }
    });
});


app.post('/getUserInformation', middleware.checkToken, (req, res) => {
    User.findOne({ email_id: req.body.email_id }).then((user) => {
        console.log(user);
        var test = {
            email_id: user.email_id,
            first_name: user.first_name,
            last_name: user.last_name
        }
        // var test3= {
        //     first_name: user.first_name,
        //     last_name: user.last_name,
        //     CurrencyCode:user.CurrencyCode
        // }
        console.log(test);

        if (user.first_name != null && user.last_name != null) {
            res.send(test);

        }
        //         else if(user.first_name != null && user.last_name != null ){
        // res.send(test3);
        //         }
        else {
            var test2 = {
                message: "Email id does not  exists"
            }
            res.status(400).send(test2)
        }
    }).catch((err) => {
        var test3 = {
            message: "Cannot get user information"
        }
        res.status(400).send(test3)
    });
});



app.post('/updateUserInformation', middleware.checkToken, (req, res) => {
    User.findOne({ email_id: req.body.email_id }).then((user) => {
        console.log(user);
        if (req.body.first_name != "" && req.body.last_name != "") {
            User.updateMany({ email_id: req.body.email_id }, { $set: { first_name: req.body.first_name, last_name: req.body.last_name } }, { new: true }).then((docs) => {
                var test = {
                    message: "User Information updated Successfully",

                }

                if (req.body.email_id == user.email_id) {

                    res.send(test);
                } else {
                    var test2 = {
                        message: "User Information update not successful"
                    }
                    res.status(400).send(test2)
                }
            }).catch((err) => {
                var test3 = {
                    message: "User Information update not successful"
                }
                res.status(400).send(test3)
            })
        }
        else {
            var test3 = {
                message: "first name or/and lastname not specified"
            }
            res.status(400).send(test3)
        }

    });
});


app.post('/addExpense', middleware.checkToken, (req, res) => {
    const newExpense = new expense();

    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 5;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    newExpense.expense_id = randomstring;
    newExpense.email_id = req.body.email_id;
    newExpense.image_url = req.body.image_url;
    newExpense.category = req.body.category;

    newExpense.merchant_name = req.body.merchant_name;

    newExpense.total = req.body.total;
    newExpense.description = req.body.description;



    newExpense.date = req.body.date;
    newExpense.CurrencyCode = req.body.CurrencyCode;
    newExpense.BillingPeriod = req.body.BillingPeriod;


    newExpense.save().then(userSaved => {

        var test = {
            message: "Expense Added Successfully",
            expense_id: newExpense.expense_id
        }
        res.send(JSON.stringify(test));
    }).catch(err => {

        var test2 = {
            message: "Expense not added "
        }

        res.send(JSON.stringify(test2));
    });
});



app.post('/updateExpense', middleware.checkToken, (req, res) => {

    expense.find({ expense_id: req.body.expense_id, email_id: req.body.email_id }).then((expense1) => {

        console.log(expense1);

        expense.updateMany({ expense_id: req.body.expense_id, email_id: req.body.email_id }, { $set: { image_url: req.body.image_url, category: req.body.category, merchant_name: req.body.merchant_name, total: req.body.total, description: req.body.description, date: req.body.date, CurrencyCode: req.body.CurrencyCode, BillingPeriod: req.body.BillingPeriod } }, { multi: true, new: true }).then((docs) => {
            var test = {
                message: "expense updated Successfully"
            }

            if (req.body.expense_id == expense1[0].expense_id && req.body.email_id == expense1[0].email_id) {

                res.send(JSON.stringify(test));
            } else {
                var test2 = {
                    message: "expenseid or emailid did not match"
                }

                res.status(400).send(JSON.stringify(test2));
            }

        }).catch((err) => {
            var test2 = {
                message: "expenseid or emailid did not match"
            }

            res.status(400).send(JSON.stringify(test2));
        })
    });
});


app.post('/getExpenseID', middleware.checkToken, (req, res) => {

    expense.find({ email_id: req.body.email_id }).then((expense1) => {
        var array = [];
        console.log(expense1);
        for (i = expense1.length - 1; i >= 0; i--) {
            var test = {
                expense_id: expense1[i].expense_id
            }
            array.push(test);
        }
        console.log(array);
        if (expense1) {
            res.send(JSON.stringify(array));
        } else {
            var elsepart = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(elsepart));

        }

    }).catch(err => {
        console.log(err);
        var test2 = {
            message: "error"
        }

        res.status(400).send(JSON.stringify(test2));
    });;
});




app.post('/getAllExpenses', middleware.checkToken, (req, res) => {
    var pageNo = parseInt(req.body.pageNo)
    var size = parseInt(req.body.size)
    var query = {}
    if (pageNo < 0 || pageNo === 0) {
        response = { "error": true, "message": "invalid page number, should start with 1" };
        return res.json(response)
    }
    query.skip = size * (pageNo - 1)
    query.limit = size
    expense.find({ email_id: req.body.email_id }, {}, query, function (err, expense1) {
        var array = [];
        console.log(expense1);
        for (i = expense1.length - 1; i >= 0; i--) {
            var test = {
                expense_id: expense1[i].expense_id,
                image_url: expense1[i].image_url,
                category: expense1[i].category,
                merchant_name: expense1[i].merchant_name,
                total: expense1[i].total,
                date: expense1[i].date,
                CurrencyCode: expense1[i].CurrencyCode


            }
            array.push(test);
        }
        console.log(array);
        if (expense1) {
            res.send(JSON.stringify(array));
            // res.send(JSON.stringify(expense1));
        } else {
            var elsepart = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(elsepart));

        }

    }).catch(err => {
        console.log(err);
        var test2 = {
            message: "error"
        }

        res.status(400).send(JSON.stringify(test2));
    });

});


app.post('/getDetailsByExpenseID', middleware.checkToken, (req, res) => {
    if (req.body.expense_id) {
        expense.find({ email_id: req.body.email_id, expense_id: req.body.expense_id }).then((expense1) => {

            console.log(expense1);

            for (i = 0; i < expense1.length; i++) {
                console.log(expense1[i].date);
                //  var s = expense1[i].date; 
                //  console.log(s);
                // var a= s.toString().substring(0,10);
                var test = {
                    image_url: expense1[i].image_url,
                    category: expense1[i].category,
                    merchant_name: expense1[i].merchant_name,
                    total: expense1[i].total,
                    description: expense1[i].description,
                    date: expense1[i].date,
                    CurrencyCode: expense1[i].CurrencyCode,
                    BillingPeriod: expense1[i].BillingPeriod
                }

            }
            console.log(test);
            if (expense1) {
                res.send(JSON.stringify(test));
            } else {
                var elsepart = {
                    message: "error"
                }

                res.status(400).send(JSON.stringify(elsepart));

            }

        }).catch(err => {
            console.log(err);
            var test2 = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(test2));
        });
    }
    else {
        var test2 = {
            message: "exenseid is must"
        }

        res.status(400).send(JSON.stringify(test2));
    }
});



// app.post('/getExpensestotalByCategoryName', middleware.checkToken, (req, res) => {

//     expense.find({ category: req.body.category }).then((expense1) => {
//         var sum = [];
//         var sum2 = 0;
//         console.log(expense1);
//         for (i = 0; i < expense1.length; i++) {
//             sum.push(expense1[i].total);
//         }
//         console.log(sum);
//         for (j = 0; j < sum.length; j++) {
//             sum2 += sum[j];
//         }
//         console.log(sum2);
//         var x = sum2.toString();
//         if (expense1) {
//             var test = {
//                 total: x
//             }
//             res.send(JSON.stringify(test));
//         } else {
//             var elsepart = {
//                 message: "error"
//             }

//             res.send(JSON.stringify(elsepart));

//         }

//     }).catch(err => {
//         console.log(err);
//         var test2 = {
//             message: "error"
//         }

//         res.send(JSON.stringify(test2));
//     });;
// });



app.post('/getExpensestotalByCategoryNameandDate', middleware.checkToken, (req, res) => {
    if (req.body.category && req.body.from_date && req.body.to_date) {
        expense.find({
            email_id: req.body.email_id,
            category: req.body.category, date: {

                $gt: req.body.from_date, $lt: req.body.to_date
            }
        }).then((expense1) => {
            var sum = [];
            var sum2 = 0;
            console.log(expense1);
            for (i = 0; i < expense1.length; i++) {
                sum.push(expense1[i].total);
            }
            console.log(sum);
            for (j = 0; j < sum.length; j++) {
                sum2 += sum[j];
            }
            console.log(sum2);
            var x = sum2.toString();
            if (expense1) {
                var test = {
                    total: x
                }
                res.send(JSON.stringify(test));
            } else {
                var elsepart = {
                    message: "error"
                }

                res.status(400).send(JSON.stringify(elsepart));

            }

        }).catch(err => {
            console.log(err);
            var test2 = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(test2));
        });
    }
    else {
        var test2 = {
            message: "category , fromdate or to date is missing"
        }

        res.status(400).send(JSON.stringify(test2));
    }
});


app.post('/getExpensestotalByDate', middleware.checkToken, (req, res) => {
    if (req.body.from_date && req.body.to_date) {
        expense.find({
            email_id: req.body.email_id,
            date: {

                $gt: req.body.from_date, $lt: req.body.to_date
            }
        }).then((expense1) => {
            var sum = [];
            var sum2 = 0;
            console.log(expense1);
            for (i = 0; i < expense1.length; i++) {
                sum.push(expense1[i].total);
            }
            console.log(sum);
            for (j = 0; j < sum.length; j++) {
                sum2 += sum[j];
            }
            console.log(sum2);
            var x = sum2.toString();
            if (expense1) {
                var test = {
                    total: x
                }
                res.send(JSON.stringify(test));
            } else {
                var elsepart = {
                    message: "error"
                }

                res.send(JSON.stringify(elsepart));

            }

        }).catch(err => {
            console.log(err);
            var test2 = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(test2));
        });
    }
    else {
        var test2 = {
            message: " fromdate or to date is missing"
        }

        res.status(400).send(JSON.stringify(test2));
    }
});



app.post('/deleteExpense', middleware.checkToken, (req, res) => {


    expense.find({ expense_id: req.body.expense_id, email_id: req.body.email_id }).then((expense1) => {

        expense.deleteOne({ expense_id: req.body.expense_id, email_id: req.body.email_id })
            .then((docs) => {
                if (req.body.expense_id == expense1[0].expense_id && req.body.email_id == expense1[0].email_id) {
                    var test = {
                        message: "expense record deleted Successfully"
                    }
                    res.send(JSON.stringify(test));
                } else {
                    var test2 = {
                        message: "expenseid did not match"
                    }

                    res.send(JSON.stringify(test2));
                }
            }).catch((err) => {
                var test2 = {
                    message: "expense-id or email_id did not match"
                }

                res.send(JSON.stringify(test2));
            });
    }).catch((err) => {
        var test2 = {
            message: "expense-id or email_id did not match"
        }

        res.send(JSON.stringify(test2));
    });
});


app.post('/addAllDetails', middleware.checkToken, (req, res) => {
    const AllDetails = new allinone();

    AllDetails.image_url = req.body.image_url;


    AllDetails.category = req.body.category;

    AllDetails.merchant_name = req.body.merchant_name;

    AllDetails.total = req.body.total;

    AllDetails.description = req.body.description;

    AllDetails.date = req.body.date;
    AllDetails.CurrencyCode = req.body.CurrencyCode;
    AllDetails.BillingPeriod = req.body.BillingPeriod;
    AllDetails.extracted_category = req.body.extracted_category;

    AllDetails.extracted_merchant_name = req.body.extracted_merchant_name;

    AllDetails.extracted_total = req.body.extracted_total;

    AllDetails.extracted_description = req.body.extracted_description;

    AllDetails.extracted_date = req.body.extracted_date;
    AllDetails.extracted_CurrencyCode = req.body.extracted_CurrencyCode;
    AllDetails.extracted_BillingPeriod = req.body.extracted_BillingPeriod;
    AllDetails.save().then(userSaved => {

        var test = {
            message: "Expense Added Successfully"
        }
        res.send(JSON.stringify(test));
    }).catch(err => {

        var test2 = {
            message: "Expense exists"
        }

        res.send(JSON.stringify(test2));
    });
});



app.post('/addCategory', middleware.checkToken, (req, res) => {
    const newCategory = new category();

    newCategory.email_id = req.body.email_id;

    newCategory.category = req.body.category;

    newCategory.save().then(userSaved => {

        var test = {
            message: "Category Added Successfully"
        }
        res.send(JSON.stringify(test));
    }).catch(err => {

        var test2 = {
            message: "category exists"
        }

        res.status(400).send(JSON.stringify(test2));
    });
});




app.post('/getCategoryForUser', middleware.checkToken, (req, res) => {
    category.find({ email_id: req.body.email_id }).then((expense1) => {

        console.log(expense1);
        var array = [];
        for (i = 0; i < expense1.length; i++) {
            console.log(expense1[i].category);
            //  var s = expense1[i].date; 
            //  console.log(s);
            // var a= s.toString().substring(0,10);
            var test = {
                category: expense1[i].category,

            }
            array.push(test);
        }
        console.log(array);
        if (expense1) {
            res.send(JSON.stringify(array));
        } else {
            var elsepart = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(elsepart));

        }

    }).catch(err => {
        console.log(err);
        var test2 = {
            message: "error"
        }

        res.status(400).send(JSON.stringify(test2));
    });;
});

app.post('/getExpensesDetailsByCategoryNameandDate', middleware.checkToken, (req, res) => {
    if (req.body.category && req.body.from_date && req.body.to_date) {
        expense.find({
            email_id: req.body.email_id,
            category: req.body.category, date: {

                $gt: req.body.from_date, $lt: req.body.to_date
            }
        }).then((expense1) => {
            var array = [];
            var sum2 = 0;
            console.log(expense1);
            for (i = 0; i < expense1.length; i++) {
                var test = {
                    expense_id: expense1[i].expense_id,
                    image_url: expense1[i].image_url,
                    category: expense1[i].category,
                    merchant_name: expense1[i].merchant_name,
                    total: expense1[i].total,
                    description: expense1[i].description,
                    date: expense1[i].date,
                    CurrencyCode: expense1[i].CurrencyCode,
                    BillingPeriod: expense1[i].BillingPeriod
                }
                array.push(test);
            }

            if (expense1) {

                res.send(JSON.stringify(array));
            } else {
                var elsepart = {
                    message: "error"
                }

                res.send(JSON.stringify(elsepart));

            }

        }).catch(err => {
            console.log(err);
            var test2 = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(test2));
        });
    }
    else {
        var test2 = {
            message: "category, from_date or to_date missing"
        }

        res.status(400).send(JSON.stringify(test2));
    }
});


app.post('/getExpensesDetailsByDate', middleware.checkToken, (req, res) => {
    if (req.body.from_date && req.body.to_date) {
        expense.find({
            email_id: req.body.email_id,
            date: {

                $gt: req.body.from_date, $lt: req.body.to_date
            }
        }).then((expense1) => {
            var array = [];
            var sum2 = 0;
            console.log(expense1);
            for (i = 0; i < expense1.length; i++) {
                var test = {
                    expense_id: expense1[i].expense_id,
                    category: expense1[i].category,
                    image_url: expense1[i].image_url,
                    merchant_name: expense1[i].merchant_name,
                    total: expense1[i].total,
                    description: expense1[i].description,
                    date: expense1[i].date,
                    CurrencyCode: expense1[i].CurrencyCode,
                    BillingPeriod: expense1[i].BillingPeriod
                }
                array.push(test);
            }

            if (expense1) {

                res.send(JSON.stringify(array));
            } else {
                var elsepart = {
                    message: "error"
                }

                res.status(400).send(JSON.stringify(elsepart));

            }

        }).catch(err => {
            console.log(err);
            var test2 = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(test2));
        })
    }
    else {
        var test2 = {
            message: "from_date or to_date missing"
        }

        res.status(400).send(JSON.stringify(test2));
    }
});

app.post('/getNoOfExpensesByCategoryandDate', middleware.checkToken, (req, res) => {
    if (req.body.category && req.body.from_date && req.body.to_date) {
        expense.find({
            email_id: req.body.email_id,
            category: req.body.category, date: {

                $gt: req.body.from_date, $lt: req.body.to_date
            }
        }).then((expense1) => {

            console.log(expense1);
            var expense_length = expense1.length;

            if (expense1) {
                var test = {
                    no_of_expenses: expense_length
                }

                res.send(JSON.stringify(test));
            } else {
                var elsepart = {
                    message: "error"
                }

                res.status(400).send(JSON.stringify(elsepart));

            }

        }).catch(err => {
            console.log(err);
            var test2 = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(test2));
        });
    }
    else {
        var test2 = {
            message: "category ,from_date or to_date missing"
        }

        res.status(400).send(JSON.stringify(test2));
    }
});

app.post('/getNoOfExpensesByDate', middleware.checkToken, (req, res) => {
    if (req.body.from_date && req.body.to_date) {
        expense.find({
            email_id: req.body.email_id,
            date: {

                $gt: req.body.from_date, $lt: req.body.to_date
            }
        }).then((expense1) => {

            console.log(expense1);
            var expense_length = expense1.length;

            if (expense1) {
                var test = {
                    no_of_expenses: expense_length
                }

                res.send(JSON.stringify(test));
            } else {
                var elsepart = {
                    message: "error"
                }

                res.status(400).send(JSON.stringify(elsepart));

            }

        }).catch(err => {
            console.log(err);
            var test2 = {
                message: "error"
            }

            res.status(400).send(JSON.stringify(test2));
        });
    }
    else {
        var test2 = {
            message: "from_date or to_date missing"
        }

        res.status(400).send(JSON.stringify(test2));
    }
});



app.post('/addcurrency', middleware.checkToken, (req, res) => {

    const newCurrency = new currency();


    newCurrency.currency = req.body.currency;

    newCurrency.save().then(userSaved => {

        var test = {
            message: "currency Added Successfully"
        }
        res.send(JSON.stringify(test));
    }).catch(err => {

        var test2 = {
            message: "currency exists"
        }

        res.send(JSON.stringify(test2));
    });


})
app.post('/getListOfCurrencies', middleware.checkToken, (req, res) => {
    currency.find({}).then((currency) => {
        console.log(currency);
        var array = [];
        for (i = 0; i < currency.length; i++) {
            var test = {
                currency: currency[i].currency
            }
            array.push(test);
        }
        if (currency) {
            res.send(JSON.stringify(array));
        }
    }).catch(err => {
        console.log(err);
        var test2 = {
            message: "error"
        }

        res.send(JSON.stringify(test2));
    });;
})

app.post('/firebase', (req, res) => {
    console.log("API Hit");
    var message;
    if(req.body.email_id !=undefined && req.body.fireUserId!=undefined){

    
    Firebase.find({ email_id: req.body.email_id}).then((user) => {
        console.log("hiiii");
        console.log(user[0]);
        if (user[0] == undefined ){
            if (req.body.email_id != "" && req.body.fireUserId != "") {

                const newFirebase = new Firebase();

                const newToken = new Token();

                var email_id1 = req.body.email_id;

                secret = email_id1;

                module.exports = {
                    secret: secret
                }

                let token = jwt.sign({ email_id: user.email_id },



                    secret,
                    {
                        expiresIn: '24h' // expires in 24 hours            
                    });

                newToken.token = token;
                newToken.email_id = req.body.email_id;
                newFirebase.email_id = req.body.email_id;
                newFirebase.fireUserId = req.body.fireUserId;
                newFirebase.save().then(userSaved => {
                    console.log("user added");
                    newToken.save().then(userSaved => {
                        console.log("token added to collection");
                    });

                    var test = {
                        message: "User Login Successful",
                        token: token
                    }

                    res.send(JSON.stringify(test));


                });
            }
            else {
                var test3 = {
                    message: "user details not provided"
                }
                res.status(400).send(test3);
            }

        }
        else {
           
            if (req.body.email_id != "" && req.body.fireUserId != "") {
                console.log("hello");


                const newToken = new Token();

                var email_id1 = req.body.email_id;

                secret = email_id1;
                // result.data=secret;
                // result.emit('update');
                //    console.log(secret);


                module.exports = {
                    secret: secret
                }

                let token = jwt.sign({ email_id: user.email_id },



                    secret,
                    {
                        expiresIn: '24h' // expires in 24 hours            
                    });

                newToken.token = token;
                newToken.email_id = req.body.email_id;
                // newToken.fireUserId=req.body.fireUserId;
                newToken.save().then(userSaved => {
                    console.log("token added to collection");
                });


                var test = {
                    message: "User Login Successful",
                    token: token
                }

                res.send(JSON.stringify(test));

            }
            else {
                var test3 = {
                    message: "user details not provided or not matched"
                }
                res.status(400).send(test3);
            }

        }
      
    }).catch((err) => {
        var test2 = {
            message: "Email ID and firebaseuid did not matched"
        }
        res.status(400).send(test2);
    });
}
else{
    var test3 = {
        message: "user details not provided x"
    }
    res.status(400).send(test3);
}
});



app.listen(4004, () => {

    console.log('listening on port 4004');


});
