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

$("#getInfo").click(function() {
  $.ajax({
    type: "POST",
    url: "/getplayer",
    data: $('#playerName').val(),
    dataType: "text",
    success: function(res) {
      console.log("success");
      $("#results").append(res);
      $("#results").append('\n');
    },
    error: function(xhr, textStatus, error){
      console.log(xhr.statusText);
      console.log(textStatus);
      console.log(error);
    }
  });
  console.log("post action completed");
});

$("#testing2").on('click', function() {
  console.log('testing');
});


//Change active class as the html pages render
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

