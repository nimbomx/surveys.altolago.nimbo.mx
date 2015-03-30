


$(function() {
	$("#slider").draggable({
		axis: 'x',
		containment: 'parent',
		drag: function(event, ui) {
			if (ui.position.left < -390) {
				startSurvey();
			} 
		},
		stop: function(event, ui) {
			if (ui.position.left > 0 || ui.position.left < 0) {
				$(this).animate({
					left: 0
				})
			}
		}
	});
	
	// The following credit: http://www.evanblack.com/blog/touch-slide-to-unlock/
	$('#slider')[0].style.webkitTransform = 'translateX(397px)';
	$('.slider')[0].style.webkitTransform = 'translateX(397px)';
	$('#slider')[0].addEventListener('touchmove', function(event) {
	    event.preventDefault();
	    var el = event.target;
	    var touch = event.touches[0];
	    var w = $(window).width();
	    curX = touch.pageX - this.offsetLeft - ((w/2)-200);
	    if(curX <= 0) return;
	    if(curX > 397) return;
	    
	    if(curX < 50){
	    	startSurvey();
	    }
	   	el.style.webkitTransform = 'translateX(' + curX + 'px)'; 
	}, false);
	
	$('#slider')[0].addEventListener('touchend', function(event) {	
	    this.style.webkitTransition = '-webkit-transform 0.3s ease-in';
	    this.addEventListener( 'webkitTransitionEnd', function( event ) { this.style.webkitTransition = 'none'; }, false );
	    this.style.webkitTransform = 'translateX(397px)';
	}, false);

	$('.slider')[0].addEventListener('touchmove', function(event) {
	    event.preventDefault();
	    var el = event.target;
	    var touch = event.touches[0];
	    var w = $(window).width();
	    curX = touch.pageX - this.offsetLeft - ((w/2)-200);
	    if(curX <= 0) return;
	    if(curX > 397) return;
	    
	    if(curX < 50){
	    	alert('s');
	    }
	   	el.style.webkitTransform = 'translateX(' + curX + 'px)'; 
	}, false);
	$('.slider')[0].addEventListener('touchend', function(event) {	
	    this.style.webkitTransition = '-webkit-transform 0.3s ease-in';
	    this.addEventListener( 'webkitTransitionEnd', function( event ) { this.style.webkitTransition = 'none'; }, false );
	    this.style.webkitTransform = 'translateX(397px)';
	}, false);
});