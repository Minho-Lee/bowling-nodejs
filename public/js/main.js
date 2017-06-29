//dynamically render html pages
$("#makeTeams").on('click', function() {
   $("#load_main").load("teams.html");
});

$("#goHome").on('click', function() {
   $("#load_main").load("home.html");
});

$("#players").on('click', function() {

   $('#load_main').load("players.html", function() {
      //this callback is here to ensure that main.js is loaded properly
      //able to recognize all id/classes before contact.html is loaded

      //making an ajax post call to retrieve data from cloudant
      $("#getInfo").click(function() {
         $.ajax({
            type: "POST",
            url: "/getplayer",
            //contentType: "json",
            //dataType: "json",
            data: { userid: $('#playerName').val() },
            success: function(res, status, xhr) {
               console.log("success! Type: "+ xhr.getResponseHeader("content-type"));
               console.log("status: " + status);
               //console.log(typeof(res));
               if(typeof res === "string") {
                  $("#results").append(res);
               } else {
                  $("#results").append(JSON.stringify(res));
               }
               //var res_obj = {};
               //$.extend(res_obj, res);
               //$("#results").append(JSON.stringify(res_obj));
               $("#results").append('<br/>');
            },
            error: function(xhr, textStatus, error){
               console.log(xhr.statusText);
               console.log(textStatus);
               console.log(error);
            }
         });
         console.log("post action completed");
      });
   });
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

