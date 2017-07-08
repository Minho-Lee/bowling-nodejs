console.log("MAIN.JS LOADED");

//dynamically render html pages
$("#submitplayers").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load("submitplayers.html", function() {
         $("#wrapper_div").fadeIn(300);
         var firstClick = true
         $("#playersubmit").on('click', function() {
            if (firstClick) {
               console.log('playerform tooltip init');

               $('#playerform').find('div').find('input').each(function(i, element) {
                  var $name = $(element).attr('name');
                  if ($name == 'playerName' || $name === "game2") {
                     $(element).addClass('playerform_tip_odd');
                  } else if ($name === 'game1' || $name === 'game3') {
                     $(element).addClass('playerform_tip_even');
                  } 
                  //not adding a tiptoolster class to input type[date] -> not supported
               });

               $(".playerform_tip_odd").tooltipster({
                  animation: 'slide',
                  delay: 200,
                  side: 'right',
                  trigger: 'custom',
                  onlyOne: false
               });
               $(".playerform_tip_even").tooltipster({
                  animation: 'slide',
                  delay: 200,
                  side: 'left',
                  trigger: 'custom',
                  onlyOne: false
               });
               //apply 'playerform_tip' class onto every div in the playerform
               //NTS: tooltipster ONLY applies to type="text"
               
            } else {
               $(".playerform_tip").tooltipster('show');
            };
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
                     playerName: "Need a player name!",
                     date: "Valid date required!",
                     game1: "Need a valid game 1 score!",
                     game2: "Need a valid game 2 score!",
                     game3: "Need a valid game 3score!"
                  },
                  errorPlacement: function(err, element) {
                     if ($(element).attr('name') === 'date') {
                        $("#date-error").html("Valid Date Required!");
                     } else {
                        $(element).tooltipster('content', $(err).text());
                        $(element).tooltipster('show');
                     }
                  },
                  success: function(label, element) {
                     if ($(element).attr('name') === 'date') {
                        $("#date-error").html("Accepted!");
                     } else {
                        $(element).tooltipster('content', 'Accepted!');
                     };
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
                           $(".playerform_tip").tooltipster('close');
                           $("#date-error").html("");
                        },
                        error: function(xhr, textStatus, error){
                           console.log(xhr.statusText);
                           console.log(textStatus);
                           console.log(error);
                        }
                     }); //ajax done
                  }//submitHandler
               });//playerform
            firstClick = false;
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
                     $("#playerAverage").html("");
                     $("#wrapper_chart").hide();
                  } else {
                     //console.log(res.player);

                     //means player is found
                     //reset playerAverage to display the average for new player
                     playerAverage = 0
                     average_array = [];
                     date_array = [];
                     $("#results").html("");
                     if (counter === 0) {
                        //if first time making the table
                        $("#showScore")
                           .append("<tr><th>Date</th><th>Game 1</th>\
                                    <th>Game 2</th><th>Game 3</th>\
                                    <th>Average</th></tr>");
                     } else {
                        //if table has been made before
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

                        playerAverage += average;
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
                     playerAverage = Math.round(playerAverage / res.player.session.length);
                     $("#playerAverage").html('<h4>Player ' + $("#playerName").val() + 
                        ' currently has average of ' + playerAverage + '!</h4>');
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

var page_reload_counter = 0;
$("#maketeams").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load('teams.html', function() {
         $("#wrapper_div").fadeIn(300);
         var teamtable = $("#teamselection").DataTable({
            "data": player_array_team,
            "paging": false,
            "columns": [
               { "title": "Selected"},
               { "title": "Rank" },
               { "title": "Name" },
               { "title": "Average" }
            ],
            "columnDefs": [
            {
               "searchable": true,
               "orderable": false,
               "targets": 2
            },
            {
               "searchable": false,
               "orderable": false,
               "targets": [0,1,3]
            },
            {
               "width": "20%",
               "targets": 0
            },
            {
               "width": "10%",
               "targets": 1
            }],
            "order": [[3, 'desc']],
            "title": 'hi'
         });//DataTable end
         teamtable.on( 'order.dt search.dt', function () {
            teamtable.column(1, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
               cell.innerHTML = i + 1;
            });
         }).draw();
         //if it's not first time loading teams.html, then refresh the table
         if (page_reload_counter !== 0) {
            //teamtable.ajax.reload(); --> runs into errors 
            for (var i = 0; i < teamtable.rows().count(); i++) {
               teamtable.cell(i, 0).data('').draw();
            };
         };
         //adding new players as they are added at the end of the teamtable as new rows
         var firstClick = true;
         $("#clickableIcon").on('click', function() {
            var text="<form id='newplayerForm'><input type='text' name='playername' \
                        placeholder='Name' id='newname' class='tooltipster'/>\
                        <input type='text' name='average' placeholder='Average' id='newavg'\
                        class='tooltipster'/> <button type='submit' \
                        class='btn btn-sm btn-success' id='newsubmit'>\
                        Add New Player!</button> <button type='button' class='btn btn-sm \
                        btn-warning' id='newsubmitDone'>Done!</button><br/></form>"
            if (firstClick) {
               $("#newcomers").append(text);   
               $(".tooltipster").tooltipster({
                  animation: 'fall',
                  delay: 200,
                  side: 'bottom',
                  trigger: 'custom'
               });
            } else {
               //if not first time clicking icon, just show it since it's already loaded.
               $("#newplayerForm").slideDown('slow');
               //$(".tooltipster").tooltipster('open');
            };
            //enabling jquery plugin tooltipster
            
            scrollTo('newplayerForm');
            //hide the add icon
            $("#clickableIcon").slideUp('slow');

            //the newly created 'Done' button needs to be within this callback function
            //or it goes out of scope
            $("#newsubmitDone").on('click', function() {
               //reshow the click icon
               $("#clickableIcon").slideDown('slow');
               $("#newplayerForm").slideUp('slow');
               //clearing all input boxes in the new player form
               $("#newplayerForm")[0].reset();
               $(".tooltipster").tooltipster('close');

            });//newplayer done button

            $("#newsubmit").on('click', function() {
               $("#newplayerForm")
                  .validate({
                     debug: false,
                     rules: {
                        playername: "required",
                        average: {
                           required: true,
                           number: true,
                           range: [1,300]
                        }
                     },
                     messages: {
                        playername: "Your name is required!",
                        average: "We need your score!"
                     },
                     errorPlacement: function(err, element) {
                        console.log(element);
                        $(element).tooltipster('content', $(err).text());
                        $(element).tooltipster('show');
                     },
                     success: function(label, element) {
                        $(element).tooltipster('content', 'Accepted!');
                     },
                     submitHandler: function(form) {
                        console.log($(form).serialize());
                     }

                  });//end validate
            });//newplayer submit button

            firstClick = false;
         });//clickableIcon



         //in order to make selection, alternate clicks will select and unselect players
         $("#teamselection tbody").on('click', 'tr', function() {
            $(this).toggleClass('selected');
            var idx = teamtable.row(this).index();
            if ($(this).hasClass('selected')) {
               teamtable.cell(idx, 0).data('Selected').draw();
            } else {
               teamtable.cell(idx, 0).data('').draw();
            }
         //MUCH easier way to select rows ^^^^^^
         //    var player_click = $(this).data('clicks');
         //    var idx = teamtable.row(this).index();
         //    //upon initialization of player_click, it is undefined.
         //    if (player_click || (typeof player_click === 'undefined')) {
         //       teamtable.cell(idx, 0).data('Selected').draw();
         //       $(this).addClass('selected');
         //       if (typeof player_click === 'undefined'){
         //          //accounting for the first click, forcefully update its data to false
         //          player_click = $(this).data('clicks', !player_click);      
         //       }
         //    } else {
         //       teamtable.cell(idx, 0).data('').draw();
         //       $(this).removeClass('selected');
         //    }
         //    $(this).data('clicks', !player_click);
         });
         page_reload_counter = 1;
         var selected_array = [];
         $("#teamSubmit").on('click', function() {
            var selectedPlayers = teamtable.rows('.selected');
            var tier_1 = [], tier_2 = [], tier_3 = [], tier_4 = [];
            if (selectedPlayers.count() < 4) {
               $("#teamSubmitMessage").html("<br/><h4>Please select more than  or equal to 4 players</h4>");
            } else if (selectedPlayers.count() % 4 !== 0 ) {
               $("#teamSubmitMessage").html("<br/><h4>Please select multiples of 4</h4>");
            } else {
               for (var i = 0; i < selectedPlayers.count(); i++) {
                  //since the indices for the rows are not stored in order of the 
                  //newly selected rows, no need to push in the name, score ahead of time
                  //just query the name and score after using the indices
                  selected_array.push([selectedPlayers[0][i]]);
               }//at this point selected_array will have [original idx, name, average] of all selected players
               //console.log(selected_array);
               
               //separate selected_array into groups of 4 (one from each respsective tier)
               //for now select in multiples of 4
               num_of_teams = Math.ceil(selectedPlayers.count() / 4);
               var tier_1_high=0, tier_2_high=0, tier_3_high=0, tier_4_high=0;
               for (var i = 0; i < selectedPlayers.count(); i++ ) {
                  var tempName = teamtable.row(selected_array[i][0]).data()[2],
                      tempAvg = teamtable.row(selected_array[i][0]).data()[3];
                  // console.log(tempName + ' / ' + tempAvg);
                  if (i === 0) {
                     tier_1_high = tempAvg;
                  } else if (i === num_of_teams) {
                     tier_2_high = tempAvg;
                  } else if (i === num_of_teams * 2) {
                     tier_3_high = tempAvg;
                  } else if (i === num_of_teams * 3) {
                     tier_4_high = tempAvg;
                  }
                  if (i < num_of_teams) {
                     tier_1.push([1, tempName, tempAvg, (tier_1_high - tempAvg)]);
                  } else if (i < num_of_teams * 2) {
                     tier_2.push([1, tempName, tempAvg, (tier_2_high - tempAvg)]);
                  } else if (i < num_of_teams * 3) {
                     tier_3.push([1, tempName, tempAvg, (tier_3_high - tempAvg)]);
                  } else {
                     tier_4.push([1, tempName, tempAvg, (tier_4_high - tempAvg)]);
                  };
                  //console.log(tier_1_high + ' / ' + tier_2_high + ' / ' + tier_3_high + ' / ' + tier_4_high);
               };

               
               $("#teamSubmitMessage").html("<br/><h4>"+ selectedPlayers.count() +
                  " Players have been submitted</h4>");
               //NTS: selected_array picks up selection from top to bottom regardless of
               //which player has been selected first -> makes it easier to split it into tiers.
               
               //remove selected rows from the original table
               selectedPlayers.remove().draw();

               //for some reason, fisherYates algorithm for shuffling is not working for my 2d array
               //thus using underscore.js
               tier_1 = _.shuffle(tier_1);
               tier_2 = _.shuffle(tier_2);
               tier_3 = _.shuffle(tier_3);
               tier_4 = _.shuffle(tier_4);
               assorted_array = [], team_average = [];
               for (var i = 0; i < num_of_teams; i++) {
                  var temp1 = tier_1.pop(), temp2 = tier_2.pop(),
                      temp3 = tier_3.pop(), temp4 = tier_4.pop();
                  // assorted_array.push(temp1, tier_1_high);
                  // assorted_array.push(temp2, tier_2_high);
                  // assorted_array.push(temp3, tier_3_high);
                  // assorted_array.push(temp4, tier_4_high);
                  assorted_array.push(temp1, temp2, temp3, temp4);
                  team_average.push(Math.round((temp1[2] + temp2[2] + temp3[2] + temp4[2])/4));
               };
               console.log(team_average);
               var tableNum = 1;
               //creating tables for each team
               
               for (var i = 0; i < assorted_array.length; i+= 4){
                  var team_handicap =
                     createTeamTable('selectedTable'+ tableNum, assorted_array.slice(i,i+4));
                  $('#selectedTable' + tableNum).after('<h4 class="show-handicap"\
                        >Overall team handicap is ' + team_handicap + '!</h4>');
                  tableNum += 1;
               };

               //NTS: space in b/w elements means grab descendants, no space means && operation
               var div_counter = 1;
               $("div .toolbar").each(function() {
                  // $(this).css({  'font-size': '16px',
                  //                'text-align': 'left',
                  //                'margin-left': '234px'
                  // });
                  // $(this).text('@media (min-width: 582px) { \
                  //              .toolbar { margin-left : 194px; color: red }}');

                  //write on each table its team numbers
                  $(this).html('<b style="font-size: 16px">Team' + div_counter + '</b>')
                  div_counter++;
               });
               //$("div.toolbar").html('<b>Team 1</b>');
               $("#teamSubmit").hide('slow');
               
            }//end if
            scrollTo('teamSubmitMessage');


         });//teamSubmit button
      });//load_main
   });//wrapper_div
});//maketeams load


