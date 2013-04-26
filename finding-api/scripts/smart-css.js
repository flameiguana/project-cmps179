updateCss();
$(window).resize(updateCss);

$('body').on('mouseover', '#sidebar-alert', moveInSidebar);
$('body').on('mouseleave', '#sidebar', moveOutSidebar);
//$('body').on('mouseover', '#sidebar', moveInSidebar);

function moveInSidebar() {
    $('#sidebar-alert').css('visibility', 'hidden');
    $('#sidebar').css('visibility', 'visible');
}

function moveOutSidebar() {
    $('#sidebar-alert').css('visibility', 'visible');
    $('#sidebar').css('visibility', 'hidden');
}

function updateCss() {
    //this should be set the same as the one in the real css
    var sideBarWidth = 250;
    var containerWidth = $(window).width() - sideBarWidth;
    
    $('#sidebar').css('width', sideBarWidth + 'px');
    
    $('#container').css('left', sideBarWidth + 'px');
    $('#container').css('width', containerWidth + 'px');
}