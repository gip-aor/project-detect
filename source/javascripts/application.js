//= require jquery
//= require popper
//= require bootstrap-sprockets
//= require_tree .

// We modified the tree above in order to have it work with Bootstrap 4


$(document).ready(function() {

    $(window).scroll(function() {

        var height = $('.first-container').height();
        var scrollTop = $(window).scrollTop();

        if (scrollTop >= height - 40) {
            $('.nav-container').addClass('solid-nav');
        } else {
            $('.nav-container').removeClass('solid-nav');
        }

    });
});


 $(function() {
    $('.scroll-down').click (function() {
      $('html, body').animate({scrollTop: $('div.ok').offset().top }, 'slow');
      return false;
    });
  });


$(document).ready(function() {
        // Transition effect for navbar
        $(window).scroll(function() {
          // checks if window is scrolled more than 500px, adds/removes solid class
          if($(this).scrollTop() > 500) {
              $('.navbar').addClass('solid');
          } else {
              $('.navbar').removeClass('solid');
          }
        });
});


