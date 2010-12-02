function superSlides(options) {

  // Defaults
  var settings = {
     'location'         : 'top',
     'background-color' : 'blue'
  };

  // Update settings with user's values
  if (options) {
    $.extend(settings, options);
  }

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
    e_dimension = {
      'title': 0,
      'sub': 1
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
    $g_currentSlide = null,
    $g_overview = null;

  // General variables
  var
    g_totalSlides = $g_slides.size(),
    g_currentSlideNumber = isNaN(location.hash.substr(1)) || location.hash === '' ? 1 : location.hash.substr(1),
    g_currentView = isNaN(location.hash.substr(1)) || location.hash === '' ? e_view.outline : e_view.slides,
    g_skipSlides = '',
    g_overviewActive = false;

  // **************************************************
  //
  // Functions
  //
  // **************************************************

  function log(message) {

    if(typeof(console) !== 'undefined' && console !== null) {
      console.log(message);
    }

  } // log(message)

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
    if($g_currentSlide) {
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

    } // goToSlide(l_slideNumber, l_direction)

    // Show new slide
    $g_currentSlide.addClass('current');

    // Update paging variables
    $g_pagingCurrent.text(g_currentSlideNumber);

    // Update url
    if(g_currentView == e_view.slides) {
      location.hash = '#' + g_currentSlideNumber;
    }

  }

  function advance(l_dimension) {

    // Get elements to be incremented
    var $l_elementsToIncrement = $g_currentSlide.find('.increment[data-visibility=hidden]');

    // If there are some
    if($l_elementsToIncrement.size() > 0) {

      // Show the next one
      log('Showing next element');
      $l_elementsToIncrement.first().show().attr('data-visibility', 'visible');

    }

    // If we're not at the end of the slides
    else if(g_currentSlideNumber < g_totalSlides) {

      // If trying to view the next sub slide and the next slide is a sub slide
      if((l_dimension == e_dimension.sub) && ($g_currentSlide.next().hasClass('sub'))) {
          goToSlide(parseInt(g_currentSlideNumber, 10) + 1, e_direction.forward);
          return;
      }

      // Find the next non-sub slide
      var $l_nextTitleSlide = $g_currentSlide.nextAll(':not(.sub)');
      if($l_nextTitleSlide.size() > 0) {

        // Skip to the next non-sub slide
        goToSlide(parseInt($g_slides.index($l_nextTitleSlide.first()), 10) + 1, e_direction.forward);

      }

    } // g_currentSlideNumber < g_totalSlides

    // No elements to show, no slide to move forward to
    else {
      log('At end of slides');
    }

  } // advance(l_dimension)

  function previous(l_dimension) {

    // Get elements already incremented
    var $l_elementsIncremented = $g_currentSlide.find('.increment[data-visibility=visible]');

    // If there are some
    if($l_elementsIncremented.size() > 0) {

      // Hide the last one
      log('Hiding next element');
      $l_elementsIncremented.last().hide().attr('data-visibility', 'hidden');

    }

    // If we're not at the start of the slides
    else if(g_currentSlideNumber > 1) {

      // If trying to view the prev sub slide and the prev slide is a sub slide
      if((l_dimension == e_dimension.sub) && (!$g_currentSlide.prev().hasClass(':not(sub)'))) {
          goToSlide(parseInt(g_currentSlideNumber, 10) - 1, e_direction.back);
          return;
      }

      // Find the prev non-sub slide
      var $l_prevTitleSlide = $g_currentSlide.prevAll(':not(.sub)');
      if($l_prevTitleSlide.size() > 0) {

        // Skip to the prev non-sub slide
        goToSlide(parseInt($g_slides.index($l_prevTitleSlide.first()), 10) + 1, e_direction.back);

      }

    } // g_currentSlideNumber > 1

    // No elements to hide, no slide to move back to
    else {
      log('At start of slides');
    }

  } // previous(l_dimension)

  function getCurrentView() {
    return g_currentView == e_view.slides ? 'slides' : 'outline';
  } // getCurrentView()

  function switchView(l_view) {

    // Update g_currentView
    g_currentView = l_view;

    log('New view: ' + getCurrentView());

    // Update url
    location.hash = g_currentView == e_view.slides ? '#' + g_currentSlideNumber : '';

    // Switch to new view
    $g_body.removeClass('slides outline').addClass(getCurrentView());

  } // switchView(l_view)

  function generateReferences() {

    // Get all links and remove specific excluded links
    var $l_links = $g_slides.find('a[href]:not(.exclude)');

    // Check for use of title attribute
    var $l_filteredLinks = $l_links.filter('[title]');
    if($l_filteredLinks.size() > 0) {
      $l_links = $l_filteredLinks;
    }

    // Restore any explicit references
    $l_links = $l_links.add($g_slides.find('a.include[href]'));

    // If there are any
    if($l_links.size() > 0) {

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
        if($(this).attr('title') !== '') {
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

  } // generateReferences()

  function toggleOverview() {

    // If overview visible
    if($g_overview.is(':visible')) {

      // Hide it and remove the slide list
      $g_overview.hide().find('> div > ol').remove();
      g_overviewActive = false;

    }

    // If overview is hidden
    else {

      // Generate new slide list
      var slideListHtml = '';
      $g_slides.filter(':not(.sub)').each(function() {
        slideListHtml += '<li><a href="#' + parseInt($g_slides.index($(this)) + 1, 10) + '">' + $(this).find('h1, h2, header').first().text() + '</a><div class="preview">' + $(this).html() + '</div>';

          var $l_subSlides = $(this).nextUntil(':not(.sub)');
          if ($l_subSlides.size() > 0) {
            slideListHtml += '<ol>';
            $l_subSlides.each(function() {
              slideListHtml += '<li><a href="#' + parseInt($g_slides.index($(this)) + 1, 10) + '">' + $(this).find('h1, h2, header').first().text() + '</a><div class="preview">' + $(this).html() + '</div></li>';
            });
            slideListHtml += '</ol>';
          }
        slideListHtml += '</li>';
      });
      $('<ol />').append(slideListHtml).prependTo($g_overview.find('> div'));

      // Show preview on hover
      $g_overview
        .find('> div ol > li > a').hover(
          function() { $(this).next().show(); },
          function() { $(this).next().hide(); }
        ).end()
        .find('> div > ol > li > a').click(function() {
          $(this).parent().find('> ol').stop(false, true).slideToggle(250);
        });

      // Show the overview
      $g_overview.show();
      g_overviewActive = true;

    }

  } // toggleOverview()

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

  // Init overview
  $g_overview = $('<div />').attr('id', 'overview').css('display', 'none').append($('<div />').append($('<div />').addClass('preview'))).appendTo('body > .wrapper');

  // Set inital view to slide
  $g_body.addClass(g_currentView == e_view.slides ? 'slides' : 'outline');

  // **************************************************
  //
  // Events
  //
  // **************************************************

  // Keyboard
  $(window).keyup(function(event) {

    switch(event.keyCode) {

      case 35: // end
        if(g_currentView == e_view.slides) {
          goToSlide(g_totalSlides, e_direction.forward);
        }
        break;

      case 36: // home
        if(g_currentView == e_view.slides) {
          goToSlide(1, e_direction.forward);
        }
        break;

      case 10: // return
      case 13: // enter
      case 32: // space
      case 39: // right
      case 40: // down
        if(g_currentView == e_view.slides && !g_overviewActive) {
          if(g_skipSlides !== '') {
            if((event.keyCode == 10) || (event.keyCode == 13)) {
              // Skip to slide
              log('Skip to slide ' + g_skipSlides);
              goToSlide(g_skipSlides, e_direction.forward);
            }
            else {
              // Skip forward slides
              log('Skip forward ' + parseInt(g_skipSlides, 10) + ' slides');
              goToSlide(parseInt(g_currentSlideNumber, 10) + parseInt(g_skipSlides, 10), e_direction.forward);
            }
          }
          else {
            if(event.keyCode == 32 || event.keyCode == 39) {
              advance(e_dimension.sub);
            }
            else if(event.keyCode == 40) {
              advance(e_dimension.title);
            }
          }
          g_skipSlides = '';
        }
        break;

      case 37: // left
      case 38: // up
        if(g_currentView == e_view.slides && !g_overviewActive) {
          if(g_skipSlides !== '') {
            // Skip back slides
            log('Skip back ' + g_skipSlides + ' slides');
            goToSlide(parseInt(g_currentSlideNumber, 10) - parseInt(g_skipSlides, 10), e_direction.back);
          }
          else {
            if(event.keyCode == 37) {
              previous(e_dimension.sub);
            }
            else if(event.keyCode == 38) {
              previous(e_dimension.title);
            }
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

      case 79: // o
        if(g_currentView == e_view.slides) {
          toggleOverview();
        }
        break;

      case 84: // t
        if(!g_overviewActive) {
          switchView(g_currentView == e_view.slides ? e_view.outline : e_view.slides);
        }
        break;

    }

    event.preventDefault();

  });

}