//dynamically render html pages
$("#makeTeams").on('click', function() {
  console.log(this.href);
  $("#load_main").load("teams.html");
});

$("#goHome").on('click', function() {
  $("#load_main").load("home.html");
});

$("#contactUs").on('click', function() {
  $('#load_main').load("contact.html");
});

//Chagne active class as the html pages render
$(document).ready(function () {
    $('.nav li a').click(function(e) {

        $('.nav li').removeClass('active');

        var $parent = $(this).parent();
        if (!$parent.hasClass('active')) {
            $parent.addClass('active');
        }
        e.preventDefault();
    });
});

