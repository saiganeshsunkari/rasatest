var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const Botkit = require('botkit');
var request = require('request');
var mongoStorage = require('botkit-storage-mongo')({mongoUri: "mongodb://admin:UKFPAYMVBAHBSOJH@sl-us-south-1-portal.2.dblayer.com:17167/admin?ssl=true"});
const rasa = require('./src/middleware-rasa')({
  rasa_uri: 'http://192.168.1.234:5000'
})
var mail = require('./src/mail');
var mailOptions = {
    from: 'carlabotmil@gmail.com', // sender address 
    to: 'pgedala@miraclesoft.com', // list of receivers 
    subject: 'Confirmation Email' , // Subject line 
    text: 'Device information was stored', // plaintext body 
    html: '<b>Confirmation Email</b>' // html body 
};
const controller = Botkit.slackbot({
	storage : mongoStorage,
  debug: false
})
var messages = {
			 attachments : [{}]
             }

	

function getData(intent, callback){
	 controller.storage.teams.get(intent, function(error, data){
				 callback(data.message);
				  });
}

const bot = controller.spawn({
  token: 'xoxb-201779873221-kM6uNlotldAtturKmxsy2vw6'
}).startRTM()
controller.middleware.receive.use(rasa.receive);

/* this uses rasa middleware defined above */
controller.hears(['Greetings'], 'direct_message,direct_mention,mention', rasa.hears, function (bot, message) {
	
	getData(message.intent.name,function(response){
		bot.reply(message,{
                "type": "typing",
                "channel": message.channel,
                "user": message.user
        })
        bot.reply(message,{
                "type": "message",
                "text": response
        })
	});

})

controller.hears(['ThankYou'], 'direct_message,direct_mention,mention', rasa.hears, function (bot, message) {
	getData(message.intent.name,function(response){

		bot.reply(message,{
                "type": "typing",
                "channel": message.channel,
                "user": message.user
        })
        bot.reply(message,{
                "type": "message",
                "text": response
        })
	});
})

controller.hears(['AnythingElse'], 'direct_message,direct_mention,mention', rasa.hears, function (bot, message) {
	getData(message.intent.name,function(response){

		bot.reply(message,{
                "type": "typing",
                "channel": message.channel,
                "user": message.user
        })
        bot.reply(message,{
                "type": "message",
                "text": response
        })
	});
})

controller.hears(['NeverMind'], 'direct_message,direct_mention,mention', rasa.hears, function (bot, message) {
	console.log('empty none');
	console.log(message);
	getData(message.intent.name,function(response){

		bot.reply(message,{
                "type": "typing",
                "channel": message.channel,
                "user": message.user
        })
        bot.reply(message,{
                "type": "message",
                "text": response
        })
	});
})

controller.hears(['Capabilities'], 'direct_message,direct_mention,mention', rasa.hears, function (bot, message) {
	/*messages.type="typing";
	messages.channel = message.channel;
	messages.user = message.user;*/

	messages.attachments[0].fallback = "something went wrong";
	messages.attachments[0].color = "#F96302";
	messages.attachments[0].actions=[];
	messages.attachments[0].text = "";
	messages.text = "";
	messages.type="typing";
	 messages.response_type="in_channel";
	messages.isDelayedResponse = true
 getData(message.intent.name,function(response){
	messages.attachments[0].callback_id = message.intent.name;
	//plcae response here
	messages.text = response;
	
	//Device Lost, Order a Device, Swap a Device, Report Device Issue

	var Reports =["Device Lost","Order a Device","Swap a Device", "Report Device Issue"];
	for(var i=0;i<Reports.length;i++){
		var data = {        "name": "Report",
                            "text": Reports[i],
                            "type": "button",
                            //"color":"#F96302",
                            "style": "#F96302",
                            "value": i
                        }
						
		messages.attachments[0].actions.push(data);
						if(messages.attachments[0].actions.length == Reports.length){
	              	             bot.reply(message,{
                "type": "typing",
                "channel": message.channel,
                "user": message.user
        })
        bot.reply(message,messages);
							
						}
	}
	
	
	});
})
controller.hears(['Report'], 'direct_message,direct_mention,mention', rasa.hears, function (bot, message) {
	messages.attachments =[{}];
	messages.attachments[0].fallback = "something went wrong";
	messages.attachments[0].color = "#F96302";
	messages.attachments[0].actions=[];
	messages.response_type="in_channel";
	messages.replace_original = false;
getData(message.intent.name,function(response){
	messages.attachments[0].callback_id = message.intent.name;
	messages.text = "Sure I can help you with";
	messages.attachments[0].text = response;
	var devices =["iPhone","Surface","Apple MacBook"];
	for(var i=0;i<devices.length;i++){
		var data = {        "name": "Device",
                            "text": devices[i],
                            "type": "button",
                            "value": i
                        }
						
		messages.attachments[0].actions.push(data);
						if(messages.attachments[0].actions.length == devices.length){

		            bot.reply(message,{
                "type": "typing",
                "channel": message.channel,
                "user": message.user
        })
       bot.reply(message,messages);
							
						}
	}
	
	
	});
})
controller.hears(['Device'], 'direct_message,direct_mention,mention', rasa.hears, function (bot, message) {
	getData(message.intent.name,function(response){
		bot.reply(message,{
                "type": "typing",
                "channel": message.channel,
                "user": message.user
        })
        bot.reply(message,{
                "type": "message",
                "text": response
        })
	});
})



