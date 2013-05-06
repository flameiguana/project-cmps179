//Notes from JavaScript book
//Allows us to add a function to a prototype.
Function.prototype.method = function (name, func) {
	this.prototype[name] = func;
	return this;
};

/*
Todo:
Filter out collections, sets

*/

//Number type now has a method to return an integer.
//ie (1.5).integer()
Number.method('integer', function () {
	return Math[this < 0 ? 'ceil' : 'floor'](this);
});

function average(){
	var total = 0;;
	for(var i = 0; i < arguments.length; i++){
		total += arguments[i];
	}
	return total/arguments.length;
}

//http://colorschemedesigner.com/#3542bvXw9w0w0

//Returns median of an array.
function getMedian(values){
	values.sort(function (a, b) {return a-b});
	var middle = Math.floor(values.length/2);
	if((middle.length % 2) === 0)
		return values[middle];
	else //average middle two values
		return (values[middle-1] + values[middle]) / 2;
}

function hoverInLine(){
	this.flag = this.paper.popup(this.middleX, this.middleY, this.percent + "% " + "Difference");
	this.animate({"stroke-width": 6});
}

function hoverOutLine(){
	this.animate({"stroke-width": 3});
	this.flag.animate({opacity: 0}, 200, function () {this.remove();});
}

function hoverInCircle(){
	this.attr({cursor : "hand"});
	this.animate({opacity: 1.0}, 140);
	//this.flag = this.paper.popup(this.axisX, this.attr('cy'), "$" + this.price, "left");
}
function hoverOutCircle(){
	this.attr({cursor : "pointer"});
	this.animate({opacity: .4}, 140);
	//this.flag.remove();
}
function hoverInBox(){
	this.boxPlot.showPrices(this.boxID);
}
function hoverOutBox(){
	this.boxPlot.removePrices();
}

