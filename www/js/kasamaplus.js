// var phpurl = "http://localhost/android/";
// var phpurl = "http://192.168.1.42/android/";
// var phpurl = "http://107.167.180.129/android/";

function login()
{
  var database_name = "kasamapl_" + $('#database_name').val();
  var nickname      = $('#database_name').val();
  var username      = $("#login_name"   ).val();
  var password      = $("#password"     ).val();
  var logindata     = {database_name  : database_name ,
                       username       : username      ,
                       password       : password      };
  $.ajax
  ({
    url      :  phpurl+'checkdatabase.php',
    data     :  { database_name : database_name },
    type     : 'GET'         ,
    dataType : 'jsonp'       ,
    jsonp    : 'jsoncallback',
    timeout  : 5000          ,
    success  : function(data, status)
    {
      if ( data.length != 0 )
      {
        if ( data[0].projectname == database_name )
        {
          $.ajax
          ({
            url      : phpurl+'login.php',
            data     :  logindata    ,
            type     : 'GET'         ,
            dataType : 'jsonp'       ,
            jsonp    : 'jsoncallback',
            timeout  : 5000          ,
            success  : function(data, status)
            {
              if ( data.length != 0 )
              {
                if ( ( data[0].username == username )
                  && ( data[1].password == "OK"     ) )
                {
                  var lastsuccesslogin  ;
                  var lastunsuccesslogin;
                  $(".nickname").text( nickname );
                  $(".loginame").text( username );
                  lastsuccesslogin   = "<font color=green><b>สามารถเข้าสู่ระบบได้ครั้งล่าสุด &nbsp; &nbsp; : </b>" + data[2].lastsuccesslogin   + "</font>";
                  lastunsuccesslogin = "<font color=red  ><b>ไม่สามารถเข้าสู่ระบบได้ครั้งล่าสุด : </b>" + data[3].lastunsuccesslogin + "</font>";
                  $("#lastsuccesslogin"  ).html( lastsuccesslogin   );
                  $("#lastunsuccesslogin").html( lastunsuccesslogin );
                  localStorage["username"         ] = username;
                  localStorage["database_fullname"] = database_name;
                  localStorage["database_nickname"] = $('#database_name').val();
                  localStorage["sale_state"       ] = 0;
                  localStorage["redeem_state"     ] = 0;
                  window.location.href = 'home.html';
                }
              }
            },
            error: function()
            {
              alert('ชื่อฐานข้อมูลไม่ถูกต้อง');
              window.location.href = 'index.html';
            }
          });
        }
      }
      else
      {
        alert('ชื่อฐานข้อมูลไม่ถูกต้อง');
        window.location.href = '#page_login';
      }
    },
    error: function()
    {
      alert('ติดต่อฐานข้อมูลไม่ได้');
      window.location.href = '#page_login';
    }
  });
}

function username_and_databasenickname()
{
  $(".nickname").html( localStorage["database_nickname"] );
  $(".loginame").html( localStorage["username"         ] );
}

function check_status_card_in_database()
{
  // alert( localStorage["database_fullname"] );
  // alert(0x7.toString(16));
  username_and_databasenickname();

  var jdata = { database : localStorage["database_fullname"] };
  $.ajax
  (
    {
      url      : phpurl+'check_status_card_in_database.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 5000          ,
      success  : function(data, status)
      {
        var lastsuccesslogin  ;
        var lastunsuccesslogin;
        var usercardcount     ;
        var admincardcount    ;
        var resetcardcount    ;
        var emptycardcount    ;
        var sumarycardcount   ;
        var meterstockcount   ;
        var meterinusecount   ;
        var meterstopcount    ;
        var sumarymetercount  ;

        $.each( data, function(i,item)
        {
          $.each(item, function(attr, value)
          {
            switch (attr)
            {
              case "lastsuccesslogin"  : lastsuccesslogin   = value; break;
              case "lastunsuccesslogin": lastunsuccesslogin = value; break;
              case "admincardcount"    : admincardcount     = value; break;
              case "usercardcount"     : usercardcount      = value; break;
              case "admincardcount"    : admincardcount     = value; break;
              case "resetcardcount"    : resetcardcount     = value; break;
              case "emptycardcount"    : emptycardcount     = value; break;
              case "meterstockcount"   : meterstockcount    = value; break;
              case "meterinusecount"   : meterinusecount    = value; break;
              case "meterstopcount"    : meterstopcount     = value; break;
            }
          });
        });
        sumarycardcount   = parseInt(usercardcount  ) + parseInt( admincardcount ) + parseInt( resetcardcount) + parseInt( emptycardcount);
        sumarymetercount  = parseInt(meterstockcount) + parseInt( meterinusecount) + parseInt( meterstopcount);
        $("#lastsuccesslogin"  ).html( lastsuccesslogin  );
        $("#lastunsuccesslogin").html( lastunsuccesslogin);
        $("#usercardcount"     ).html( usercardcount     );
        $("#admincardcount"    ).html( admincardcount    );
        $("#resetcardcount"    ).html( resetcardcount    );
        $("#emptycardcount"    ).html( emptycardcount    );
        $("#sumarycardcount"   ).html( sumarycardcount   );
        $("#meterstockcount"   ).html( meterstockcount   );
        $("#meterinusecount"   ).html( meterinusecount   );
        $("#meterstopcount"    ).html( meterstopcount    );
        $("#sumarymetercount"  ).html( sumarymetercount  );
      },
      error : function()
      {
      }
    }
  );
}

function sale_load_1()
{
  $(".nickname").html( localStorage["username"         ] );
  $(".loginame").html( localStorage["database_nickname"] );
}

$(document).on('pageshow', '#page_home' ,   function() { check_status_card_in_database(); });
$(document).on('pageshow', '#page_other',   function() { username_and_databasenickname(); });
$(document).on('pageshow', '#page_comport', function() { username_and_databasenickname(); });
