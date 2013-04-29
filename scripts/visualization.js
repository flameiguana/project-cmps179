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
	stats.sort(function (a, b) {return a-b});
	var middle = (values.length/2).integer();
	if((middle.length % 2) === 0)
		return values[middle];
	else //average middle two values
		return (values[middle-1] + values[middle]) / 2;
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
		this.flag = paper.popup(this.bar.x, this.bar.y, "$" + this.bar.value || "0").insertBefore(this);
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
	var chartA = paper.barchart(x, y, width, height, dataofA)
		.hover(hoverIn, hoverOut);
	var chartB = paper.barchart(x + width + 10, y, width, height, dataofB)
		.hover(hoverIn, hoverOut);

	paper.text(chartA.bars[0].x + width/4, y + height, labelA);
	paper.text(chartB.bars[0].x + width/4, y + height, labelB);




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