function goToProduct(){
	window.open("https://www.google.com/");
}
//TODO be able to pass in any number of colors, alternate between these colors
function BoxPlot(paper, x, y, width, height, data, labels, axesNames) {
	function buildLine(x1, y1, x2, y2){
		return "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
	}
	if(labels.length != data.length){
		console.log("Warning: Names and Category counts don't match.");
	}
 	axesNames = typeof axesNames !== 'undefined' ? axesNames : [null, null];

	this.paper = paper;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.data = data;
	this.paper = paper;
	this.boxCount = data.length;
	this.lines = [];
	this.priceFlags = [];
	this.yCoords = [[],[],[],[],[]];
	yCoords = this.yCoords;
	//Indicies into data array.
	var low = 0;
	var twentyFifth = 1;
	var median = 2;
	var seventyFifth = 3;
	var high = 4;

	var circleAttributes = {"stroke-width" : 1, fill:"#007046", opacity : .4};
	//Find the highest value in data, use it to normalize.
	var maxValue = 0;
	for(var i = 0; i < this.boxCount; i++){
		var potentialMax = Math.max.apply(Math, data[i]);
		if(maxValue < potentialMax)
			maxValue = potentialMax;
	}

	var scale = 1 / maxValue * height;
	var boxWidth =  width/this.boxCount/2;
	var margin = boxWidth/2;
	var circleRadius = boxWidth/9;
	//draw axes, might wanna style color of text
	if(axesNames[0] !== null)
		paper.text(x, y - 12, axesNames[0]).attr({"font-size" : "14px"});

	if(axesNames[1] !== null)
		paper.text(x + width + 4, y + height, axesNames[1]).attr({"font-size" : "14px", "text-anchor" : "start"});

	var verticalAxis = buildLine(x, y, x, (y + height));
	var horizontalAxis = buildLine(x, y + height, x + width, y + height);
	paper.path(verticalAxis);
	paper.path(horizontalAxis);

	var boxes = [];
	for(var i = 0; i < this.boxCount; i++){
		var bubbles = [];
		var leftX = x + margin + i*width/this.boxCount;
		
		yCoords[i][low] =  y + (height - data[i][low] * scale);
		yCoords[i][twentyFifth] = y + (height - data[i][twentyFifth]*scale);
		yCoords[i][seventyFifth] = y + (height - data[i][seventyFifth]*scale);
		yCoords[i][median] = y + (height - data[i][median] * scale);
		yCoords[i][high] = y + (height - data[i][high] * scale);
		var length = data[i][seventyFifth] - data[i][twentyFifth];

		var medianLine = buildLine(leftX, yCoords[i][median], (leftX + boxWidth), yCoords[i][median]);
		var verticalLine =  buildLine((leftX + boxWidth/2), yCoords[i][high], (leftX + boxWidth/2), yCoords[i][low]);
		var bottomWhisker = buildLine(leftX + boxWidth/4, yCoords[i][low], leftX + boxWidth - boxWidth/4, yCoords[i][low]);
		var topWhisker = buildLine(leftX + boxWidth/4, yCoords[i][high], leftX + boxWidth - boxWidth/4, yCoords[i][high]);

		//Render the boxes
		paper.path(verticalLine);
		paper.path(bottomWhisker);
		paper.path(topWhisker);
		boxes.push(paper.rect(leftX, y + (height - data[i][seventyFifth]* scale), boxWidth, length * scale)
			.attr({fill: "#00AD6C", "stroke-width": 1})
			.hover(hoverInBox, hoverOutBox));
		boxes[i].boxID = i;
		boxes[i].boxPlot = this;

		paper.path(medianLine).attr({"stroke-width" : 3, "stroke" :"#1533AE"});
		//Need a bottom margin, put this below bottom axis
		paper.text(leftX + boxWidth/2, y + height + 10, labels[i]);

		bubbles.push(paper.circle(leftX + boxWidth/2, yCoords[i][low], circleRadius));
		bubbles.push(paper.circle(leftX + boxWidth/2, yCoords[i][twentyFifth], circleRadius));
		bubbles.push(paper.circle(leftX + boxWidth/2, yCoords[i][median], circleRadius));
		bubbles.push(paper.circle(leftX + boxWidth/2, yCoords[i][seventyFifth], circleRadius));
		bubbles.push(paper.circle(leftX + boxWidth/2, yCoords[i][high], circleRadius));
		
		$(bubbles).each(function(j, v){
			this
				.hover(hoverInCircle, hoverOutCircle)
				.click(goToProduct)
				.attr(circleAttributes);
			this.axisX = x;
			this.price = data[i][j];
		});
		//Create lines for slopes
		if(i > 0){
			var percentDifference = 
				Math.abs((data[i-1][median] - data[i][median])/average(data[i-1][median], data[i][median])) * 100;
			var rightOfPrev = leftX - boxWidth;
			var prevMedianY = y +  (height - data[i-1][median] * scale);
			var medianSlope = buildLine(rightOfPrev, prevMedianY, leftX,  yCoords[i][median]);
			this.lines.push(paper.path(medianSlope)
				.attr({"stroke" :"#1533AE", "stroke-width" : 3, "stroke-linecap": "round"}));
			this.lines[i-1].hover(hoverInLine, hoverOutLine);
			//add new property percent
			this.lines[i-1].percent = Math.round(percentDifference);
			this.lines[i-1].middleX = average(rightOfPrev, leftX);
			this.lines[i-1].middleY = average(prevMedianY, yCoords[i][median]);
		}
	}
	
	this.showPrices = function (xIndex){
		for(var i = 0; i < this.data[xIndex].length; i++){
			var v = data[xIndex][i];
			this.priceFlags[i] = this.paper.text(x - 8, this.yCoords[xIndex][i], "$" + v ).attr({"text-anchor" : "end"});
		}
		/*
		$(data[xIndex]).each(function(i, v){
			priceFlags[i] = paper.text(x-8, yCoords[xIndex][i], "$" + v).attr({"text-anchor" : "end"});
			//priceFlags[i] = paper.popup(x, yCoords[xIndex][i], "$" + v, "left");
		});
		*/
	};
	this.removePrices = function(){
		$(this.priceFlags).each(function(i, v){
			v.remove();
		});
	};

	return this;
}