//for buttons
function sendMessageToSlackResponseURL(responseURL, jsonMessage){
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: jsonMessage
    }
    request(postOptions, (error, response,body) => {
        if (error){
			console.log(error);
			mailOptions.to = "";
            // handle errors as you see fit
        }else{
mailOptions.to = "";
		}
    })
};


					
					
					 
app.post('/slack/actions', urlencodedParser, (req, res) =>{
	res.status(200).end()
	 var actionJSONPayload = JSON.parse(req.body.payload);
	if(actionJSONPayload.actions[0].name == "Report"){
		var option = messages.attachments[0].actions[actionJSONPayload.actions[0].value].text;
		 messages.attachments[0].actions=[];
		 messages.replace_original = true;
		 messages.attachments[0].text = "Sure, I can help you with "+option // +response;
		  messages.response_type="in_channel";
		messages.isDelayedResponse = true
		sendMessageToSlackResponseURL(actionJSONPayload.response_url, messages);
	
	getData(actionJSONPayload.actions[0].name,function(response){
    messages.attachments[0].callback_id = actionJSONPayload.actions[0].name;
	var devices =["iPhone","Surface","Apple MacBook"];
	for(var i=0;i<devices.length;i++){
		var data = {       "name":"Device",
                            "text": devices[i],
                            "type": "button",
                            "value": i
                        }
						
	     	      messages.attachments[0].actions.push(data);
						if(messages.attachments[0].actions.length == devices.length){
							
							if(response == actionJSONPayload.original_message.attachments[0].text){
								messages.attachments[0].text = response;
								messages.replace_original = false;
								// need to test
							}
							else{
								
							//messages.attachments[0].pretext = messages.attachments[0].text;
							messages.attachments[0].text =""
							messages.text = response;
								messages.replace_original = false;
							}
		  
			sendMessageToSlackResponseURL(actionJSONPayload.response_url, messages);				
						}
	}
	
	});
		
	}
	else{
		
        var option = messages.attachments[0].actions[actionJSONPayload.actions[0].value].text;
         messages.attachments[0].actions=[];
        
		 messages.attachments[0].text = "Sure, let me initiate a request for your "+option // +response;
		 messages.replace_original = true;
		
		sendMessageToSlackResponseURL(actionJSONPayload.response_url, messages);
mailOptions.to = actionJSONPayload.user.name+"@homedepot.com";
mail.sendMail(mailOptions,function(err,info){
		 if(err){
		console.log(err);
    }
    else{
		getData(actionJSONPayload.actions[0].name,function(response){
			messages.replace_original = false;
		messages.text = "I have initiated a request, you will receive an email soon."+response+"<https://www.miraclesoft.com|here>";
		messages.attachments[0].text = "";
	sendMessageToSlackResponseURL(actionJSONPayload.response_url, messages);
	})
	}
	});

	}
	
})


app.listen(process.env.PORT || 3000,function(){
	
	console.log('running on port 3000');
})


