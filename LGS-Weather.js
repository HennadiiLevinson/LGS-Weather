/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("helloworld",{

	start: function() {
		
		this.sendSocketNotification("NEW_READING", {"test":"test"});
		Log.log("Starting module: " + this.name);

	},

	// Default module config.

	socketNotificationReceived: function(notification, payload) {

		Log.log(this.name + " received a Socket Notification: " + notification);
		var self = this;
		
		self.lastReading = payload;
		self.updateUI();	
	
	},

	updateUI: function () {
		this.updateDom();
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "w-wrapper large bright light";
		var reading = this.lastReading;
		
		var temperatureNode = document.createElement("div");
		var humidityNode = document.createElement("div");
		
		var temperatureIcon = document.createElement("i");
		var humidityIcon = document.createElement("i");
		var temperatureValue = document.createElement("span");
		var humidityValue = document.createElement("span");	
        	
		temperatureNode.appendChild(temperatureIcon);
		temperatureNode.appendChild(temperatureValue);
		temperatureIcon.className = "fas fa-thermometer-half";
		humidityNode.appendChild(humidityIcon);
		humidityNode.appendChild(humidityValue);
		humidityIcon.className = "fas fa-tint";
		
		var box = document.createElement("div");
		
		wrapper.appendChild(box);
		
		box.appendChild(temperatureNode);
		box.appendChild(humidityNode);

		box.className = "w-box";	

		temperatureNode.className += "w-node";
		humidityNode.className += "w-node";

		//temperatureIcon.className += "w-icon";
		//humidityIcon.className += "w-icon";

		temperatureValue.className += "w-value";
		humidityValue.className += "w-value";
		

		if (reading){
			temperatureValue.innerHTML = reading.temperature+"&#8451;";
			humidityValue.innerHTML = reading.humidity+"%";
		}
		else{
			wrapper.innerHTML = "Initializing...";
		}
		return wrapper;
	},

	
	notificationReceived: function (notification, payload, sender) {
		if (sender) {
			Log.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name);
		} else {
			Log.log(this.name + " received a system notification: " + notification);
		}
	},
	getStyles:function(){ return [ "weather.css"]; },


getScripts: function() {
	return [
		'fontawesome-all.js', // will try to load it from the vendor folder, otherwise it will load is from the module folder.
	]
}		
});
