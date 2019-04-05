$( document ).ready(function() {

  if(localStorage.getItem("distance")) {
    document.getElementById('distRange').value = localStorage.getItem("distance");
  }

  if(localStorage.getItem("price")) {
    document.getElementById('priceRange').value = localStorage.getItem("price");
  }

  if(localStorage.getItem("rating")) {
    document.getElementById('rateRange').value = localStorage.getItem("rating");
  }

  if(typeof username === 'undefined') {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("userList", null);
    localStorage.setItem("meetingPoint", null);
  }

  else {

    let isLoggedIn = localStorage.getItem("isLoggedIn");

    if(isLoggedIn == "false") {

      $.ajax({
        url: './getUserPreference',
        type: 'get',
        dataType: 'json',
        success: function (data) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("distance", data[0].p_distance);
          localStorage.setItem("price", data[0].p_price);
          localStorage.setItem("rating", data[0].p_rate);


          document.getElementById('distRange').value = localStorage.getItem("distance");
          document.getElementById('priceRange').value = localStorage.getItem("price");
          document.getElementById('rateRange').value = localStorage.getItem("rating");

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log('error', errorThrown);
        }
      });

    }

    else {
      localStorage.setItem("userList", null);
      localStorage.setItem("meetingPoint", null);
    }

  }

});

$(document).on('click', '#logout_btn', function(e){
  localStorage.setItem("isLoggedIn", "false");
});

$(document).on('click', '#preference_btn', function(e){
  //console.log("Preference");
  $('#body').addClass('preference');
});

$(document).on('click', '#body:not(.no-back) #preference-overlay header div.back', function(e){
  $('#body').removeClass('preference');
});

$(document).on('click', '#preference-overlay header div.done', function(e){
  setPreference();
  $('#body').removeClass('preference');
});

function setPreference() {

  localStorage.setItem("distance", document.getElementById('distRange').value);
  localStorage.setItem("price", document.getElementById('priceRange').value);
  localStorage.setItem("rating", document.getElementById('rateRange').value);

  if(localStorage.getItem("userList") != "null") {
    socket.emit('update userlist', {
      preference: [localStorage.getItem("distance"), localStorage.getItem("price"), localStorage.getItem("rating")]
    });
  }

  $.ajax({
      type:'PUT',
      url: '/updateUserPreference',
      data: {username: username,
             p_distance: document.getElementById('distRange').value,
             p_price: document.getElementById('priceRange').value,
             p_rate: document.getElementById('rateRange').value}
    }).done(function(response){
      console.log(response);
    }).fail(function(response){
      console.log("Oops not working");
    });

}