//should pass in data here
function drawVisualization(labelA, labelB, dataofA, dataofB) {

	var divWidth = $('#vis').width();
	var divHeight = $('#vis').height();
	var paper = new Raphael("vis", divWidth, divHeight);


/*
	var hoverInLine = function(){
		this.flag = paper.popup(this.bar.x, this.bar.y, "$" + Math.round(this.bar.value) || "0").insertBefore(this);
	};

	var hoverOutLine = function(){
		this.flag.animate({opacity: 0}, 200, function () {this.remove();});
	};
*/

	//Pass in median of values.
	//[used, new]
	//var dataCombined = [dataofA, dataofB];

	//Note this both graphs end up being same height although the values are very different. This is very useful.
	var  width = 320, height = 320;
	var x = divWidth/2 - width;
	var y = 100;
	
	var opts = 
	{
	colors: ["#2F69BF", "#808080"]
	};
	/*
	var chartA = paper.barchart(x, y, width, height, dataofA, opts)
		.hover(hoverInLine, hoverOutLine);
		
	var chartB = paper.barchart(x + width + 10, y, width, height, dataofB, opts)
		.hover(hoverInLine, hoverOutLine);

	paper.text(chartA.bars[0].x + width/4, y + height, labelA);
	paper.text(chartB.bars[0].x + width/4, y + height, labelB);
	*/
	
	var thing =	{
'label': 'Tablets & eBook Readers',
'percentilePrice': [[48,61.04,112.5,265,652.99],[17.49,82,180,300,600],[150,150,290,310,310],[10.11,29.95,55,112.5,399]],
'percentileBids': [[1,7,17,33,44],[1,5,15,26,59],[8,8,15,18,18],[1,3,10,20,33]],
'links': [["http://www.ebay.com/itm/Archos-7-Home-Tablet-8gb-/271198191034?pt=US_Tablets","http://www.ebay.com/itm/7-Teclast-P76V-Tablet-PC-Allwinner-A13-Android-4-0-5-Point-Capacitive-WiFi-8GB-/400481497738?pt=US_Tablets","http://www.ebay.com/itm/Brand-New-PINK-ANDROID-4-0-AllWinner-A13-Q88-7-Capacitive-WIFI-Tablet-PC-4GB-/290909157793?pt=US_Tablets","http://www.ebay.com/itm/SVP-9-inch-Android-4-0-Tablet-PC-w-Google-Play-Store-Dual-Camera-8GB-Nand-/350787731056?pt=US_Tablets","http://www.ebay.com/itm/NEW-7-Android-4-0-Tablet-PC-4GB-Wifi-Capacitive-Screen-Netbook-Computer-BK-/271201456817?pt=US_Tablets"],["http://www.ebay.com/itm/Google-Nexus-10-16GB-accessories-mint-condition-/230968822320?pt=US_Tablets","http://www.ebay.com/itm/Apple-iPad-4th-Generation-Retina-Display-32GB-Wi-Fi-9-7in-Black-/151036596006?pt=US_Tablets","http://www.ebay.com/itm/Barnes-Noble-NOOK-Color-8GB-Oberon-Tree-Life-Leather-Warranty-/111062886716?pt=US_Tablets","http://www.ebay.com/itm/Asus-TF300T-10-1-IPS-16GB-Android-4-0-Ice-Cream-Sandwich-Tablet-/161017129557?pt=US_Tablets","http://www.ebay.com/itm/Microsoft-Surface-Pro-128GB-With-Type-Cover-and-Wedge-Mouse-/321116053452?pt=US_Tablets"],[],["http://www.ebay.com/itm/Nexus-7-16GB-Wi-Fi-7in-Black-/111062871394?pt=US_Tablets","http://www.ebay.com/itm/Nexus-7-16GB-Wi-Fi-7in-Black-/111062871394?pt=US_Tablets","http://www.ebay.com/itm/Apple-iPad-mini-16GB-Wi-Fi-Bundled-Smart-Cover-/281100526009?pt=US_Tablets","http://www.ebay.com/itm/Acer-Iconia-Tab-A200-16GB-Wi-Fi-10-1in-/171032550411?pt=US_Tablets","http://www.ebay.com/itm/Acer-Iconia-Tab-A200-16GB-Wi-Fi-10-1in-/171032550411?pt=US_Tablets"],["http://www.ebay.com/itm/Kobo-eReader-Touch-touchscreen-not-working-/200922018309?pt=US_Tablets","http://www.ebay.com/itm/NOT-WORKING-SYLVANIA-SYNET7LP-PC-TABLET-/181133175673?pt=US_Tablets","http://www.ebay.com/itm/NOT-WORKING-MOTOROLA-XOOM-MZ604-INTERNET-TABLET-/310663480106?pt=US_Tablets","http://www.ebay.com/itm/Barnes-Noble-NOOK-Simple-Touch-2GB-Wi-Fi-Electronic-Book-e-Reader-BRAND-NEW-/290909156369?pt=US_Tablets","http://www.ebay.com/itm/Samsung-Galaxy-Note-GT-N8013-16GB-Wi-Fi-10-1in-White-/261209576053?pt=US_Tablets"]],
'labels': ["New","HQ Used","Refurbished","Acceptable"]
};
	
	//low, 25, median, 75, high
	var data = [[2, 4, 8, 9, 13],[ 4, 6, 7, 8, 9], [10, 13, 15 , 17, 19]];
	var datb = [[2, 4, 8, 9, 13], [0.50, 13, 15 , 17, 19]];
	//remove null entries
	data = data.filter(function(){return true});

	var conditionNamesa = ["New", "Used", "Refurbished"];
	var conditionNamesb = ["New", "Used"];
	var aAxes = ["Price", null];
	var bAxes = [null, "Condition"];
	//for categories with different avaiable conditions, we either force selection of similar ones, or just put in blank data.
	var graphA = new BoxPlot(paper, x, y, width, height, thing['percentilePrice'], thing['labels'], aAxes);
	var graphB = new BoxPlot(paper, x + width + 20, y, width, height, datb, conditionNamesb, bAxes);
	//graphB.remove();
}
