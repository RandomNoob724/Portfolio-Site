$(document).ready(function() {
  $("#about-me-button").on("click", function() {
    $("html, body").animate(
      {
      scrollTop: $("#aboutme").position().top
      }, 'slow'
    );
  });
  
    $("#portfolio-button").on("click", function() {
    $("html, body").animate(
      {
      scrollTop: $("#portfolio").position().top
      }, 'slow'
    );
  });
  
    $("#contact-button").on("click", function() {
    $("html, body").animate(
      {
      scrollTop: $("#contact").position().top
      }, 'slow'
    );
  });
  
    $("#home").on("click", function() {
    $("html, body").animate(
      {
      scrollTop: $("body").position().top
      }, 'slow'
    );
  });
});