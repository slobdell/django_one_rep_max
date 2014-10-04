$(window).load(function() {
  /* Isotope */
  var container = $('.portfolio');
  var $optionSets = $('.filter'), $optionLinks = $optionSets.find('a');
  
  container.isotope({
    itemSelector : '.column, .columns',
    resizable : 'false',
    resizesContainer : 'false',
    animationEngine : 'best-available',
    animationOptions : {
      duration : 500
    }
  });

  $(window).smartresize(function() {
    container.isotope({
      masonry : {
        columnWidth : container.width() / 12
      }
    });
  });
  
  // Filter 
  var filterToggle =  $('a.toggle');
  var filter = $('ul.sort');

  filterToggle.click(function() {
    if (filter.is(':visible')) {
      filter.slideUp(200);
    } else {
      filter.slideDown(200);
    }
  });

  filter.find('a').click(function(){
    filter.slideUp(200);
  })

  $('a', $optionSets).click(function() {
    var selector = $(this).attr('data-filter');
    container.isotope({
      filter : selector
    });
    return false;
  });
  
  $optionLinks.click(function() {
    var $this = $(this);
    if ($this.parents('li').hasClass('selected')) {
      return false;
    }
  
    var $optionSet = $this.parents('.option-set');
    $optionSet.find('.selected').removeClass('selected');
    $this.parents('li').addClass('selected');
  
    return false;
  });

  /* Swipebox Lightbox */
  $(".box").swipebox();

  /* Nav Menu */
  var flyout = $('.has-flyout');
  flyout.hover(function() {
    var width = $(this).width();
    var left = (150 - width) / 2;
    $('.flyout').css({
      left : -left
    });
    $(this).find('.flyout').eq(0).fadeIn(300);
    //This positions sub menus to the left if they go off screen
    if ($(this).children('.flyout').length > 0) {
      var elm = $(this).children('.flyout');
      var off = elm.offset();
      var l = off.left;
      var w = elm.width();
      var docW = $(window).width();

      var isEntirelyVisible = (l + w <= docW);

      if (!isEntirelyVisible) {
        $('.flyout', this).addClass('edge');
      }
    }
  }, function() {
    $(this).find('.flyout').eq(0).fadeOut(0);
  });

  /* Flexslider */
  var caption = $('.flex-caption');
  var subCaption = $('.flex-caption-second');

  function trans_jq() {
    if (caption.length || subCaption.length) {
      setTimeout(function(){
        caption.animate({
          left: '100px'
        }, 500);
        setTimeout(function(){
          subCaption.css({
            left: '100px'
          }, 500);
        }, 800);
      }, 100)
    }
  }

  function exit_js(slider) {
    if (caption.length || subCaption.length) {
      slider.slides.eq(slider.currentSlide).delay(500);
      caption.animate({
        left: '-500px'
      }, 0);
      subCaption.animate({
        left: '1600px'
      }, 0);
      slider.slides.eq(slider.animatingTo).delay(500);
    }
  }

  (function() {
    $('.flexslider').flexslider({
      animation : "fade",
      controlNav : false,
      prevText : "",
      nextText : "",
      slideshowSpeed : 8000,
      controlsContainer : ".flex-container",
      pauseOnHover: true,
      start: function(){
        trans_jq();
      },
      before: function(slider){
        exit_js(slider);
      },
      after: function(){
        trans_jq();
      }
    });
  })();

  /* NiceScroll */
  function nice() { 
    $("html").niceScroll({
      scrollspeed: '60',
      mousescrollstep: '40',
      cursorwidth: '10',
      cursorborder: 'none',
      hidecursordelay: '60000'
    });
  };

  nice();

  /* Contact form */
  $('#send').click(function(){ 
    $('.error').fadeOut('slow'); 
    
    var error = false;
  
    var name = $('input#name').val();
    if(name == "" || name == " ") {
      $('#err-name').fadeIn('slow');
      error = true;
    }
    
    var email_compare = /^([A-Za-z0-9_.-]+)@([dA-Za-z.-]+).([A-Za-z.]{2,6})$/;
    var email = $('input#email').val();
    if (email == "" || email == " ") {
      $('#err-email').fadeIn('slow');
      error = true;
    } else if (!email_compare.test(email)) {
      $('#err-emailvld').fadeIn('slow');
      error = true;
    }
  
    if(error == true) {
      return false;
    }
    
    var data_string = $('#ajax-form').serialize();
  
    $.ajax({
      type: "POST",
      url: $('#ajax-form').attr('action'),
      data: data_string,
      timeout: 6000,
      error: function(request,error) {
        if (error == "timeout") {
          $('#err-timedout').fadeIn('slow');
        }
        else {
          $('#error').slideDown('slow');
          $("#error").html('Error! Please try again');
        }
      },
      success: function() {
        $('#ajax-form').slideUp('slow');
        $('#email-success').fadeIn('slow');
      }
    });
    
    return false; 
  }); 

  /* UI Elements */
  // Tabs
  $("#tabs").tabs();

  // Toggle
  $('#toggle').find('.toggle').click(function() {
    var header = $(this).find('h5');
    var text = $(this).find('.content');

    if (text.is(':hidden')) {
      header.addClass('active');
      text.slideDown('fast');
    } else {
      header.removeClass('active');
      text.slideUp('fast');
    }
  });

  /* Image Hovers */
  var item = $('.portfolio .item'),
  mask = item.find('.mask'),
  zoom = item.find('a.zoom'),
  link = item.find('a.link');

  item.hover(function(){
    $(this).find(mask).css({opacity: '.4'});
    $(this).find(mask).fadeIn();
    $(this).find(name).animate({
      top: '80px'
    });
    $(this).find(zoom).animate({
      top: '0'
    });
    $(this).find(link).delay(300).animate({
      top: '0'
    });
  }, function(){
    $(this).find(mask).stop(true).fadeOut();
    $(this).find(zoom).stop(true).animate({
      top: '-40px'
    });
    $(this).find(link).stop(true).delay(300).animate({
      top: '-40px'
    });
  })

  var blogImage = $('.blog-image-cont a');

  blogImage.hover(function(){
    $(this).find('img').stop(true).animate({
      opacity: .5
    });
  }, function(){
    $(this).find('img').stop(true).animate({
      opacity: 1
    });
  })

  /* Flickr feed */
  $('.flickr').jflickrfeed({
    limit : 8,
    qstrings : {
      id : ''
    },
    itemTemplate : '<li>' + '<a href="{{link}}" title="{{title}}" target="_blank"><img src="{{image_q}}" alt="{{title}}" /></a>' + '</li>'
  });

  /* Twitter Feed */
  $(function($) {
    $(".tweet").tweet({
      username : "BreakingNews",
      count : 3,
      template : "{text}",
      loading_text : "loading ..."
    }).bind("loaded", function() {
    });
  });

  /* Google Maps */
  $("#gmap").gmap3({ 
    map:{
      address:"Miami Beach, FL",
      options:{
        zoom: 17,
        scrollwheel: false,
        styles: [{
          "stylers": [
            { "saturation": -100 }
          ]
        }]
      }
    }
  });

  /* Scroll to top */
  $('body').append('<div id="back-top"><i class="icon-arrow-up"></i></div>');
  $("#back-top").hide();
  
  // fade in #back-top
  $(function () {
    $(window).scroll(function () {
      if ($(this).scrollTop() > 100) {
        $('#back-top').fadeIn();
      } else {
        $('#back-top').fadeOut();
      }
    });

    // scroll body to 0px on click
    $('#back-top').click(function () {
      $('body,html').animate({
        scrollTop: 0
      }, 800);
      return false;
    });
  });

  /* Responsive Videos */
  (function() {
    var iframes = document.getElementsByTagName('iframe');
    
    for (var i = 0; i < iframes.length; i++) {
        var iframe = iframes[i];
        var players = /www.youtube.com|player.vimeo.com/;
        if(iframe.src.search(players) !== -1) {
            var videoRatio = (iframe.height / iframe.width) * 100;
            
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.width = '100%';
            iframe.height = '100%';
            
            var div = document.createElement('div');
            div.className = 'video-wrap';
            div.style.width = '100%';
            div.style.position = 'relative';
            div.style.paddingTop = videoRatio + '%';
            
            var parentNode = iframe.parentNode;
            parentNode.insertBefore(div, iframe);
            div.appendChild(iframe);
        }
    }
  })();

  /* Responsive Nav Menu */
  selectnav('nav-bar');

  /* Placeholder fallback */
  if (! ("placeholder" in document.createElement("input"))) {
    $('*[placeholder]').each(function() {
        $this = $(this);
        var placeholder = $(this).attr('placeholder');
        if ($(this).val() === '') {
            $this.val(placeholder);
        }
        $this.bind('focus',
        function() {
            if ($(this).val() === placeholder) {
                this.plchldr = placeholder;
                $(this).val('');
            }
        });
        $this.bind('blur',
        function() {
            if ($(this).val() === '' && $(this).val() !== this.plchldr) {
                $(this).val(this.plchldr);
            }
        });
    });
  }

  /* IE 8 Responsiveness */
  if ($('html').hasClass('ie8')) {
    $('body').append('<script src="js/respond.min.js"></script>');
  }
});