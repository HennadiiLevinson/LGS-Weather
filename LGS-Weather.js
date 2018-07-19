/* Magic Mirror
 * Module: LGS-Weather
 * By cowboysdude and tbbear 
        modified by barnosch
 */
var c = 0;
var l = 1;
var loco = "";
"use strict";

Module.register("LGS-Weather", {

    // Module config defaults.
    defaults: {
        updateInterval: 100 * 60 * 1000, // every 1 minutes
        animationSpeed: 10,
        initialLoadDelay: 8000,
        rotateInterval: 2000 * 1000,
        maxWidth: "100%",
        apiKey: "",
        airKey: "",
	loco1: "xxx",
	loco2: "xxx",
	loco3: "xxx",
	pws: "XXX",
	pws1: "xxx",
	pws2: "xxx",
	pws3: "xxx",

	   langFile: {
            "en": "en-US",
            "de": "de-DE",
            "sv": "sv-SE",
            "es": "es-ES",
            "fr": "fr-FR",
            "zh_cn": "zh-CN",
            "da": "da",
            "nl": "nl-NL",
            "nb": "nb-NO"
        },


        langTrans: {
            "en": "EN",
            "de": "DL",
            "sv": "SW",
            "es": "SP",
            "fr": "FR",
            "zh_cn": "CN",
            "da": "DK",
            "nl": "NL",
            "nb": "NO",
        },

	levelTrans: {
        "1":"green",
		"2":"yellow",
		"3":"orange",
		"4":"red",
	}				

    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            da: "translations/da.json",
            sv: "translations/sv.json",
            de: "translations/de.json",
            es: "translations/es.json",
            fr: "translations/fr.json",
            zh_cn: "translations/zh_cn.json",
            nl: "translations/nl.json",
            nb: "translations/nb.json"
        };
    },



    getStyles: function() {
        return [
		"LGS-Weather.css", 
		"weather-icons.css",
		"bootstrap.min.prefixed.css"		
		];
    },
    getScripts: function() {
        return [
		"moment.js", 
		"fontawesome-all.js",
		"jquery-3.3.1.js",
		"bootstrap.min.prefixed.js"
		];
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.activeItem = 0;
        this.rotateInterval = null;
        this.updateInterval = null;
        this.config.lang = this.config.lang || config.language; //automatically overrides and sets language :)
        this.config.units = this.config.units || config.units;
        this.sendSocketNotification("CONFIG", this.config);
		this.scheduleUpdate();

        // Set locale.  
        var lang = this.config.langTrans[config.language];
	l = 1;
	loco = this.config.loco1;
	this.config.pws = this.config.pws1; 
        this.forecast = [];
	    this.forecast2 = {};
        this.air = {};
        this.srss = {};
        //this.alert = [];
	    this.amess = [];
        this.map = [];
        this.city = {};
        this.clphase = {};
        this.current = {};
        this.allDay = {};//all night
        this.today = "";
        
    }, 

    processNoaa: function(data) {
	c = 0;
        this.current = data.current;
        this.forecast = data.forecast;
		console.log(this.current, this.forecast);
    },

    processSRSS: function(data) {
        this.srss = data.results;
    },

    processAIR: function(data) {
        this.air = data.data.current.pollution;
    },

	
    scheduleCarousel: function() {
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(self.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getNOAA();
        }, this.config.updateInterval);
        this.getNOAA(this.config.initialLoadDelay);
    },

    getNOAA: function() {
        this.sendSocketNotification("GET_NOAA");
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NOAA_RESULT") {
            this.processNoaa(payload);
        }
        if (notification === "SRSS_RESULTS") {
            this.processSRSS(payload);
        }
        
        if (this.rotateInterval == null) {
                this.scheduleCarousel();
        }
	if (notification === "NEW_READING") {
            this.lastReading = payload;
        }
        this.updateDom(this.config.animationSpeed);
    },

    /////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_NOAA') {
            this.hide(100);
            this.updateDom(300);
        } else if (notification === 'SHOW_NOAA') {
            this.show(100);
            this.updateDom(300);
        }  else if (notification === 'NEXT_NOAA') {
            //this.doact();
	}
    },


 

    getSuSd: function() {
	
	
	
	return [iconsRow, valuesRow];
    },

    getDom: function() {
	
	function create(el){ return document.createElement(el)}
	function wrapper(children){
		var el = create("div");
		el.classList.add("tb-container");
		children.forEach(c => el.appendChild(c));
		return el;
	}
	function row(children){
		
		var el = create("div");
		el.classList.add("tb-row");
		children.forEach(c => c.classList.add("tb-text-center", "tb-col-xs-"+parseInt(12/children.length)));
		children.forEach(c => el.appendChild(c));
		return el;
	}
	function col(arg){
		
		var el = create("div");
		
		if (arg instanceof Array){
			
			arg.forEach(c => el.appendChild(c));
		}
		else{
			
			el.innerHTML = arg;
		}
		return el;
	}
	function img(src, cls){
		var el = create("img");
		el.src = src;
		el.classList.add(cls);
		return el;
	}

	function classAdder(cls){
		return function(el){
			el.classList.add(cls);
			return el;
		}
	}

	var addSmallTextClass = classAdder("text-weather-info");

	var smIconCls = "icon3";
        var d = new Date();
        var n = d.getHours();
	var reading = this.lastReading;
	var current = this.current;
	
	var dayImageSrc = 'modules/LGS-Weather/images/' + current.icon + '.png';
	var nightImageSrc = 'modules/LGS-Weather/images/nt_' + current.icon + '.png';
	var weatherImageSrc = (n < 22 && n > 5) ? dayImageSrc : nightImageSrc;
	
	var weatherImage = img(weatherImageSrc, "icon2");
	var topTemperature = document.createElement("div");
	var weatherText = document.createElement("div");
	
	weatherText.innerHTML = current.weather;
	weatherText.classList.add("medium", "weather-header", "bright");
	
	topTemperature.classList.add("weather-temperature", "large", "tempf");
	
	if (reading){
		topTemperature.innerHTML = Math.round(reading.temperature) + "&deg;";			
	}	

	
	var imgAndTemp = document.createElement("div");
	imgAndTemp.appendChild(weatherImage);
	imgAndTemp.appendChild(topTemperature);
	
	
	var headerCol = col([weatherText, imgAndTemp]);
	var headerRow = row([headerCol]);
	
        var SUSymbol = img("modules/LGS-Weather/images/icons/Sunrise.png", smIconCls);
	var SDSymbol = img("modules/LGS-Weather/images/icons/Sunset.png", smIconCls)
    
	
	var srssIconsRow = row([
		col([SUSymbol]),
		col([SDSymbol])
	]);



        var srss = this.srss;
        var sunrise = srss.sunrise;
        var sunset = srss.sunset;
        var utcsunrise = moment.utc(sunrise).toDate();
        var utcsunset = moment.utc(sunset).toDate();
	var sunrise = config.timeFormat == 12 ? moment(utcsunrise).local().format("h:mm A") : moment(utcsunrise).local().format("HH:mm");
	var sunset = config.timeFormat == 12 ? moment(utcsunset).local().format("h:mm A") : moment(utcsunset).local().format("HH:mm");

	var srssValuesRow = row([
		addSmallTextClass(col(sunrise)),
		addSmallTextClass(col(sunset))
	]);
	

        var currentHSymbol = img("modules/LGS-Weather/images/icons/Feuchtigkeit.png", smIconCls);
	var tempSymbol = img("modules/LGS-Weather/images/icons/Regen.png", smIconCls);
	
        var currentWindSymbol = img("modules/LGS-Weather/images/icons/Windgeschiwndigkeit.png", smIconCls);


	var currentForecastIconsRow = row([
		col([tempSymbol]), 
		col([currentHSymbol]), 
		col([currentWindSymbol])
		]); 

	var currentForcastValuesRow = row([
		addSmallTextClass(col(current.rain_probability)),
		addSmallTextClass(col(reading ? parseInt(reading.humidity) + "%" : "")),
		addSmallTextClass(col(current.wind_mph))
	]);        

        ////// FORECAST ROWS ///////////////////////////////// 

        var d = new Date();
        var weekday = new Array(7);
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

        var n = this.translate(weekday[d.getDay()]);
	var self = this;
	var weekForcastDaysRow = row(
		self.forecast.map(
			(noaa) =>
			(self.translate(noaa.date.weekday_short) == n) ? 
				self.translate("Today") : 
				self.translate(noaa.date.weekday_short)
            
		).map(col).map(classAdder("text-weather-info"))
	);

	var weekForcastIconsRow = row(
		self.forecast.map(
			(noaa) =>
			"<img src='modules/LGS-Weather/images/" + 
			noaa.icon + ".png' class='"+smIconCls+"'>"            
		).map(col).map(classAdder("text-weather-info"))
	);
        
	var weekForcastValuesRow = row(
		self.forecast.map(
			(noaa) =>
			(config.units != "metric") ? 
			noaa.high.fahrenheit + "/" + noaa.low.fahrenheit : 
			noaa.high.celsius + "/" + noaa.low.celsius
                   
		).map(col).map(classAdder("text-weather-info"))
	);
        

 	
        
        return wrapper([
		headerRow,
		srssIconsRow,
		srssValuesRow,
		currentForecastIconsRow,
		currentForcastValuesRow,
		weekForcastDaysRow,
		weekForcastIconsRow,
		weekForcastValuesRow
			
	]);

    }, 
});