//method for creating a table for splitting into small ordered tables (groups of 4)
var createTeamTable = function(id, arr) {
   id = $("#"+ id).DataTable({
      //for dom documentation, refer to https://datatables.net/reference/option/dom
      "dom": '<"toolbar">tri',
      "info": false,
      "data": arr,
      "searching": false,
      "paging": false,
      "columns": [
         { "title" : "Tier"},
         { "title" : "Name" },
         { "title" : "Average" },
         { "title" : "Handicap" }
      ],
      "columnDefs": [{
         "orderable": false,
         "searchable": false,
         "targets": [0,1,2,3]
      },
      {
         "width": "15%",
         "targets": 3
      }],
      "order": [[2, 'desc']]

   });//DataTable done
   //putting tiers in front
   id.on( 'order.dt search.dt', function () {
      id.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
         cell.innerHTML = i + 1;
      });
   }).draw();
   //returning the sum of the handicaps
   return id.column(3).data().sum();
   //adding a row in the end to indicate what their overall hadicap is
   // $(id.table().footer()).contents().last()[0].textContent=
   //       "The overall handicap for this team is " + id.column(3).data().sum();
   // $(id.table().footer()).addClass('teamtable-footer');

};//createTeamTable method

//create a table that's not ordered, just shows as data is fed
var createTable = function(id, arr) {
   id = $("#"+ id).DataTable({
      "data": arr,
      "searching": false,
      "paging": false,
      "columns": [
         { "title" : "Order"},
         { "title" : "Name" },
         { "title" : "Average" }
      ],
      "orderable": false,
      "searchable": false
   });//DataTable done
}//createTable method

