function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id, endtime) {
  var clock = document.getElementById(id);
  var daysSpan = clock.querySelector('.days');
  var hoursSpan = clock.querySelector('.hours');
  var minutesSpan = clock.querySelector('.minutes');
  var secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    var user = $('#username').val();
    if (user === "admin123") {
      adminMode = true;
    }
    
    t = getTimeRemaining(endtime);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

    if (t.total < 0) {
      clearInterval(timeinterval);
      var weeks = document.getElementById('weekdiv');
      var weeksSpan = weeks.querySelector('.weeks');
      weekCounter += 2;
      balanceUpdate('add', salaryValue);
      if (foodCounter === true) {
        balanceUpdate('minus', foodCost);
      }
      if (houseCounter === true) {
        balanceUpdate('minus', houseCost);
      }
      if ((weekCounter === startWeek + 10) & (investCounter === true)) {
        if (investSuccess) {
          investUpdate.html("<h3>Investment Successful! You earned $" + investReturn + "</h3>");
          balanceUpdate('add', investReturn);
        } else {
          investUpdate.html("<h3>Invest Unsuccessful :( You lost your $1000</h3>");
        } 
        investmentButton.disabled = false;
        investmentButton.innerHTML = "Submit";
        $('#afterInvestSubmit').empty();
      }

      //Check if the game is still going on (modify endWeek to change the ending)
      if (weekCounter === endWeek || adminMode === true) {
        $('#currentBalance, .initialHide, #foodExpense, \
            #houseExpense, #eventUpdate, #investmentUpdate, \
            #afterSubmit, #ownedItems').hide('slow', function() {
              daysSpan.innerHTML = '0';
              hoursSpan.innerHTML = '00';
              minutesSpan.innerHTML = '00';
              secondsSpan.innerHTML = '00';
              weeksSpan.innerHTML = weekCounter;
              $("#gameover")
                .html('<h1>Congrats! You finished the game with balance of <b>$' + Math.round(parseFloat(balance)*100) / 100 + '</b></h1>')
                .fadeIn(2000);
              activate();
            });

      } else {
        currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
        weeksSpan.innerHTML = weekCounter;
        deadline = new Date(Date.parse(new Date()) + 0.00006 * 24 * 60 * 60 * 1000);
        initializeClock('clockdiv', deadline);
      }

      
    }
  }

  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}

//scroll to any given div
function goToByScroll(id){
  // Remove "link" from the ID
  id = id.replace("link", "");
  // Scroll
  $('html, body').animate({
      scrollTop: $("#"+id).offset().top},
      'slow');
}

$('#submitSalary').click(function() {
  var salary = document.getElementById('salary');
  var submitButton = document.getElementById('submitSalary');
  if (isNaN(salary.value)) {
    $('#afterSubmit').html('<h3>Invalid Entry! Please Enter A Number!</h3>');
  } else {
    if (regexp.test(salary.value) === true) {
      submitButton.disabled = true;
      submitButton.innerHTML = "Submitted!"
      initialHide.fadeIn(2000);
      salary.disabled = true;
      salaryValue = salary.value;
      $('#afterSubmit').html('<h3>Your bi-weekly salary is : $' + salaryValue + '</h3>');
      currentBalance.html('<h2>You currently have: $0</h2>');
      salary.value = "Entered!";
      deadline = new Date(Date.parse(new Date()) + 0.00006 * 24 * 60 * 60 * 1000);
      initializeClock('clockdiv', deadline);  
    } else {
      $('#afterSubmit').html('<h3>Invalid Entry! Please Enter A Valid Number! (XXX.XX format)</h3>');
    }
  }
  goToByScroll('weekdiv');

  //hiding the salary section after a certain time
  var id = setInterval(function() {
    seconds++;
    if (seconds >= 5) {
      clearInterval(id);
      //alert('Total time: ' + seconds + ' seconds');
      var elems = document.querySelectorAll('.salaryHide');
      for (var i = 0; i < elems.length; ++i) {
        //elems[i].innerHTML = "";
        elems[i].style.display = "none";
      }
      $('#transition').html("<h1>Start!</h1>");
      /*$('#salaryInput').css(
        'padding-top: -70px'
      );*/
      seconds = 0;
    }
  }, 1000);
});


