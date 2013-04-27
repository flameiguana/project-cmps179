$('body').on('mouseover', '#sidebar-alert', moveSidebar);
//$('body').on('mouseover', '#container', moveSidebar);
$('body').on('mouseleave', '#sidebar', moveSidebar);

//this should be set the same as the one in the real css
var _sidebarWidth = 250;

function moveSidebar(e) {
	var leftDist = Number($('#sidebar').css('left').replace('px', ''));		//get rid of the 'px' returned by .css('left') and turn it into a number

	//assuming we're moving to the right
	var moveTo = 0;
	var opacity = 1;
	
	//if the mouse has left
	if(e.type == 'mouseleave'){
		moveTo = -250;
		opacity = 0;
	}
	
	var distToAnimate = moveTo-leftDist;
	
	//hide the alert as soon as we start animating
	$('#sidebar-alert').css('left', '-250px');
	
	//if it's animating, stop and change directions
   	if($('#sidebar').is(':animated')){
		$('#sidebar').stop();
	}

	/*$('#sidebar').animate({
		opacity: opacity,
		left: '+=' + distToAnimate
	  }, {
		duration: 500,
		easing: "easeInQuint",
		},
		function() {
			alert("done");
		 if(leftDist < 0)
				$('#sidebar-alert').css('left', '0px');
			  else
				$('#sidebar-alert').css('left', '-250px');
		});	*/
	 $('#sidebar').animate({
    opacity: opacity,
		left: '+=' + distToAnimate
  }, {
    duration: 700,
	easing: 'easeOutExpo',
    complete: function() {
      if(e.type != 'mouseleave')
		$('#sidebar-alert').css('left', '0px');
	  else
		$('#sidebar-alert').css('left', '-250px');
    }
  });
}