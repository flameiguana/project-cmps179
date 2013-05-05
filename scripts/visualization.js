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

function hoverIn(){
	this.bubble = this.paper.popup(this.middleX, this.middleY, this.percent + "% " + "Difference");
	this.animate({"stroke-width": 6});
}

function hoverOut(){
	this.animate({"stroke-width": 3});
	this.bubble.animate({opacity: 0}, 200, function () {this.remove();});
}

//TODO be able to pass in any number of colors, alternate between these colors
function BoxPlot(paper, x, y, width, height, data, labels) {
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

	//draw axes, might wanna style color of text
	paper.text(x, y, "$").attr({"font-size" : "14px"});
	paper.text(x + width - 14, y + height, "C").attr({"font-size" : "14px"});
	var verticalAxis = "M" + x + "," + (y + 11) + "L" + x + "," + (y + height);
	var horizontalAxis = "M" + x + "," + (y + height) + "L" + (x + width - 22)  + "," + (y + height);
	paper.path(verticalAxis);
	paper.path(horizontalAxis);

	for(var i = 0; i < that.boxCount; i++){
		var leftX = x + margin + i*width/that.boxCount;
		var medianY = y + (height - data[i][median] * scale);
		var lowY = y + (height - data[i][low] * scale);
		var highY = y + (height - data[i][high] * scale);
		var medianLine = "M" + leftX + "," + medianY + "," + (leftX + boxWidth) + "," + medianY;
		var verticalLine = "M" + (leftX + boxWidth/2) + "," + highY + "," + (leftX + boxWidth/2) + "," + lowY;
		var length = data[i][seventyFifth] - data[i][twentyFifth];

		//Render the boxes
		//Todo: Hovering over the box displays exact values for prices.
		paper.path(verticalLine);
		paper.rect(leftX, y + (height - data[i][seventyFifth]* scale), boxWidth, length * scale)
			.attr({fill: "#00AD6C", "stroke" : "#60D6A9", "stroke-width": 1});
		paper.path(medianLine).attr({"stroke-width" : 3, "stroke" :"#1533AE"});
		//Need a bottom margin, put this below bottom axis
		paper.text(leftX + boxWidth/2, y + height + 10, labels[i]);
		//Create lines for slopes
		if(i > 0){
			var percentDifference = 
				Math.abs((data[i-1][median] - data[i][median])/average(data[i-1][median], data[i][median])) * 100;
			var rightOfPrev = leftX - boxWidth;
			var prevMedianY = y +  (height - data[i-1][median] * scale);
			var medianSlope = "M" + rightOfPrev + "," + prevMedianY + "L" + leftX + "," + medianY;
			that.lines.push(paper.path(medianSlope)
				.attr({"stroke" :"#1533AE", "stroke-width" : 3, "stroke-linecap": "round"}));
			that.lines[i-1].hover(hoverIn, hoverOut);
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
	var hoverIn = function(){
		this.flag = paper.popup(this.bar.x, this.bar.y, "$" + Math.round(this.bar.value) || "0").insertBefore(this);
	};

	var hoverOut = function(){
		this.flag.animate({opacity: 0}, 200, function () {this.remove();});
	};
*/

	//Pass in median of values.
	//[used, new]
	//var dataCombined = [dataofA, dataofB];

	//Note that both graphs end up being same height although the values are very different. This is very useful.
	var  width = 500, height = 500;
	var x = divWidth/2 - width;
	var y = 100;
	
	var opts = 
	{
	colors: ["#2F69BF", "#808080"]
	};
	/*
	var chartA = paper.barchart(x, y, width, height, dataofA, opts)
		.hover(hoverIn, hoverOut);
		
	var chartB = paper.barchart(x + width + 10, y, width, height, dataofB, opts)
		.hover(hoverIn, hoverOut);

	paper.text(chartA.bars[0].x + width/4, y + height, labelA);
	paper.text(chartB.bars[0].x + width/4, y + height, labelB);
	*/
	

    //low, 25, median, 75, high
	var data = [[2, 4, 8, 9, 13],[ 4, 6, 7, 8, 9], [10, 13, 15 , 17, 19]];
	var conditionNames = ["New", "Used", "Refurbished"];
	var graph = BoxPlot(paper, x, y, width, height, data, conditionNames);
	//Fibonacci using memoization instead of pure recursion.
}
