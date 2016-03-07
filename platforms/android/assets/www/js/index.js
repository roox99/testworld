/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },

  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.receivedEvent('deviceready'); // from example
  },

  // Update DOM on a Received Event
  receivedEvent: function(id) {
    // var parentElement    = document.getElementById(id);
    // var listeningElement = parentElement.querySelector('.listening');
    // var receivedElement  = parentElement.querySelector('.received' );
    // listeningElement.setAttribute('style', 'display:none;' );
    // receivedElement.setAttribute ('style', 'display:block;');
    // console.log('Received Event: ' + id);
    //if ( id == 'deviceready' )
    //{
      // alert( "deviceready" );
    //}
  }
};

app.initialize();

//var phpurl = "http://localhost/android/";
//var phpurl = "http://192.168.1.44/android/";
  var phpurl = "http://107.167.180.129/android/";
//var phpurl = "http://169.254.122.57/android/";
//var page            ;
//var card_type_value ;
//var process_fill    ;
var process_read                 ;
var recv_state                   ;
var addr_state                   ;
var smc_buffer_size              ;
var smc_buffer      = new Array();
var serial_begin    = 0          ;
var serial_run      = 0          ;
var serial_end      = 0          ;
var PSC1;
var PSC2;

  $(document).on('pageshow', '#page_home' , function() { check_status_card_in_database(); });
  $(document).on('pageshow', '#page_other', function() { username_and_databasenickname(); });
  $(document).on('pageshow', '#page_sale2', function() { confirm_sale_read() ;            });
  $(document).on('pageshow', '#page_sale3', function() { confirm_sale_write();            });