//rankings page load
$("#getrankings").on('click', function() {
   $("#wrapper_div").fadeOut(300, function() {
      $("#load_main").load("rankings.html", function() {
         $("#wrapper_div").fadeIn(300);
         //$("#rankings").on('click', function() {
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
           // $(this).hide(300);
         //});//rankings
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
         console.log("getDocs() success! Type: "+ xhr.getResponseHeader("content-type"));
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
               player_array_team.push(["", 0, name, parseInt(avg_of_avg)]);
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
      //var $btn = $('.nav li button');
      var $parent = $(this).parent();
      //var $hash = $(this)[0].hash;
      $('.nav li').removeClass('active');
      
      // console.log($parent);
      // console.log($parent.parent());

      if (!$parent.hasClass('active')) {
         if ($parent.parent().hasClass('dropdown-menu')) {
            //adding active class to the list which is a direct child of ul navbar
            $parent.parent().parent().addClass('active');
            
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

//checks if two arrays are identical (content and length)
function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }
    return true;
};

//scrolls to the given id's position
var scrollTo = function(id) {
   $('html, body').animate({
                  scrollTop: $("#" + id).offset().top
               }, 2000);
}

var playerAverage = 0;
var counter = 0;
var average_array = [], date_array = [];
var player_array_rank = [], player_array_team = [];


