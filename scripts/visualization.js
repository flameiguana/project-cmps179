//Notes from JavaScript book
//Allows us to add a function to a prototype.
Function.prototype.method = function (name, func) {
	this.prototype[name] = func;
	return this;
};

//Number type now has a method to return an integer.
Number.method('integer', function () {
	return Math[this < 0 ? 'ceil' : 'floor'](this);
});
//ie (1.5).integer()


//Instead of this, draw when data has loaded.
//$(document).ready(drawVisualization);

//Returns median of an array.
function getMedian(values){
	values.sort(function (a, b) {return a-b});
	var middle = Math.floor(values.length/2);
	if((middle.length % 2) === 0)
		return values[middle];
	else //average middle two values
		return (values[middle-1] + values[middle]) / 2;
}


//TODO be able to pass in any number of colors, alternate between these colors
function BoxPlot(paper, x, y, width, height, data) {
	var that = {};

	that.x = x;
	that.y = y;
	that.width = width;
	that.height = height;
	that.paper = paper;
	that.boxCount = data.length;
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
	var scale = 1 / maxValue * height;
	var boxPrev = 0;
	var boxCurr = 1;
	for(var i = 0; i < that.boxCount; i++){
		var leftX = x + i*width/that.boxCount;
		var boxWidth =  width/that.boxCount/2;
		var medianY = height - data[i][median] * scale;
		var lowY = height - data[i][low] * scale;
		var highY = height - data[i][high] * scale;
		var medianLine = "M" + leftX + "," + medianY + "L" + (leftX + boxWidth) + "," + medianY + "Z";
		var verticalLine = "M" + (leftX + boxWidth/2) + "," + highY + "L" + (leftX + boxWidth/2) + "," + lowY +  "Z";
		var length = data[i][seventyFifth] - data[i][twentyFifth];
		if(i > 0 && i < that.boxCount){
			var rightOfPrev = leftX - boxWidth;
			var prevMedianY = height - data[i-1][median] * scale;
			var medianSlope = "M" + rightOfPrev + "," + prevMedianY + "L" + leftX + "," + medianY + "Z";
			paper.path(medianSlope);
		}
		paper.path(verticalLine);
		paper.rect(leftX, height - data[i][seventyFifth]* scale, boxWidth, length * scale)
			.attr({fill: "#2F69BF", "stroke-width": 0});
		paper.path(medianLine);
	}

	//Draw line between medians, should pass in bool to see if this is wanted or not

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


	var hoverIn = function(){
		this.flag = paper.popup(this.bar.x, this.bar.y, "$" + Math.round(this.bar.value) || "0").insertBefore(this);
	};

	var hoverOut = function(){
		this.flag.animate({opacity: 0}, 200, function () {this.remove();});
	};


	//Pass in median of values.
	//[used, new]
	//var dataCombined = [dataofA, dataofB];

	//Note that both graphs end up being same height although the values are very different. This is very useful.
	var  width = 320, height = 220;
	var x = divWidth/2 - width;
	var y = 200;
	
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
	data = [[2, 4, 8, 9, 13],[4, 6, 7, 8, 9], [10, 13, 15 , 17, 19]];
	var graph = BoxPlot(paper, x, y, width, height, data);
	//Fibonacci using memoization instead of pure recursion.
	var fibonacci = (function ( ) {
		var memo = [0, 1];
		var fib = function (n) {
		var result = memo[n];
		if (typeof result !== 'number') {
			result = fib(n - 1) + fib(n - 2);
			memo[n] = result;
		}
		return result;
		};
		return fib;
	}());
}
