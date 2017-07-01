//dynamically render html pages
$("#submitplayers").on('click', function() {
   $("#load_main").load("submitplayers.html", function() {
      $("#playersubmit").on('click', function() {
         // var dateformat = '/^201[0-9]{1}-[0-9]{2}-[0-9]{2}$/';
         // console.log($("input[type='date']").val());
         // if ($("input[type='date']").val().match(dateformat)) {
         //    console.log('date format good!');
         // } else {
         //    console.log('date format BAD');
         // };
         $("#playerform")
            .validate({
               debug: false,
               rules: {
                  playerName: "required",
                  date: "required",
                  game1: {
                     required: true,
                     number: true
                  },
                  game2: {
                     required: true,
                     number: true
                  },
                  game3: {
                     required: true,
                     number: true
                  }
               },
               messages: {
                  playerName: "Need a name!",
                  date: "Valid date required!",
                  game1: "Need a valid score!",
                  game2: "Need a valid score!",
                  game3: "Need a valid score!"
               },
               submitHandler: function(form) {
                  $.ajax({
                     type: "POST",
                     url: "submitplayer",
                     data: $(form).serialize(),
                     success: function(res, status, xhr) {
                        console.log("success! Type: "+ xhr.getResponseHeader("content-type"));
                        console.log("status: " + status);
                        console.log(JSON.stringify(res));
                     }
                  }); //ajax done
               }
            });
      });

      //submit button on submitplayers.html
      //clear all inputs to make it easier for submitting more players
      /*$("#playersubmit").on('click', function() {
         $("input[name='playerName']").val('');
         for (var i = 1; i <= 3; i++){
            $("input[name='game"+ i + "']").val('');
         };
      });*/
   });
});

$("#goHome").on('click', function() {
   $("#load_main").load("home.html");
});

$("#contactUs").on('click', function() {
   $("#load_main").load("contact.html", function() {
      $("#submitContact").on('click', function() {
         $("#contactInfo")
            .validate({
               debug: false,
               rules: {
                  name: "required",
                  email: {
                     required: true,
                     email: true
                  },
                  comment: "required",
                  subject: "required"
               },
               messages: {
                  name: "We need to know who you are!",
                  email:"Need a valid email to contact you!",
                  comment: "Let us hear from you!",
                  subject: "What is the message about?"
               },
               submitHandler: function(form) {
                  $.get("sendemail", $(form).serialize(), function(data) {
                        if (data==="sent") {
                           $("#message").empty().html("\
                              Email is sent to minho.lee.93@hotmail.com");
                           };
                        });
                  $("#message").html("<h4>Message Sent!</h4>");
               }
            //add SubmitHandler to do ajax post call (use serialize to use stuff inside form)
            });
      });
   });
});

$("#getplayers").on('click', function() {
   $('#load_main').load("getplayers.html", function() {
      //this callback is here to ensure that main.js is loaded properly
      //able to recognize all id/classes before contact.html is loaded
      
      /*$("#getInfo").on('click', function() {
         $("#displayInfo").DataTable({
            "paging": false,
            "processing": true,
            "serverSide": true,
            "ajax": {
               type: "POST",
               url: "/getplayer",
               data: { userid: $('#playerName').val() },
               dataSrc: ''
            },
            "columns" : [
               { data: "session" },
               { data: "session[0].game1" },
               { data: "session[0].game2" },
               { data: "session[0].game3" }
            ]
         });
      });*/


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
               if (typeof res === "string") {
                  $("#results").html("<div id='playerNotFound'>"+ res + "</div>");
                  $("#showScore").html("");
               } else {
                  //$("#results").append(JSON.stringify(res));
                  console.log(res.player);
                  $("#results").html("");
                  if (counter === 0) {
                     $("#showScore")
                        .append("<tr><th>Date</th><th>Game 1</th>\
                                 <th>Game 2</th><th>Game 3</th>\
                                 <th>Average</th></tr>");
                  } else {
                     $("#showScore")
                        .html("<tr><th>Date</th><th>Game 1</th>\
                                 <th>Game 2</th><th>Game 3</th>\
                                 <th>Average</th></tr>");
                  };
                  for (var i = 0; i < res.player.session.length; i++) {
                     var game1 = parseInt(res.player.session[i].game1),
                         game2 = parseInt(res.player.session[i].game2),
                         game3 = parseInt(res.player.session[i].game3),
                         date  = res.player.session[i].date;

                     var average = (game1 + game2 + game3) / 3;

                     $("#showScore")
                        .append("\
                           <tr><td>"+date+"</td>\
                           <td>"+ game1 + "</td>\
                           <td>"+ game2 +"</td>\
                           <td>"+ game3+"</td>\
                           <td>"+ Math.round(average) + "</tr>");
                  };
                  counter++;
               };
               $("#results").append('<br/>');
            },
            error: function(xhr, textStatus, error){
               console.log(xhr.statusText);
               console.log(textStatus);
               console.log(error);
            }
         }); //ajax done
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
   
   webshims.setOptions('forms-ext', {types: 'date'});
   webshims.polyfill('forms forms-ext');
});

var counter = 0;