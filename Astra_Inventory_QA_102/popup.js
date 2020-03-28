chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
	function(tabs){
		var allChannels = [];
		getAllChannels();
      
      	var currentUrl = tabs[0].url.split('?')[0];
      	var url = "https://exampleURL.ru/?".concat(currentUrl);
		
	  	appendElem('load', 'Loading');

	  	fetch(url, {
	  		method: "get"
	  	}).then(function(response){

	  		if(!response.ok && response.status != 200) {

				var err = `${response.status} \': \' ${response.statusText}`;
			  	appendElem('err', err);
			} else { return response.json();}
	  	}).then(function(data){
	  		document.getElementById("load").remove();

			if (data.index_date != "no date") {
				displayIndexDate(data);
				displayWords(data);
				
			}

			displayCats(data.channels);

			if (data.channels.length == 0) {
				catchingIndexingError(data);
				
			}
			addButton(data);
	  	}).catch(function(error){
	  		console.log(error);
	  	})

		adverts();
		
		function displayIndexDate(json) {
			monthA = 'января,февраля,марта,апреля,мая,июня,июля,августа,сентября,октября,ноября,декабря'.split(',');
			var index_date = json.index_date;

			date = new Date(index_date);
			
			year = date.getFullYear();
			month = date.getMonth();
			day = date.getDate();
			hour = date.getHours();
			minute = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

			strIndexDate = day + " " + monthA[month].substring(0,3) + " " + year + " " +  hour + ":" + minute;

			var div = document.querySelector('.indexDate');
	        div.innerHTML = strIndexDate;
		}


		function addButton(json) {

			var wlbsdiv = document.querySelector('.wlbs');
			if (wlbsdiv.innerHTML == "") {

				wlbsdiv.innerHTML = "Страница не в WLBS каналах!";
				errorStyling(wlbsdiv); 

				var currentHost = extractHostname(tabs[0].url.split('?')[0]);
				var channelName = currentHost;

				timeout();

				function wlb() {
					for (var i = 0; i < allChannels.length; i++) {
						if ((allChannels[i].Name).includes(channelName) && (allChannels[i].Name).includes("WLBS")) {	
							var name = allChannels[i].Name;
							var chanId = allChannels[i]._id.$oid;
							displayButton(chanId, name);

							var urlToReq = "https://exampleURL.ru/?" + currentUrl + "&chanel_id=" + allChannels[i].OverallId;

							fetch(urlToReq, {
								method: "get",
							}).then(function(response){
								return response.json();
							}).then(function(data){
								
								var skwt = document.querySelector('.skw_t');
								var fkwt = document.querySelector('.fkw_t');
								if (data.length != 0) {
									document.querySelector('.blockedWord').parentElement.style.display = "block";
								}

								for (var i = 0; i < data.length; i++) {
									if (data[i].includes('skw_t:')) {
										skwt.innerHTML += '• ';
										skwt.innerHTML += data[i].split('skw_t:')[1];
										skwt.innerHTML += '<br>';
									} else if (data[i].includes('fkw_t:')) {
										fkwt.innerHTML += '• ';
										fkwt.innerHTML += data[i].split('fkw_t:')[1];
										fkwt.innerHTML += '<br>';
									} 
								}
								
							}).catch(function(error){
								console.log("Error" + error)
							})
						}
					}
				}

				function timeout() {
				    setTimeout(function () {
						if (allChannels.length == 0) {
							timeout();
						} else {
							wlb();
						}
				        
				    }, 1000);
				}
			}
		}

		function getAllChannels() {
			var url_req = "https://exampleURL.ru/?";

			fetch(url_req, {
				method: 'get',
			}).then(function(response){
				return response.json();
			}).then(function(data){
				for (var key in data) {
					pushObject(data[key]);
				}
			}).catch(function(error){
				console.log("Requset failed", error)
			})
		}

		function pushObject(obj) {
			allChannels.push(obj);
		}

		function displayErr(message) {
	  		appendElem('error', message);
  		 	document.getElementById('error').style.backgroundColor = "#f9805e";
		}

		function displayButton(id, name) {
			var div = document.createElement('div');
			div.setAttribute('id', 'addToWLBS');
	        document.querySelector('.wlbs').parentElement.appendChild(div);
	        div.style.borderRadius = "5px";
	        div.style.padding = "0px";
	        div.style.opacity = 1;


	        var button = document.createElement('input');
	        button.type  = 'button';
	        button.value = 'Add to ' + name;
	        button.style.color = "#FFFFFF";
	        button.style.backgroundColor = "#b72439";
	        button.style.width = "100%";
	        button.style.cursor = "pointer";
	        button.style.borderRadius = "5px";
	        button.style.font = "Acrom";
	        button.style.fontSize = "15px";
	        button.style.fontWeight = "bold";
			button.addEventListener('click', function() {
			    if (confirm("Вы уверенны, что хотите добавить статью в white list?")) {
			    	performAddingWlbs(id, name);
			    }
			}, false);

			document.getElementById('addToWLBS').appendChild(button);
		}

		function performAddingWlbs(id, name) {
			

			var url = "https://exampleURL.ru/?"

			var payload = {
			    "url": currentUrl,
			    "channel_id": id
			};

			fetch(url, {
				method: "POST",
				headers: {
			    	'Content-Type': 'application/json'
			    },
				body: JSON.stringify(payload),
			}).then(function(response) {
				if (response.ok) {
					alert("Сатья добавлена в " + name)
				}
			}).catch(function(error) {
				console.log("Request error: " + error);
			})
		}


		function catchingIndexingError(json) {
			if (json.index_date === "no date") {
				displayErr('Error: The page is not indexed');
			} else {
				if (!json.ifsuccess) {
					displayErr('Error: The page is indexed, but there\'s an error adding to the database!');
				} else {
					displayErr('Error: The page got into the database, but were not added to any channels');
				}
			}
		}



		function displayCats(channels) {
			var chan = [];

			for (var i = 0; i < channels.length; i++) {
				for (var n = 0; n < allChannels.length; n++) {
					if (allChannels[n]._id.$oid == channels[i]._id){
						chan.push(allChannels[n]);
					}
				}
			}
			
			var divWLBS = document.querySelector('.wlbs');
			var divOtherChannels = document.querySelector('.otherChannels');

			for (var i = 0; i < chan.length; i++) {
				if (chan[i].Name.includes("WLBS")) {
			        var toPush = "• " + chan[i].Name + '<br>'
			        divWLBS.innerHTML += toPush;
				} else {
					var toPush = "• " + chan[i].Name + '<br>'
			        divOtherChannels.innerHTML += toPush;
				}
		    }

		    if (divOtherChannels.innerHTML == "") {
		    	divOtherChannels.innerHTML = "Страница не принадлежит другим каналам";
		    }
		}

		function getAllCats() {
			return {"id": allCatsId, "name": allCatsName, "solrId": allCatsSolrId};
		}

		function displayWords(json) {
			words = "Fkw: <br>" + json.words.fkw + " <br><br>Skw:<br>" + json.words.skw;

			var div = document.createElement('div');
			var elem = document.querySelectorAll('.element')
			div.setAttribute('words', 'fkw_skw');
	        div.innerHTML = words;
	        elem[elem.length-1].appendChild(div);
		}

		function appendElem(id, inner) {
			var div = document.createElement('div');
			div.setAttribute('id', id);
	        div.innerHTML = inner;
	        document.body.appendChild(div);
		}

		function extractHostname(url) {
		    var hostname;

		    if (url.indexOf("//") > -1) {
		        hostname = url.split('/')[2];
		    } else {
		        hostname = url.split('/')[0];
		    }

		    hostname = hostname.split(':')[0];
		    hostname = hostname.split('?')[0];

		    if (hostname.includes("www.")) {
		    	hostname = hostname.split("www.")[1];
		    }

		    return hostname;
		}

		function adverts() {
			var adverdiv = document.querySelector('.advertisers');
			var div = document.querySelector('.astraIntegrated');
			adverdiv.innerHTML = "Loading...";
			div.innerHTML = "Loading..."

			chrome.tabs.executeScript({file:"contentscript.js"},function(){
				chrome.runtime.sendMessage({"inj": 1}, function(response) {
					return Promise.resolve("Dummy response to keep the console quiet");
			    });
			});
			chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
				if (request.msg === "session") {
					var adverdiv = document.querySelector('.advertisers');		
			        if (request.data.sessionid == "no_div_scr") {
						
						div.innerHTML = "No div and no script";
						errorStyling(div);
						adverdiv.innerHTML = "Никто не ставил!";
						errorStyling(adverdiv);

					} else if (request.data.sessionid == "no_div") {

						div.innerHTML = "No div";
						errorStyling(div);
						adverdiv.innerHTML = "Никто не ставил!";
						errorStyling(adverdiv);

					} else if (request.data.sessionid == "no_scr") {

						div.innerHTML = "No script";
						errorStyling(div);
						adverdiv.innerHTML = "Никто не ставил!";
						errorStyling(adverdiv);

					} else if (request.data.sessionid != "non_found") {
				        var url_req = "https://exampleURL.ru/?" + request.data.sessionid;

				        var adverdiv = document.querySelector('.advertisers');

				        fetch(url_req, {
							method: "get",
						}).then(function(response) {
							if (response.ok) {
								return response.json()
							}
						}).then(function(data) {
							div.innerHTML = "Script и div";
							adverdiv.innerHTML == "";

					        var advertisers = "";
							for (var i = 0; i < data.ads.length; i++) {
								advertisers += data.ads[i].advertiser;
								advertisers += "<br>";
							}
							adverdiv.innerHTML = advertisers;
							
						}).catch(function(error) {
							console.log("Request error: " + error);
						})
					} else {
						adverdiv.innerHTML = "НИКТО НЕ СТАВИЛ!";
						errorStyling(adverdiv);
						div.innerHTML = "Script и div";
					}
			    }

			});
		}

		function errorStyling(node) {
			
			node.style.backgroundColor = "white";
			node.style.opacity = 1;
			node.style.fontWeight = "bold";
			node.style.color = "red";
		}
		
   }	
);

