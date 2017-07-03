 var username = "carlabotmil@gmail.com";
 var password= "miracle@123";
var nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport 
var transporter = nodemailer.createTransport({service: 'Gmail',
                    auth: {
                        user: username,
                        pass:  password
}
});

// send mail with defined transport object 


  module.exports.sendMail = function(mailOptions,callback)
{
	transporter.sendMail(mailOptions, callback);
}