//dynamically render html pages
$("#submitplayers").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load("submitplayers.html", function() {
         $("#wrapper_div").fadeIn(300);
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
                           $("#playerSubmitMessage").html(JSON.stringify(res));
                        },
                        error: function(xhr, textStatus, error){
                           console.log(xhr.statusText);
                           console.log(textStatus);
                           console.log(error);
                        }
                     }); //ajax done
                     //$(form).clear();
                  }
               });
         });//playersubmit
      });//load_main
   });//wrapper_div
});//submitPlayers

$("#goHome").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load("home.html", function() {
         $("#wrapper_div").fadeIn(300);
      });//load_main
   });//wrapper_div
});//goHome

$("#contactUs").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load("contact.html", function() {
         $("#wrapper_div").fadeIn(300);
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
               });//contactInfo
         });//submitContact
      });//load_main
   });//wrapper_div
});//contactUs

$("#getplayers").on('click', function() {
   //**important!!: this callback ^ is here to ensure that main.js is loaded properly
   //able to recognize all id/classes before contact.html is loaded
   $("#wrapper_div").fadeOut(300, function() {
      $('#load_main').load("getplayers.html", function() {
         $("#wrapper_div").fadeIn(300);
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
                            date  = res.player.session[i].date;

                        var average = Math.round((game1 + game2 + game3) / 3);
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
                              label: 'Average by date',
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




//Change active class as the html pages render
$(document).ready(function () {
   $('.nav li a').click(function(e) {
      var $btn = $('.nav li button');
      var $parent = $(this).parent();

      $('.nav li').removeClass('active');
      $btn.css({'background-color': 'rgb(34,34,34)', 'color':'#9d9d9d'});
      console.log($btn[0]);
      console.log($(this)[0].hash);
      
      //console.log($(this));

      //dropdown menu doesn't work with active boostrap list so making
      //a manual hack to add in css and removing them
      if (!$parent.hasClass('active')) {
         if ($parent.hasClass('dropdown-content')) {
            $parent.parent().addClass('active');
            if ($(this)[0].hash === "#submitplayers") {
               $btn = $btn[0];
            } else if ($(this)[0].hash === "#getplayers") {
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
   
   webshims.setOptions('forms-ext', {types: 'date'});
   webshims.polyfill('forms forms-ext');
});

var counter = 0;
var average_array = [], date_array = [];