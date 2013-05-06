$('body').on('mouseleave', '#sidebar-left', moveSidebar);
$('body').on('mouseover', '#sidebar-alert-left', moveSidebar);

$('body').on('mouseleave', '#sidebar-right', moveSidebar);
$('body').on('mouseover', '#sidebar-alert-right', moveSidebar);

$('.option').click(productSelect);

//this should be set the same as the one in the real css
var _sidebarWidth = 180;

function moveSidebar(e) {
	var dir = 'left';
	if (e.currentTarget.id.indexOf('right') !== -1) {
		dir = 'right';
	}
	var leftDist = Number($('#sidebar-' + dir).css(dir).replace('px', ''));		//get rid of the 'px' returned by .css('left') and turn it into a number

	//assuming we're moving to the right
	var moveTo = -1;
	var opacity = 1;
	
	//if the mouse has left
	if(e.type == 'mouseleave'){
		moveTo = -_sidebarWidth;
		opacity = 1;
	}
	
	var distToAnimate = moveTo-leftDist;
	
	//hide the alert as soon as we start animating
	if(e.type != 'mouseleave'){
		$('#sidebar-alert-' + dir).css(dir, '-250px');
	}
	else{
		$('#sidebar-alert-' + dir).css(dir, '-0px');
	}
	
	//if it's animating, stop and change directions
   	if($('#sidebar-' + dir).is(':animated')){
		$('#sidebar-' + dir).stop();
	}
	if (dir == 'left') {
		$('#sidebar-' + dir).animate({
		opacity: opacity,
		left: '+=' + distToAnimate
		}, {
		  duration: 700,
		      easing: 'easeOutExpo',
		  complete: function() {
		   
		  }
		});
	}else{
		$('#sidebar-' + dir).animate({
		opacity: opacity,
		right: '+=' + distToAnimate
		}, {
		  duration: 700,
		      easing: 'easeOutExpo',
		  complete: function() {
		   
		  }
		});
	}
}

function productSelect(e) {
	console.log(e.target.innerHTML);
	var innerHTML = e.target.innerHTML
	_graphA.remove();
	_graphB.remove();
	dataA = data[innerHTML];
	dataB = data[innerHTML];
	drawVisualization(dataA['label'], dataB['label'], dataA['percentilePrice'], dataB['percentilePrice'], dataA['labels'], dataB['labels'], dataA['links'], dataB['links'], 'Price');
}