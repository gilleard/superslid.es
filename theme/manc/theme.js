var g_globalString = '';

function findMain($l_current) {

  var l_up = false;
  
  if($l_current.hasClass('sub')) {
    l_up = findMain($l_current.prev());
    if(l_up === true) {
    g_globalString = '<span class="offTab"></span>' + g_globalString;
    }
    else {
    g_globalString = g_globalString + '<span class="offTab"></span>';
    } 
  }
  else if($l_current.hasClass('up')) {
    g_globalString = '<span class="offTab"></span>';
    return true;
  }
  else
  {
    g_globalString = '<span class="offTab"></span>';
    return false;
  }
  
  return l_up;

}

$(document).ready(function() {

  var l_styles = $('<span />').addClass('topStyle');
  var l_up = false;
  
  $('#slides > div').each(function() {
    l_up = false;
    //cycle through parents
    if($(this).hasClass('sub')){
      
      l_up = findMain($(this).prev());
      if(l_up)
      {
        g_globalString = '<span class="litTab"></span>' + g_globalString;
      }
      else
      {
        g_globalString = g_globalString + '<span class="litTab"></span>';
      } 
    }
    else
    {
      g_globalString = '<span class="litTab"></span>';
      if($(this).hasClass('up')) {
        l_up = true;
      }
    }
    
    var $l_subSlides = $(this).nextUntil(':not(.sub)');
    
    if($l_subSlides.size() > 0)
    {
      $l_subSlides.each(function() {
        if(l_up) {
          g_globalString = '<span class="offTab"></span>' + g_globalString;
        }
        else {
          g_globalString = g_globalString + '<span class="offTab"></span>';
        }
      });
    }
    g_globalString = '<div class="tracker">' + g_globalString + '</div>';
    $(this).prepend(g_globalString).filter(':not(.title)').prepend(l_styles.clone());
    g_globalString = '';
    
  });
  
  
});