function login() {
  var database_name = "kasamapl_" + $('#database_name').val();
  var nickname      = $('#database_name').val();
  var username      = $("#login_name"   ).val();
  var password      = $("#password"     ).val();
  var logindata     = { database_name : database_name ,
                        username      : username      ,
                        password      : password      };
  $.ajax ({
    url      :  phpurl+'checkdatabase.php',
    data     :  { database_name : database_name },
    type     : 'GET'         ,
    dataType : 'jsonp'       ,
    jsonp    : 'jsoncallback',
    timeout  : 5000          ,
    success  : function(data, status) {
      if ( data.length != 0 ) {
        if ( data[0].projectname == database_name ) {
          $.ajax ({
            url      : phpurl+'login.php',
            data     :  logindata    ,
            type     : 'GET'         ,
            dataType : 'jsonp'       ,
            jsonp    : 'jsoncallback',
            timeout  : 5000          ,
            success  : function(data, status) {
              if ( data.length != 0 ) {
                if ( ( data[0].username == username )
                  && ( data[1].password == "OK"     ) ) {
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
            error: function() {
              alert('ชื่อฐานข้อมูลไม่ถูกต้อง');
              window.location.href = 'index.html';
            }
          });
        }
      }
      else {
        alert('ชื่อฐานข้อมูลไม่ถูกต้อง');
        window.location.href = '#page_login';
      }
    },
    error: function() {
      alert('ติดต่อฐานข้อมูลไม่ได้');
      window.location.href = '#page_login';
    }
  });
}

function username_and_databasenickname() {
  $(".nickname").html( localStorage["database_nickname"] );
  $(".loginame").html( localStorage["username"         ] );
}

//$(document).on( "change","#unit_sale_new", function(event, ui) {
//  unit_sale_new = $(this).val();
//});

//$(document).on( "change","#warning_unit", function(event, ui) {
//  smc_val.warning_unit = $(this).val();
//});

//$(document).on( "change","#emer_unit", function(event, ui) {
//  smc_val.emer_unit = $(this).val();
//});

//$(document).on( "change","#buzz_silent", function(event, ui) {
//  smc_val.meter_ctrl =  parseInt($('select[name="buzz_silent"]').val())
//                      | parseInt($('select[name="unit_update"]').val()) ;
//});

//$(document).on( "change","#unit_update", function(event, ui) {
//  smc_val.meter_ctrl =  parseInt($('select[name="buzz_silent"]').val())
//                      | parseInt($('select[name="unit_update"]').val()) ;
//});

function sale_step1_to_step2_function() {
  $("#li_warn_message"  ).css("display", "none");
  $("#div_warn_message" ).css("display", "none");
  $("#div_warn_message" ).html("");
  $('#div_btn_step2_nok').css('display', 'none' );
  $('#div_btn_step2_ok' ).css('display', 'block');

  insert_log_card_sale_read();
  $("#div_card_id"      ).html( $("#card_id"      ).val() );
  $("#div_area_name"    ).html( $("#area_name"    ).val() );
  $("#div_customer_name").html( $("#customer_name").val() );
  $("#div_business_name").html( $("#business_name").val() );
  $("#div_serial_no"    ).html( $("#serial_no"    ).val() );

  $("#div_price_id"     ).html( smc_val.price_id  );
  if ( $("#price_per_unit_new").val() == "NONE" ) {
    $("#li_warn_message"  ).css( "display", "block");
    $("#div_warn_message" ).css( "display", "block");
    $("#div_warn_message" ).html( $("#div_warn_message" ).html()
    + "<font color='red'>ไม่สามารถรับอัตราค่าไฟฟ้าจาก server !</font><br/>" );
    $('#div_btn_step2_nok').css('display', 'block');
    $('#div_btn_step2_ok' ).css('display', 'none' );
  }
  else {
    $("#div_price_per_unit").html( $("#price_per_unit_new").val() );
  }
  $("#div_buy_no" ).html( parseInt( parseInt( $("#buy_num" ).val() ) + 1) );
  $("#buy_num_new").val(  parseInt( parseInt( $("#buy_num" ).val() ) + 1) );
  smc_val.buy_num_hi = ( parseInt( $("#div_buy_no").html() ) >>  8 ) & 0xFF;
  smc_val.buy_num_lo =   parseInt( $("#div_buy_no").html() )         & 0xFF;
  $("#unit_sale_sum").val(  parseInt( parseInt( $("#unit_sale"    ).val() )
                                    + parseInt( $("#unit_sale_new").val() ) ) );
  smc_val.unit_sale_hi = ( parseInt( $("#unit_sale_sum").val() ) >>  8 ) & 0xFF;
  smc_val.unit_sale_lo =   parseInt( $("#unit_sale_sum").val() )         & 0xFF;
  if ( parseInt( $("#unit_sale").val() ) != 0 )
  {
    $("#li_warn_message"  ).css( "display", "block");
    $("#div_warn_message" ).css( "display", "block");
    $("#div_warn_message" ).html( $("#div_warn_message" ).html()
    + "<font color='red'>การซื้อครั้งที่แล้วยังไม่ได้เสียบการ์ดเพือเติมเงิน</font><br/>" );
  }
  $("#div_unit_sale_new" ).html( $("#unit_sale_new").val() );
  $("#div_unit_sale_sum" ).html( $("#unit_sale_sum").val() );

  switch ( $("#warnmethod").val() ) {
    case "warnmethodunit":
      if ( $("#warnmethodunit").val() != "NONE" ) {
        $("#warning_unit_new").val( $("#warnmethodunit").val() );
        $("#div_warning_unit").html( $("#warning_unit_new").val() );
        smc_val.warning_unit = parseInt( $("#warning_unit_new").val() );
      }
      else {
        smc_val.warning_unit = 0;
        $("#warning_unit_new").val( 0 );
        $("#div_warning_unit").html( 0 );
      }
    break;
    case "warnmethodpercent":
      if ( $("#warnmethodpercent").val() != "NONE" ) {
        $("#warning_unit_new").val( parseInt( $("#warnmethodpercent").val() ) * parseInt( $("#unit_sale_new").val() ) / parseInt( 100.00 ) );
        if ( parseInt( $("#warning_unit_new").val() ) > 255 ) {
          $("#warning_unit_new").val( 255 );
        }
        $("#div_warning_unit").html( $("#warning_unit_new").val() );
        smc_val.warning_unit = parseInt( $("#warning_unit_new").val() );
      }
      else {
        smc_val.warning_unit = 0;
        $("#warning_unit_new").val( 0 );
        $("#div_warning_unit").html( 0 );
      }
    break;
    default:
      $("#li_warn_message"  ).css( "display", "block");
      $("#div_warn_message" ).css( "display", "block");
      $("#div_warn_message" ).html( $("#div_warn_message" ).html()
      + "<font color='red'>ไม่สามารถรับหน่วยไฟเตือนจาก server !</font><br/>" );
      $('#div_btn_step2_nok').css('display', 'block');
      $('#div_btn_step2_ok' ).css('display', 'none' );
    break;
  }

  switch ( $("#gracemethod").val() ) {
    case "gracemethodunit":
    if ( $("#gracemethodunit").val() != "NONE" ) {
      $("#emer_unit_new").val( $("#gracemethodunit").val() );
      $("#div_emer_unit").html( $("#emer_unit_new").val() );
      smc_val.emer_unit = parseInt( $("#emer_unit_new").val() );
    }
    else {
      smc_val.emer_unit = 0;
      $("#emer_unit_new").val( 0 );
      $("#div_emer_unit").html( 0 );
    }
    break;
    case "gracemethodpercent":
      if ( $("#gracemethodpercent").val() != "NONE" ) {
        $("#emer_unit_new").val( parseInt( $("#gracemethodpercent").val() ) * parseInt( $("#unit_sale_new").val() ) / parseInt( 100.00 ) );
        if ( parseInt( $("#emer_unit_new").val() ) > 255 ) {
          $("#emer_unit_new").val( 255 );
        }
        $("#div_emer_unit").html( $("#emer_unit_new").val() );
        smc_val.emer_unit = parseInt( $("#emer_unit_new").val() );
      }
      else {
        smc_val.emer_unit = 0;
        $("#emer_unit_new").val( 0 );
        $("#div_emer_unit").html( 0 );
      }
    break;
    default:
      $("#li_warn_message"  ).css( "display", "block");
      $("#div_warn_message" ).css( "display", "block");
      $("#div_warn_message" ).html( $("#div_warn_message" ).html()
      + "<font color='red'>ไม่สามารถรับหน่วยไฟฉุกเฉินจาก server !</font><br/>" );
      $('#div_btn_step2_nok').css('display', 'block');
      $('#div_btn_step2_ok' ).css('display', 'none' );
    break;
  }

  check_saleid_in_database();

  if ( $("#percentVAT").val() == "NONE" ) {
    alert( "ไม่มีข้อมูลค่าภาษีใน server !" );
    $("#li_warn_message"  ).css( "display", "block");
    $("#div_warn_message" ).css( "display", "block");
    $("#div_warn_message" ).html( $("#div_warn_message" ).html()
    + "<font color='red'>ไม่มีข้อมูลค่าภาษีจาก server !</font><br/>" );
    $('#div_btn_step2_nok').css('display', 'block');
    $('#div_btn_step2_ok' ).css('display', 'none' );
  }
  else {
    switch ( $("#methodVAT").val() )
    {
      case "No VAT":
        $("#price_exclude_tax").val( parseFloat( parseFloat( $("#unit_sale_new"    ).val() ) * parseFloat( $("#price_per_unit_new").val() ) ).toFixed(2) );
        $("#price_tax"        ).val(0.00);
        $("#price_include_tax").val( parseFloat( $("#price_exclude_tax").val() ).toFixed(2) );
      break;
      case "Including VAT":
        // alert( parseFloat( $("#unit_sale_new"     ).val()  ) ); // OK
        // alert( parseFloat( $("#div_price_per_unit").html() ) ); // OK
        // alert( parseFloat( $("#price_per_unit_new").val()  ) ); // OK
        $("#price_include_tax").val( parseFloat( parseFloat( $("#unit_sale_new"    ).val() ) * parseFloat( $("#price_per_unit_new").val() ) ).toFixed(2) );
        $("#price_exclude_tax").val( parseFloat( parseFloat( $("#price_include_tax").val() ) * ( parseFloat(1.00) - ( parseFloat( $("#percentVAT").val() ) / parseFloat(100.00) ) ) ).toFixed(2) );
        $("#price_tax"        ).val( parseFloat( parseFloat( $("#price_include_tax").val() ) - parseFloat( $("#price_exclude_tax").val() ) ).toFixed(2) );
      break;
      case "Excluding VAT":
        $("#price_exclude_tax").val( parseFloat( parseFloat( $("#unit_sale_new"    ).val() ) * parseFloat( $("#price_per_unit_new").val() ) ).toFixed(2) );
        $("#price_tax"        ).val( parseFloat( parseFloat( $("#price_exclude_tax").val() ) * parseFloat( $("#percentVAT"        ).val() / parseFloat( 100. ) ) ).toFixed(2) );
        $("#price_include_tax").val( parseFloat( parseFloat( $("#price_exclude_tax").val() ) + parseFloat( $("#price_tax"         ).val() ) ).toFixed(2) );
      break;
      default:
        alert( "ไม่มีข้อมูลวิธีคิดภาษีใน server !" );
        $("#li_warn_message"  ).css( "display", "block");
        $("#div_warn_message" ).css( "display", "block");
        $("#div_warn_message" ).html( $("#div_warn_message" ).html()
        + "<font color='red'>ไม่มีข้อมูลวิธีคิดภาษีจาก server !</font><br/>" );
        $('#div_btn_step2_nok').css('display', 'block');
        $('#div_btn_step2_ok' ).css('display', 'none' );
      break;
    }
  }
  $("#div_price_exclude_tax").html( $("#price_exclude_tax").val() );
  $("#div_tax"              ).html( $("#price_tax"        ).val() );
  $("#div_price_include_tax").html( $("#price_include_tax").val() );

  $('#STEP1').css('display', 'none');
  $('#STEP2').css('display', 'block');
}

function sale_step2_to_step1_function() {
  clearmsg_function();
  $('#STEP2').css('display', 'none' );
  $('#STEP1').css('display', 'block');
}

function sale_step2_to_step3_function() {
  $("#li_warn_finish"   ).css("display", "none");
  $("#div_warn_finish"  ).css("display", "none");
  $("#div_warn_finish"  ).html("");
  $('#div_btn_step3_nok').css('display', 'none' );
  $('#div_btn_step3_ok' ).css('display', 'block');

  insert_log_card_sale_write();
  insert_log_sale();
  fillunit_function();

  $('#STEP2').css('display', 'none' );
  $('#STEP3').css('display', 'block');
}

function sale_step3_to_step1_function() {
  clearmsg_function();
  $('#STEP3').css('display', 'none' );
  $('#STEP1').css('display', 'block');
}

function insert_log_card_sale_read() {
  var jdata = {
    database       : localStorage["database_fullname"],
    cardid         : $('#card_id'       ).val(),
    areaid         : $('#area_id'       ).val(),
    businessid     : $('#business_id'   ).val(),
    customerid     : $('#customer_id'   ).val(),
    startunit      : $('#start_unit'    ).val(),
    unitprice      : $('#price_per_unit').val(),
    saleunit       : $('#unit_sale'     ).val(),
    buyno          : $('#buy_num'       ).val(),
    warnunit       : smc_val.warning_unit,
    emergunit      : smc_val.emer_unit   ,
    saledate       : $('#sale_date_time'  ).val(),
    createdate     : $('#create_date_time').val(),
    meterunitadd   : $('#unit_add'        ).val(),
    meterunituse   : $('#used_unit'       ).val(),
    meterunitremain: $('#remain_unit'     ).val(),
    serialno       : $('#serial_no'       ).val(),
    meterstatus    : smc_val.meter_status,
    cardtype       : smc_val.card_type   ,
    remakecard     : smc_val.card_remake ,
    priceid        : smc_val.price_id    ,
    transaction    :"Sale (Read)",
    iswrite        : 0,
    username       : localStorage["username"]
  };
  $.ajax ({
      url      : phpurl+'log_card_read.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 5000          ,
      success  : function(data, status) {
        //$.each( data, function(i,item) {
        //  $.each(item, function(attr, value) {
        //    switch (attr) {
        //      case "result" : step = true; break;
        //    }
        //  });
        //});
      },
      error : function() {
        alert( "ไม่สามารถบันทึกข้อมูลไปที่ server !" );
        $("#li_warn_message"  ).css( "display", "block");
        $("#div_warn_message" ).css( "display", "block");
        $("#div_warn_message" ).html( $("#div_warn_message" ).html()
        + "<font color='red'>ไม่สามารถบันทึกข้อมูลไปที่ server !</font><br/>" );
        $('#div_btn_step2_nok').css('display', 'block');
        $('#div_btn_step2_ok' ).css('display', 'none' );
      }
    }
  );
}

function insert_log_card_sale_write() {
  var now   = new Date();
  var year  = parseInt( now.getFullYear() ) ;
  smc_val.sale_date_year  = parseInt( now.getFullYear() ) % 100 ;
  smc_val.sale_date_month = parseInt( now.getMonth()    ) + 1   ;
  smc_val.sale_date_day   = parseInt( now.getDate()     ) ;
  smc_val.sale_date_hour  = parseInt( now.getHours()    ) ;
  smc_val.sale_date_min   = parseInt( now.getMinutes()  ) ;
  smc_val.sale_date_sec   = parseInt( now.getSeconds()  ) ;

  $('#sale_date_time').val( year.toString() +'/'+
                            (((smc_val.sale_date_month  >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_month.toString()+'/'+
                            (((smc_val.sale_date_day    >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_day.toString()  +' '+
                            (((smc_val.sale_date_hour   >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_hour.toString() +':'+
                            (((smc_val.sale_date_min    >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_min.toString()  +':'+
                            (((smc_val.sale_date_sec    >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_sec.toString()      );

  var jdata = {
    database       : localStorage["database_fullname"],
    cardid         : $('#card_id'       ).val(),
    areaid         : $('#area_id'       ).val(),
    businessid     : $('#business_id'   ).val(),
    customerid     : $('#customer_id'   ).val(),
    startunit      : $('#start_unit'        ).val(),
    unitprice      : $('#price_per_unit_new').val(),
    saleunit       : $('#unit_sale_sum'     ).val(),
    buyno          : $('#buy_num_new'       ).val(),
    warnunit       : smc_val.warning_unit,
    emergunit      : smc_val.emer_unit   ,
    saledate       : $('#sale_date_time'  ).val(),
    createdate     : $('#create_date_time').val(),
    meterunitadd   : $('#unit_add'        ).val(),
    meterunituse   : $('#used_unit'       ).val(),
    meterunitremain: $('#remain_unit'     ).val(),
    serialno       : $('#serial_no'       ).val(),
    meterstatus    : smc_val.meter_status,
    cardtype       : smc_val.card_type   ,
    remakecard     : smc_val.card_remake ,
    priceid        : smc_val.price_id    ,
    transaction    :"Sale (Write)",
    iswrite        : 1,
    username       : localStorage["username"]
  };
  $.ajax ({
      url      : phpurl+'log_card_sale_write.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 5000          ,
      success  : function(data, status) {
        //$.each( data, function(i,item) {
        //  $.each(item, function(attr, value) {
        //    switch (attr) {
        //      case "result" : step = true; break;
        //    }
        //  });
        //});
      },
      error : function() {
        alert( "ไม่สามารถบันทึกข้อมูลไปที่ server !" );
        $("#li_warn_finish"  ).css( "display", "block");
        $("#div_warn_finish" ).css( "display", "block");
        $("#div_warn_finish" ).html( $("#div_warn_finish" ).html()
        + "<font color='red'>ไม่สามารถบันทึกข้อมูลไปที่ server !</font><br/>" );
        $('#div_btn_step3_nok').css('display', 'block');
        $('#div_btn_step3_ok' ).css('display', 'none' );
      }
    }
  );
}

function insert_log_sale() {
  var now   = new Date();
  var year  = parseInt( now.getFullYear() ) ;

  $('#sale_date').val( year.toString() +
  ( ( ( smc_val.sale_date_month >>> 0 ) & 0xFF ) < 0xA ? '0' : '' ) +
        smc_val.sale_date_month.toString() +
  ( ( ( smc_val.sale_date_day   >>> 0 ) & 0xFF ) < 0xA ? '0' : '' ) +
        smc_val.sale_date_day.toString() );

  var jdata = {
    database       : localStorage["database_fullname"],
    saledate       : $('#sale_date'         ).val(),
    areaid         : $('#area_id'           ).val(),
    businessid     : $('#business_id'       ).val(),
    customerid     : $('#customer_id'       ).val(),
    unitprice      : $('#price_per_unit_new').val(),
    saleunit       : $('#unit_sale_sum'     ).val(),
    buyno          : $('#buy_num_new'       ).val(),
    metersn        : $('#serial_no'         ).val(),
    warnunit       : smc_val.warning_unit,
    emergunit      : smc_val.emer_unit   ,
    username       : localStorage["username"]
  };
  $.ajax ({
      url      : phpurl+'log_sale.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 5000          ,
      success  : function(data, status) {
        //$.each( data, function(i,item) {
        //  $.each(item, function(attr, value) {
        //    switch (attr) {
        //      case "result" : step = true; break;
        //    }
        //  });
        //});
      },
      error : function() {
        alert( "ไม่สามารถบันทึกข้อมูลไปที่ server !" );
        $("#li_warn_finish"  ).css( "display", "block");
        $("#div_warn_finish" ).css( "display", "block");
        $("#div_warn_finish" ).html( $("#div_warn_finish" ).html()
        + "<font color='red'>ไม่สามารถบันทึกข้อมูลไปที่ server !</font><br/>" );
        $('#div_btn_step3_nok').css('display', 'block');
        $('#div_btn_step3_ok' ).css('display', 'none' );
      }
    }
  );
}

function check_status_card_in_database() {
  // alert( localStorage["database_fullname"] );
  // alert(0x7.toString(16));
  username_and_databasenickname();

  var jdata = { database : localStorage["database_fullname"] };
  $.ajax ({
      url      : phpurl+'check_status_card_in_database.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 5000          ,
      success  : function(data, status) {
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

        $.each( data, function(i,item) {
          $.each(item, function(attr, value) {
            switch (attr) {
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
      error : function() {
        alert('check_status_card_in_database ติดต่อฐานข้อมูลไม่ได้');
      }
    }
  );
}

function check_cardid_in_database() {
  var jdata = { database : localStorage["database_fullname"],
                cardid   : $("#card_id").val()             };
  $.ajax ({
      url      : phpurl+'cardid.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 5000          ,
      success  : function(data, status) {
        var cardtype  ;
        var cardstatus;
        $.each( data, function(i,item) {
          $.each(item, function(attr, value) {
            switch (attr) {
              case "cardtype" : cardtype   = value.replace(' ', ''); break;
              case "status"   : cardstatus = value.replace(' ', ''); break;
            }
          });
        });
        if ( cardtype == "User"   ) {
          if ( cardstatus == "Active" ) {}
          else {
            $('#card_id').val("การ์ดยังไม่เริ่มใช้งาน");
          }
        }
        else if ( ( cardtype == "Reset" )
               || ( cardtype == "Empty" ) ) {
          $('#card_id').val("ไม่ใช่การ์ดสำหรับผู้ใช้");
        }
        else {
          $('#card_id').val("ไม่พบการ์ดนี้ในระบบ");
        }
      },
      error : function() {
        $('#card_id').val('ติดต่อฐานข้อมูลไม่ได้');
      }
    }
  );
}

function check_areaid_in_database() {
  var jdata = { database : localStorage["database_fullname"],
                areaid   : $("#area_id").val()             };
  $.ajax ({
      url      : phpurl+'areaid.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 10000          ,
      success  : function(data, status) {
        $.each( data, function(i,item) {
          $.each(item, function(attr, value) {
            switch (attr) {
              case "areaname"  :
                if (value == null) {
                  $("#area_name").val("ไม่พบในฐานข้อมูล");
                }
                else {
                  $("#area_name").val(value);
                }
              break;
            }
          });
        });
      },
      error : function() {
        $("#area_name").val('ติดต่อฐานข้อมูลไม่ได้');
      }
    }
  );
}

function check_businessid_in_database() {
  var jdata = { database   : localStorage["database_fullname"],
                businessid : $("#business_id").val()         };
  $.ajax ({
      url      : phpurl+'businessid.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 10000          ,
      success  : function(data, status) {
        $.each( data, function(i,item) {
          $.each(item, function(attr, value) {
            switch (attr) {
              case "businessname" :
                if (value == null) {
                  $("#business_name").val("ไม่พบในฐานข้อมูล");
                }
                else {
                  $("#business_name").val(value);
                }
              break;
            }
          });
        });
      },
      error : function() {
        $("#business_name").val('ติดต่อฐานข้อมูลไม่ได้');
      }
    }
  );
}

function check_priceid_in_database() {
  var jdata = { database : localStorage["database_fullname"],
                priceid  : smc_val.price_id                };
  $.ajax ({
    url      : phpurl+'priceid.php',
    data     :  jdata        ,
    type     : 'GET'         ,
    dataType : 'jsonp'       ,
    jsonp    : 'jsoncallback',
    timeout  : 5000          ,
    success  : function(data, status) {
      // alert( status );
      $.each( data, function(i,item) {
        $.each(item, function(attr, value) {
          switch (attr) {
            case "price_per_unit" :
              if (value == null) {
                $("#price_per_unit_new").val("NONE");
              }
              else {
                $("#price_per_unit_new").val(value);
                smc_val.price_unit_hi = (parseInt( value ) >> 8 ) & 0xFF;
                smc_val.price_unit_lo =  parseInt( value )        & 0xFF;
              }
            break;
          }
        });
      });
    },
    error : function() {
      alert( "ไม่สามารถรับอัตราค่าไฟฟ้าจาก server !" );
      $("#price_per_unit_new").val("NONE");
    }
  });
}

function check_warn_in_database() {
  var warn_unit        ;
  var warnmethod       ;
  var warnmethodunit   ;
  var warnmethodpercent;
  var jdata = { database : localStorage["database_fullname"] };
  $("#warnmethodpercent").val("NONE");
  $("#warnmethodunit"   ).val("NONE");
  $.ajax ({
    url      : phpurl+'warning.php',
    data     :  jdata        ,
    type     : 'GET'         ,
    dataType : 'jsonp'       ,
    jsonp    : 'jsoncallback',
    timeout  : 5000          ,
    success  : function(data, status) {
      $.each( data, function(i,item) {
        $.each(item, function(attr, value) {
          switch (attr) {
            case "warnmethod"        : $("#warnmethod"       ).val(value); break;
            case "warnmethodunit"    : $("#warnmethodunit"   ).val(value); break;
            case "warnmethodpercent" : $("#warnmethodpercent").val(value); break;
          }
        });
      });
      //if ( warnmethod == "warnmethodunit" ) {
      //  warn_unit = parseInt( warnmethodunit );
      //}
      //else if ( warnmethod == "warnmethodpercent" ) {
      //  warn_unit  = parseInt( warnmethodpercent         );
      //  warn_unit *= parseInt( $("#unit_sale_new").val() );
      //  warn_unit /= parseInt( 100 );
      //}
      //else {
      //  $("#warning_unit_new").val( "NONE" );
      //}
      //if ( $("#warning_unit_new").val() != "NONE" ) {
      //  if ( warn_unit > 255 )
      //  { warn_unit = 255; }
      //  smc_val.warning_unit = warn_unit;
      //  $("#warning_unit_new").val( warn_unit );
      //}
      //else {
      //  smc_val.warning_unit = 0;
      //  $("#warning_unit_new").val( 0 );
      //}
    },
    error : function() {
      alert( "ไม่สามารถรับหน่วยไฟเตือนจาก server !" );
      $("#warning_unit_new").val( "NONE" );
    }
  });
}

function check_emer_in_database() {
  var emer_unit         ;
  var gracemethod       ;
  var gracemethodunit   ;
  var gracemethodpercent;
  var jdata = { database : localStorage["database_fullname"] };
  $("#gracemethodpercent").val("NONE");
  $("#gracemethodunit"   ).val("NONE");
  $.ajax ({
    url      : phpurl+'emergency.php',
    data     :  jdata        ,
    type     : 'GET'         ,
    dataType : 'jsonp'       ,
    jsonp    : 'jsoncallback',
    timeout  : 5000          ,
    success  : function(data, status) {
      $.each( data, function(i,item) {
        $.each(item, function(attr, value) {
          switch (attr) {
            case "gracemethod"        : $("#gracemethod"       ).val(value); break;
            case "gracemethodunit"    : $("#gracemethodunit"   ).val(value); break;
            case "gracemethodpercent" : $("#gracemethodpercent").val(value); break;
          }
        });
      });
      //if (gracemethod == "gracemethodunit") {
      //  emer_unit = parseInt( gracemethodunit );
      //}
      //else if (gracemethod == "gracemethodpercent") {
      //  emer_unit  = parseInt( gracemethodpercent        );
      //  emer_unit *= parseInt( $("#unit_sale_new").val() );
      //  emer_unit /= parseInt( 100 );
      //}
      //else {
      //  $("#emer_unit_new").val( "NONE" );
      //}
      //if ( $("#emer_unit_new").val() != "NONE" ) {
      //  if ( emer_unit > 255 )
      //  { emer_unit = 255; }
      //  smc_val.emer_unit = emer_unit;
      //  $("#emer_unit_new").val( emer_unit );
      //}
      //else {
      //  $("#emer_unit_new").val( 0 );
      //  smc_val.emer_unit = 0;
      //}
    },
    error : function() {
      alert( "ไม่สามารถรับหน่วยไฟฉุกเฉินจาก server !" );
      $("#emer_unit_new").val( "NONE" );
    }
  });
}

function check_saleid_in_database() {
  var code  ;
  var now   = new Date();
  var year  = parseInt( now.getFullYear() ) ;
  var month = parseInt( now.getMonth() ) + 1;
  var date  = parseInt( now.getDate()     ) ;
  month = parseInt(month) < 10 ? '0'+month : month;
  date  = parseInt(date ) < 10 ? '0'+date  : date ;
  var jdata = { database : localStorage["database_fullname"],
                year     : year ,
                month    : month,
                date     : date};
  // alert( year  );
  // alert( month );
  // alert( date  );
  $.ajax ({
    url      : phpurl+'saleid.php',
    data     :  jdata        ,
    type     : 'GET'         ,
    dataType : 'jsonp'       ,
    jsonp    : 'jsoncallback',
    timeout  : 5000          ,
    success  : function(data, status) {
      $.each( data, function(i,item) {
        $.each(item, function(attr, value) {
          switch (attr) {
            case "saleid" :
              $("#div_code_sale").html(value);
              $("#code_sale").val(value);
            break;
          }
        });
      });
    },
    error : function() {
      alert( "ไม่สามารถรับรหัสการขายจาก server !" );
      $("#li_warn_message"  ).css( "display", "block");
      $("#div_warn_message" ).css( "display", "block");
      $("#div_warn_message" ).html( $("#div_warn_message" ).html()
      + "<font color='red'>ไม่สามารถรับรหัสการขายจาก server !</font><br/>" );
      $('#div_btn_step2_nok').css('display', 'block');
      $('#div_btn_step2_ok' ).css('display', 'none' );
    }
  });
}

function check_customerid_in_database() {
  var jdata = { database   : localStorage["database_fullname"],
                customerid : $("#customer_id").val()         };
  var customer_first_name  ;
  var customer_last_name   ;
  $.ajax ({
      url      : phpurl+'customerid.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 10000          ,
      success  : function(data, status) {
        $.each( data, function(i,item) {
          $.each(item, function(attr, value) {
            switch (attr) {
              case "firstname" : customer_first_name = value; break;
              case "lastname"  : customer_last_name  = value; break;
            }
          });
        });
        if ( customer_first_name == null ) {
          $("#customer_name").val("ไม่พบในฐานข้อมูล");
        }
        else {
          $("#customer_name").val(customer_first_name + ' ' + customer_last_name);
        }
      },
      error : function() {
        alert('customer id ติดต่อฐานข้อมูลไม่ได้');
      }
    }
  );
}

function check_billsetting_in_database() {
  var jdata = { database : localStorage["database_fullname"]};
  $.ajax ({
      url      : phpurl+'billsetting.php',
      data     :  jdata        ,
      type     : 'GET'         ,
      dataType : 'jsonp'       ,
      jsonp    : 'jsoncallback',
      timeout  : 10000          ,
      success  : function(data, status) {
        var priceExcludeVAT;
        var onlyVAT;
        var priceIncludeVAT;
        $.each( data, function(i,item) {
          $.each(item, function(attr, value) {
            switch (attr) {
              case "percentVAT"  :
                if (value == null) {
                  $("#percentVAT").val("NONE");
                }
                else {
                  $("#percentVAT").val(value);
                }
              break;
              case "methodVAT":
                if (value == null) {
                  $("#methodVAT").val("NONE");
                }
                else {
                  $("#methodVAT").val(value);
                }
              break;
            }
            /*
            switch (methodVAT)
            {
              case "No VAT":
                priceExcludeVAT = parseFloat( $("#unit_sale_new").val() ) * parseFloat( $("div_price_per_unit").val() );
                onlyVAT = 0;
                priceIncludeVAT = priceExcludeVAT;
              break;
              case "Including VAT":
                priceIncludeVAT = parseFloat( $("#unit_sale_new").val() ) * parseFloat( $("div_price_per_unit").val() );
                onlyVAT = parseFloat( parseFloat(priceExcludeVAT) * parseFloat(percentVAT));
                priceExcludeVAT = parseFloat( priceIncludeVAT ) - parseFloat( onlyVAT );
              break;
              case "Excluding VAT":
                priceExcludeVAT = parseFloat( $("#unit_sale_new").val() ) * parseFloat( $("div_price_per_unit").val() );
                onlyVAT = parseFloat( parseFloat(priceExcludeVAT) * parseFloat(percentVAT));
                priceIncludeVAT = parseFloat( priceExcludeVAT ) + parseFloat( onlyVAT );
              break;
            }
            alert(methodVAT);
            alert(percentVAT);
            onlyVAT.toFixed(2);
            priceExcludeVAT.toFixed(2);
            priceIncludeVAT.toFixed(2);
            $("#div_price_exclude_tax").html( priceExcludeVAT );
            $("#div_tax").html( onlyVAT );
            $("#div_price_include_tax").html( priceExcludeVAT );
            */
          });
        });
      },
      error : function() {
        alert( "ไม่สามารถรับข้อมูลการคำนวณภาษีจาก server !" );
        $("#li_warn_message"  ).css( "display", "block");
        $("#div_warn_message" ).css( "display", "block");
        $("#div_warn_message" ).html( $("#div_warn_message" ).html()
        + "<font color='red'>ไม่สามารถรับข้อมูลการคำนวณภาษีจาก server !</font><br/>" );
        $('#div_btn_step2_nok').css('display', 'block');
        $('#div_btn_step2_ok' ).css('display', 'none' );
      }
    }
  );
}

function sale_load_1() {
  $(".nickname").html( localStorage["username"         ] );
  $(".loginame").html( localStorage["database_nickname"] );
}

const cards    = {
  'user'         : 0,
  'admin'        : 1,
  'reset'        : 2,
  'master_reset' : 3,
  'initial'      : 4,
  'setting'      : 5,
  'reading'      : 6,
  'special'      : 7,
  'extended'     : 8,
  'empty'        : 0xFF
};

const meter_ctrl = {
  'silent'     : 0x01,
  'warn_ack'   : 0x02,
  'unit_update': 0x04
};

const smc_func  = {
  'read'      : 0x01,
  'write'     : 0x02,
  'connect'   : 0x03,
  'disconnect': 0x04,
  'changePSC' : 0x05
};

const smc_func_size_send = {
  'read'      : 0x03,
  'write'     : 0x04,
  'connect'   : 0x01,
  'disconnect': 0x01,
  'changePSC' : 0x03
};

const smc_func_size_recv = {
  'read'      : 0x06,
  'write'     : 0x06,
  'connect'   : 0x04,
  'disconnect': 0x03,
  'changePSC' : 0x04
};

const smc_func_connect_response    = {
  'func_ok'  : 0x03, // OK   func
  'func_fail': 0x83, // Fail func
  'ok_ok'    : 0x00, // OK  status
  'fail_atr' : 0x01, // ATR status fail
  'fail_psc' : 0x02, // PSC status fail
  'fail_nul' : 0x04, // No Card status fail
  'psc_ok'   : 0x05
};

const smc_func_disconnect_response = {
  'func_ok' : 0x04
};

const smc_func_read_response  = {
  'func_ok'  : 0x01, // OK   func
  'func_fail': 0x81, // Fail func
  'fail_addr': 0x03  // Address invalid
};

const smc_func_write_response = {
  'func_ok'  : 0x02, // OK   func
  'func_fail': 0x82, // Fail func
  'fail_addr': 0x04  // Address invalid
};

const smc_name = [
  'card_id_highest'    , //  0
  'card_id_higher'     , //  1
  'card_id_lower'      , //  2
  'card_id_lowest'     , //  3
  'area_id_hi'         , //  4 Area ID high
  'area_id_lo'         , //  5 Area ID low
  'customer_id_hi'     , //  6 Customer ID high
  'customer_id_lo'     , //  7 Customer ID low
  'start_unit_hi'      , //  8
  'start_unit_lo'      , //  9
  'price_unit_hi'      , // 10 Price per Unit high
  'price_unit_lo'      , // 11 Price per Unit low
  'unit_sale_hi'       , // 12 Unit Sale high
  'unit_sale_lo'       , // 13 Unit Sale low
  'buy_num_hi'         , // 14 Buy Num high
  'buy_num_lo'         , // 15 Buy Num low
  'warning_unit'       , // 16 Warning
  'emer_unit'          , // 17 Emergency
  'sale_date_day'      , // 18 Date Day
  'sale_date_month'    , // 19 Date Month
  'sale_date_year'     , // 20 Date Year
  'sale_date_hour'     , // 21 Hour
  'sale_date_min'      , // 22 Min
  'sale_date_sec'      , // 23 Sec
  'create_date_day'    , // 24 Date Day
  'create_date_month'  , // 25 Date Month
  'create_date_year'   , // 26 Date Year
  'create_date_hour'   , // 27 Hour
  'create_date_min'    , // 28 Min
  'create_date_sec'    , // 29 Sec
  'unit_add_hi'        , // 30 Unit Add high
  'unit_add_lo'        , // 31 Unit Add low
  'unit_used_hi'       , // 32 Unit Used high
  'unit_used_lo'       , // 33 Unit Used low
  'unit_remain_hi'     , // 34 Unit Remain high
  'unit_remain_lo'     , // 35 Unit Remain low
  'serial_highest'     , // 36 Serial no highest
  'serial_higher'      , // 37 serial no higher
  'serial_lower'       , // 38 serial no lower
  'serial_lowest'      , // 39 Serial no lowest
  'meter_status'       , // 40 Meter Status
  'card_type'          , // 41 card_type
  'card_remake'        , // 42
  'price_id'           , // 43
  'business_id'        , // 44
  'buzz_peri_warn'     , // 45 Buzz Period Warning
  'buzz_hold_warn'     , // 46 Buzz Hold Warning
  'meter_ctrl'         , // 47
  'panel_peri_norm_hi' , // 48 Panel Period Normal high
  'panel_peri_norm_lo' , // 49 Panel Period Normal low
  'panel_hold_norm_hi' , // 50 Panel Hold Normal high
  'panel_hold_norm_lo' , // 51 Panel Hold Normal low
  'panel_peri_warn_hi' , // 52 Panel Period Warning high
  'panel_peri_warn_lo' , // 53 Panel Period Warning low
  'panel_hold_warn_hi' , // 54 Panel Hold Warning high
  'panel_hold_warn_lo' , // 55 Panel Hold Warning low
  'pulse_1kWh_hi'      , // 56 Pulse 1kWh high
  'pulse_1kWh_lo'      , // 57 Pulse 1kWh low
  'pulse_count_hi'     , // 58 Pluse count high
  'pulse_count_lo'       // 59 Pulse count low
];

const smc_addr = {
  'card_id_highest'    : 0x60, //  0 Card ID MSB
  'card_id_higher'     : 0x61, //  1 Card ID
  'card_id_lower'      : 0x62, //  2 Card ID
  'card_id_lowest'     : 0x63, //  3 Card ID LSB
  'area_id_hi'         : 0x64, //  4 Area ID high
  'area_id_lo'         : 0x65, //  5 Area ID low
  'customer_id_hi'     : 0x66, //  6 Customer ID high
  'customer_id_lo'     : 0x67, //  7 Customer ID low
  'start_unit_hi'      : 0x6F, //  8 Start Unit MSB
  'start_unit_lo'      : 0x70, //  9 Start Unit LSB
  'price_unit_hi'      : 0x71, // 10 Price per Unit high
  'price_unit_lo'      : 0x72, // 11 Price per Unit low
  'unit_sale_hi'       : 0x73, // 12 Unit Sale high
  'unit_sale_lo'       : 0x74, // 13 Unit Sale low
  'buy_num_hi'         : 0x75, // 14 Buy Num high
  'buy_num_lo'         : 0x76, // 15 Buy Num low
  'warning_unit'       : 0x77, // 16 Warning
  'emer_unit'          : 0x78, // 17 Emergency
  'sale_date_day'      : 0x79, // 18 Date Day
  'sale_date_month'    : 0x7A, // 19 Date Month
  'sale_date_year'     : 0x7B, // 20 Date Year
  'sale_date_hour'     : 0x7C, // 21 Hour
  'sale_date_min'      : 0x7D, // 22 Min
  'sale_date_sec'      : 0x7E, // 23 Sec
  'create_date_day'    : 0x7F, // 24 Date Day
  'create_date_month'  : 0x80, // 25 Date Month
  'create_date_year'   : 0x81, // 26 Date Year
  'create_date_hour'   : 0x82, // 27 Hour
  'create_date_min'    : 0x83, // 28 Min
  'create_date_sec'    : 0x84, // 29 Sec
  'unit_add_hi'        : 0x85, // 30 Unit Add high
  'unit_add_lo'        : 0x86, // 31 Unit Add low
  'unit_used_hi'       : 0x87, // 32 Unit Used high
  'unit_used_lo'       : 0x88, // 33 Unit Used low
  'unit_remain_hi'     : 0x89, // 34 Unit Remain high
  'unit_remain_lo'     : 0x8A, // 35 Unit Remain low
  'serial_highest'     : 0x8B, // 36 Serial no highest
  'serial_higher'      : 0x8C, // 37 serial no higher
  'serial_lower'       : 0x8D, // 38 serial no lower
  'serial_lowest'      : 0x8E, // 39 Serial no lowest
  'meter_status'       : 0x8F, // 40 Meter Status
  'card_type'          : 0x90, // 41 card_type
  'card_remake'        : 0x91, // 42 card remake
  'price_id'           : 0x92, // 43 price ID
  'business_id'        : 0x93, // 44 business ID
  'buzz_peri_warn'     : 0x94, // 45 Buzz Period Warning
  'buzz_hold_warn'     : 0x95, // 46 Buzz Hold Warning
  'meter_ctrl'         : 0x96, // 47 meter control warnning register
  'panel_peri_norm_hi' : 0x97, // 48 Panel Period Normal high
  'panel_peri_norm_lo' : 0x98, // 49 Panel Period Normal low
  'panel_hold_norm_hi' : 0x99, // 50 Panel Hold Normal high
  'panel_hold_norm_lo' : 0x9A, // 51 Panel Hold Normal low
  'panel_peri_warn_hi' : 0x9B, // 52 Panel Period Warning high
  'panel_peri_warn_lo' : 0x9C, // 53 Panel Period Warning low
  'panel_hold_warn_hi' : 0x9D, // 54 Panel Hold Warning high
  'panel_hold_warn_lo' : 0x9E, // 55 Panel Hold Warning low
  'pulse_1kWh_hi'      : 0x9F, // 56 Pulse 1kWh high
  'pulse_1kWh_lo'      : 0xA0, // 57 Pulse 1kWh low
  'pulse_count_hi'     : 0xA1, // 58 Pulse count high
  'pulse_count_lo'     : 0xA2  // 59 Pulse count low
};

var   smc_val  = {
  'card_id_highest'    : 0, //  0
  'card_id_higher'     : 0, //  1
  'card_id_lower'      : 0, //  2
  'card_id_lowest'     : 0, //  3
  'area_id_hi'         : 0, //  4 Area ID high
  'area_id_lo'         : 0, //  5 Area ID low
  'customer_id_hi'     : 0, //  6 Customer ID high
  'customer_id_lo'     : 0, //  7 Customer ID low
  'start_unit_hi'      : 0, //  8
  'start_unit_lo'      : 0, //  9
  'price_unit_hi'      : 0, // 10 Price per Unit high
  'price_unit_lo'      : 0, // 11 Price per Unit low
  'unit_sale_hi'       : 0, // 12 Unit Sale high
  'unit_sale_lo'       : 0, // 13 Unit Sale low
  'buy_num_hi'         : 0, // 14 Buy Num high
  'buy_num_lo'         : 0, // 15 Buy Num low
  'warning_unit'       : 0, // 16 Warning
  'emer_unit'          : 0, // 17 Emergency
  'sale_date_day'      : 0, // 18 Date Day
  'sale_date_month'    : 0, // 19 Date Month
  'sale_date_year'     : 0, // 20 Date Year
  'sale_date_hour'     : 0, // 21 Hour
  'sale_date_min'      : 0, // 22 Min
  'sale_date_sec'      : 0, // 23 Sec
  'create_date_day'    : 0, // 24 Date Day
  'create_date_month'  : 0, // 25 Date Month
  'create_date_year'   : 0, // 26 Date Year
  'create_date_hour'   : 0, // 27 Hour
  'create_date_min'    : 0, // 28 Min
  'create_date_sec'    : 0, // 29 Sec
  'unit_add_hi'        : 0, // 30 Unit Add high
  'unit_add_lo'        : 0, // 31 Unit Add low
  'unit_used_hi'       : 0, // 32 Unit Used high
  'unit_used_lo'       : 0, // 33 Unit Used low
  'unit_remain_hi'     : 0, // 34 Unit Remain high
  'unit_remain_lo'     : 0, // 35 Unit Remain low
  'serial_highest'     : 0, // 36 Serial no highest
  'serial_higher'      : 0, // 37 serial no higher
  'serial_lower'       : 0, // 38 serial no lower
  'serial_lowest'      : 0, // 39 Serial no lowest
  'meter_status'       : 0, // 40 Meter Status
  'card_type'          : 0, // 41 card_type
  'card_remake'        : 0, // 42
  'price_id'           : 0, // 43
  'business_id'        : 0, // 44
  'buzz_peri_warn'     : 0, // 45 Buzz Period Warning
  'buzz_hold_warn'     : 0, // 46 Buzz Hold Warning
  'meter_ctrl'         : 0, // 47
  'panel_peri_norm_hi' : 0, // 48 Panel Period Normal high
  'panel_peri_norm_lo' : 0, // 49 Panel Period Normal low
  'panel_hold_norm_hi' : 0, // 50 Panel Hold Normal high
  'panel_hold_norm_lo' : 0, // 51 Panel Hold Normal low
  'panel_peri_warn_hi' : 0, // 52 Panel Period Warning high
  'panel_peri_warn_lo' : 0, // 53 Panel Period Warning low
  'panel_hold_warn_hi' : 0, // 54 Panel Hold Warning high
  'panel_hold_warn_lo' : 0, // 55 Panel Hold Warning low
  'pulse_1kWh_hi'      : 0, // 56 Pulse 1kWh high
  'pulse_1kWh_lo'      : 0, // 57 Pulse 1kWh low
  'pulse_count_hi'     : 0, // 58 Pulse count high
  'pulse_count_lo'     : 0  // 59 Pulse count low
};

function serialport_setting() {
  action_stop_circle();
  serial.requestPermission (
    {vid:'10C4',pid:'EA60'},
    function success() {
      serial.open ({
          baudRate: 9600,
          dataBits: 8   ,
          stopBits: 1   ,
          parity  : 0
        },
        function success() {
          alert( "เปิด USB to UART แล้ว" );
          serial_recv_callback ();
        },
        function error() {
          alert( "ไม่สามารถเปิด USB to UART ได้" );
        }
      );
    },
    function error() { alert("ติดต่อเครื่องอ่านการ์ดไม่ได้"); }
  );
}

function action_show_circle(text) {
  $.mobile.loading( 'show', {
    text        : text,
    textVisible : true,
    theme       : 'e',
    html        : ""
  });
}

function action_stop_circle() {
  $.mobile.loading( 'hide' );
}

function readcard_function() {
  action_show_circle( 'กำลังอ่านการ์ด' );
  clear_smc_val();
  process_read    = true;
  recv_state      = 0;
  smc_buffer_size = 0;

  var smc_send    = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function fillunit_function() {
  action_show_circle( 'กำลังเขียนการ์ด' );
  pack_fillunit();
  process_read    = false;
  recv_state      = 0;
  smc_buffer_size = 0;
  var smc_send    = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function usercard_function() {
  action_show_circle( 'กำลังเขียน user การ์ด' );
  pack_usercard();
  process_read    = false;
  recv_state      = 0;
  smc_buffer_size = 0;
  var smc_send    = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function initialcard_function() {
  action_show_circle( 'กำลังเขียน initial การ์ด' );
  pack_initialcard();
  process_read    = false;
  recv_state      = 0;
  smc_buffer_size = 0;
  var smc_send    = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function admincard_function() {
  action_show_circle( 'กำลังเขียน admin การ์ด' );
  smc_val.card_type        = parseInt(cards.admin);
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;

  if (smc_val.card_remake < 255)
  { smc_val.card_remake++; }

  process_read    = false;
  recv_state      = 0;
  smc_buffer_size = 0;
  var smc_send    = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function resetcard_function() {
  action_show_circle( 'กำลังเขียน reset การ์ด' );
  smc_val.card_type        = parseInt(cards.reset);
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;

  if (smc_val.card_remake < 255)
  { smc_val.card_remake++; }

  process_read      = false;
  recv_state        = 0;
  smc_buffer_size   = 0;
  var smc_send      = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function master_resetcard_function() {
  action_show_circle( 'กำลังเขียน master reset การ์ด' );
  smc_val.card_type        = parseInt(cards.master_reset);
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;

  if (smc_val.card_remake < 255)
  { smc_val.card_remake++; }

  process_read      = false;
  recv_state        = 0;
  smc_buffer_size   = 0;
  var smc_send      = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function readingcard_function() {
  action_show_circle( 'กำลังเขียน reading การ์ด' );
  smc_val.card_type = parseInt(cards.reading);
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;

  if (smc_val.card_remake < 255)
  { smc_val.card_remake++; }

  process_read      = false;
  recv_state        = 0;
  smc_buffer_size   = 0;
  var smc_send      = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function extensioncard_function() {
  action_show_circle( 'กำลังเขียน extension การ์ด' );
  smc_val.card_type        = parseInt(cards.extended);
  var now = new Date();
  smc_val.warning_unit     = parseInt($('#warning_unit' ).val());
  smc_val.emer_unit        = parseInt($('#emer_unit'    ).val());
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;

  if (smc_val.card_remake < 255)
  { smc_val.card_remake++; }

  process_read      = false;
  recv_state        = 0;
  smc_buffer_size   = 0;
  var smc_send      = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function psc_serial_function() {
  var ishex_PSC1  = /[a-fA-F\d]+/i.test( $('#PSC1').val() );
  var ishex_PSC2  = /[a-fA-F\d]+/i.test( $('#PSC2').val() );
  var isnum_begin = /[\d]+/i.test( $('#serial_begin').val() );
  var isnum_end   = /[\d]+/i.test( $('#serial_end'  ).val() );
  var isok = false;
  if ( ishex_PSC1 == false ) {
    alert("กรุณาใส่เป็นตัวเลขฐาน 16");
  }
  else {
    PSC1 = parseInt( $('#PSC1').val(), 16);
  }
  if ( ishex_PSC2 == false ) {
    alert("กรุณาใส่เป็นตัวเลขฐาน 16");
  }
  else {
    PSC2 = parseInt( $('#PSC2').val(), 16);
  }
  if ( isnum_begin == false ) {
    alert("กรุณาใส่ เป็นตัวเลข");
  }
  else {
    serial_begin = parseInt( $("#serial_begin").val(), 10 );
  }
  if ( isnum_end == false ) {
    alert("กรุณาใส่ เป็นตัวเลข");
  }
  else {
    serial_end = parseInt( $("#serial_end").val(), 10 );
  }
  if ( isnum_begin && isnum_end ) {
    if ( serial_end >= serial_begin ) {
      isok = true;
    }
    else {
      isok = false;
    }
  }
  if ( ishex_PSC1 && ishex_PSC2 && isok ) {
    var now = new Date();
    smc_val.create_date_day  = parseInt( now.getDate()    )       ;
    smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
    smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
    smc_val.create_date_hour = parseInt( now.getHours()   )       ;
    smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
    smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;
    smc_val.card_type        = 0xFF;
    process_read      = false;
    recv_state        = 0;
    smc_buffer_size   = 0;
    var smc_send      = [ smc_func['changePSC'], PSC1, PSC2 ];
    smc_send_fn( smc_send, smc_send.length );
    serial_run = serial_begin;
    action_show_circle( 'กำลังเขียน PASSWORD และ ID ลงการ์ด' );
  }
}

function pack_usercard() {
  smc_val.card_type        = parseInt(cards.user);
  smc_val.serial_lowest    = parseInt($('#serial_no'      ).val())        & 0xFF;
  smc_val.serial_lower     =(parseInt($('#serial_no'      ).val()) >>  8) & 0xFF;
  smc_val.serial_higher    =(parseInt($('#serial_no'      ).val()) >> 16) & 0xFF;
  smc_val.serial_highest   =(parseInt($('#serial_no'      ).val()) >> 24) & 0xFF;
  smc_val.meter_status     = parseInt($('#user_post_paid' ).val())              ;
  smc_val.warning_unit     = parseInt($('#warning_unit'   ).val());
  smc_val.emer_unit        = parseInt($('#emer_unit'      ).val());
  smc_val.meter_ctrl       = parseInt($('select[name="buzz_silent"]').val()) | parseInt($('select[name="unit_update"]').val()) ;
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;

  if (smc_val.card_remake < 255)
  { smc_val.card_remake++; }
}

function pack_initialcard() {
  smc_val.card_type       =  parseInt(cards.initial);
  smc_val.serial_highest  = (parseInt(  $('#serial_no'     ).val()) >> 24) & 0xFF;
  smc_val.serial_higher   = (parseInt(  $('#serial_no'     ).val()) >> 16) & 0xFF;
  smc_val.serial_lower    = (parseInt(  $('#serial_no'     ).val()) >>  8) & 0xFF;
  smc_val.serial_lowest   =  parseInt(  $('#serial_no'     ).val())        & 0xFF;
  smc_val.meter_status    =  parseInt(  $('#post_paid'     ).val())              ;
  smc_val.pulse_1kWh_hi   = (parseInt(  $('#pulse_1kwh'    ).val()) >>  8) & 0xFF;
  smc_val.pulse_1kWh_lo   =  parseInt(  $('#pulse_1kwh'    ).val())        & 0xFF;
  smc_val.unit_add_hi     = (parseInt(  $('#unit_add'      ).val()) >>  8) & 0xFF;
  smc_val.unit_add_lo     =  parseInt(  $('#unit_add'      ).val())        & 0xFF;
  smc_val.warning_unit    =  parseInt(  $('#warning_unit'  ).val());
  smc_val.emer_unit       =  parseInt(  $('#emer_unit'     ).val());
  smc_val.buzz_peri_warn  =( parseFloat($('#buzz_peri_warn').val()) * 10) > 255 ? 255 :
                           ((parseFloat($('#buzz_peri_warn').val()) * 10) < 1   ?   1 :
                           ((parseFloat($('#buzz_peri_warn').val()) * 10)));
  smc_val.buzz_hold_warn  =( parseFloat($('#buzz_hold_warn').val()) * 10) > 255 ? 255 :
                           ((parseFloat($('#buzz_hold_warn').val()) * 10) < 1   ?   1 :
                           ((parseFloat($('#buzz_hold_warn').val()) * 10)));
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;
  var panel_peri_norm_val = parseFloat($('#panel_peri_norm').val()) * 10;
  var panel_hold_norm_val = parseFloat($('#panel_hold_norm').val()) * 10;
  var panel_peri_warn_val = parseFloat($('#panel_peri_warn').val()) * 10;
  var panel_hold_warn_val = parseFloat($('#panel_hold_warn').val()) * 10;

  if (panel_peri_norm_val > 9999) {panel_peri_norm_val = 9999;}
  if (panel_hold_norm_val > 9999) {panel_hold_norm_val = 9999;}
  if (panel_peri_warn_val > 9999) {panel_peri_warn_val = 9999;}
  if (panel_hold_warn_val > 9999) {panel_hold_warn_val = 9999;}
  if (panel_peri_norm_val <    1) {panel_peri_norm_val =    1;}
  if (panel_hold_norm_val <    1) {panel_hold_norm_val =    1;}
  if (panel_peri_warn_val <    1) {panel_peri_warn_val =    1;}
  if (panel_hold_warn_val <    1) {panel_hold_warn_val =    1;}

  smc_val.panel_peri_norm_hi =(parseInt(panel_peri_norm_val) >>  8) & 0xFF;
  smc_val.panel_peri_norm_lo = parseInt(panel_peri_norm_val)        & 0xFF;
  smc_val.panel_hold_norm_hi =(parseInt(panel_hold_norm_val) >>  8) & 0xFF;
  smc_val.panel_hold_norm_lo = parseInt(panel_hold_norm_val)        & 0xFF;
  smc_val.panel_peri_warn_hi =(parseInt(panel_peri_warn_val) >>  8) & 0xFF;
  smc_val.panel_peri_warn_lo = parseInt(panel_peri_warn_val)        & 0xFF;
  smc_val.panel_hold_warn_hi =(parseInt(panel_hold_warn_val) >>  8) & 0xFF;
  smc_val.panel_hold_warn_lo = parseInt(panel_hold_warn_val)        & 0xFF;
  smc_val.meter_ctrl         = $('#buzz_silent').val() | $('#unit_update').val();
}

function pack_fillunit() {
//var now = new Date();
//smc_val.sale_date_day  = parseInt( now.getDate()    )       ;
//smc_val.sale_date_month= parseInt( now.getMonth()   ) + 1   ;
//smc_val.sale_date_year = parseInt( now.getFullYear()) % 100 ;
//smc_val.sale_date_hour = parseInt( now.getHours()   )       ;
//smc_val.sale_date_min  = parseInt( now.getMinutes() )       ;
//smc_val.sale_date_sec  = parseInt( now.getSeconds() )       ;
//var buy_num = parseInt( $('#buy_num' ).val()) + 1;
//smc_val.buy_num_hi     = (  buy_num >>  8) & 0xFF;
//smc_val.buy_num_lo     =    buy_num        & 0xFF;
//smc_val.unit_add_hi    =(parseInt($('#new_unit_sale').val()) >>  8) & 0xFF;
//smc_val.unit_add_lo    = parseInt($('#new_unit_sale').val())        & 0xFF;
//smc_val.warning_unit   = parseInt($('#warning_unit' ).val());
//smc_val.emer_unit      = parseInt($('#emer_unit'    ).val());
  smc_val.meter_ctrl     = parseInt($('select[name="buzz_silent"]').val()) | parseInt($('select[name="unit_update"]').val()) ;
}

function information_readcard() {
  $('#card_id'    ).val( (  smc_val.card_id_highest << 24)
                        | ( smc_val.card_id_higher  << 16)
                        | ( smc_val.card_id_lower   <<  8)
                        |   smc_val.card_id_lowest       );
  $('#area_id'    ).val( ( smc_val.area_id_hi     << 8 ) | smc_val.area_id_lo     );
  $('#customer_id').val( ( smc_val.customer_id_hi << 8 ) | smc_val.customer_id_lo );
  $('#business_id').val( smc_val.business_id );
  $('#card_type').val( smc_val.card_type == cards.user         ? 'การ์ดผู้ใช้'        :
                    (  smc_val.card_type == cards.admin        ? 'การ์ดแอดมิน'     :
                    (  smc_val.card_type == cards.reset        ? 'การ์ดรีเซ็ต'       :
                    (  smc_val.card_type == cards.master_reset ? 'การ์ดมาสเตอร์รีเซ็ต':
                    (  smc_val.card_type == cards.initial      ? 'การ์ดตั้งค่า'       :'ไม่มีในระบบ')))));
  $('#price_per_unit').val( ( smc_val.price_unit_hi << 8 ) | smc_val.price_unit_lo );
  $('#unit_add'      ).val( ( smc_val.unit_add_hi   << 8 ) | smc_val.unit_add_lo   );
  $('#buy_num'       ).val( ( smc_val.buy_num_hi    << 8 ) | smc_val.buy_num_lo    );
  $('#sale_date_time').val(   (((smc_val.sale_date_year   >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_year.toString() +'/'+
                              (((smc_val.sale_date_month  >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_month.toString()+'/'+
                              (((smc_val.sale_date_day    >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_day.toString()  +' '+
                              (((smc_val.sale_date_hour   >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_hour.toString() +':'+
                              (((smc_val.sale_date_min    >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_min.toString()  +':'+
                              (((smc_val.sale_date_sec    >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_sec.toString()    );
  $('#create_date_time').val( (((smc_val.create_date_year >>>0)&0xFF)<0xA?'0':'')+smc_val.create_date_year.toString() +'/'+
                              (((smc_val.create_date_month>>>0)&0xFF)<0xA?'0':'')+smc_val.create_date_month.toString()+'/'+
                              (((smc_val.create_date_day  >>>0)&0xFF)<0xA?'0':'')+smc_val.create_date_day.toString()  +' '+
                              (((smc_val.create_date_hour >>>0)&0xFF)<0xA?'0':'')+smc_val.create_date_hour.toString() +':'+
                              (((smc_val.create_date_min  >>>0)&0xFF)<0xA?'0':'')+smc_val.create_date_min.toString()  +':'+
                              (((smc_val.create_date_sec  >>>0)&0xFF)<0xA?'0':'')+smc_val.create_date_sec.toString()   );
  $('#unit_sale'   ).val( ( smc_val.unit_sale_hi   << 8 ) | smc_val.unit_sale_lo   );
  $('#used_unit'   ).val( ( smc_val.unit_used_hi   << 8 ) | smc_val.unit_used_lo   );
  $('#remain_unit' ).val( ( smc_val.unit_remain_hi << 8 ) | smc_val.unit_remain_lo );
  $('#start_unit'  ).val( ( smc_val.start_unit_hi  << 8 ) | smc_val.start_unit_lo  );
  $('#pulse_count' ).val( ( smc_val.pulse_count_hi << 8 ) | smc_val.pulse_count_lo );
  $('#pulse_1kwh'  ).val( ( smc_val.pulse_1kWh_hi  << 8 ) | smc_val.pulse_1kWh_lo  );
  $('#serial_no' ).val( (  smc_val.serial_highest  << 24)
                       | ( smc_val.serial_higher   << 16)
                       | ( smc_val.serial_lower    <<  8)
                       |   smc_val.serial_lowest        );
  $('#post_paid'   ).val( smc_val.meter_status == 0 ? 'stock'   :
                        ( smc_val.meter_status == 1 ? 'pre paid':
                        ( smc_val.meter_status == 2 ? 'stop'    : 'post paid')) );
  $('#meter_status').val( smc_val.meter_status == 0 ? 'stock'   :
                        ( smc_val.meter_status == 1 ? 'inuse'   :
                        ( smc_val.meter_status == 2 ? 'stop'    : 'post paid')) );
  if ( parseInt( $('#remain_unit').val() ) > 32767)
  { $('#remain_unit').val( $('#remain_unit').val() - 65535   ); }
  $('#warning_unit'    ).val(    smc_val.warning_unit        );
  $('#emer_unit'       ).val(    smc_val.emer_unit           );
  $('#card_remake'     ).val(    smc_val.card_remake         );
  $('#buzz_peri_warn'  ).val(    smc_val.buzz_peri_warn / 10.);
  $('#buzz_hold_warn'  ).val(    smc_val.buzz_hold_warn / 10.);
  $('#panel_peri_norm' ).val( ( (smc_val.panel_peri_norm_hi << 8) | smc_val.panel_peri_norm_lo) / 10.);
  $('#panel_hold_norm' ).val( ( (smc_val.panel_hold_norm_hi << 8) | smc_val.panel_hold_norm_lo) / 10.);
  $('#panel_peri_warn' ).val( ( (smc_val.panel_peri_warn_hi << 8) | smc_val.panel_peri_warn_lo) / 10.);
  $('#panel_hold_warn' ).val( ( (smc_val.panel_hold_warn_hi << 8) | smc_val.panel_hold_warn_lo) / 10.);
  var my_buzz_silent = $('select[name="buzz_silent"]');
  var my_unit_update = $('select[name="unit_update"]');
  var buzz_silent_val = parseInt( ( smc_val.meter_ctrl & meter_ctrl.silent      ), 16 );
  var unit_update_val = parseInt( ( smc_val.meter_ctrl & meter_ctrl.unit_update ), 16 );

  if ( buzz_silent_val == 0 )
  { my_buzz_silent[0].selectedIndex = 1; }
  else
  { my_buzz_silent[0].selectedIndex = 0; }

  if ( unit_update_val == 0 )
  { my_unit_update[0].selectedIndex = 1; }
  else
  { my_unit_update[0].selectedIndex = 0; }

  my_buzz_silent.selectmenu("refresh");
  my_unit_update.selectmenu("refresh");

  check_cardid_in_database();
  check_areaid_in_database();
  check_businessid_in_database();
  check_customerid_in_database();
  check_priceid_in_database();
  check_billsetting_in_database();
  check_warn_in_database();
  check_emer_in_database();
  $("#div_btn_step1_ok").css("display", "block");
}

function clear_smc_val() {
  for (var i in smc_val) {
    smc_val[i] = 0;
  }
}

function clearmsg_function() {
  $('#div_btn_step1_ok').css('display', 'none');
  $('#div_btn_step2_ok').css('display', 'none');
  // $('#div_btn_step3_ok').css('display', 'none');
  action_stop_circle();
  $(".CardData"   ).val("");
  $(".ConfirmData").html("");
}

function serial_recv_callback () {
  serial.registerReadCallback (
    function success( data ) {
      var view = new Uint8Array( data );
      recv( view, view.length );
    },
    function error() {
      alert("การรับข้อมูลผิดพลาด");
    }
  );
}

function recv ( bytes, size ) {
  for ( var i = 0; i < size; ++i ) {
    smc_buffer[ smc_buffer_size + i ] = (( bytes[i]>>>0) & 0xFF); // Force to unsigned byte : ((bytes[i]>>>0) & 0xFF)
  }
  smc_buffer_size += parseInt(size);

  if (process_read == false) {
    // Write
    switch (recv_state) {
    case 0: // check connect
      if ( smc_buffer_size == smc_func_size_recv['connect'] ) {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) ) {
          if (smc_buffer[0] == smc_func_connect_response['func_ok']) {
            if (smc_buffer[1] == smc_func_connect_response['ok_ok']) {
              recv_state = 1;
              addr_state = 0;
              var smc_addr_hi = ((smc_addr[ smc_name[ addr_state ] ] & 0xFF00) >> 8 );
              var smc_addr_lo = ((smc_addr[ smc_name[ addr_state ] ] & 0x00FF)      );
              var smc_data    =   smc_val [ smc_name[ addr_state ] ];
              var smc_send    = [ smc_func['write'], smc_addr_hi, smc_addr_lo, smc_data ];
              smc_send_fn( smc_send, smc_send.length );
            }
          }
          else if (smc_buffer[0] == smc_func_connect_response['func_fail']) {
            if (smc_buffer[1] == smc_func_connect_response['fail_atr']) {
              action_stop_circle();
              alert('connection error this card is not SLE4428!');
              recv_state = 0xFF;
            }
            else if (smc_buffer[1] == smc_func_connect_response['fail_psc']) {
              action_stop_circle();
              alert('connection error PSC not match!');
              recv_state = 0xFF;
            }
            else if (smc_buffer[1] == smc_func_connect_response['fail_nul']) {
              action_stop_circle();
              alert('connection error no smart card!');
              recv_state = 0xFF;
            }
            else {
              action_stop_circle();
              alert('undefine connection error status!');
              recv_state = 0xFF;
            }
          }
          else if (smc_buffer[0] == smc_func_connect_response['psc_ok']) {
            smc_val.card_id_highest =( ( serial_run ) >> 24) & 0xFF;
            smc_val.card_id_higher  =( ( serial_run ) >> 16) & 0xFF;
            smc_val.card_id_lower   =( ( serial_run ) >>  8) & 0xFF;
            smc_val.card_id_lowest  =    serial_run          & 0xFF;
            process_read    = false;
            recv_state      = 0;
            smc_buffer_size = 0;
            var smc_send    = [ smc_func['connect'] ];
            smc_send_fn( smc_send, smc_send.length );
          }
          else {
            action_stop_circle();
            alert('function is not match process y');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
    break;

    case 1: // check read smc_val
      if ( smc_buffer_size == smc_func_size_recv['write'] ) {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) ) {
          if (smc_buffer[0] == smc_func_write_response['func_ok']) {
            // alert('x : ' + addr_state);
            smc_val [ smc_name[ addr_state ]] = smc_buffer[ 3 ];
            addr_state++;
            // $('#read_progress').val( addr_state );
            if (addr_state < smc_name.length) {
              var smc_addr_hi = ((smc_addr[ smc_name[ addr_state ] ] & 0xFF00) >> 8 );
              var smc_addr_lo = ((smc_addr[ smc_name[ addr_state ] ] & 0x00FF)      );
              var smc_data    =   smc_val [ smc_name[ addr_state ] ];
              var smc_send    = [ smc_func['write'], smc_addr_hi, smc_addr_lo, smc_data ];
              smc_send_fn( smc_send, smc_send.length );
            }
            else {
              var smc_send    = [ smc_func['disconnect'] ];
              smc_send_fn( smc_send, smc_send.length );
            }
          }
          else if (smc_buffer[0] == smc_func_write_response['func_fail']) {
            alert('write fail!');
            if (smc_buffer[3] == smc_func_write_response['fail_addr']) {
              action_stop_circle();
              alert('Address invalid!');
              recv_state = 0xFF;
            }
            else {
              action_stop_circle();
              alert('undefine connection error status!');
              recv_state = 0xFF;
            }
          }
          else {
            action_stop_circle();
            alert('function is not match process z');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
      else if ( smc_buffer_size == smc_func_size_recv['disconnect'] ) {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) ) {
          if (smc_buffer[0] == smc_func_disconnect_response['func_ok']) {
            // $('#read_progress').val( 0 );
            if ( ( serial_begin > 0 ) && ( serial_end > 0 ) ) {
              serial_run++;
              if ( serial_run > serial_end ) {
                serial_run   = 0;
                serial_end   = 0;
                serial_begin = 0;
                action_stop_circle();
              }
              else {
                action_stop_circle();
                alert( "เปลี่ยนการ์ดใบใหม่ สำหรับ : " + serial_run );
                process_read      = false;
                recv_state        = 0;
                smc_buffer_size   = 0;
                var smc_send      = [ smc_func['changePSC'], PSC1, PSC2 ];
                smc_send_fn( smc_send, smc_send.length );
                action_show_circle( 'กำลังเขียน PASSWORD และ ID ลงการ์ด' );
              }
            }
            else {
              action_stop_circle();
              alert('เขียนการ์ดสำเร็จ!');
            }
            recv_state = 0x0;
          }
          else {
            action_stop_circle();
            alert('function is not match process a');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
      else {
      }
    break;
    }
  }
  else {
    // Read Card
    switch (recv_state) {
    case 0 : // check connect
      if ( smc_buffer_size == smc_func_size_recv['connect'] ) {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) ) {
          if (smc_buffer[0] == smc_func_connect_response['func_ok']) {
            if (smc_buffer[1] == smc_func_connect_response['ok_ok']) {
              recv_state = 1;
              addr_state = 0;
              var smc_addr_hi = ((smc_addr[ smc_name[ addr_state ]] & 0xFF00) >> 8 );
              var smc_addr_lo = ((smc_addr[ smc_name[ addr_state ]] & 0x00FF)      );
              var smc_send    = [ smc_func['read'], smc_addr_hi, smc_addr_lo ];
              smc_send_fn( smc_send, smc_send.length );
            }
          }
          else if (smc_buffer[0] == smc_func_connect_response['func_fail']) {
            if (smc_buffer[1] == smc_func_connect_response['fail_atr']) {
              action_stop_circle();
              alert('connection error this card is not SLE4428!');
              recv_state = 0xFF;
            }
            else if (smc_buffer[1] == smc_func_connect_response['fail_psc']) {
              action_stop_circle();
              alert('connection error PSC not match!');
              recv_state = 0xFF;
            }
            else if (smc_buffer[1] == smc_func_connect_response['fail_nul']) {
              action_stop_circle();
              alert('connection error no smart card!');
              recv_state = 0xFF;
            }
            else {
              action_stop_circle();
              alert('undefine connection error status!');
              recv_state = 0xFF;
            }
          }
          else {
            action_stop_circle();
            alert('function is not match process b');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
    break;

    case 1: // check read address
      if ( smc_buffer_size == smc_func_size_recv['read'] ) {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) ) {
          if (smc_buffer[0] == smc_func_read_response['func_ok']) {
            smc_val [ smc_name[ addr_state ]] = smc_buffer[3];
            addr_state++;
            // $('#read_progress').val( addr_state );
            if (addr_state < smc_name.length) {
              var smc_addr_hi = ((smc_addr[ smc_name[ addr_state ]] & 0xFF00) >> 8 );
              var smc_addr_lo = ((smc_addr[ smc_name[ addr_state ]] & 0x00FF)      );
              var smc_send = [ smc_func['read'], smc_addr_hi, smc_addr_lo ];
              smc_send_fn( smc_send, smc_send.length );
            }
            else {
              var smc_send    = [ smc_func['disconnect'] ];
              smc_send_fn( smc_send, smc_send.length );
            }
          }
          else if (smc_buffer[0] == smc_func_read_response['func_fail']) {
            if (smc_buffer[3] == smc_func_read_response['fail_addr']) {
              action_stop_circle();
              alert('Address invalid!');
              recv_state = 0xFF;
            }
            else {
              action_stop_circle();
              alert('undefine connection error status!');
              recv_state = 0xFF;
            }
          }
          else {
            action_stop_circle();
            alert('function is not match process c');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
      else if ( smc_buffer_size == smc_func_size_recv['disconnect'] ) {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) ) {
          if (smc_buffer[0] == smc_func_disconnect_response.func_ok) {
            action_stop_circle();
            alert('อ่านการ์ดสำเร็จ!');
            information_readcard();
            // $('#read_progress').val( 0 );
            recv_state = 0x0;
          }
          else {
            action_stop_circle();
            alert('function is not match process x');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
      else {
      }
    break;
    }
  }
}

function smc_send_fn(bytes, size_of_bytes) {
  var crc  ;
  var crc1 ;
  var crc2 ;
  var packstr = "";

  crc  = MODBUSRTU_CRC( bytes, size_of_bytes );
  crc1 = ( crc &  0x00FF )      ;
  crc2 = ( crc &  0xFF00 ) >> 8 ;

  bytes.push( crc1 );
  bytes.push( crc2 );
  $.each ( bytes,
    function( i, item ) {
      if ( Number( item ) > 0xf) {
        packstr += Number( item ).toString( 16 );
      }
      else {
        packstr += '0';
        packstr += Number( item ).toString( 16 );
      }
    }
  );
  serial.writeHex( packstr, function success(){}, function error(){} );
}

function smc_crc_fn(bytes, size_of_bytes) {
  var size_of_data = size_of_bytes - 2; // crc1 crc2
  var crc ;
  var crc1;
  var crc2;
  var crc1_index = size_of_bytes - 2;
  var crc2_index = size_of_bytes - 1;

  crc  = MODBUSRTU_CRC(bytes, size_of_data);
  crc1 = (crc & 0x00FF)      ;
  crc2 = (crc & 0xFF00) >> 8 ;

  if ( ( crc1 == bytes[ crc1_index ] )
    && ( crc2 == bytes[ crc2_index ] ) ) {
    return true;
  }
  else {
    return false;
  }
}

function MODBUSRTU_CRC(buf, len) {
  var crc = 0xFFFF             ;
  var pos                      ;
  var i                        ;
  var CRC16_MODBUSRTU = 0xA001 ;

  for ( pos = 0; pos < len; pos++ ) {
    crc ^= ( ( buf[ pos ] >>> 0 ) & 0xFF ); // XOR byte into least sig. byte of crc

    for ( i = 8; i != 0; i-- ) {
      // Loop over each bit
      if ( ( crc & 0x0001 ) != 0 ) {
        // If the LSB is set
        crc >>= 1; // Shift right and XOR 0xA001
        crc  ^= CRC16_MODBUSRTU;
      }
      else {
        // Else LSB is not set
        crc >>= 1; // Just shift right
      }
    }
  }
  // Note,
  // this number has low and high bytes swapped,
  // so use it accordingly (or swap bytes)
  return crc;
}
