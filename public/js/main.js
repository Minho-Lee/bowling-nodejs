console.log("MAIN.JS LOADED");

//dynamically render html pages
$("#submitplayers").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load("submitplayers.html", function() {
         $("#wrapper_div").fadeIn(300);
         $("#playersubmit").on('click', function() {
            $("#playerform")
               .validate({
                  debug: false,
                  rules: {
                     playerName: "required",
                     date: "required",
                     game1: {
                        required: true,
                        number: true,
                        range: [1, 300]
                     },
                     game2: {
                        required: true,
                        number: true,
                        range: [1, 300]
                     },
                     game3: {
                        required: true,
                        number: true,
                        range: [1, 300]
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
                     var average = 0;
                     //submitting 'average' field into db in order to make getrankings faster
                     for (var i = 1; i <= 3; i++) {
                        average += parseInt($("input[name='game" + i + "']").val());   
                     };
                     average = Math.round(average / 3);
                     $.ajax({
                        cache: false,
                        type: "POST",
                        url: "submitplayer",
                        data: $(form).serialize() + "&average=" + average,
                        success: function(res, status, xhr) {
                           console.log("success! Type: "+ xhr.getResponseHeader("content-type"));
                           console.log("status: " + status);
                           console.log(JSON.stringify(res));
                           $("#playerSubmitMessage").html(JSON.stringify(res));
                           //clearing fields except for the date
                           for (var i = 1; i <= 3; i++) {
                              $("input[name='game" + i + "']").val('');   
                           };
                           $("input[name='playerName']").val('');
                           //if a player gets submitted properly then reset the arrays
                           //and query all the docs again
                           player_array_team = [];
                           player_array_rank = [];
                           getDocs();
                        },
                        error: function(xhr, textStatus, error){
                           console.log(xhr.statusText);
                           console.log(textStatus);
                           console.log(error);
                        }
                     }); //ajax done
                  }//submitHandler
               });//playerform
            scrollTo('playerSubmitMessage')
         });//playersubmit button
      });//load_main
   });//wrapper_div
});//submitPlayers

$("#goHome").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load("home.html", function() {
         $("#wrapper_div").fadeIn(300);
         $("#goToMap").on('click', function() {
            $("#load_main").load("map.html", function() {
               scrollTo('scrollTopOfMap');
            });
         });//goToMap
      });//load_main
   });//wrapper_div
});//goHome

$("#contactUs").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load("contact.html", function() {
         $("#wrapper_div").fadeIn(300);
         $("#clearContactForm").on('click', function() {
            $("#messageSent").html("");
            $("#submitMessage").prop('disabled', false);
            scrollTo('contactInfo');
         });
         $("#submitMessage").on('click', function() {
            email_status = "";
            $("#contactInfo")
               .validate({
                  debug: false,
                  rules: {
                     name: "required",
                     email: {
                        required: true,
                        email: true
                     },
                     message: "required",
                     subject: "required"
                  },
                  messages: {
                     name: "We need to know who you are!",
                     email: {
                        required: "Need a valid email to contact you!",
                        email: "Email must be in form of name@domain.com"
                     },
                     message: "Let us hear from you!",
                     subject: "What is the message about?"
                  },
                  submitHandler: function(form) {
                     $.ajax({
                        cache: false,
                        url: 'sendemail',
                        type: 'GET',
                        data: $(form).serialize(),
                     }) //ajax call complete
                     .done(function(data) {
                        //gets a confirmation from nodemailer to see
                        if (data.status === "success") {
                           $("#submitMessage").prop('disabled', true)
                           $("#messageSent").empty()
                                            .html("Email is sent to mississaugabowling@gmail.com");
                        } else {
                           $("#messageSent").empty()
                                            .html("Error has occurred, please try again later.");
                        };
                        //defined scrollTo function at bottom. Just smooth scroll animation.
                        scrollTo('messageSent');
                     })
                     .fail(function(xhr, textStatus, err) {
                        console.log(xhr.statusText);
                        console.log(textStatus);
                        console.log(error);
                     });
                  }//submitHandler
               });//contactInfo
         });//submitMessage
      });//load_main
   });//wrapper_div
});//contactUs