function submitFood() {
  foodCost = $('#foodCost').val();
  foodSubmit = $('#foodSubmitButton');
  if (isNaN(foodCost)) {
    $('#afterFoodSubmit').html('<h4>Invalid Entry! Please Enter A Number!</h4>');
    foodCounter = false;
  } else {
    $('#afterFoodSubmit').html('<h4>Submitted!</h4>');
    if (regexp.test(foodCost) === true) {
      foodCounter = true;
      foodExpense.html('<h3>Food Expense: $' + foodCost+ '</h3>');
    } else {
      $('#afterFoodSubmit').html('<h4>Invalid Entry! Please Enter A Valid Number! (XXX.XX format)</h4>');
      foodCounter = false;
    }
  }
}

function submitHouse() {
  houseCost = $('#houseCost').val();
  houseSubmit = $('#houseSubmitButton');
  if (isNaN(houseCost)) {
    $('#afterHouseSubmit').html('<h4>Invalid Entry! Please Enter A Number!</h4>');
    houseCounter = false;
  } else {
    $('#afterHouseSubmit').html('<h4>Submitted!</h4>');
    if (regexp.test(houseCost) === true) {
      houseCounter = true;
      houseExpense.html('<h3>House Expense: $' + houseCost+ '</h3>');
    } else {
      $('#afterHouseSubmit').html('<h4>Invalid Entry! Please Enter A Valid Number! (XXX.XX format)</h4>');
      houseCounter = false;
    }
  }

}

function balanceUpdate(action, moneyVal) {
  if (action === 'add') {
    balance += Math.round(parseFloat(moneyVal)*100) / 100;
  } else if (action === 'minus') {
    balance -= Math.round(parseFloat(moneyVal)*100) / 100;
  }
}

function optionSubmit() {
  var options = $('#options');
  if (options.val() === 'option1') {
    balanceUpdate('minus', 200);
    eventUpdate.html('<h3>You bought brand new shoes! Spent $200.</h3>');

    shoeCounter++;
    if (shoeCounter === 1) {
      $('#hideShoes').fadeIn(2000);
    } else {
      $('#multipleShoes').html('<h4> X ' + shoeCounter + '</h4>');
    }

  } else if(options.val() === 'option2') { 
    salaryValue = salaryValue * 0.8;
    eventUpdate.html('<h3>You changed jobs! Decrease salary by 20%.</h3>');
    $('#afterSubmit').html('<h3>Your bi-weekly salary is : $' + Math.round(parseFloat(salaryValue)*100) / 100 + '</h3>');
  } else if(options.val() === 'option3') {
    balanceUpdate('minus', 500);
    eventUpdate.html('<h3>You bought a brand new phone! Spent $500</h3>');

    phoneCounter++;
    if (phoneCounter === 1) {
      $('#hidePhone').fadeIn(2000);
    } else {
      $('#multiplePhones').html('<h4> X ' + phoneCounter + '</h4>');
    }
  } else if(options.val() === 'option4') {
    balanceUpdate('add', 1000);
    eventUpdate.html('<h3>You won a lottery! Gained $1000</h3>');
  } else if(options.val() === 'option5') {
    eventUpdate.html('<h3>Nothing happened</h3>');
    //do nothing
  }

  ++i;
  if (i%2 === 0) {
    $('#afterEventSubmit').html('<h4>Event Submitted!</h4>');
  }
  else {
    $('#afterEventSubmit').html('<h4>Submitted Event!</h4>');  
  }
  currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');

  //adding owned item section
  $("#ownedItems").fadeIn(2000);
  //goToByScroll('hideShoes');

}

