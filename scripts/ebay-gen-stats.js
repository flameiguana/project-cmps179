//See 
//http://developer.ebay.com/Devzone/finding/HowTo/GettingStarted_JS_NV_JSON/GettingStarted_JS_NV_JSON.html

/*****************************************************************************/
/** Define a global variable *************************************************/
/*****************************************************************************/
var EBAY_SEARCH = {
	resultSize: 100
};
//I'm thinking of having this eventually look like
//_resultStats[categoryId][conditionIndex].totalCost
//[0] = 1000, [1] =1001-2000, [2] = 2001-3000, [3] = 4000, [4] = 4001-7000
var _resultStats = [];
var  _isFirstItem = true;
var _firstCategory;
var _curCategory;
var _maxPages = 20;
var _average = [];
var _nameCatA;
var _items;
var _sortedItems;


/**
 * This is the callback referenced in the getFindUrl function defined below.
 * It parses the response from eBay and builds an HTML table to display
 * the search results.
 * 
 * @param root
 */
function findCompletedItems(root) {
	//bail if the result is undefined
	if (root.findCompletedItemsResponse == undefined || root.findCompletedItemsResponse[0].searchResult == undefined) {
		var lastChild = document.body.lastChild;
		document.body.removeChild(lastChild);
		return;
	}
	// get the results or return an empty array if there aren't any.
	_items = root.findCompletedItemsResponse[0].searchResult[0].item || [];

	// create an empty array for building up the html output
	var html = [];
	for ( var i = 0; i < _items.length; ++i) {
		var item = _items[i];
		var conditionId = item.condition[0]['conditionId'][0];
		//sanity check!
		if(conditionId = item.condition[0]['conditionId'] != undefined && item.condition[0]['conditionId'][0] != 'false'){
			addAndSortItem(item);
		}
	}	
	// When we're done processing remove the script tag we created below
	var lastChild = document.body.lastChild;
	document.body.removeChild(lastChild);
	
	//page info
	var curPageNumber = root.findCompletedItemsResponse[0].paginationOutput[0].pageNumber[0];
	var totalPages = root.findCompletedItemsResponse[0].paginationOutput[0].totalPages[0];
	
        $("#currentPage").text(curPageNumber);
        $("#totalPages").text(totalPages);
        $("#maxPages").text(_maxPages);
	//if we're not on the last page
	if (curPageNumber != totalPages && curPageNumber != _maxPages) {
                console.log("going again");
		setTimeout(makeEbayRequest(_curCategory, parseFloat(curPageNumber)+1));	
	}
	//otherwise save the data
	else{
                console.log("bailed")
		for (var i = 0; i < 4; i++) {
			if (_resultStats[i].totalCost != 0) {
				_average[i] = _resultStats[i].totalCost/_resultStats[i].totalItems;
			}
			else{
			    _average[i] = 0;
                        }
		}
		console.log("AVERAGE");
		//console.log(_sortedItems);		
                _average["label"] = _nameCatA;
		processData();
		console.log(_average);
                //console.log(JSON.stringify(_average))
		//console.log(JSON.stringify(_sortedItems))
                //json building
                var j = "{\n";
                j+="'label': '" + _nameCatA + "',\n";
                j+= "'averages': " + JSON.stringify(_average);
                j+="\n}";
                makeThatAjaxrequest(_nameCatA, "var " + _nameCatA.replace(" ", "_") + " = " + j);
	}
}

function addAndSortItem(item) {
	var conditionId = item.condition[0]['conditionId'][0];
	//no idea why you need that [0] there, wth ebay
	var price = item.sellingStatus[0].currentPrice[0]['__value__'];
	var index;
	_resultStats.numValidItems++;
	
	if (_sortedItems == undefined) {
		_sortedItems = [];
		_resultStats = [];
		for (var i = 0; i < 5; i++) {
			_sortedItems[i] = [];
			_resultStats[i] = [];
		}
	}
	//[0] = 1000, [1] =1001-2000, [2] = 2001-3000, [3] = 4000, [4] = 4001-7000
	
	//later want to changed to only enable condition ranges if supported.
	//New
	if (conditionId == 1000) 
		index = 0;
	//Higer Quality Used
	else if (conditionId == 3000 || conditionId == 4000) 
		index = 1;
	//Lower Quality Used
	else if (conditionId == 5000 || conditionId == 6000) 
		index = 2;
	//Refurbished
	else if (conditionId == 2000 || conditionId == 2500) 
		index = 3;
	else
		index = 4;
	_resultStats[index].totalCost += parseFloat(price);
	_resultStats[index].totalItems++;
	if (_sortedItems[index][0] == undefined) {
		_sortedItems[index][0]  = item;
	}
	else{
		var compPrice = _sortedItems[index][0].sellingStatus[0].currentPrice[0]['__value__'];
		var insertIndex = 0;
		var price1 = parseFloat(_sortedItems[index][insertIndex].sellingStatus[0].currentPrice[0]['__value__']);
		var price2 = -1;
		if (insertIndex < _sortedItems[index].length)
			price2 = parseFloat(item.sellingStatus[0].currentPrice[0]['__value__']);
		while (insertIndex < _sortedItems[index].length && price1 < price2) {
			price1 = parseFloat(_sortedItems[index][insertIndex].sellingStatus[0].currentPrice[0]['__value__']);
			insertIndex++;
		}
		_sortedItems[index].splice(insertIndex, 0, item);
	}
	
}

