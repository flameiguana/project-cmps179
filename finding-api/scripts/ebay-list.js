//See 
//http://developer.ebay.com/Devzone/finding/HowTo/GettingStarted_JS_NV_JSON/GettingStarted_JS_NV_JSON.html

/*****************************************************************************/
/** Define a global variable *************************************************/
/*****************************************************************************/
var EBAY_SEARCH = {
	resultSize: 100
};

/*****************************************************************************/
/** Define some functions ****************************************************/
/*****************************************************************************/
/**
 * Convenience function for getting an element by id.
 * @param id
 * @returns The element
 */
function $(id) {
	return document.getElementById(id);
}

/**
 * This is the callback referenced in the getFindUrl function defined below.
 * It parses the response from eBay and builds an HTML table to display
 * the search results.
 * 
 * @param root
 */
function findCompletedItems(root) {
	// get the results or return an empty array if there aren't any.
	var items = root.findCompletedItemsResponse[0].searchResult[0].item || [];

	// create an empty array for building up the html output
	var html = [];

	// create a table
	html.push('<table><tbody>');

	for ( var i = 0; i < items.length; ++i) {
		var item = items[i];
		var title = item.title;
		var pic = item.galleryURL;
		var viewItem = item.viewItemURL;

		// do some sanity checking
		if (null != title && null != viewItem) {
			// add a row to the table
			html.push('<tr><td>' + '<img style="width: 150px; height: 150px;" src="' + pic + '" border="0">'
					+ '</td>' + '<td><a href="' + viewItem
					+ '" target="_blank">' + title + '</a></td></tr>');
		}
	}

	// close the table
	html.push('</tbody></table>');

	// find the results div in the DOM and set its HTML content
	document.getElementById("resultsDiv").innerHTML = html.join("");
	
	// When we're done processing remove the script tag we created below
	var lastChild = document.body.lastChild;
	document.body.removeChild(lastChild);
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
function getFindUrl(query) {
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
	url += "&keywords=" + query;
	//url += "&categoryId=104705"
	url += "&paginationInput.entriesPerPage=" + EBAY_SEARCH.resultSize;
	
	// Make sure to encode the url to make sure spaces and other special
	// characters are escaped properly.
	// Note: I think this does not handle all cases so be careful.
	// You may need some additional checks here.
	return encodeURI(url);
}

/**
 * Actually request the ebay data 
 */
function makeEbayRequest() {
	var query = $("ebayQueryInput").value;
	
	// Make sure the query is valid.
	// If it's not, then return without doing anything
	if (!valid(query)) {
		return;
	} 
	
	// Programmatically create a new script tag
	var script = document.createElement('script');
	
	// Create the URL for requesting data from eBay using a GET request
	// and set the src attribute of the newly created script tag to this URL.
	script.src = getFindUrl(query);
	
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

/*****************************************************************************/
/** Register some event listeners ********************************************/
/*****************************************************************************/
// Make the request to eBay when you click the Search button
$("searchButton").addEventListener("click", function(event) {
	makeEbayRequest();
}, false);

// Clear the request
$("resetButton").addEventListener("click", function(event) {
	clearQuery();
}, false);

// Run Search when the 'Return' button is pressed
$("ebayQueryInput").addEventListener("keyup", function(event) {
	if (event.keyCode == 13) {
		makeEbayRequest();
	}
}, false);