$('#investmentSubmit').click(function() {
  if (balance < 1000) {
    $('#afterInvestSubmit').html('<h4>Not enough balance!</h4>');
  } else {
    startWeek = weekCounter;
    var investments = $('#investments');
    var investChoice = "";
    var randNum = Math.floor((Math.random() * 100) + 1);
    if (investments.val() === 'invest1') {
      balanceUpdate('minus', 1000);
      investChoice = 'one';
      investSuccess = true;
      investReturn = 1200;
    } else if (investments.val() === 'invest2') {
      balanceUpdate('minus', 1000);
      investChoice = 'two';
      if (randNum <= 80) {
        investSuccess = true;
        investReturn = 1500;
      } else {
        investSuccess = false;
        investReturn = 0;
      }
    } else if (investments.val() === 'invest3') {
      balanceUpdate('minus', 1000);
      investChoice = 'three';
      if (randNum <= 60) {
        investSuccess = true;
        investReturn = 1800;
      } else {
        investSuccess = false;
        investReturn = 0;
      }
    } else if (investments.val() === 'invest4') {
      balanceUpdate('minus', 1000);
      investChoice = 'four';
      if (randNum <= 50) {
        investSuccess = true;
        investReturn = 2000;
      } else {
        investSuccess = false;
        investReturn = 0;
      }
    } else if (investments.val() === 'invest5') {
      balanceUpdate('minus', 1000);
      investChoice = 'five';
      if (randNum <= 30) {
        investSuccess = true;
        investReturn = 2500;
      } else {
        investSuccess = false;
        investReturn = 0;
      }
    }
    investCounter = true;
    investUpdate.html('<h3>You chose investment option ' + investChoice + '! Balance of $1000 deducted, result will show in 10 weeks!');
    investmentButton.disabled = true;
    investmentButton.innerHTML = "Invested!";
    $('#afterInvestSubmit').html('<h4>Submitted!</h4>');
    currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
  }
});

//load the window to the top once refreshed or reset
$(window).on('beforeunload', function(){
  $(window).scrollTop(0);
});

$(document).ready(function(){
  $('.initialHide, #ownedItems, #hideShoes, #hidePhone, #gameover').hide();
  //initialHide.show();
  $('#friends').hide();
  $(window).scroll(function() {
    if (($('body').scrollTop() > 150) || (document.documentElement.scrollTop > 150)) {
      //$("#myBtn1").css("display", "block");
      $('#myBtn1').fadeIn(1000);
    } else {
      //$("#myBtn1").css("display", "none");
      $('#myBtn1').fadeOut(1000);
    };
  });

  $('#myBtn1').on('click', function() {
    $('body').scrollTop('0'); //For Chrome, Safari and Opera
    document.documentElement.scrollTop = 0; // For IE and Firefox
  });

  $("#myBtn2").on('click', function() {
    $('html, body').animate({
      scrollTop: $('#placeholder1').offset().top
    }, 2000);
  });
});

$(function() {
    $('.confirm').click(function(e) {
        e.preventDefault();
        if (window.confirm("Are you sure?")) {
          location.reload();
          $(window).scrollTop(0);
        }
    });
});

var adminMode = false;
var fireworks = false;
var shoeCounter = 0, phoneCounter = 0;
var seconds = 0;
var investmentButton = document.getElementById('investmentSubmit');
var initialHide = $('.initialHide');
var currentBalance = $('#currentBalance');
var foodExpense = $('#foodExpense');
var houseExpense = $('#houseExpense');
var eventUpdate = $('#eventUpdate');
var investUpdate = $('#investmentUpdate');
var houseCounter = false, foodCounter = false, investCounter = false;
var investSuccess = false;
var investReturn = 0;
var t = 0, i = 0;
var regexp = /^\d+\.?\d{0,2}$/;
var foodCost, houseCost = 0;
var balance = 0;
var salaryValue = 0;
var weekCounter = 0;
var deadline = 0;
var startWeek = 0, endWeek=52;