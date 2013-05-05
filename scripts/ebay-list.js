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
var _secondCategory;
var _curCategory;
var _maxPages = 0;
var _average = [];
var _nameCatA, nameCatB;
var items;

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
	items = root.findCompletedItemsResponse[0].searchResult[0].item || [];

	// create an empty array for building up the html output
	var html = [];
	_resultStats = [];
	//init numValidItems if it's null
	if (_resultStats.initialized == undefined) {
		_resultStats.initialized  = true;
		_resultStats.numValidItems = 0;
		for (var i = 0; i < 4; i++) {
			_resultStats[i] = [];
			_resultStats[i].totalCost= 0;
			_resultStats[i].totalItems = 0;

		}
	}
	for ( var i = 0; i < items.length; ++i) {
		var item = items[i];
		var title = item.title;
		var pic = item.galleryURL;
		var viewItem = item.viewItemURL;
		//no idea why you need that [0] there, wth ebay
		var price = item.sellingStatus[0].currentPrice[0]['__value__'];
		//sanity check!
		if(conditionId = item.condition[0]['conditionId'] != undefined && item.condition[0]['conditionId'][0] != 'false' && null != title && null != viewItem){
			var conditionId = item.condition[0]['conditionId'][0];
			//html.push('<p>price: '+price+' conditionId: '+conditionId );//'<a href="'+viewItem+'">'+title+'<a/></p>');
			_resultStats.numValidItems++;
			//[0] = 1000, [1] =1001-2000, [2] = 2001-3000, [3] = 4000, [4] = 4001-7000
			
			//later want to changed to only enable condition ranges if supported.
			//New
			if (conditionId == 1000) {
				_resultStats[0].totalCost += parseFloat(price);
				_resultStats[0].totalItems++;
			}
			//Higer Quality Used
			else if (conditionId == 3000 || conditionId == 4000) {
				_resultStats[1].totalCost += parseFloat(price);
				_resultStats[1].totalItems++;
			}
			//Lower Quality Used
			else if (conditionId == 5000 || conditionId == 6000) {
				_resultStats[2].totalCost += parseFloat(price);
				_resultStats[2].totalItems++;
			}
			//Refurbished
			else if (conditionId == 2000 || conditionId == 2500) {
				_resultStats[3].totalCost += parseFloat(price);
				_resultStats[3].totalItems++;
			}
		}
	}
	//html.push('</tbody></table>');

	// find the results div in the DOM and set its HTML content
	//document.getElementById("resultsDiv").innerHTML += html.join("");
	
	// When we're done processing remove the script tag we created below
	var lastChild = document.body.lastChild;
	document.body.removeChild(lastChild);
	
	//page info
	var curPageNumber = root.findCompletedItemsResponse[0].paginationOutput[0].pageNumber[0];
	var totalPages = root.findCompletedItemsResponse[0].paginationOutput[0].totalPages[0];
	
	//if we're not on the last page
	if (curPageNumber != totalPages && curPageNumber != (_maxPages+1)) {
		//console.log(_resultStats);
		setTimeout(makeEbayRequest(_curCategory, parseFloat(curPageNumber)+1));	
	}
	//otherwise make the chart
	else{
		_average[_curCategory] = [];
		
		//Only traverse first two conditions
		for (var i = 0; i < 2; i++) {
			if (_resultStats[i].totalCost != 0) {
				_average[_curCategory][i] = _resultStats[i].totalCost/_resultStats[i].totalItems;
			}
			else
				_average[_curCategory][i] = 0;
			//console.log("_average of " + i + ": " + _average[i]);
		}
		
		//console.log(_average);
		if (_isFirstItem) {
			_isFirstItem = false;
			_curCategory = _secondCategory;
			setTimeout(makeEbayRequest(_curCategory, 1));	
		}
		else{
			drawVisualization(_nameCatA, _nameCatB, _average[_firstCategory], _average[_secondCategory]);	
		}
	}
}

function updateDetails(i)
{
	var item = items[i];
	var title = item.title;
	var location = item.location;
	var topRated = item.topRatedListing;
	
	var html = [];
	html.push('<b>Title</b>: ' + title + '<br/>');
	html.push('<b>Location</b>: ' + location + '<br/>');
	html.push('<b>Top Rated Seller</b>: ' + topRated + '<br/>');
	document.getElementById("resultInfo").innerHTML = html.join("");
	//alert(items[i].title);
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
