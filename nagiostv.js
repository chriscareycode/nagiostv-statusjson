(function() {

	// preload ember templates so we don't need them in index.htm <body>
	var loadTemplate = function(thefile) {
        $.ajax({
            type: "GET",
            url: thefile,
            success: function(data) {
                $(data).filter('script[type="text/x-handlebars"]').each(function() {
                    templateName = $(this).attr('data-template-name');
                    Ember.TEMPLATES[templateName] = Ember.Handlebars.compile($(this).html());
                });
            },
            async:false
        });
    }
    loadTemplate("nagiostv.html");

	// Create the EmberJS Application
	window.App = Ember.Application.create({});

	// EmberJS Routing
	App.Router.map(function() {
	  this.route("index", { path: "/" });
	});
	
	// Application Route
	App.ApplicationRoute = Ember.Route.extend({
	  setupController: function(controller) {
	  	//console.info('ApplicationRoute');
	  }
	});
	
	
	App.ServiceThing = Ember.Object.extend({
	
	
		service_plugin_output_clean: function() {
			var encoded = this.get('service_plugin_output');
			var div = document.createElement('div');
			div.innerHTML = encoded;
			var decoded = div.firstChild.nodeValue;
			//return $('<div/>').text(output).text();
			return decoded;
		}.property('service_plugin_output'),
		
		statusClassBorder: function() {
			var cc = "";
			switch(this.get('service_status')) {
				case "WARNING":
					cc = "service-warning-border";
					break;
				case "CRITICAL":
					cc = "service-critical-border";
					break;
				default:
					cc = "";
			}
			return cc;
		}.property('service_status'),
		
		statusClassText: function() {
			var cc = "";
			switch(this.get('service_status')) {
				case "WARNING":
					cc = "service-warning-text";
					break;
				case "CRITICAL":
					cc = "service-critical-text";
					break;
				default:
					cc = "";
			}
			return cc;
		}.property('service_status')
		
	});
	
	App.FooController = Ember.ObjectController.extend({
		service_plugin_output_clean: function() {
			//console.info('service_plugin_output_clean');
    		return "10";
  		}.property('service_plugin_output')
	});
	
	
	// Application Controller
	App.ApplicationController = Ember.ArrayController.extend({
	  
	  	itemController: 'foo',
	  	
		content:[],
		arr_service_problems: [],
		arr_service_problems_acked: [],
		arr_service_history: [],
		
		json_service_problems:{},
		
		title:'NagiosTV status-json edition',
	  
		doIt: function() {
			var that = this;
			console.info('doIt()');
			$.ajax({
				type: "POST",
				url: "api.php",
				data: "func=versioncheck&client_version="+that.get('versionCurrent'),
				dataType: "json",
				timeout: 5000,
				error: function(data1, data2) {
					console.log('versionCheck() Error getting version');
				},
				success: function(data){
					//console.log('VersionCheck success');	
				}
			});
		},
				
		getIt: function() {
			var that = this;
			//console.info('getIt()');
			$.ajax({
				type: "GET",
				url: "/cgi-bin/nagios3/status-json.cgi?host=all&servicestatustypes=28&hoststatustypes=15",
				//data: "func=versioncheck&client_version="+that.get('versionCurrent'),
				dataType: "json",
				timeout: 5000,
				error: function(data1, data2) {
					console.log('getIt() Error');
				},
				success: function(data){
					//console.log('getIt() success');
					that.chompIt(data);
				}
			});
		},
		
		chompIt: function(food) {
			//console.info('chompIt()');
			//console.dir(food);
			this.set('json_service_problems', food);
			var arr = this.get('arr_service_problems');
			var acked = this.get('arr_service_problems_acked');
			//console.dir(arr);
			
			// add new items into the array
			for(var i=0;i<food.services.length;i++){
				//console.info('looping');
				var size = Object.size(food.services[i]);
				//console.info(size);
				if (size > 0) {
				
					if (food.services[i].service_problem_has_been_acknowledged) {
					
						// duplicate check before we add the item into the array
						var match = false;
						for(var j=0;j<acked.length;j++){							
							if (food.services[i].service_host.host_name === acked[j].service_host.host_name &&
								
								food.services[i].service_description === acked[j].service_description) {
								//update the clock from the match
								acked[j].service_state_duration = food.services[i].service_state_duration
								match = true;
							}
						}
						if (match === false) acked.addObject(food.services[i]);
						
						
						
						
					} else {
					
						// duplicate check before we add the item into the array
						var match = false;
						for(var j=0;j<arr.length;j++){
							//console.info(arr[j].service_host);
							//console.info(food.services[i].service_host.host_name);
							if (typeof(arr[j].service_host) === "undefined") continue;		
							if (typeof(food.services[i].service_host) === "undefined") continue;		
							if (food.services[i].service_host.host_name === arr[j].service_host.host_name &&
								
								food.services[i].service_description === arr[j].service_description) {
								//update the clock from the match
								//console.info(arr[j].service_state_duration);
								//console.info(food.services[i].service_state_duration);
								
								//arr.insertAt(j, food.services[i]);
								//arr.removeAt(j+1);
								
								
								//Ember.set(arr[j].service_state_duration, food.services[i].service_state_duration);
								//arr[j].service_state_duration = food.services[i].service_state_duration
								arr[j].set('service_state_duration', food.services[i].service_state_duration);
								arr[j].set('service_status', food.services[i].service_status);
								arr[j].set('service_plugin_output', food.services[i].service_plugin_output);
								//arr[j] = food.services[i];
								//arr.replace(j,1,food.services[i]);
								
								match = true;
							}
						}
						if (match === false) {
							var st = App.ServiceThing.create();
							st.set('service_host', food.services[i].service_host);
							st.set('service_status', food.services[i].service_status);
							st.set('service_description', food.services[i].service_description);
							st.set('service_state_duration', food.services[i].service_state_duration); 
							st.set('service_plugin_output', food.services[i].service_plugin_output); 
							//service_plugin_output
							//arr.addObject(Ember.Object.create(food.services[i]));
							arr.addObject(st);
						}
					}
					
				}
				
				
				
			}
			// remove items from the array which are now gone
			
			
			for(var i=0;i<arr.length;i++){
			
				var match = false;	
				
				for(var j=0;j<food.services.length;j++){
					if (typeof(arr[i]) === "undefined") continue;		
					if (typeof(arr[i].service_host) === "undefined") continue;	
					if (typeof(food.services[j].service_host) === "undefined") continue;
					if (food.services[j].service_host.host_name === arr[i].service_host.host_name &&
						
						food.services[j].service_description === arr[i].service_description) match = true;
					
				}
				//if (match === true) console.info('found you. you are safe!');
				if (match === false) {
					//slideup
					//console.info('bye bye');
					//$().slideUp(function(){
						arr.removeAt(i);
						//arr[i].removeObject();
					//});
					
				}
			}
			
						
						
			
			
			//var arr = this.get('arr_service_problems');
			
			//console.info('now we have '+arr.length+' items in the array');
			
		}
		
		
	});
	
	App.SomeView = Ember.View.extend({
	  templateName:'someview',
	  interval: null,
	  
	  didInsertElement: function(){
	  	//console.info('didInsertElement');
	  	//console.info();
	  	//this.get('controller').doIt();
	  	
	  	
	  	var that = this;
	  	
	  	this.get('controller').getIt();
	  	//getIt();
	  	var st = setInterval(function(){
	  		that.get('controller').getIt();
	  	}, 10000);
	  	
	  	this.set('interval', st);
	  	
	  }
	});
	
	App.ServiceProblem = Ember.View.extend({
		templateName:'service_problem',
		classNames:'displayNone',
	
		didInsertElement: function(){
			//console.info('App.ServiceProblem didInsertElement()');  	
			this.$().slideDown();
		},
		
		statusClass: function(){
			console.info('statusClass2');
			console.info(this.service_status);
			return this.service_status;
		}.property('content.service_status')
	});
	
	
	App.ServiceProblemController = Ember.ArrayController.extend({
		
		statusClass: function(){
			//console.info('statusClass1');
			//console.info(this.service_status);
			return this.service_status;
		}.property('this.service_status'),
		
		service_plugin_output_clean: function(e) {
		
			return e;
		
		}.property('this.service_plugin_output_clean')
		
	});
	
	

	Object.size = function(obj) {
    	var size = 0, key;
    	for (key in obj) {
        	if (obj.hasOwnProperty(key)) size++;
    	}
    	return size;
	};
	


	//$(function() {
	//});


})();