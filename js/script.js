function superSlides(options) {

  // Defaults
  var settings = {
    width: 980,
    height: 735,
    scale: 0.9,
    fontSize: 150,
    enableMath: false,
    enableToc: false,
    strictNav: false,
    incrementOnce: false,
    customJs: null,
    customCss: null,
    syntax: null
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
    $g_wrapper = $g_body.find('#slides'),
    $g_slides = $g_wrapper.find('> div'),
    $g_currentSlide = null,
    $g_overview = $('#overview');

  // General variables
  var
    g_totalSlides = $g_slides.size(),
    g_currentSlideNumber = isNaN(location.hash.substr(1)) || location.hash === '' ? 1 : location.hash.substr(1),
    g_currentView = e_view.slides,
    g_skipSlides = '',
    g_overviewActive = false;
    
  // Scale/position
  var
    g_windowWidth = null,
    g_windowHeight = null,
    g_wrapperWidth = null,
    g_wrapperHeight = null,
    g_wrapperHorizontalMargin = null,
    g_wrapperVerticalMargin = null;

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
  
  function includeJs(l_jsFile) {
  
    var l_req = new XMLHttpRequest();
    l_req.open('GET', l_jsFile, false);
    l_req.onreadystatechange = function() {
      if(l_req.readyState === 4) {
        window.eval(l_req.responseText);
        log(l_jsFile + ' loaded.');
      }
    };
    l_req.send(null);
  
  } // include(l_jsFile)
  
  function includeCss(l_cssFile) {
  
    $('head').append(
      $('<link />').attr({
        'rel': 'stylesheet',
        'href': l_cssFile
      })
    );
    log(l_cssFile + ' included.');
  
  } // includeCss(l_cssFile)
  
  function loadTheme() {
  
    if(settings.customJs) {
      includeJs(settings.customJs);
    }
    
    if(settings.customCss) {
      includeCss(settings.customCss);
    }
      
  } // loadTheme()
  
  function positionSlides() {
  
    // Init positioning variables
    var
      l_nonSubSlideIndex = 0,
      l_subSlideIndex = 0,
      l_subSlideGoingDown = true,
      l_topOffsetPerSlide = parseInt(g_wrapperHeight + (g_wrapperVerticalMargin / 2), 10),
      l_leftOffsetPerSlide = parseInt(g_wrapperWidth + (g_wrapperHorizontalMargin / 2), 10);
  
    $g_slides.not(':first').each(function() {
      
      if(!$(this).hasClass('inplace')) {
      
        // Non-sub slide
        if(!$(this).hasClass('sub')) {
        
          // Increment non-sub slide index
          l_nonSubSlideIndex += 1;
          
          // Reset sub slide index
          l_subSlideIndex = 0;
          
          // Update the sub slide direction
          l_subSlideGoingDown = $(this).hasClass('up');
          
        }
        
        // Sub slide 
        else {
        
          // Increment sub slide index
          l_subSlideIndex += 1;
          
        }
      
      }
      
      // Position slide accordingly
      $(this).css({
        'top': l_subSlideIndex > 0 ? (l_subSlideGoingDown ? '-' : '') + (l_subSlideIndex * l_topOffsetPerSlide) + 'px' : 'auto',
        'left': l_nonSubSlideIndex > 0 ? (l_nonSubSlideIndex * l_leftOffsetPerSlide) + 'px' : 'auto'
      });
      
    });
    
    // Centre current slide
    if($g_currentSlide) {
    
      // Move to new slide
      $g_body.css({
        'top': $g_currentSlide.position().top * -1 + 'px',
        'left': $g_currentSlide.position().left * -1 + 'px'
      });
    
    }
  
  } // positionSlides()
  
  function scaleSlides() {

    g_windowWidth = $(window).width();
    g_windowHeight = $(window).height();
    
    // Wider than slide ratio
    if((g_windowWidth/g_windowHeight) > (settings.width/settings.height)) {
      
      // Width set to settings.scale% of windows height
      g_wrapperHeight = settings.scale * g_windowHeight;
      
      // Height based on width to preserve aspect ratio
      g_wrapperWidth = g_wrapperHeight * (settings.width/settings.height);
      
    }
    
    // Taller than slide ratio
    else {
      
      // Height set to settings.scale% of windows width
      g_wrapperWidth = settings.scale * g_windowWidth;
      
      // Width based on height to preserve aspect ratio
      g_wrapperHeight = g_wrapperWidth * (settings.height/settings.width);
      
    }
      
    // Centre slide
    g_wrapperHorizontalMargin = (g_windowWidth - g_wrapperWidth) / 2;
    g_wrapperVerticalMargin = (g_windowHeight - g_wrapperHeight) / 2;
    
    // Scale slides wrapper
    $g_wrapper.css({
      'width': parseInt(g_wrapperWidth, 10) + 'px',
      'height': parseInt(g_wrapperHeight, 10) + 'px',
      'margin': parseInt(g_wrapperVerticalMargin, 10) + 'px ' + parseInt(g_wrapperHorizontalMargin, 10) + 'px',
      'font-size': (settings.fontSize * (g_wrapperWidth / settings.width)) + '%'
    });
    
    if($g_overview.size() > 0) {
    
      // Scale overview
      $g_overview.find('> div').css({
        'width': parseInt(g_wrapperWidth / 2, 10) + 'px',
        'height': parseInt(g_wrapperHeight, 10) + 'px',
        'margin': parseInt(g_wrapperVerticalMargin, 10) + 'px auto',
        'font-size': (settings.fontSize * (g_wrapperWidth / settings.width)) + '%'
      });
    
    }
  
    // Position slides
    positionSlides();
  
  } // scaleSlides()
  
  function scaleImages() {
  
    // For each image
    $g_slides.find('> img')
    
      // On load
      .one('load', function() {
        
        // Set width as a % relative to settings.width
        $(this).css('width', ($(this).width() / settings.width) * 100 + '%');
      
      })
      .each(function() {
      
        // Cache check
        if(this.complete) {
          $(this).trigger('load');
        }
      
      });
  
  } // scaleImages()

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
    
    // Move to new slide
    $g_body.css({
      'top': $g_currentSlide.position().top * -1 + 'px',
      'left': $g_currentSlide.position().left * -1 + 'px'
    });
    
    // Add class to current slide
    $g_currentSlide.addClass('current');

    // Update url
    if(g_currentView === e_view.slides) {
      location.hash = '#' + g_currentSlideNumber;
    }

  } // goToSlide()

  function advance(l_dimension) {

    // Get elements to be incremented
    var $l_elementsToIncrement = $g_currentSlide.find('.incremental').filter(function(index) {
      return $(this).css('visibility') === 'hidden';
    });

    // If there are some
    if($l_elementsToIncrement.size() > 0) {

      // Show the next one
      log('Showing next element');
      $l_elementsToIncrement.first().css({'visibility':'visible'});
      
      // Check for increment preference
      if(settings.incrementOnce) {
        $l_elementsToIncrement.first().removeClass('incremental');
      }

    }

    // If we're not at the end of the slides
    else if(g_currentSlideNumber < g_totalSlides) {

      // Trying to view next sub slide
      if(l_dimension === e_dimension.sub) {
      
        // Next slide is a sub slide
        if($g_currentSlide.next().hasClass('sub')) {
        
          // Go!
          goToSlide(parseInt(g_currentSlideNumber, 10) + 1, e_direction.forward);
          
        }
        
      } // l_dimension === e_dimension.sub
      
      // Trying to view next non-sub slide
      else {

        // Find the next non-sub slide
        var $l_nextTitleSlide = $g_currentSlide.nextAll(':not(.sub)');
        
        // If there is one and strictNav is off or this is a non-sub slide
        if($l_nextTitleSlide.size() > 0 && (!settings.strictNav || !$g_currentSlide.hasClass('sub'))) {
  
          // Skip to the next non-sub slide
          goToSlide(parseInt($g_slides.index($l_nextTitleSlide.first()), 10) + 1, e_direction.forward);
  
        }
      
      } // l_dimension === e_dimension.title

    } // g_currentSlideNumber < g_totalSlides

    // No elements to show, no slide to move forward to
    else {
      log('At end of slides');
    }

  } // advance(l_dimension)

  function previous(l_dimension) {

    // Get elements already incremented
    var $l_elementsIncremented = $g_currentSlide.find('.incremental').filter(function(index) {
      return $(this).css('visibility') === 'visible';
    });

    // If there are some
    if($l_elementsIncremented.size() > 0) {

      // Hide the last one
      log('Hiding next element');
      $l_elementsIncremented.last().css({'visibility':'hidden'});

    } // $l_elementsIncremented.size() > 0

    // If we're not at the start of the slides
    else if(g_currentSlideNumber > 1) {

      // Trying to view the prev sub slide
      if(l_dimension === e_dimension.sub) {
      
        // This is a sub slide
        if($g_currentSlide.hasClass('sub')) {
        
          // Go!
          goToSlide(parseInt(g_currentSlideNumber, 10) - 1, e_direction.back);
        
        }
        
      } // l_dimension === e_dimension.sub
      
      // Trying to view prev non-sub slide
      else {

        // Find the prev non-sub slide
        var $l_prevTitleSlide = $g_currentSlide.prevAll(':not(.sub)');
        
        // If there is one and strictNav is off or this is a non-sub slide
        if($l_prevTitleSlide.size() > 0 && (!settings.strictNav || !$g_currentSlide.hasClass('sub'))) {
  
          // Skip to the prev non-sub slide
          goToSlide(parseInt($g_slides.index($l_prevTitleSlide.first()), 10) + 1, e_direction.back);
  
        }
      
      } // l_dimension === e_dimension.title

    } // g_currentSlideNumber > 1

    // No elements to hide, no slide to move back to
    else {
      log('At start of slides');
    }

  } // previous(l_dimension)

  function getCurrentView() {
  
    return g_currentView === e_view.slides ? 'slides' : 'outline';
    
  } // getCurrentView()

  function switchView(l_view) {

    // Update g_currentView
    g_currentView = l_view;

    log('New view: ' + getCurrentView());
    
    // Switch to new view
    $g_body.removeClass('slides outline').addClass(getCurrentView());
    
    if(g_currentView === e_view.slides) {
    
      // Check for resize
      scaleSlides();
    
    }
    
    // Update url
    location.hash = g_currentView === e_view.slides ? '#' + g_currentSlideNumber : '';

  } // switchView(l_view)

  function generateReferences() {

    // Get all links and remove specific excluded links
    var $l_links = $g_slides.filter(':not(#toc)').find('a[href]:not(.exclude)');

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
      $('#slides').append('<div class="references"><h2>References</h2><section><ul></ul></section></div>');
      var l_referencesHtml = '';

      // For each
      $l_links.each(function() {

        // Add number to original link
        $(this).after('<sup>[' + parseInt($l_links.index($(this)) + 1, 10) + ']</sup>');

        // Start reference list item
        l_referencesHtml += '<li><a href="#' + parseInt($g_slides.index($(this).parentsUntil('#slides').last()) + 1, 10) + '">[' + parseInt($l_links.index($(this)) + 1, 10) + ']</a> ' + $(this).text();

        // Check for a description
        if($(this).attr('title') !== '') {
          l_referencesHtml += ' (' + $(this).attr('title') + ')'; }

        // Add link and end reference list item
        l_referencesHtml += ' &#8211; <a href="' + $(this).attr('href') + '">' + $(this).attr('href') + '</a></li>';

      });

      // Add list to reference slide
      $('#slides > .references ul').append(l_referencesHtml);
      
      // Go to reference location
      $('#slides > .references ul a').click(function() {
      
        goToSlide(parseInt($(this).attr('href').substring(1), 10));
      
      });

    }

    // Update paging variables
    $g_slides = $('#slides > div');
    g_totalSlides = $g_slides.size();

  } // generateReferences()
  
  function generateFooters() {
  
    // Copy footer into each slide
    $g_slides.append($g_wrapper.find('> footer'));
    
    // For each slide
    $g_slides.each(function() {
    
      // Replace current slide numbers
      $(this).find('.current').text(parseInt($g_slides.index($(this)) + 1, 10));
      
    });
    
    // Replace total slide numbers
    $g_slides.find('.total').text(g_totalSlides);
  
  } // generateFooters()
  
  function initMathJax() {
  
    var l_scriptTag = document.createElement('script');
    l_scriptTag.type = 'text/javascript';
    l_scriptTag.src = '../tools/math/MathJax.js';
  
    var l_config = 'MathJax.Hub.Config({ config: \'MathJax.js\' }); ' + 'MathJax.Hub.Startup.onload();';
  
    if(window.opera) {
      l_scriptTag.innerHTML = l_config;
    }
    else {
      l_scriptTag.text = l_config;
    }
  
    $('head').get(0).appendChild(l_scriptTag);
  
  } // initMathJax()

  function toggleOverview() {
    
    // If overview visible
    if($g_overview.is(':visible')) {

      // Hide it and remove the slide list
      $g_overview.hide().find('> div > ol').remove();
      g_overviewActive = false;

    }

    // If overview is hidden
    else {
    
      // For each non sub slide
      var slideListHtml = '';
      $g_slides.filter(':not(.sub)').each(function() {
      
        // Add title and preview
        slideListHtml += '<li><a href="#' + parseInt($g_slides.index($(this)) + 1, 10) + '">' + $(this).find('h1, h2, header').first().text() + '</a><div class="preview">' + $(this).html() + '</div>';
        
          // Check for sub slides
          var $l_subSlides = $(this).nextUntil(':not(.sub)');
          if ($l_subSlides.size() > 0) {
          
            // Add arrow
            slideListHtml += '<span>&darr;</span><ol>';
            $l_subSlides.each(function() {
            
              // Add title and preview
              slideListHtml += '<li><a href="#' + parseInt($g_slides.index($(this)) + 1, 10) + '">' + $(this).find('h1, h2, header').first().text() + '</a><div class="preview">' + $(this).html() + '</div></li>';
            
            });
            
            // Close sub slide list
            slideListHtml += '</ol>';
            
          } // $l_subSlides.size() > 0
          
        // Close non sub slide list-item
        slideListHtml += '</li>';
        
      });
      
      // Add list to reference slide
      $('<ol />').append(slideListHtml).prependTo($g_overview.find('> div'));

      // Show preview on hover
      $g_overview
        .find('> div ol > li > a').hover(
          function() { $(this).next().show(); },
          function() { $(this).next().hide(); }
        )
        
        // Go to slide on click
        .click(function() {
          toggleOverview();
          goToSlide(parseInt($(this).attr('href').substring(1), 10));
        }).end()
        
        // Toggle sub slides on span click
        .find('> div > ol > li > span').click(function() {
          $(this).parent().find('> ol').stop(false, true).slideToggle(250);
        });

      // Show the overview
      $g_overview.show();
      g_overviewActive = true;

    }

  } // toggleOverview()

  function generatePrintHtml() {
    
    // Fetch current html
    var $l_printHtml = $('html').clone();
    
    // Switch to print state
    $l_printHtml.find('body').removeClass('slides outline').addClass('print');
    
    // Remove any scaling
    $l_printHtml.find('body > .wrapper').attr('style' , '').css({'font-size': settings.fontSize + '%'});
    
    // Remove any unnecessary html
    $l_printHtml.find('#MathJax_Hidden, #MathJax_Message, #overview, script, applet').remove();
    $l_printHtml.find('#slides > div').removeClass('current').removeAttr('style');
    
    // Put the doctype + html tag back
    var l_printHtml = '<!doctype html><html lang="en-GB">' + $l_printHtml.html() + '</html>';
    
    // Save the file
    $.twFile.save($.twFile.convertUriToLocalPath(document.location.href), l_printHtml);

  } // generatePrintHtml()
  
  function generateToc() {
    
    // Remove slides without a data-content attribute
    var $l_labeledSlides = $g_slides.filter('[data-content]');
    
    // If there are any left
    if($l_labeledSlides.size() > 0) {
    
      // Add toc slide
      var $l_toc = $('<div />').attr({'id':'toc'}).append('<h2>Topic Oriented Contents</h2>').append('<section />').appendTo($g_wrapper).find('> section');
      
      var
       l_contents,
       l_slideNumber,
       $l_contentsList;
      
      // For each
      $l_labeledSlides.each(function() {
        
        // Store attribute
        l_contents = $(this).attr('data-content');
        
        // Look for existing list
        $l_contentsList = $l_toc.find('ul[data-content="' + l_contents + '"]');
        
        // If there isn't one
        if($l_contentsList.size() === 0) {
        
          // Create it
          $l_toc.append('<h3>' + l_contents + '</h3>');
          $l_contentsList = $('<ul />').attr({'data-content':l_contents}).appendTo($l_toc);
          
        }
        
        // Add this slide
        l_slideNumber = parseInt($g_slides.index($(this)) + 1, 10);
        $l_contentsList.append('<li><a href="#' + l_slideNumber + '" data-source="' + l_slideNumber + '">' + $(this).find('h2').first().text() + '</a></li>');
        
      });
      
      // Allow for clicks
      $l_toc.find('ul[data-content] a').click(function() {
        goToSlide($(this).attr('data-source'), e_direction.forward);
        return false;
      });
      
    }

    // Update paging variables
    $g_slides = $('#slides > div');
    g_totalSlides = $g_slides.size();
  
  } // generateToc()
  
  function loadSyntaxHighlighting() {
  
    // syntax css
    includeCss('../tools/syntax/styles/shCore.css');
    includeCss('../tools/syntax/styles/shThemeDefault.css');
      
    // syntax core js
    includeJs('../tools/syntax/scripts/shCore.js');
    
    // syntax brushes
    $.each(settings.syntax, function(index, value) { 
      includeJs(value);
    });
    
    // call syntax highlighter
    if(typeof SyntaxHighlighter  !== 'undefined') {
      SyntaxHighlighter.all();
    }

  } // loadSyntaxHighlighting()
  
  // **************************************************
  //
  // Initialisation
  //
  // **************************************************

  log('Number of slides: ' + g_totalSlides);
  log('Current slides: ' + g_currentSlideNumber);
  log('Current view: ' + getCurrentView(g_currentView));
  
  // Load theme
  loadTheme();
  
  // Add view class
  $g_body.addClass(g_currentView === e_view.slides ? 'slides' : 'outline');
  
  // Generate ToC
  if(settings.enableToc) {
    generateToc();
  }

  // Generate initial references
  generateReferences();
  
  // Init overview
  $g_overview = $('<div />').attr('id', 'overview').append($('<div />').append($('<div />').addClass('preview'))).appendTo($g_body);

  // Calculate initial scale
  scaleSlides();
  
  // Resize images
  scaleImages();

  // Show initial slide
  goToSlide(g_currentSlideNumber, e_direction.forward);

  // Generate footer
  generateFooters();
  
  // MathJax
  if(settings.enableMath) {
    initMathJax();
  }
  
  // Syntax Highlighting
  if(settings.syntax) {
    loadSyntaxHighlighting();
  }

  // **************************************************
  //
  // Events
  //
  // **************************************************

  // Keyboard
  $(document).keydown(function(event) {
  
    if(!$(event.target).is('[contenteditable=true]')) {

      switch(event.which) {
  
        case 35: // end
          if(g_currentView === e_view.slides) {
            goToSlide(g_totalSlides, e_direction.forward);
          }
          break;
  
        case 36: // home
          if(g_currentView === e_view.slides) {
            goToSlide(1, e_direction.forward);
          }
          break;
  
        case 10: // return
        case 13: // enter
        case 32: // space
        case 39: // right
        case 40: // down
          if(g_currentView === e_view.slides && !g_overviewActive) {
            if(g_skipSlides !== '') {
              if((event.which === 10) || (event.which === 13)) {
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
              if(event.which === 32 || event.which === 39) {
                advance(e_dimension.title);
              }
              else if(event.which === 40) {
                // If reversed sub slides
                if($g_currentSlide.hasClass('up') ||
                    ($g_currentSlide.hasClass('sub') && $g_currentSlide.prevAll(':not(.sub)').first().hasClass('up'))) {
                  previous(e_dimension.sub);
                }
                else {
                  advance(e_dimension.sub);
                }
              }
            }
            g_skipSlides = '';
          }
          break;
  
        case 37: // left
        case 38: // up
          if(g_currentView === e_view.slides && !g_overviewActive) {
            if(g_skipSlides !== '') {
              // Skip back slides
              log('Skip back ' + g_skipSlides + ' slides');
              goToSlide(parseInt(g_currentSlideNumber, 10) - parseInt(g_skipSlides, 10), e_direction.back);
            }
            else {
              if(event.which === 37) {
                previous(e_dimension.title);
              }
              else if(event.which === 38) {
                // If reversed sub slides
                if($g_currentSlide.hasClass('up') ||
                    ($g_currentSlide.hasClass('sub') && $g_currentSlide.prevAll(':not(.sub)').first().hasClass('up'))) {
                  advance(e_dimension.sub);
                }
                else {
                  previous(e_dimension.sub);
                }
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
          g_skipSlides += parseInt(event.which, 10) - 48;
          break;
  
        case 79: // o
          if(g_currentView === e_view.slides) {
            toggleOverview();
          }
          break;
  
        case 80: // p
          if(confirm('Are you sure?')) {
            generatePrintHtml();
          }
          break;
  
        case 84: // t
          if(!g_overviewActive) {
            switchView(g_currentView === e_view.slides ? e_view.outline : e_view.slides);
          }
          break;
          
      }
      
      if($.inArray(event.which, [37, 38, 39, 40]) > -1) {
        event.preventDefault();
        return false;
      }
              
    }
    
  });
  
  // Resize
  $(window).resize(function() {
    if(g_currentView === e_view.slides) {
      scaleSlides();
    }
  });

}