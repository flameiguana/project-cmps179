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
}
function hoverOutCircle(){
	this.attr({cursor : "pointer"});
	this.animate({opacity: .4}, 140);
}

function goToProduct(){
	window.open("https://www.google.com/");
}
//TODO be able to pass in any number of colors, alternate between these colors
function BoxPlot(paper, x, y, width, height, data, labels) {
	function buildLine(x1, y1, x2, y2){
		return "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
	}
	if(labels.length != data.length){
		console.log("Warning: Names and Category counts don't match.");
	}
	var that = {};
	that.x = x;
	that.y = y;
	that.width = width;
	that.height = height;
	that.paper = paper;
	that.boxCount = data.length;
	that.lines = [];
	
	//Indicies into data array.
	var low = 0;
	var twentyFifth = 1;
	var median = 2;
	var seventyFifth = 3;
	var high = 4;

	var circleAttributes = {"stroke-width" : 1, fill:"#007046", opacity : .4};
	//Find the highest value in data, use it to normalize.
	var maxValue = 0;
	for(var i = 0; i < that.boxCount; i++){
		var potentialMax = Math.max.apply(Math, data[i]);
		if(maxValue < potentialMax)
			maxValue = potentialMax;
	}
	console.log(maxValue);
	var scale = 1 / maxValue * height;
	var boxWidth =  width/that.boxCount/2;
	var margin = boxWidth/2;
	var circleRadius = boxWidth/9;
	//draw axes, might wanna style color of text
	paper.text(x, y - 10, "Price").attr({"font-size" : "14px"});
	paper.text(x + width + 4, y + height, "Condition").attr({"font-size" : "14px", "text-anchor" : "start"});

	var verticalAxis = buildLine(x, y, x, (y + height));
	var horizontalAxis = buildLine(x, y + height, x + width, y + height);
	paper.path(verticalAxis);
	paper.path(horizontalAxis);

	for(var i = 0; i < that.boxCount; i++){
		var bubbles = [];
		var leftX = x + margin + i*width/that.boxCount;
		
		var lowY = y + (height - data[i][low] * scale);
		var twentyFifthY = y + (height - data[i][twentyFifth]*scale);
		var seventyFifthY = y + (height - data[i][seventyFifth]*scale);
		var medianY = y + (height - data[i][median] * scale);
		var highY = y + (height - data[i][high] * scale);
		var length = data[i][seventyFifth] - data[i][twentyFifth];

		var medianLine = buildLine(leftX, medianY, (leftX + boxWidth), medianY);
		var verticalLine =  buildLine((leftX + boxWidth/2), highY, (leftX + boxWidth/2), lowY);
		var bottomWhisker = buildLine(leftX + boxWidth/4, lowY, leftX + boxWidth - boxWidth/4, lowY);
		var topWhisker = buildLine(leftX + boxWidth/4, highY, leftX + boxWidth - boxWidth/4, highY);
		//Render the boxes
		//Todo: Hovering over the box displays exact values for prices.
		paper.path(verticalLine);
		paper.path(bottomWhisker);
		paper.path(topWhisker);
		paper.rect(leftX, y + (height - data[i][seventyFifth]* scale), boxWidth, length * scale)
			.attr({fill: "#00AD6C", "stroke-width": 1});
		paper.path(medianLine).attr({"stroke-width" : 3, "stroke" :"#1533AE"});
		//Need a bottom margin, put this below bottom axis
		paper.text(leftX + boxWidth/2, y + height + 10, labels[i]);
		//TODO: When hovering over circle, show crosshair and enlarge circle
		
		bubbles.push(paper.circle(leftX + boxWidth/2, lowY, circleRadius).attr(circleAttributes));
		bubbles.push(paper.circle(leftX + boxWidth/2, highY, circleRadius).attr(circleAttributes));
		bubbles.push(paper.circle(leftX + boxWidth/2, twentyFifthY, circleRadius).attr(circleAttributes));
		bubbles.push(paper.circle(leftX + boxWidth/2, seventyFifthY, circleRadius).attr(circleAttributes));
		bubbles.push(paper.circle(leftX + boxWidth/2, medianY, circleRadius).attr(circleAttributes));
		$(bubbles).each(function(){
			this
				.hover(hoverInCircle, hoverOutCircle)
				.click(goToProduct);
		});
		//Create lines for slopes
		if(i > 0){
			var percentDifference = 
				Math.abs((data[i-1][median] - data[i][median])/average(data[i-1][median], data[i][median])) * 100;
			var rightOfPrev = leftX - boxWidth;
			var prevMedianY = y +  (height - data[i-1][median] * scale);
			var medianSlope = buildLine(rightOfPrev, prevMedianY, leftX, medianY);
			that.lines.push(paper.path(medianSlope)
				.attr({"stroke" :"#1533AE", "stroke-width" : 3, "stroke-linecap": "round"}));
			that.lines[i-1].hover(hoverInLine, hoverOutLine);
			//add new property percent 
			that.lines[i-1].percent = Math.round(percentDifference);
			that.lines[i-1].middleX = average(rightOfPrev, leftX);
			that.lines[i-1].middleY = average(prevMedianY, medianY);
		}
	}
}


//should pass in data here
function drawVisualization(labelA, labelB, dataofA, dataofB) {

	var divWidth = $('#vis').width();
	var divHeight = $('#vis').height();
	var paper = new Raphael("vis", divWidth, divHeight);


	/*
	median             median
	price              price
	 |                 |
	 |         new     |
	 |          []     |
	 |          []     | used    new
	 |   used   []     |   []    []
	 |    []    []     |   []    []
	 |____[]____[]__   |___[]____[]_________ 
		condtion            condition
	We use median because we dont think prices are symmetrically distributed.
	Problems:
	Doesn't account for distribution of prices (high-end models/brands vs low-end)
	The user has to make judgements based on two separate graphs.
	Also want to take into consideration:.
	Percent of items sold at that condition
	*/

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

	//Note that both graphs end up being same height although the values are very different. This is very useful.
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
	

    //low, 25, median, 75, high
	var data = [[2, 4, 8, 9, 13],[ 4, 6, 7, 8, 9], [10, 13, 15 , 17, 19]];
	var conditionNames = ["New", "Used", "Refurbished"];
	var graph = BoxPlot(paper, x, y, width, height, data, conditionNames);
}
