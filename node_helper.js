"use strict";
var rf = require("nrf24");
var NodeHelper = require("node_helper");


module.exports = NodeHelper.create(
{
	
	start: function() {
		
		console.log("Starting module: " + this.name);
		var rfo=new rf.nRF24(22,0);
		this.rfo = rfo;
		//this.sendNotification("hello")
		
		console.log("Starting RADIO  ->" + rfo.begin(true));
		console.log("Chip is present ->" + rfo.present());
		
		//this.sendSocketNotification("NEW_READING", {temperature:5,humidity:10});

		rfo.config({PALevel:rf.RF24_PA_MAX,DataRate:rf.RF24_1MBPS});
		var pipe = "0x65646f4e31";
		rfo.addReadPipe(pipe,true) // "2Node" + autoACK
		
		console.log("Opened reading pipe for address:" + pipe);
		console.log("Waiting incoming frames...");

		var self = this;

		//var sendSocketNotification = this.sendSocketNotification

		
		//sendSocketNotification("NEW_READING", {temperature:5,humidity:10});
		

		var onNewData=function(d,pipe) {  
		     var t=d.readFloatLE(0);
		     var h=d.readFloatLE(4);
		     
		     console.log(">Read on pipe " + rfo + " t: " + t + " h: "+h);
		     self.sendSocketNotification("NEW_READING", {temperature:t, humidity:h});
		
		   }
		rfo.read(
			
		   onNewData,
		
		   function() { 
		     console.log("stopped");
		   }
		);

	},

	socketNotificationReceived: function(notification, payload) {

		 console.log("helper received: " + notification);
		 //this.helperFunc();
	},
	
	
	/*helperFunc: function() {

        	this.sendSocketNotification("NEW_READING", {temperature:5,humidity:10});
    	}*/
	
	
});