function processData() {
	//this bit will get the first, 25th, 50th, and 99th Percentile
	var percentilePrices = [];
	var percentiles = [1, 25, 50, 75, 99];
	for (var i = 0; i < 5; i++) {
		percentilePrices[i]= [];
		var length = _sortedItems[i].length;
		//make sure the sample size is big enough
		if (length > 3) {
			for (var j = 0; j < percentiles.length; j++){
				var index = Math.floor(length*percentiles[j]/100);
				if (index == 0) {
					index = 1;
				}
				else if (index >= length-1) {
					index = length-2;
				}
				percentilePrices[i][j] = _sortedItems[i][index].sellingStatus[0].currentPrice[0]['__value__'];
			}
		}
		
	}
	console.log(JSON.stringify(percentilePrices));
}

function makeThatAjaxrequest(name, text) {
    // fire off the request to /form.php
    var request = $.post("scripts/create-file.php",
                         { text: text,
                           filename: name
                         });

    // callback handler that will be called on success
    request.done(function (response, textStatus, jqXHR){
        // log a message to the console
        console.log("Hooray, it worked!");
        //alert(response);
    });

    // callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
        // log the error to the console
        console.error(
            "The following error occured: "+
            textStatus, errorThrown
        );
    });
}


/**
 * Communicate with the eBay servers using A GET request.
 * A GET request is a base url that is appended by a series of key/value pairs.
 * The base URL is separated from the request by a '?'.
 * Each key/value pair is specified by: key=value.
 * Key/value pairs are separated by an '&'
 * 
 * @param query
 * @returns
 */
function getFindUrl(query, pageNumber) {
	if (pageNumber == undefined) {
		//page numbers start at 1
		pageNumber = 1;
	}
	
	// Base url
	var url = "http://svcs.ebay.com/services/search/FindingService/v1";
	
	// GET parameters
	url += "?OPERATION-NAME=findCompletedItems";
	url += "&SERVICE-VERSION=1.0.0";
	url += "&SECURITY-APPNAME=" + appId;
	url += "&GLOBAL-ID=EBAY-US";
	url += "&RESPONSE-DATA-FORMAT=JSON";
	
	
	// When eBay processes the request it will create a javascript object
	// containing the resulting data and wrap the callback function defined
	// below around it. So you need to have a function defined in the script
	// with the name 'findCompletedItems' (or whatever you call it) that
	// takes one parameter (i.e., the javascript object ebay returns).
	url += "&callback=findCompletedItems";
	url += "&REST-PAYLOAD";
	url += "&categoryId=" + query;
	url += "&paginationInput.entriesPerPage=" + EBAY_SEARCH.resultSize;
	url += "&paginationInput.pageNumber=" + pageNumber;
	
	//filter!
	url += "&itemFilter[0].name=SoldItemsOnly";
	url += "&itemFilter[0].value=true";
	url += '&itemFilter[0].name=Condition';
	url += '&itemFilter[0].value[0]=New';
	url += '&itemFilter[0].value[1]=Used';
	
	// Make sure to encode the url to make sure spaces and other special
	// characters are escaped properly.
	// Note: I think this does not handle all cases so be careful.
	// You may need some additional checks here.
	return encodeURI(url);
}

/**
 * Actually request the ebay data 
 */
function makeEbayRequest(query, pageNumber) {
	if (_isFirstItem) {
		_curCategory = _firstCategory;
	}
	if (pageNumber == undefined) {
		//page numbers start at 1
		pageNumber = 1;
	}
	
	// Make sure the query is valid.
	// If it's not, then return without doing anything
	if (!valid(query) && query == undefined) {
		return;
	} 
	
	// Programmatically create a new script tag
	var script = document.createElement('script');
	
	// Create the URL for requesting data from eBay using a GET request
	// and set the src attribute of the newly created script tag to this URL.
	script.src = getFindUrl(query, pageNumber);
	
	// Add the new tag to the document body which will try to load the script
	// from the URL.
	// eBay will dynamically create a script for us that will load in the
	// attached <script> tag.
	// See the comment in getFindUrl about the callback
	document.body.appendChild(script);
}

/**
 * Returns true if the query is not empty.
 * Note: could be more robust.
 * 
 * @param query
 * @returns {Boolean}
 */
function valid(query) {
	return query != '';
}

/**
 * Clear the input from the text input and remove any content from the
 * results panel.
 */
function clearQuery() {
	$("ebayQueryInput").value = '';
	$("resultsDiv").innerHTML = '';
}
