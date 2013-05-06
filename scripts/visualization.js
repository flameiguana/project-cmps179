//Notes from JavaScript book
//Allows us to add a function to a prototype.
Function.prototype.method = function (name, func) {
	this.prototype[name] = func;
	return this;
};


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


//Callback Functions
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
	this.boxPlot.removePrices();
	this.animate({fill: "#FFB300"}, 120);
	this.boxPlot.showPrices(this.boxID);
}
function hoverOutBox(){
	this.animate({fill: "#00AD6C"}, 120);
}

function goToProduct(){
	window.open(this.boxPlot.links[this.conditionIndex][this.percentileIndex]);
}

//TODO be able to pass in any number of colors, alternate between these colors
function BoxPlot(paper, x, y, width, height, mainLabel, data, labels, links, axesNames, fakeBoxCount) {
	function buildLine(x1, y1, x2, y2){
		return "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
	}
	if(labels.length != data.length){
		console.log("Warning: Names and Category counts don't match.");
	}
 	axesNames = typeof axesNames !== 'undefined' ? axesNames : [null, null];

	this.paper = paper;
	this.data = data;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.data = data;
	this.links = links;
	this.boxCount = typeof fakeBoxCount !== 'undefined' ? fakeBoxCount : data.length;
	var this_outSideScope = this;

	var priceFlags = [];
	var yCoords = [];
	//Used for deleting.
	var bubbles = [];
	var boxes = [];
	var diffLines = [];
	var otherElements = [];

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

	//draw axes, might wanna style color of text. If a fake box count is used, the axis length is altered.
	var altWidth = width;
	if(data.length != this.boxCount)
		altWidth = width - (this.boxCount - data.length)*(boxWidth + margin); //adjust width depending on number of boxes missing.
	if(axesNames[0] !== null)
		otherElements.push(paper.text(x, y - 12, axesNames[0]).attr({"font-size" : "14px"}));
	if(axesNames[1] !== null)
		otherElements.push(paper.text(x + altWidth + 4, y + height, axesNames[1]).attr({"font-size" : "14px", "text-anchor" : "start"}));
	otherElements.push(paper.text(x + altWidth/2, y - 26, mainLabel).attr({"font-weight" : "bold", "font-size" : "16px", "text-anchor" : "start"}));
	var verticalAxis = buildLine(x, y, x, (y + height));
	var horizontalAxis = buildLine(x, y + height, x + altWidth, y + height);
	otherElements.push(paper.path(verticalAxis));
	otherElements.push(paper.path(horizontalAxis));

	
	for(var i = 0; i < data.length; i++){
		bubbles[i] = [];
		yCoords[i] = [];

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

		//Whiskers
		otherElements.push(paper.path(verticalLine));
		otherElements.push(paper.path(bottomWhisker));
		otherElements.push(paper.path(topWhisker));
		//Need a bottom margin, put this below bottom axis
		otherElements.push(paper.text(leftX + boxWidth/2, y + height + 10, labels[i]));

		//Box
		boxes.push(paper.rect(leftX, y + (height - data[i][seventyFifth]* scale), boxWidth, length * scale)
			.attr({fill: "#00AD6C", "stroke-width": 1})
			.hover(hoverInBox, hoverOutBox));
		boxes[i].boxID = i;
		boxes[i].boxPlot = this;

		//median line
		otherElements.push(paper.path(medianLine).attr({"stroke-width" : 3, "stroke" :"#1533AE"}));

		bubbles[i].push(paper.circle(leftX + boxWidth/2, yCoords[i][low], circleRadius));
		bubbles[i].push(paper.circle(leftX + boxWidth/2, yCoords[i][twentyFifth], circleRadius));
		bubbles[i].push(paper.circle(leftX + boxWidth/2, yCoords[i][median], circleRadius));
		bubbles[i].push(paper.circle(leftX + boxWidth/2, yCoords[i][seventyFifth], circleRadius));
		bubbles[i].push(paper.circle(leftX + boxWidth/2, yCoords[i][high], circleRadius));
		
		$(bubbles[i]).each(function(j, v){
			this
				.hover(hoverInCircle, hoverOutCircle)
				.click(goToProduct)
				.attr(circleAttributes);
			this.axisX = x;
			this.boxPlot = this_outSideScope;
			this.conditionIndex =i;
			this.percentileIndex = j;
			this.price = data[i][j];
		});
		//Create diagonal lines
		if(i > 0){
			var percentDifference = 
				Math.abs((data[i-1][median] - data[i][median])/average(data[i-1][median], data[i][median])) * 100;
			var rightOfPrev = leftX - boxWidth;
			var prevMedianY = y +  (height - data[i-1][median] * scale);
			var medianSlope = buildLine(rightOfPrev, prevMedianY, leftX,  yCoords[i][median]);
			diffLines.push(paper.path(medianSlope)
				.attr({"stroke" :"#1533AE", "stroke-width" : 3, "stroke-linecap": "round"}));
			diffLines[i-1].hover(hoverInLine, hoverOutLine);
			//add new property percent
			diffLines[i-1].percent = Math.round(percentDifference);
			diffLines[i-1].middleX = average(rightOfPrev, leftX);
			diffLines[i-1].middleY = average(prevMedianY, yCoords[i][median]);
		}
	}
	
	this.showPrices = function (xIndex){
		for(var i = 0; i < this.data[xIndex].length; i++){
			var v = this.data[xIndex][i];
			priceFlags[i] = this.paper.text(this.x - 8, yCoords[xIndex][i], "$" + v ).attr({"text-anchor" : "end"});
		}
		/*
		$(data[xIndex]).each(function(i, v){
			priceFlags[i] = paper.text(x-8, yCoords[xIndex][i], "$" + v).attr({"text-anchor" : "end"});
			//priceFlags[i] = paper.popup(x, yCoords[xIndex][i], "$" + v, "left");
		});
		*/
	};
	this.removePrices = function(){
		$(priceFlags).each(function(i, v){
			v.remove();
		});
	};

	//Deletes all dom elements attached to graph.
	this.remove = function(){
		for(var i = 0; i < bubbles.length; i++){
			for(var j = 0; j < 5; j++)
				bubbles[i][j].remove();
		}
		for(var i = 0; i < boxes.length; i++)
			boxes[i].remove();
		for(var i = 0; i < diffLines.length; i++)
			diffLines[i].remove();
		for(var i = 0; i < otherElements.length; i++)
			otherElements[i].remove();
	};
	return this;
}


//should pass in data here
var _graphA;
var _graphB;
function drawVisualization(labelA, labelB, dataofA, dataofB, conditionNamesA, conditionNamesB, linksA, linksB, axisLabel) {
	var divWidth = $('#vis').width();
	var divHeight = $('#vis').height();
	var paper = new Raphael("vis", divWidth, divHeight);

	//Note this both graphs end up being same height although the values are very different. This is very useful.
	var  width = 320, height = 420;
	var x = divWidth/2 - width;
	var y = 100;
	
	var opts = 
	{
	colors: ["#2F69BF", "#808080"]
	};
	/*
	paper.text(chartA.bars[0].x + width/4, y + height, labelA);
	paper.text(chartB.bars[0].x + width/4, y + height, labelB);
	*/
	
    //low, 25, median, 75, high

	var aAxes = [axisLabel, null];
	var bAxes = [null, "Condition"];
	//for categories with different avaiable conditions, we either force selection of similar ones, or just put in blank data.
	_graphA = new BoxPlot(paper, x, y, width, height, labelA, dataofA, conditionNamesA, linksA, aAxes);
	//graphA.remove();
	_graphB = new BoxPlot(paper, x + width + 30, y, width, height, labelB, dataofB, conditionNamesB, linksB, bAxes);
}
