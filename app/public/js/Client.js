(function() {
	var OnaClient = (function () {
		var FORMS_URL= 'forms'
		// OnaAPI Client
		var Client = function(obj) {
			// Rasie exception that no token provided OR URL is Provided
			if (( obj.url === undefined) || (obj.token === undefined)){
				throw("Create Client does not meet requirements");
			}
			this.url = _cleanURL(obj.url);
			this.token = obj.token;

		};

		Client.prototype.setToken = function(authToken, tempToken) {
			this.authToken = authToken;
			this.tempToken = tempToken;
			if (( this.authToken === undefined) && (this.tempToken === undefined)){
				throw('No Token Provided');
			}
		};

		Client.prototype.getData = function(formid,callback){
			_get(this.url+'/data/'+formid+'.json',function(data){
				callback(data);
			});
		}

		// Return a formated list of forms with formID, url, title
		Client.prototype.getForms = function(callback){
			var self = this;
			if (this.formList === undefined){
				_get(this.url+FORMS_URL,function(data){
					self.formList = data.map(_formatForm);
					callback(self.formList);
				});
			}else{
				callback(self.formList)
			}
		}

		//Get the attributes of a single form
		Client.prototype.getFormById = function(formid,callback){
			var self = this;
			if (this.formList === undefined){
				this.getForms(function(data){
					self.getFormById(formid,callback)
				});
			}else{
				//Formlist has been created
				for (var i = 0; i < this.formList.length; i++) {
					if(formid === this.formList[i].formid){
						if (!self.formList[i].children){
							_get(this.formList[i].url,function(data){
									self.formList[i].children = data.children;
									console.log('Request')
									callback(self.formList[i]);
							});
						}else{
								console.log(' NO Request');
									callback(self.formList[i]);
						}

						break
					}else{
						callback("NO Match")
					}
				}
			}
		}

		function _formatForm(form){
			return {
				formid:form.formid,
				title:form.title,
				url:form.url +'/form.json'
			}
		}

		//Clean, and standarized with slashs
		var _cleanURL = function(url){
			return url
		}
		var _get = function(url,callback){
			$.get(url, function (data) {
			  // if (!error && response.statusCode == 200) {
					callback(data);
			  // }else{
				// 	throw("Request Error");
				// }
			});
		}
		return Client;
	}());

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
		module.exports = OnaClient;
	}else
		window.OnaClient = OnaClient;

})();