$("#getplayers").on('click', function() {
   //**important!!: this callback ^ is here to ensure that main.js is loaded properly
   //able to recognize all id/classes before contact.html is loaded
   $("#wrapper_div").fadeOut(300, function() {
      $('#load_main').load("getplayers.html", function() {
         $("#wrapper_div").fadeIn(300);
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
                     //means player is not found
                     $("#results").html("<div id='playerNotFound'>"+ res + "</div>");
                     $("#showScore").html("");
                     $("#wrapper_chart").hide();
                  } else {
                     //means player is found
                     console.log(res.player);
                     average_array = [];
                     date_array = [];
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
                            average = parseInt(res.player.session[i].average)
                            date  = res.player.session[i].date;

                        average_array.push(average);
                        date_array.push(date);
                        $("#showScore")
                           .append("\
                              <tr><td>"+date+"</td>\
                              <td>"+ game1 + "</td>\
                              <td>"+ game2 +"</td>\
                              <td>"+ game3+"</td>\
                              <td>"+ average + "</tr>");
                     };//end for
                     counter++;
                     //making chart
                     ctx = document.getElementById("myChart").getContext('2d');

                     //setting dimensions
                     //ctx.canvas.width = 2000;
                     //ctx.canvas.height = 1000;
                     var myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                           labels: date_array,
                           datasets: [{
                              label: 'Average',
                              backgroundColor: 'red',
                              data: average_array,
                              borderColor: 'red',
                              borderWidth: 1,
                              fill: false
                           }]
                        },
                        options: {
                           responsive: true,
                           title: {
                              display: true,
                              text: "Display Average"
                           },
                           scales: {
                              xAxes: [{
                                 display: true,
                                 scaleLabel: {
                                    display: true,
                                    labelString: 'Date'
                                 }
                              }],
                              yAxes: [{
                                 display: true,
                                 scaleLabel: {
                                    display: true,
                                    labelString: 'Average'
                                 }
                              }]
                           }
                        }
                     });//myChart
                     $("#wrapper_chart").show();
                  };//end if
                  $("#results").append('<br/>');
                  console.log(date_array);
               },
               error: function(xhr, textStatus, error){
                  console.log(xhr.statusText);
                  console.log(textStatus);
                  console.log(error);
               }
            }); //ajax done
            console.log("post action completed");
            
         });//getInfo
      });//load_main
   });//wrapper_div
});//getplayers

//login page load
$("#goToLogin").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $('#load_main').load("login.html", function() {
         $("#wrapper_div").fadeIn(300);


      });//load_main
   });//wrapper_div
});//goToLogin

$("#maketeams").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load('teams.html', function() {
         $("#wrapper_div").fadeIn(300);
         var teamtable = $("#teamselection").DataTable({
            "data": player_array_team,
            "columns": [
               { "title": "Name" },
               { "title": "Average" }
            ],
            "columnDefs": [{
               "searchable": false,
               "orderable": false,
               "targets": [0,1]
            }],
            "order": [[1, 'desc']]

         });//DataTable end
      });//load_main
   });//wrapper_div
});//maketeams load

//rankings page load
$("#getrankings").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load("rankings.html", function() {
         $("#wrapper_div").fadeIn(300);
         $("#rankings").on('click', function() {
            //at this point player_array is [name, average for each session]
            //displaying onto a table using DataTable library
            var table = $("#displayRankings").DataTable({
               "data" : player_array_rank, 
               //"paging": false,
               "columns" : [
                  { "title" : "Rank" },
                  { "title" : "Name" },
                  { "title" : "Average" }
               ],
               "columnDefs": [{
                  "searchable": false,
                  "orderable": false,
                  "targets": 0
               },
               {
                  "searchable": true,
                  "orderable": false,
                  "targets": 1
               },
               {
                  "searchable": false,
                  "orderable": false,
                  "targets": 2
               }],
               "order" : [[2, 'desc']]
            });//dataTable init
            //puts a default index rank
            table.on( 'order.dt search.dt', function () {
               table.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
                  cell.innerHTML = i + 1;
               });
            }).draw();
            //hide retrieve button after submitting
            $(this).hide(300);
         });//rankings
      });//load_main
   });//wrapper_div
});//getrankings.html

