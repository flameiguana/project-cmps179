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
var _links;


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
		//console.log(item);
		var conditionId = item.condition[0]['conditionId'][0];
		//sanity check!
		if(conditionId = item.condition[0]['conditionId'] != undefined && item.condition[0]['conditionId'][0] != 'false'){
			addAndSortItem(item, 'price');
		}
		if(item.sellingStatus[0].bidCount != undefined  && item.sellingStatus[0].bidCount[0] != 0){
			addAndSortItem(item, 'bids');
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
		var totalItems = 0;
		for (var i = 0; i < 4; i++) {
			if (_resultStats[i].totalCost != 0) {
				_average[i] = _resultStats[i].totalCost/_resultStats[i].totalItems;
				totalItems++;
			}
			else{
			    _average[i] = 0;
                        }
		}
		console.log(_sortedItems);
		var percentilePrice = processData('price');
		var percentileBids = processData('bids');
		var labels = genLabels(percentilePrice);
		console.log(_links);
		
		percentilePrice = clipArray(percentilePrice);
		percentileBids = clipArray(percentileBids);
		console.log(percentilePrice);
		console.log(labels);
		console.log(percentileBids);
		console.log(_resultStats);
                //json building
                var j = "{\n";
                j+="'label': '" + _nameCatA + "',\n";
                j+= "'percentilePrice': " + JSON.stringify(percentilePrice)+",\n";
		j+= "'percentileBids': " + JSON.stringify(percentileBids)+",\n";
		j+= "'linksPrice': " + JSON.stringify(_links['price'])+",\n";
		j+= "'linksBids': " + JSON.stringify(_links['bids'])+",\n";
		j+= "'labels': " + JSON.stringify(labels)+",\n";
		j+="'totalItems':" + totalItems;
                j+="\n}";
                makeThatAjaxrequest(_nameCatA, j);
	}
}

function addAndSortItem(item, type) {
	var conditionId = item.condition[0]['conditionId'][0];
	//no idea why you need that [0] there, wth ebay
	var price = item.sellingStatus[0].currentPrice[0]['__value__'];
	var index;
	_resultStats.numValidItems++;
	
	if (_sortedItems == undefined) {
		_sortedItems = [];
		_sortedItems['price'] = [];
		_sortedItems['pics'] = [];
		_sortedItems['bids'] = [];
		_resultStats = [];
		for (var i = 0; i < 5; i++) {
			_sortedItems['price'][i] = [];
			_sortedItems['pics'][i] = [];
			_sortedItems['bids'][i] = [];
			_resultStats[i] = [];
		}
	}
	//[0] = 1000, [1] =1001-2000, [2] = 2001-3000, [3] = 4000, [4] = 4001-7000
	
	//later want to changed to only enable condition ranges if supported.
	//New
	if (conditionId == 1000) 
		index = 0;
	//Refurbished
	else if (conditionId == 2000 || conditionId == 2500) 
		index = 1;
	//Higer Quality Used
	else if (conditionId == 3000 || conditionId == 4000) 
		index = 2;
	//Lower Quality Used
	else if (conditionId == 5000 || conditionId == 6000) 
		index = 3;
	//For Parts
	else 
		index = 4;

	if (type == 'price') {
		_resultStats[index].totalCost += parseFloat(price);
		_resultStats[index].totalItems++;
	}
	//if its empty here
	if (_sortedItems[type][index][0] == undefined) {
		_sortedItems[type][index][0]  = item;
	}
	else{
		var insertIndex = 0;
		var listPrice = parseFloat(getComp(_sortedItems[type][index][insertIndex], type));
		var itemPrice = parseFloat(getComp(item, type));
		while (insertIndex < _sortedItems[type][index].length && listPrice <= itemPrice) {
			listPrice = parseFloat(getComp(_sortedItems[type][index][insertIndex], type));
			insertIndex++;
		}
		if (insertIndex == 0) {
			_sortedItems[type][index].unshift(item);
		}
		else if (listPrice <= itemPrice)
		{
			_sortedItems[type][index].push(item);
		}
		else
			_sortedItems[type][index].splice(insertIndex-1, 0, item);
	}
	//debug stuff
	/*if (type == 'bids' && index == 0) {
		if (insertIndex == _sortedItems[type][index].length)
			console.log("ran out");
		console.log("itemPrice: " + (itemPrice));
		console.log("listPrice: " + (listPrice));
		console.log("insertIndex: " + (insertIndex));
		console.log (listPrice > itemPrice);
		for (var i = 0; i < _sortedItems['bids'][0].length; i++) {
			console.log(getComp(_sortedItems['bids'][0][i], "bids"));
		}
		//console.log(_sortedItems['bids'][0]);
	}*/
	
}

//gets the stat to compare the item by
function getComp(item, type) {
	if (type=='price') 
		return parseFloat(item.sellingStatus[0].currentPrice[0]['__value__']);
	if (type=='bids')
		return parseFloat(item.sellingStatus[0].bidCount[0]);
	return -1;
}

function processData(type) {
	//this bit will get the first, 25th, 50th, 75th, and 99th Percentile
	var percentileValues = [];
	if (_links == undefined) 
		_links = [];
	_links[type] = [];
	var percentiles = [9, 25, 50, 75, 91];
	for (var i = 0; i < 5; i++) {
		percentileValues[i]= [];
		_links[type][i]= [];
		var length = _sortedItems[type][i].length;
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
				percentileValues[i][j] = getComp(_sortedItems[type][i][index], type);
				if (percentileValues[i][j] > 100) {
					console.log(percentileValues[i][j]);
					console.log(_sortedItems[type][i][index]);
				}
				_links[type][i][j] = _sortedItems[type][i][index].viewItemURL[0];
			}
		}
		
	}
	return percentileValues;
	//console.log(JSON.stringify(percentileValues));
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
        console.log("Ajax request succesful!");
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


function genLabels(percentiles) {
	var lassie = [];
	if (percentiles[0].length != 0) {
		lassie.push("New");
	}
	if (percentiles[1].length != 0) {
		lassie.push("Refurbished");
	}
	if (percentiles[2].length != 0) {
		lassie.push("HQ Used");
	}
	if (percentiles[3].length != 0) {
		lassie.push("LQ Used");
	}
	if (percentiles[4].length != 0) {
		lassie.push("Acceptable");
	}
	return lassie;
}


//gets rid of the empty subarrays
function clipArray(percentiles) {
	var lassie = [];
	for (var i = 0; i < percentiles.length; i++) {
		if (percentiles[i].length != 0) {
			lassie.push(percentiles[i]);
		}
	}
	return lassie;
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
	//url += "&descriptionSearch=true";
	//url += "&keywords=" + "the+-lot+-set+-collection+-pack+-assortment+-bundle";
	
	//filter!
	url += "&itemFilter[0].name=SoldItemsOnly";
	url += "&itemFilter[0].value=true";
	url += '&itemFilter[1].name=Condition';
	url += '&itemFilter[1].value[0]=New';
	url += '&itemFilter[1].value[1]=Used';
	url += "&itemFilter[2].name=MaxQuantity";
	url += "&itemFilter[2].value=2";
	
	//outputSelector
	url +="&outputSelector(0)=GalleryInfo";
	
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
