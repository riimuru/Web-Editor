chrome.storage.local.get(null, function(result){
	//run code if url match.
	try {
		for(var i = 0; i < result[window.location.host].length; i++){
			if(result[window.location.host][i].canContain && window.location.href.indexOf(result[window.location.host][i].checker) > -1){
				evaluate(result[window.location.host][i].code)
			}
			else if(result[window.location.host][i].canEqual && window.location.href == result[window.location.host][i].checker){
				evaluate(result[window.location.host][i].code)
			}
		}
	//do nothing if error since then the url does not match a checker.
	} catch (error) {}
});

//evaluates the code on the page if no error.
function evaluate(code){
	try {
		eval(code)
	}
	catch (error) {
		console.log("%cCodify:"+" %cA/An " + error.name + " occured in your code with the following message:"+"%c"+error.message,"color:green;font-weight:bold;","","font-style: italic;")
	}
}

//Todos
/*
	Synkronisering over devices skal synkronisere følgende:
		ens makroer altså koden - som default disabled.
	Tjekke det juridiske omkring frameworket.
*/
