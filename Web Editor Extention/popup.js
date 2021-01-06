//defining globalt variables
var editor;
var theTab;

//Startup code
window.onload = function(){
	//eventlisternes for all menubuttons
	document.getElementById("basicBtn").addEventListener("click", function(){
		document.getElementById("basic").style.display = "block";
		document.getElementById("advanced").style.display = "none";
		document.getElementById("allcode").style.display = "none";
	});
	document.getElementById("advancedBtn").addEventListener("click", function(){
		document.getElementById("advanced").style.display = "block";
		document.getElementById("basic").style.display = "none";
		document.getElementById("allcode").style.display = "none";
	});
	document.getElementById("allcodeBtn").addEventListener("click", function(){
		document.getElementById("advanced").style.display = "none";
		document.getElementById("basic").style.display = "none";
		document.getElementById("allcode").style.display = "block";
	});

	//set url value
		setUrlValue();

	//in the add code section
		document.getElementById("add").addEventListener("click", function(){
			setExtension();
		});
		//Code Editor
		editor = ace.edit("editor");
		editor.setTheme("ace/theme/dreamweaver");
		editor.session.setMode("ace/mode/javascript");
		document.getElementById('editor').style.fontSize='18px';
		chrome.storage.local.get(null, function(result){
			if (typeof result["editorState"] !== 'undefined'){
				editor.setValue(result["editorState"])
				editor.navigateTo(result["editorPosition"].row,result["editorPosition"].column)
			}
		})
		//adding autosaving feature for the code editor.
		editor.on("change", function(e){
			saveSingle(editor.getValue(), "editorState")
			saveSingle(editor.getCursorPositionScreen(), "editorPosition")
			PCLS()
		})

	//in the view all code section
		setCodeList();
}

//change the value of the url tab to be the current page's.
function setUrlValue(){
	chrome.tabs.query({active:true,currentWindow:true},function(tabs){
		var re = new RegExp(/^.*\/\/(.*?)\//);
		theTab = re.exec(tabs[0].url)[1];
		document.getElementById("url").value = theTab;
	});
}

//creates the list with all the code
function setCodeList(){
	//setting the container to empty
	document.getElementById("codeContainer").innerHTML = " ";
	//requesting all data from chrome local storage.
	chrome.storage.local.get(null, function(result){
		var i = -1;
		var editors = [];
		//generate section for all codesnippets.
		for(var url in result){
			if(typeof result[url] === 'object'){
				for(var j = 0; j < result[url].length; j++){
					i++;
					//adding HTML elements for one piece of code.
					var div = document.createElement("DIV");
					div.style.margin = "0px 7px 15px 0px";
					document.getElementById("codeContainer").appendChild(div);
					div.ClassName = "codecontainers";
					div.innerHTML = "<div class='codeTextcontainers'>"+
					"<div><img title='Delete Code' class='deleteBtns'id='" + j + "deleteBtn"+ url +"'src='/resources/images/cross.png' width='2.5%'><p id='codeContainersURL'>" + url + " (Match: " + result[url][j].checker +
					")</p></div><pre id='"+ url + j +
					"' style='margin:5px 0px 0px 15px;'></pre></div>";
					//configuring the editor and adding the code.
					editors[i] = ace.edit(url + j);
					editors[i].setTheme("ace/theme/dreamweaver");
					editors[i].session.setMode("ace/mode/javascript");
					editors[i].insert(result[url][j].code);
					editors[i].setReadOnly(true);
					var lines = editors[i].session.getLength();
					editor.gotoLine(1);
					document.getElementById(url+j).style.fontSize='18px';
					document.getElementById(url+j).style.height = 22*lines + "px";
					//adding eventlisternes to the deletebuttons.
					document.getElementById(j+"deleteBtn"+url).addEventListener("click", function(){
						var url = this.id.substring(this.id.indexOf("deleteBtn")+("deleteBtn").length, this.id.length);
						var index = Number(this.id.substring(0,this.id.indexOf("deleteBtn")));
						chrome.storage.local.get([url], function(result_2){
							checker = result_2[url][index].checker
							result_2[url].splice(index,1)
							if(result_2[url].length == 0){
								chrome.storage.local.remove(url, function(){console.log("Removed match: " + checker)});
							}
							else{
								chrome.storage.local.set({[url]:result_2[url]}, function(){console.log("Removed match: " + checker)});
							}
							setTimeout(function(){
								setCodeList();
							}, 100)
						});
					})
				}
			}
		}
	})
}

//Add code to chrome-storage-local
function setExtension(){
	var pageID = theTab;
	var checker = document.getElementById("url").value;
	var equals = document.getElementById("equal").checked;
	var containing = document.getElementById("contain").checked;
	var theCode = editor.getValue();
	if(theCode != ""){
		chrome.storage.local.get([pageID], function(result){
			if(!([pageID] in result)){
				chrome.storage.local.set({[pageID]: [{"checker":checker, "canEqual":equals, "canContain":containing, "code":theCode}]}, function() {console.log("added to " + checker)});
			}
			else{
				result[pageID][result[pageID].length] = {"checker":checker, "canEqual":equals, "canContain":containing, "code":theCode}
				chrome.storage.local.set({[pageID]: result[pageID]}, function(){console.log("added to " + checker)})
			}
		})
		//run next functions (the timeout is to make sure the chrome local storage has been updated).
		setTimeout(function(){
			setCodeList();
			editor.setValue("");
			setUrlValue();
		}, 100)
	}
}

//this function saves the first parameter as the value of the property in chrome.storage.local called the second parameter. Ex: chrome.storage.local[second parameter] = first parameter
function saveSingle(value, property){
	chrome.storage.local.set({[property]: value})
}

//prints the local storage
function PCLS(){
	chrome.storage.local.get(null, function(result){console.log(result)})
}