//function to query all the docs in the db
function getDocs(){
   $.ajax({
      type: "POST",
      url: "/retrieverankings",
      data: { 'text': 'userid' },
      success: function(res, status, xhr) {
         console.log("success! Type: "+ xhr.getResponseHeader("content-type"));
         console.log("status: " + status);
         if (typeof res === "string") {
            $("#rankingMsg").html(res);
         } else {
            //every doc is called, now separate the names
            //$("#rankingMsg").html(JSON.stringify(res));
            var docs = res.eventNames;
            console.log("# of players in db : " +docs.length);
            //iterate through all docs
            for (var outer = 0; outer < docs.length; outer++) {
               //iterate through all sessions
               var name = docs[outer].userid;
               var avg_of_avg = 0;
               for (var inner = 0; inner < docs[outer].session.length; inner++) {
                  // $("#rankingMsg").append(docs[outer].session[inner].average + "<br/>");
                  avg_of_avg += parseInt((docs[outer].session[inner].average));
               }; //end for
               avg_of_avg = Math.round(avg_of_avg / docs[outer].session.length);
               //making teams would not require a rank but rather a clickable option
               //as the first column so no need to push in a default rank column
               player_array_rank.push([0, name, parseInt(avg_of_avg)]);
               player_array_team.push([name, parseInt(avg_of_avg)]);
            }; //end for
         }//end if
      },
      error: function(xhr, textStatus, error){
         console.log(xhr.statusText);
         console.log(textStatus);
         console.log(error);
      }//error
   });//ajax done
}

//Change active class as the html pages render
$(document).ready(function() {
   //make ajax call when doc is loaded to fill in player_array so that 
   //other html pages can use it to make their tables with the same info.
   getDocs();

   $('.nav li a').click(function(e) {
      var $btn = $('.nav li button');
      var $parent = $(this).parent();

      $('.nav li').removeClass('active');
      $btn.css({'background-color': 'rgb(34,34,34)', 'color':'#9d9d9d'});
      //console.log($btn[0]);
      //console.log($(this)[0].hash);
      //console.log($(this));

      //dropdown menu doesn't work with active boostrap list so making
      //a manual hack to add in css and removing them
      if (!$parent.hasClass('active')) {
         if ($parent.hasClass('dropdown-content')) {
            $parent.parent().addClass('active');
            if ($(this)[0].hash === "#submitplayers") {
               $btn = $btn[0];
            } else if ($(this)[0].hash === "#getplayers" ||
                       $(this)[0].hash === "#getrankings" || 
                       $(this)[0].hash === "#maketeams"){
               $btn = $btn[1];
            }
            $btn.style.backgroundColor = '#080808';
            $btn.style.color = '#fff';
         } else {
            $parent.addClass('active');
         }
      }
      e.preventDefault();
   });
   
   //clicking elsewhere will close navbar (for mobile purposes, or reduced browser size)
   $(document).click(function(event) {
      var clickover = $(event.target);
      var _opened = $(".navbar-collapse").hasClass('in');
      
      var navMain = $(".navbar-collapse"); // avoid dependency on #id
      // "a:not([data-toggle])" - to avoid issues caused
      // when you have dropdown inside navbar

      navMain.on("click", "a:not([data-toggle])", null, function () {
         navMain.collapse('hide');
      });

      if (!clickover.hasClass('navbar-collapse') && !clickover.hasClass('dropdown') 
          && !clickover.hasClass('dropbtn') && _opened) {
         navMain.collapse('hide');
      };
   });

   webshims.setOptions('forms-ext', {types: 'date'});
   webshims.polyfill('forms forms-ext');
});//document.ready

/*function initMap() {
   var uluru = {lat: 43.6505534, lng: -79.6029267}
   var map1 = new google.maps.Map(document.getElementById('myMap'), {
      zoom: 14,
      center: uluru
   });

   var marker = new google.maps.Marker({
          position: uluru,
          map: map1
   });
};
*/

//scrolls to the given id's position
var scrollTo = function(id) {
   $('html, body').animate({
                  scrollTop: $("#" + id).offset().top
               }, 2000);
}

var email_status = "";
var counter = 0;
var average_array = [], date_array = [];
var player_array_rank = [], player_array_team = [];


