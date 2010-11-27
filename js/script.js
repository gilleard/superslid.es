$(document).ready(function() {

  // **************************************************
  //
  // Enum
  //
  // **************************************************
  
  var
    e_direction = {
      'forward': 0,
      'back': 1
    },
    e_view = {
      'slides': 0,
      'outline': 1
    };

  // **************************************************
  //
  // Global Variables
  //
  // **************************************************
  
  // Pointers
  var
    $g_body = $('body'),
    $g_slides = $('#slides > div'),
    $g_footer = $('body > .wrapper > footer'),
    $g_pagingCurrent = $g_footer.find('.current'),
    $g_pagingTotal = $g_footer.find('.total'),
    $g_currentSlide = null;
  
  // General variables
  var
    g_totalSlides = $g_slides.size(),
    g_currentSlideNumber = isNaN(location.hash.substr(1)) || location.hash === '' ? 1 : location.hash.substr(1),
    g_currentView = isNaN(location.hash.substr(1)) || location.hash === '' ? e_view.outline : e_view.slides,
    g_skipSlides = '';

  // **************************************************
  //
  // Functions
  //
  // **************************************************
  
  function log(message) {
  
    if(typeof(console) !== 'undefined' && console !== null) {
      console.log(message);
    }
    
  }
  
  function advance() {
  
    var $l_elementsToIncrement = $g_currentSlide.find('.increment[data-visibility=hidden]');
  
    if($l_elementsToIncrement.size() > 0) {
      log('Showing next element');
      $l_elementsToIncrement.first().show().attr('data-visibility', 'visible');
    }
    else if(g_currentSlideNumber < g_totalSlides) {
      goToSlide(parseInt(g_currentSlideNumber, 10) + 1, e_direction.forward);
    }
    else {
      log('At end of slides');
    }
  
  }
  
  function previous() {
  
    var $l_elementsIncremented = $g_currentSlide.find('.increment[data-visibility=visible]');
  
    if($l_elementsIncremented.size() > 0) {
      log('Hiding next element');
      $l_elementsIncremented.last().hide().attr('data-visibility', 'hidden');
    }
    else if(g_currentSlideNumber > 1) {
      goToSlide(parseInt(g_currentSlideNumber, 10) - 1, e_direction.back);
    }
    else {
      log('At start of slides');
    }

  }
  
  function goToSlide(l_slideNumber, l_direction) {
  
    log('New slide: ' + l_slideNumber);
  
    // Check l_slideNumber
    if(l_slideNumber <= 0) {
      l_slideNumber = 1;
      log('Adjusted to: ' + l_slideNumber);
    }
    else if(l_slideNumber > g_totalSlides) {
      l_slideNumber = g_totalSlides;
      log('Adjusted to: ' + l_slideNumber);
    }
  
    // Hide current slide
    if ($g_currentSlide) {
      $g_currentSlide.removeClass('current');
    }
    
    // Update variables
    $g_currentSlide = $g_slides.eq(l_slideNumber - 1);
    g_currentSlideNumber = l_slideNumber;
    
    // Prepare incremented elements
    switch(l_direction) {
    
      case e_direction.forward:
        $g_currentSlide.find('.increment').hide().attr('data-visibility', 'hidden');
        break;
    
      case e_direction.back:
        $g_currentSlide.find('.increment').show().attr('data-visibility', 'visible');
        break;
    
    }
    
    // Show new slide
    $g_currentSlide.addClass('current');
    
    // Update paging variables
    $g_pagingCurrent.text(g_currentSlideNumber);
    
    // Update url
    if (g_currentView == e_view.slides) {
      location.hash = '#' + g_currentSlideNumber;
    }
    
  }
  
  function getCurrentView() {
    return g_currentView == e_view.slides ? 'slides' : 'outline';
  }
  
  function switchView(l_view) {
        
    // Update g_currentView
    g_currentView = l_view;
    
    log('New view: ' + getCurrentView());
    
    // Update url
    location.hash = g_currentView == e_view.slides ? '#' + g_currentSlideNumber : '';
      
    // Switch to new view
    $g_body.attr('data-view', getCurrentView());
    
  }
  
  function generateReferences() {
    
    // Get all links
    var $l_links = $('a[href!=""]').filter(':not(.ignore)');
    
    // If there are any
    if ($l_links.size() > 0) {
    
      // Create reference slide
      $('#slides').append('<div class="references"><h2>References</h2><section><ol></ol></section></div>');
      var l_referencesHtml = '';
      
      // For each
      $l_links.each(function() {
      
        // Add number to original link
        $(this).after('<sup>[' + parseInt($l_links.index($(this)) + 1, 10) + ']</sup>');
        
        // Start reference list item
        l_referencesHtml += '<li>' + $(this).text();
        
        // Check for a description
        if ($(this).attr('title') != '') {
          l_referencesHtml += ' (' + $(this).attr('title') + ')'; }
        
        // Add link and end reference list item
        l_referencesHtml += ' &#8211; <a href="' + $(this).attr('href') + '">' + $(this).attr('href') + '</a></li>';
      
      });
      
      // Add list to reference slide
      $('#slides > .references ol').append(l_referencesHtml);
    
    }
    
    // Update paging variables
    $g_slides = $('#slides > div');
    g_totalSlides = $g_slides.size();
    
  }
  
  // **************************************************
  //
  // Initialisation
  //
  // **************************************************
  
  log('Number of slides: ' + g_totalSlides);
  log('Current slides: ' + g_currentSlideNumber);
  log('Current view: ' + getCurrentView(g_currentView));
  
  // Init references
  generateReferences();
  
  // Show initial slide
  goToSlide(g_currentSlideNumber, e_direction.forward);
  
  // Replace paging variables
  $g_pagingCurrent.text(g_currentSlideNumber);
  $g_pagingTotal.text(g_totalSlides);
  
  // Set inital view to slide
  $g_body.attr('data-view', g_currentView == e_view.slides ? 'slides' : 'outline');
  
  // **************************************************
  //
  // Events
  //
  // **************************************************
  
  $(window)
    // Keyboard
    .keyup(function(event) {
    
      switch(event.keyCode) {
      
        case 35: // end
          if (g_currentView == e_view.slides) {
            goToSlide(g_totalSlides, e_direction.forward);
          }
          break;
      
        case 36: // home
          if (g_currentView == e_view.slides) {
            goToSlide(1, e_direction.forward);
          }
          break;
      
        case 10: // return
        case 13: // enter
        case 32: // space
        case 39: // right
        case 40: // down      
          if(g_currentView == e_view.slides) {
            if(g_skipSlides !== '') {
              if((event.keyCode == 10) || (event.keyCode == 13)) {
                log('Skip to slide ' + g_skipSlides);
                goToSlide(g_skipSlides, e_direction.forward);
              }
              else {
                log('Skip forward ' + parseInt(g_skipSlides, 10) + ' slides');
                goToSlide(parseInt(g_currentSlideNumber, 10) + parseInt(g_skipSlides, 10), e_direction.forward);
              }
            }
            else {
              advance();
            }
            g_skipSlides = '';
          }
          break;
        
        case 37: // left
        case 38: // up          
          if(g_currentView == e_view.slides) {
            if(g_skipSlides !== '') {
              log('Skip back ' + g_skipSlides + ' slides');
              goToSlide(parseInt(g_currentSlideNumber, 10) - parseInt(g_skipSlides, 10), e_direction.back);
            }
            else {
              previous();
            }
            g_skipSlides = '';
          }
          break;
          
        case 48: // 0
        case 49: // 1
        case 50: // 2
        case 51: // 3
        case 52: // 4
        case 53: // 5
        case 54: // 6
        case 55: // 7
        case 56: // 8
        case 57: // 9
          g_skipSlides += parseInt(event.keyCode, 10) - 48;
          break;
        
        case 84: // t
          switchView(g_currentView == e_view.slides ? e_view.outline : e_view.slides);
          break;
        
      }
      
      event.preventDefault();
      
    });

});
