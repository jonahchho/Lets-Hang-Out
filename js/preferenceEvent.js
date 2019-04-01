$( document ).ready(function() {

  if(typeof username === 'undefined') {
    sessionStorage.setItem("isLoggedIn", "false");
  }

  else {

    let isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if(isLoggedIn == "false") {

      $.ajax({
        url: './getUserPreference',
        type: 'get',
        dataType: 'json',
        success: function (data) {
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("distance", data[0].p_distance);
          sessionStorage.setItem("price", data[0].p_price);
          sessionStorage.setItem("rating", data[0].p_rate);


          document.getElementById('distRange').value = sessionStorage.getItem("distance");
          document.getElementById('priceRange').value = sessionStorage.getItem("price");
          document.getElementById('rateRange').value = sessionStorage.getItem("rating");

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log('error', errorThrown);
        }
      });

    }

  }

});

$(document).on('click', '#logout_btn', function(e){
  sessionStorage.setItem("isLoggedIn", "false");
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

  sessionStorage.setItem("distance", document.getElementById('distRange').value);
  sessionStorage.setItem("price", document.getElementById('priceRange').value);
  sessionStorage.setItem("rating", document.getElementById('rateRange').value);

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
