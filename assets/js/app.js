var _ = {};

_.now = Date.now || function() {
  return new Date().getTime();
};

_.throttle = function(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : _.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = _.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

var nav = $('nav.global');
$(window).scroll(_.throttle(function(){
  nav.toggleClass('full', $(window).scrollTop() > 0);
}, 100));

$('.menu-btn').click(function(evt){
  $(this).toggleClass('activated');
  $('.full-only').toggleClass('active');
  evt.stopPropagation();
});

$('.show-menu').click(function (evt) {
  nav.addClass('full');
  $('.menu-btn').addClass('activated');
  $('.full-only').addClass('active');
  evt.stopPropagation();
});

$('body').click(function(){
  $('.menu-btn').removeClass('activated');
  $('.full-only').removeClass('active');
});