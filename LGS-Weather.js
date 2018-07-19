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
		//"https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css"
		];
    },
    getScripts: function() {
        return [
		"moment.js", 
		"fontawesome-all.js",
		//"https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/js/bootstrap.min.js"
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
        this.forecast = {};
	    this.forecast2 = {};
        this.air = {};
        this.srss = {};
        //this.alert = [];
	    this.amess = [];
        this.map = [];
        this.city = {};
        this.clphase = {};
        this.current = {};
        this.allDay = {};
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


    

    getDomInside: function(){
        	var reading = this.lastReading;
		

        var weatherTable = document.createElement("table");
        weatherTable.classList.add("table");
		
		var temperatureIcon = document.createElement("i");
		var humidityIcon = document.createElement("i");
		
		temperatureIcon.className = "fas fa-thermometer-half";
		humidityIcon.className = "fas fa-tint";
		
		temperatureIcon.setAttribute("color", "#e2fdec");
		humidityIcon.setAttribute("color", "#e2fdec");
		

        var forecastRow = document.createElement("tr");

        var second = document.createElement("th");
        second.setAttribute("colspan", 2);
	second.appendChild(temperatureIcon);
        forecastRow.appendChild(second);

        var third = document.createElement("th");
	third.setAttribute("colspan", 2);
        third.appendChild(humidityIcon);
        forecastRow.appendChild(third);
      
        var TDrow = document.createElement("tr");
        TDrow.classList.add("xsmall", "bright");

        var td2 = document.createElement("td");
 	td2.setAttribute("colspan", 2);     
        TDrow.appendChild(td2);

        var td3 = document.createElement("td");
	td3.setAttribute("colspan", 2);       
        TDrow.appendChild(td3);
        

        if (reading){
			td2.innerHTML = reading.temperature+"&#8451;";
			td3.innerHTML = reading.humidity+"%";
		}
		else{
			wrapper.innerHTML = "Initializing...";
	}

	weatherTable.appendChild(forecastRow);
	weatherTable.appendChild(TDrow);
	var wrapper = document.createElement("tr");
	var cell = document.createElement("td");
	cell.setAttribute("colspan", 4);
	cell.appendChild(weatherTable);
	wrapper.appendChild(cell);
	return wrapper;
    },

    getSuSd: function() {
	var weatherTable = document.createElement("table");
        weatherTable.classList.add("table");

	var SUSymbol = document.createElement("img");
	var SDSymbol = document.createElement("img");
     
	SUSymbol.id = "x";
	SUSymbol.src = "modules/LGS-Weather/images/icons/Sunrise.png";
	SUSymbol.width = 30;
	SUSymbol.height = 30;

	SDSymbol.id = "y";
	SDSymbol.src = "modules/LGS-Weather/images/icons/Sunset.png";
	SDSymbol.width = 30;
	SDSymbol.height = 30;

	var midRow = document.createElement("tr");
 
        var sunup = document.createElement("th");
	sunup.setAttribute("colspan", 2);
	sunup.appendChild(SUSymbol);
        midRow.appendChild(sunup);


	var sunDown = document.createElement("th");
	sunDown.setAttribute("colspan", 2);
	sunDown.appendChild(SDSymbol);
        midRow.appendChild(sunDown);


        weatherTable.appendChild(midRow);

        var srss = this.srss;
        var sunrise = srss.sunrise;
        var sunset = srss.sunset;
        var utcsunrise = moment.utc(sunrise).toDate();
        var utcsunset = moment.utc(sunset).toDate();
	var sunrise = config.timeFormat == 12 ? moment(utcsunrise).local().format("h:mm A") : moment(utcsunrise).local().format("HH:mm");
	var sunset = config.timeFormat == 12 ? moment(utcsunset).local().format("h:mm A") : moment(utcsunset).local().format("HH:mm");

	var convertedTimeSr = parseInt(sunrise);
	var convertedTimeSs = parseInt(sunset);

        var Midrow = document.createElement("tr");
        Midrow.classList.add("xsmall", "bright");
        Midrow.setAttribute('style', 'line-height: 30%;');

        var SU = document.createElement("td");
	SU.setAttribute("colspan", 2);
        SU.innerHTML = sunrise;
        Midrow.appendChild(SU);


        var SD = document.createElement("td");
	SD.setAttribute("colspan", 2);
        SD.innerHTML = sunset;
        Midrow.appendChild(SD);

        weatherTable.appendChild(Midrow);


	var wrapper = document.createElement("tr");
	var cell = document.createElement("td");
	cell.setAttribute("colspan", 4);
	cell.appendChild(weatherTable);
	wrapper.appendChild(cell);
	return wrapper;
    },

    getDom: function() {


        var wrapper = document.createElement("div");

	

        var current = this.current;

        var d = new Date();
        var n = d.getHours();

        //var curCon = document.createElement("div");
    	
        //wrapper.appendChild(curCon);

	var reading = this.lastReading;


        var cur = document.createElement("div");

	cur.classList.add("weather-table");
	
	var weatherImage = document.createElement("img");
	var topTemperature = document.createElement("div");
	var weatherText = document.createElement("div");
	
	weatherText.innerHTML = current.weather;

	weatherText.classList.add("medium");
	cur.classList.add("weather-header", "bright");
	
	topTemperature.classList.add("weather-temperature", "large", "tempf");
	
	if (reading){
		topTemperature.innerHTML = Math.round(reading.temperature) + "&deg;";			
	}	


	weatherImage.classList.add("icon2", "small", "bright", "img");
	var dayImageSrc = 'modules/LGS-Weather/images/' + current.icon + '.png';
	var nightImageSrc = 'modules/LGS-Weather/images/nt_' + current.icon + '.png';
	weatherImage.src = (n < 22 && n > 6) ? dayImageSrc : nightImageSrc;

	cur.appendChild(weatherText);
	cur.appendChild(weatherImage);
	cur.appendChild(topTemperature);
        cur.setAttribute('style', 'line-height: 105%;');
   	wrapper.appendChild(cur);

        var top = document.createElement("div");

	var weatherTable = document.createElement("table");
        weatherTable.classList.add("table");
	weatherTable.classList.add("weather-table");

        weatherTable.appendChild(this.getSuSd());

        top.appendChild(weatherTable);
        wrapper.appendChild(top);
	

        var forecastRow = document.createElement("tr");

        var second = document.createElement("th");
        var tempSymbol = document.createElement("img");
		
	tempSymbol.src = "modules/LGS-Weather/images/icons/Regen.png";
	tempSymbol.width = 30;
	tempSymbol.height = 30;
        second.appendChild(tempSymbol);
        forecastRow.appendChild(second);

        var third = document.createElement("th");
        var currentHSymbol = document.createElement("img");

	currentHSymbol.src = "modules/LGS-Weather/images/icons/Feuchtigkeit.png";
	currentHSymbol.width = 30;
	currentHSymbol.height = 30;
        third.appendChild(currentHSymbol);
        forecastRow.appendChild(third);

        var fourth = document.createElement("th");
        var currentWindSymbol = document.createElement("img");
	
        currentWindSymbol.src = "modules/LGS-Weather/images/icons/Windgeschiwndigkeit.png";
	currentWindSymbol.width = 30;
	currentWindSymbol.height = 30;
        fourth.appendChild(currentWindSymbol);
        forecastRow.appendChild(fourth);

        weatherTable.appendChild(forecastRow);

        var TDrow = document.createElement("tr");
        TDrow.classList.add("xsmall", "bright");

        var td2 = document.createElement("td");
        td2.innerHTML = current.rain_probability;
        TDrow.appendChild(td2);
        weatherTable.appendChild(TDrow);

        var td3 = document.createElement("td");
	if (reading) {
		td3.innerHTML = reading.humidity + "%";
	}
        TDrow.appendChild(td3);
        weatherTable.appendChild(TDrow);

        var td5 = document.createElement("td");
        td5.innerHTML = current.wind_mph;
        TDrow.appendChild(td5);
        weatherTable.appendChild(TDrow);

        ////// FORECAST ROWS ///////////////////////////////// 

        var ForecastTable = document.createElement("table");
        ForecastTable.classList.add("table")
        ForecastTable.setAttribute('style', 'line-height: 20%;');
	ForecastTable.setAttribute("style", "padding-top: 30px;");

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


        var nextRow = document.createElement("tr");
        for (i = 0; i < this.forecast.length; i++) {
            var noaa = this.forecast[i];
            var wdshort = document.createElement("td");
            wdshort.classList.add("xsmall", "bright");
            wdshort.setAttribute("style", "padding:10px");
    	    wdshort.innerHTML = (this.translate(noaa.date.weekday_short) == n) ? this.translate("Today") : this.translate(noaa.date.weekday_short);
            nextRow.appendChild(wdshort);
            ForecastTable.appendChild(nextRow);
        }

        var foreRow = document.createElement("tr");
        for (i = 0; i < this.forecast.length; i++) {
            var noaa = this.forecast[i];
            var fore = document.createElement("td");

            fore.setAttribute("colspan", "1");
            fore.innerHTML = "<img src='modules/LGS-Weather/images/" + noaa.icon + ".png' height='22' width='28'>";
            foreRow.appendChild(fore);
            ForecastTable.appendChild(foreRow);
        }

        var tempRow = document.createElement("tr");
        for (i = 0; i < this.forecast.length; i++) {
            var noaa = this.forecast[i];
            var temper = document.createElement("td");
            temper.setAttribute("colspan", "1");
            temper.classList.add("xsmall", "bright");
            temper.innerHTML = (config.units != "metric") ? noaa.high.fahrenheit + "/" + noaa.low.fahrenheit : noaa.high.celsius + "/" + noaa.low.celsius;
            tempRow.appendChild(temper);
            ForecastTable.appendChild(tempRow);

        }

        wrapper.appendChild(ForecastTable);

        
        return wrapper;

    }, 
});