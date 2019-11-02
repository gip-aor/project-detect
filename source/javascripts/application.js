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

jQuery(document).ready(function(){
jQuery("#mapsvg").mapSvg({markerLastID: 3,width: 596.41547,height: 584.5448,colors: {baseDefault: "#000000",background: "transparent",directory: "#fafafa",status: {},base: "#00597B",stroke: "white",hover: "#143f55",selected: "#143f55"},regions: {'FR-CE': {disabled: false},'FR-LP': {disabled: false}},viewBox: [0,0,596.41547,584.5448],cursor: "pointer",popovers: {mode: "off",on: false,priority: "local",position: "top",centerOn: false,width: 300,maxWidth: 50,maxHeight: 50,resetViewboxOnClose: true,mobileFullscreen: true},gauge: {on: false,labels: {low: "low",high: "high"},colors: {lowRGB: {r: 85,g: 0,b: 0,a: 1},highRGB: {r: 238,g: 0,b: 0,a: 1},low: "#550000",high: "#ee0000",diffRGB: {r: 153,g: 0,b: 0,a: 0}},min: 0,max: false},source: "images/france-new.svg",title: "France-new",markers: [{id: "marker_1",attached: true,isLink: false,tooltip: "Htkvzevzr",data: {},src: "/mapsvg/markers/pin1_blue.png",width: 15,height: 24,x: 184.64758384204754,y: 337.236670360992,geoCoords: [45.289005,-0.170821]},{id: "marker_2",attached: true,isLink: false,data: {},src: "/mapsvg/markers/pin1_red.png",width: 15,height: 24,x: 329.0707704268872,y: 341.0348287570356,geoCoords: [45.224646,3.305676]},{id: "marker_3",attached: true,isLink: false,data: {},src: "/mapsvg/markers/pin1_yellow.png",width: 15,height: 24,x: 270.21582445088393,y: 452.0433533153723,geoCoords: [43.311423,1.888943]}],responsive: true});
});
