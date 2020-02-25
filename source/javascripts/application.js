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
      $('html, body').animate({scrollTop: $('div.ok').offset().top-149 }, 'slow');
      return false;
    });
  });

  $(function() {
    $('.scroll-contact').click (function() {
      $('html, body').animate({scrollTop: $('div.ok').offset().top-109 }, 'slow');
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

// $(document).ready(function() {
//         // Transition effect for navbar
//         $(window).scroll(function() {
//           // checks if window is scrolled more than 500px, adds/removes solid class
//           if($(this).scrollTop() < 500) {
//               $('.logo').addClass('logo-invert');
//           } else {
//               $('.logo').removeClass('logo-invert');
//           }
//         });
// });


// DOM Variables
var initialImg = "https://i.imgur.com/BPD3Fy6.png";
var scrollImg = "https://i.imgur.com/FKhHemf.png";
var nav = document.getElementById('navbar');
// Scrolling Function
$(window).scroll(function(){
  $('nav').toggleClass('scrolled', $(this).scrollTop() > 500);
});
// Change Logo and Logo Height on Scroll
$(window).scroll(function() {
   var value = $(this).scrollTop();
   if (value > 500)
      $(".logo").attr("src", scrollImg);
  else
      $(".logo").attr("src", initialImg);
});


if (window.matchMedia("(min-width: 800px)").matches) {
jQuery(document).ready(function(){
jQuery("#mapsvg").mapSvg({markerLastID: 3,width: 596.41547,height: 584.5448,loadingText: "Chargement...",colors: {baseDefault: "#000000",background: "transparent",selected: "#143f55",directory: "#fafafa",status: {},base: "#00597B",hover: "#143f55",stroke: "white"},regions: {'FR-AC': {id: "FR-AC",'id_no_spaces': "FR-AC",title: "Nouvelle-Aquitaine",href: "contact-nouvelle-aquitaine",data: {}},'FR-AO': {id: "FR-AO",'id_no_spaces': "FR-AO",title: "Grand Est",href: "contact-autres-regions",data: {}},'FR-AR': {id: "FR-AR",'id_no_spaces': "FR-AR",title: "Auvergne-Rhône-Alpes",href: "contact-auvergne-rhone-alpes",data: {}},'FR-BF': {id: "FR-BF",'id_no_spaces': "FR-BF",title: "Bourgogne-Franche-Comté",href: "contact-autres-regions",data: {}},'FR-BT': {id: "FR-BT",'id_no_spaces': "FR-BT",title: "Brittany",href: "contact-autres-regions",data: {}},'FR-CE': {id: "FR-CE",'id_no_spaces': "FR-CE",title: "Corsica",href: "contact-autres-regions",data: {}},'FR-CN': {id: "FR-CN",'id_no_spaces': "FR-CN",title: "Centre-Val de Loire",href: "contact-autres-regions",data: {}},'FR-IF': {id: "FR-IF",'id_no_spaces': "FR-IF",title: "Île-de-France",href: "contact-autres-regions",data: {}},'FR-LP': {id: "FR-LP",'id_no_spaces': "FR-LP",title: "Occitanie",href: "contact-occitanie",data: {}},'FR-NC': {id: "FR-NC",'id_no_spaces': "FR-NC",title: "Hauts-de-France",href: "contact-autres-regions",data: {}},'FR-ND': {id: "FR-ND",'id_no_spaces': "FR-ND",title: "Normandy",href: "contact-autres-regions",data: {}},'FR-PL': {id: "FR-PL",'id_no_spaces': "FR-PL",title: "Pays de la Loire",href: "contact-autres-regions",data: {}},'FR-PR': {id: "FR-PR",'id_no_spaces': "FR-PR",title: "Provence-Alpes-Côte d'Azur",href: "contact-autres-regions",data: {}}},viewBox: [0,0,596.41547,584.5448],cursor: "pointer",zoom: {on: false,limit: [0,10],delta: 2,buttons: {on: true,location: "right"},mousewheel: true},scroll: {on: false,limit: false,background: false,spacebar: false},tooltips: {mode: "off",on: false,priority: "local",position: "bottom-right"},popovers: {mode: "off",on: false,priority: "local",position: "top",centerOn: false,width: 300,maxWidth: 50,maxHeight: 50,resetViewboxOnClose: true,mobileFullscreen: true},gauge: {on: false,labels: {low: "low",high: "high"},colors: {lowRGB: {r: 85,g: 0,b: 0,a: 1},highRGB: {r: 238,g: 0,b: 0,a: 1},low: "#550000",high: "#ee0000",diffRGB: {r: 153,g: 0,b: 0,a: 0}},min: 0,max: false},source: "https://gist.githack.com/Osque/6e3be098f257c7f547def541e078147c/raw/03d7c88126639a47e6c76de13aba5bb6e92dacc2/france-new.svg",title: "France-new",markers: [{id: "aquitaine",attached: true,isLink: false,href: "contact-nouvelle-aquitaine",data: {},src: "https://i.imgur.com/3icKmpo.png",width: 265,height: 50,x: 95.62089025751072,y: 315.77001297467365,geoCoords: [45.694435,-0.092718]},{id: "avr",attached: true,isLink: false,href: "contact-auvergne-rhone-alpes",data: {},src: "https://i.imgur.com/HlEzID2.png",width: 180,height: 48,x: 300.44316527896996,y: 315.77001297467365,geoCoords: [45.65138,3.398891]},{id: "occitanie",attached: true,isLink: false,href: "contact-occitanie",data: {},src: "https://i.imgur.com/2JVZ4MT.png",width: 105,height: 30,x: 246.5866535479256,y: 426.51727314634746,geoCoords: [43.635047,1.139615]}],responsive: true});
});

} else {
jQuery(document).ready(function(){
jQuery("#mapsvg").mapSvg({markerLastID: 3,width: 596.41547,height: 584.5448,loadingText: "Chargement...",colors: {baseDefault: "#000000",background: "transparent",selected: "#143f55",directory: "#fafafa",status: {},base: "#00597B",hover: "#143f55",stroke: "white"},regions: {'FR-AC': {id: "FR-AC",'id_no_spaces': "FR-AC",title: "Nouvelle-Aquitaine",href: "contact-nouvelle-aquitaine",data: {}},'FR-AO': {id: "FR-AO",'id_no_spaces': "FR-AO",title: "Grand Est",href: "contact-autres-regions",data: {}},'FR-AR': {id: "FR-AR",'id_no_spaces': "FR-AR",title: "Auvergne-Rhône-Alpes",href: "contact-auvergne-rhone-alpes",data: {}},'FR-BF': {id: "FR-BF",'id_no_spaces': "FR-BF",title: "Bourgogne-Franche-Comté",href: "contact-autres-regions",data: {}},'FR-BT': {id: "FR-BT",'id_no_spaces': "FR-BT",title: "Brittany",href: "contact-autres-regions",data: {}},'FR-CE': {id: "FR-CE",'id_no_spaces': "FR-CE",title: "Corsica",href: "contact-autres-regions",data: {}},'FR-CN': {id: "FR-CN",'id_no_spaces': "FR-CN",title: "Centre-Val de Loire",href: "contact-autres-regions",data: {}},'FR-IF': {id: "FR-IF",'id_no_spaces': "FR-IF",title: "Île-de-France",href: "contact-autres-regions",data: {}},'FR-LP': {id: "FR-LP",'id_no_spaces': "FR-LP",title: "Occitanie",href: "contact-occitanie",data: {}},'FR-NC': {id: "FR-NC",'id_no_spaces': "FR-NC",title: "Hauts-de-France",href: "contact-autres-regions",data: {}},'FR-ND': {id: "FR-ND",'id_no_spaces': "FR-ND",title: "Normandy",href: "contact-autres-regions",data: {}},'FR-PL': {id: "FR-PL",'id_no_spaces': "FR-PL",title: "Pays de la Loire",href: "contact-autres-regions",data: {}},'FR-PR': {id: "FR-PR",'id_no_spaces': "FR-PR",title: "Provence-Alpes-Côte d'Azur",href: "contact-autres-regions",data: {}}},viewBox: [0,0,596.41547,584.5448],cursor: "pointer",zoom: {on: false,limit: [0,10],delta: 2,buttons: {on: true,location: "right"},mousewheel: true},scroll: {on: false,limit: false,background: false,spacebar: false},tooltips: {mode: "off",on: false,priority: "local",position: "bottom-right"},popovers: {mode: "off",on: false,priority: "local",position: "top",centerOn: false,width: 300,maxWidth: 50,maxHeight: 50,resetViewboxOnClose: true,mobileFullscreen: true},gauge: {on: false,labels: {low: "low",high: "high"},colors: {lowRGB: {r: 85,g: 0,b: 0,a: 1},highRGB: {r: 238,g: 0,b: 0,a: 1},low: "#550000",high: "#ee0000",diffRGB: {r: 153,g: 0,b: 0,a: 0}},min: 0,max: false},source: "https://gist.githack.com/Osque/6e3be098f257c7f547def541e078147c/raw/03d7c88126639a47e6c76de13aba5bb6e92dacc2/france-new.svg",title: "France-new",markers: [{id: "aquitaine",attached: true,isLink: false,href: "contact-nouvelle-aquitaine",data: {},src: "https://i.imgur.com/3icKmpo.png",width: 55,height: 50,x: 200.62089025751072,y: 330.47649500614716,geoCoords: [45.694435,-0.092718]},{id: "avr",attached: true,isLink: false,href: "contact-auvergne-rhone-alpes",data: {},src: "https://i.imgur.com/HlEzID2.png",width: 80,height: 30,x: 350.44316527896996,y: 333.77001297467365,geoCoords: [45.65138,3.398891]},{id: "occitanie",attached: true,isLink: false,href: "contact-occitanie",data: {},src: "https://i.imgur.com/2JVZ4MT.png",width: 60,height: 30,x: 276.5866535479256,y: 426.51727314634746,geoCoords: [43.635047,1.139615]}],responsive: true});
});
}


       var slide_index = 1;
        displaySlides(slide_index);

        function nextSlide(n) {
            displaySlides(slide_index += n);
        }

        function currentSlide(n) {
            displaySlides(slide_index = n);
        }

        function displaySlides(n) {
            var i;
            var slides = document.getElementsByClassName("showSlide");
            if (n > slides.length) { slide_index = 1 }
            if (n < 1) { slide_index = slides.length }
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            slides[slide_index - 1].style.display = "block";
        }


       var slide2_index = 1;
        displaySlides2(slide2_index);

        function nextSlide2(n) {
            displaySlides2(slide2_index += n);
        }

        function currentSlide2(n) {
            displaySlides2(slide2_index = n);
        }

        function displaySlides2(n) {
            var i;
            var slides2 = document.getElementsByClassName("showSlide2");
            if (n > slides2.length) { slide2_index = 1 }
            if (n < 1) { slide2_index = slides2.length }
            for (i = 0; i < slides2.length; i++) {
                slides2[i].style.display = "none";
            }
            slides2[slide2_index - 1].style.display = "block";
        }


       var slide3_index = 1;
        displaySlides3(slide3_index);

        function nextSlide3(n) {
            displaySlides3(slide3_index += n);
        }

        function currentSlide3(n) {
            displaySlides3(slide3_index = n);
        }

        function displaySlides3(n) {
            var i;
            var slides3 = document.getElementsByClassName("showSlide3");
            if (n > slides3.length) { slide3_index = 1 }
            if (n < 1) { slide3_index = slides3.length }
            for (i = 0; i < slides3.length; i++) {
                slides3[i].style.display = "none";
            }
            slides3[slide3_index - 1].style.display = "block";
        }
