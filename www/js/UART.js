var card_type_value ;
var process_read    ;
var process_fill    ;
var recv_state      ;
var addr_state      ;
var smc_buffer = new Array();
var smc_buffer_size ;
const smc_size = 59 ;
var saleDateTime    ;
var createDateTime  ;

const process_func_const = {
  'smartcard_php_read1'      :  1,
  'smartcard_php_read2'      :  2,
  'smartcard_php_read3'      :  3,
  'smartcard_php_read4'      :  4,
  'smartcard_php_read5'      :  5,
  'smartcard_php_setting'    :  6,
  'smartcard_php_writeuser'  :  7,
  'sale_php_writeUserCard'   :  8,
  'sale_php_submitReadCard1' :  9,
  'sale_php_submitReadCard2' : 10,
  'remakecard_php_read1'     : 11,
  'remakecard_php_read2'     : 12,
  'remakecard_php_write'     : 13,
  'restorecard_php_read'     : 14,
  'restorecard_php_write'    : 15,
  'redeem_php_ReadCard1'     : 16,
  'redeem_php_ReadCard2'     : 17,
  'redeem_php_WriteCard'     : 18,
};

const smc_type = {
  'CARD_USER'         : '0',
  'CARD_ADMIN'        : '1',
  'CARD_RESET'        : '2',
  'CARD_MASTER_RESET' : '3',
  'CARD_INITIAL'      : '4',
  'CARD_READING'      : '6'
};

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
  'fail_nul' : 0x03  // No Card status fail
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

function recv(bytes, size)
{
  for (var i = 0; i < size; ++i)
  {
    smc_buffer[ smc_buffer_size + i ] = ( ( bytes[ i ] >>> 0) & 0xFF );
  }

  smc_buffer_size += parseInt(size);

  if (process_read == false)
  {
    // Write
    switch (recv_state)
    {
    case 0: // check connect
      if ( smc_buffer_size == smc_func_size_recv['connect'] )
      {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) )
        {
          if (smc_buffer[0] == smc_func_connect_response['func_ok'])
          {
            if (smc_buffer[1] == smc_func_connect_response['ok_ok'])
            {
              recv_state = 1;
              addr_state = 0;
              var smc_addr_hi = ((smc_addr[ smc_name[ addr_state ] ] & 0xFF00) >> 8 );
              var smc_addr_lo = ((smc_addr[ smc_name[ addr_state ] ] & 0x00FF)      );
              var smc_data    =   smc_val [ smc_name[ addr_state ] ];
              var smc_send    = [ smc_func['write'], smc_addr_hi, smc_addr_lo, smc_data ];
              smc_send_fn( smc_send, smc_send.length );
            }
          }
          else if (smc_buffer[0] == smc_func_connect_response['func_fail'])
          {
            if (smc_buffer[1] == smc_func_connect_response['fail_atr'])
            {
              alert('connection error this card is not SLE4428!');
              recv_state = 0xFF;
            }
            else if (smc_buffer[1] == smc_func_connect_response['fail_psc'])
            {
              alert('connection error PSC not match!');
              recv_state = 0xFF;
            }
            else if (smc_buffer[1] == smc_func_connect_response['fail_nul'])
            {
              alert('connection error no smart card!');
              recv_state = 0xFF;
            }
            else
            {
              alert('undefine connection error status!');
              recv_state = 0xFF;
            }
          }
          else
          {
            alert('function is not match process');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
    break;

    case 1: // check read smc_val
      if ( smc_buffer_size == smc_func_size_recv['write'] )
      {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) )
        {
          if (smc_buffer[0] == smc_func_write_response['func_ok'])
          {
            smc_val [ smc_name[ addr_state ]] = smc_buffer[3];
            addr_state++;
            // $('.read_progress').val( addr_state );
            updateProgress( addr_state );
            if (addr_state < smc_name.length)
            {
              var smc_addr_hi = ((smc_addr[ smc_name[ addr_state ] ] & 0xFF00) >> 8 );
              var smc_addr_lo = ((smc_addr[ smc_name[ addr_state ] ] & 0x00FF)      );
              var smc_data    =   smc_val [ smc_name[ addr_state ] ];
              var smc_send    = [ smc_func['write'], smc_addr_hi, smc_addr_lo, smc_data ];
              smc_send_fn( smc_send, smc_send.length );
            }
            else
            {
              var smc_send    = [ smc_func['disconnect'] ];
              smc_send_fn( smc_send, smc_send.length );
            }
          }
          else if (smc_buffer[0] == smc_func_write_response['func_fail'])
          {
            if (smc_buffer[3] == smc_func_write_response['fail_addr'])
            {
              alert('Address invalid!');
              recv_state = 0xFF;
            }
            else
            {
              alert('undefine connection error status!');
              recv_state = 0xFF;
            }
          }
          else
          {
            alert('function is not match process');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
      else if ( smc_buffer_size == smc_func_size_recv['disconnect'] )
      {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) )
        {
          if (smc_buffer[0] == smc_func_disconnect_response['func_ok'])
          {
            // alert('Communication Complete!');
            updateProgress( 0 );
            recv_state = 0x0;
          }
          else
          {
            alert('function is not match process');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
      else
      {
      }
    break;
    }
  }
  else
  {
    // Read Card
    switch (recv_state)
    {
    case 0 : // check connect
      if ( smc_buffer_size == smc_func_size_recv['connect'] )
      {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) )
        {
          if (smc_buffer[0] == smc_func_connect_response['func_ok'])
          {
            if (smc_buffer[1] == smc_func_connect_response['ok_ok'])
            {
              recv_state = 1;
              addr_state = 0;
              var smc_addr_hi = ((smc_addr[ smc_name[ addr_state ]] & 0xFF00) >> 8 );
              var smc_addr_lo = ((smc_addr[ smc_name[ addr_state ]] & 0x00FF)      );
              var smc_send    = [ smc_func['read'], smc_addr_hi, smc_addr_lo ];
              smc_send_fn( smc_send, smc_send.length );
            }
          }
          else if (smc_buffer[0] == smc_func_connect_response['func_fail'])
          {
            if (smc_buffer[1] == smc_func_connect_response['fail_atr'])
            {
              alert('connection error this card is not SLE4428!');
              recv_state = 0xFF;
            }
            else if (smc_buffer[1] == smc_func_connect_response['fail_psc'])
            {
              alert('connection error PSC not match!');
              recv_state = 0xFF;
            }
            else if (smc_buffer[1] == smc_func_connect_response['fail_nul'])
            {
              alert('connection error no smart card!');
              recv_state = 0xFF;
            }
            else
            {
              alert('undefine connection error status!');
              recv_state = 0xFF;
            }
          }
          else
          {
            alert('function is not match process');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
    break;

    case 1: // check read address
      if ( smc_buffer_size == smc_func_size_recv['read'] )
      {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) )
        {
          if (smc_buffer[0] == smc_func_read_response['func_ok'])
          {
            smc_val [ smc_name[ addr_state ]] = smc_buffer[3];
            addr_state++;
            // $('.read_progress').val( addr_state );
            updateProgress( addr_state );
            if (addr_state < smc_name.length) {
              var smc_addr_hi = ((smc_addr[ smc_name[ addr_state ]] & 0xFF00) >> 8 );
              var smc_addr_lo = ((smc_addr[ smc_name[ addr_state ]] & 0x00FF)      );
              var smc_send = [ smc_func['read'], smc_addr_hi, smc_addr_lo ];
              smc_send_fn( smc_send, smc_send.length );
            }
            else
            {
              var smc_send    = [ smc_func['disconnect'] ];
              smc_send_fn( smc_send, smc_send.length );
            }
          }
          else if (smc_buffer[0] == smc_func_read_response['func_fail'])
          {
            if (smc_buffer[3] == smc_func_read_response['fail_addr'])
            {
              alert('Address invalid!');
              recv_state = 0xFF;
            }
            else
            {
              alert('undefine connection error status!');
              recv_state = 0xFF;
            }
          }
          else
          {
            alert('function is not match process');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
      else if ( smc_buffer_size == smc_func_size_recv['disconnect'] )
      {
        if ( smc_crc_fn( smc_buffer, smc_buffer_size ) )
        {
          if (smc_buffer[0] == smc_func_disconnect_response.func_ok)
          {
            // alert('Communication Complete!');
            updateProgress( 0 );
            show_read_card();
            recv_state = 0x0;
          }
          else {
            alert('function is not match process');
            recv_state = 0xFF;
          }
          smc_buffer_size = 0;
        }
      }
      else
      {
      }
    break;
    }
  }
}

function show_read_card_fill()
{
/*
  $('#fill_serial_no'      ).val( (smc_val.serial_highest  << 24)
                                | (smc_val.serial_higher   << 16)
                                | (smc_val.serial_lower    <<  8)
                                |  smc_val.serial_lowest       );
  $('#fill_card_type'      ).val(  smc_val.card_type == cards.user ?'user' :
                                  (smc_val.card_type == cards.admin?'admin':
                                  (smc_val.card_type == cards.reset?'reset':
                                  (smc_val.card_type == cards.master_reset?'master reset':
                                  (smc_val.card_type == cards.initial?'initial':'undefine')))));
  $('#fill_remain_unit'    ).val( (smc_val.unit_remain_hi  << 8) | smc_val.unit_remain_lo );
  if ( parseInt( $('#fill_remain_unit').val() ) > 32767)
  {
    $('#fill_remain_unit').val( $('#fill_remain_unit').val() - 65535 );
  }
  $('#fill_buy_num'        ).val( (smc_val.buy_num_hi      << 8) | smc_val.buy_num_lo     );
  $('#fill_unit_sale'      ).val( (smc_val.unit_sale_hi    << 8) | smc_val.unit_sale_lo    );
  $('#fill_sale_date_time' ).val((((smc_val.sale_date_day  >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_day.toString()  +'/'+
                                 (((smc_val.sale_date_month>>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_month.toString()+'/'+
                                 (((smc_val.sale_date_year >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_year.toString() +' '+
                                 (((smc_val.sale_date_hour >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_hour.toString() +':'+
                                 (((smc_val.sale_date_min  >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_min.toString()  +':'+
                                 (((smc_val.sale_date_sec  >>>0)&0xFF)<0xA?'0':'')+smc_val.sale_date_sec.toString() );
  $('#fill_price_unit'     ).val( (smc_val.price_unit_hi   << 8) | smc_val.price_unit_lo  );
  $('#fill_warning_unit'   ).val(  smc_val.warning_unit);
  $('#fill_emer_unit'      ).val(  smc_val.emer_unit   );
//$('#fill_unit_add'       ).val( (smc_val.unit_add_hi     << 8) | smc_val.unit_add_lo    );
  $('#fill_buzz_peri_warn' ).val(  smc_val.buzz_peri_warn / 10.);
  $('#fill_buzz_hold_warn' ).val(  smc_val.buzz_hold_warn / 10.);
  $('#fill_panel_peri_norm').val(((smc_val.panel_peri_norm_hi << 8) | smc_val.panel_peri_norm_lo) / 10.);
  $('#fill_panel_hold_norm').val(((smc_val.panel_hold_norm_hi << 8) | smc_val.panel_hold_norm_lo) / 10.);
  $('#fill_panel_peri_warn').val(((smc_val.panel_peri_warn_hi << 8) | smc_val.panel_peri_warn_lo) / 10.);
  $('#fill_panel_hold_warn').val(((smc_val.panel_hold_warn_hi << 8) | smc_val.panel_hold_warn_lo) / 10.);
  $('#fill_pulse_1kwh'     ).val( (smc_val.pulse_1kWh_hi      << 8) | smc_val.pulse_1kWh_lo     );
//$('#fill_buzz_silent'    ).val(  smc_val.buzz_silent );
//$('#fill_post_paid'      ).val(  smc_val.post_paid   );
*/
}

function smc_send_fn(bytes, size_of_bytes)
{
  var crc ;
  var crc1;
  var crc2;
  var arr = [];
  var str = "";

  crc  = MODBUSRTU_CRC( bytes, size_of_bytes );
  crc1 = ( crc &  0x00FF )      ;
  crc2 = ( crc &  0xFF00 ) >> 8 ;

  for (var i = 0; i < size_of_bytes; ++i)
  {
    arr.push( bytes[ i ] );
  }
  arr.push( crc1 );
  arr.push( crc2 );

  $.each
  ( arr,
   function(i,item)
   {
     if ( Number(item) < 0xf)
     {
       str += '0';
       str += Number(item).toString( 16 );
     }
     else
     {
       str += Number(item).toString( 16 );
     }
   }
  );
  serial.writeHex( str, function success(){}, function error(){} );
}

function smc_crc_fn(bytes, size_of_bytes)
{
  var size_of_data = size_of_bytes - 2; // crc1 crc2
  var crc ;
  var crc1;
  var crc2;
  var crc1_index = size_of_bytes - 2;
  var crc2_index = size_of_bytes - 1;

  crc  = MODBUSRTU_CRC(bytes, size_of_data);
  crc1 = (crc & 0x00FF)      ;
  crc2 = (crc & 0xFF00) >> 8 ;

  if ((crc1 == bytes[ crc1_index ])
   && (crc2 == bytes[ crc2_index ]))
   {
     return true;
   }
   else {
     return false;
   }
}

function check_enable_fill_fn()
{
  if( $('#check_enable_fill').is(':checked') )
  {
    $('#fill_btn_write_info').prop("disabled", false);
  }
  else
  {
    $('#fill_btn_write_info').prop("disabled", true);
  }
}

function check_enable_user_fn()
{
  if( $('#check_enable_user').is(':checked') )
  {
    $('#user_btn_write_info').prop("disabled", false);
  }
  else
  {
    $('#user_btn_write_info').prop("disabled", true);
  }
}

function check_enable_admin_fn()
{
  if( $('#check_enable_admin').is(':checked') )
  {
    $('#admin_btn_write_info').prop("disabled", false);
  }
  else
  {
    $('#admin_btn_write_info').prop("disabled", true);
  }
}

function check_enable_reading_fn()
{
  if( $('#check_enable_reading').is(':checked') )
  {
    $('#reading_btn_write_info').prop("disabled", false);
  }
  else
  {
    $('#reading_btn_write_info').prop("disabled", true);
  }
}

function check_enable_reset_fn()
{
  if( $('#check_enable_reset').is(':checked') )
  {
    $('#reset_btn_write_info').prop("disabled", false);
  }
  else
  {
    $('#reset_btn_write_info').prop("disabled", true);
  }
}

function check_enable_master_reset_fn()
{
  if( $('#check_enable_master_reset').is(':checked') )
  {
    $('#master_reset_btn_write_info').prop("disabled", false);
  }
  else
  {
    $('#master_reset_btn_write_info').prop("disabled", true);
  }
}

function check_enable_initial_fn()
{
  if( $('#check_enable_initial').is(':checked') )
  {
    $('#initial_btn_write_info').prop("disabled", false);
  }
  else
  {
    $('#initial_btn_write_info').prop("disabled", true);
  }
}

function check_enable_extended_fn()
{
  if ($('#check_enable_extended').is(':checked'))
  {
    $('#extended_btn_write_info').prop('disabled', false);
  }
  else
  {
    $('#extended_btn_write_info').prop('disabled', true);
  }
}

function clear_smc_val()
{
  for (var i in smc_val)
  {
    smc_val[i] = 0;
  }
}

function pack_fill()
{
  smc_val.serial_highest = (parseInt($('#fill_serial_no'  ).val()) >> 24) & 0xFF;
  smc_val.serial_higher  = (parseInt($('#fill_serial_no'  ).val()) >> 16) & 0xFF;
  smc_val.serial_lower   = (parseInt($('#fill_serial_no'  ).val()) >>  8) & 0xFF;
  smc_val.serial_lowest  =  parseInt($('#fill_serial_no'  ).val())        & 0xFF;
  smc_val.card_type      =  parseInt(cards.user);
  smc_val.unit_remain_hi = (parseInt($('#fill_remain_unit').val()) >>  8) & 0xFF;
  smc_val.unit_remain_lo =  parseInt($('#fill_remain_unit').val())        & 0xFF;
  var now = new Date();
  smc_val.sale_date_day  = parseInt( now.getDate()    )       ;
  smc_val.sale_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.sale_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.sale_date_hour = parseInt( now.getHours()   )       ;
  smc_val.sale_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.sale_date_sec  = parseInt( now.getSeconds() )       ;
  smc_val.price_unit_hi  =(parseInt($('#fill_price_unit'  ).val()) >>  8) & 0xFF;
  smc_val.price_unit_lo  = parseInt($('#fill_price_unit'  ).val())        & 0xFF;

  if ((smc_val.unit_add_hi == 0x0)
   && (smc_val.unit_add_lo == 0x0))
  {
     var fill_buy_num    = parseInt($('#fill_buy_num' ).val()) + 1;
     smc_val.buy_num_hi  = (fill_buy_num >>  8) & 0xFF;
     smc_val.buy_num_lo  =  fill_buy_num        & 0xFF;
  }
  smc_val.unit_add_hi   =(parseInt($('#fill_unit_add'   ).val()) >>  8) & 0xFF;
  smc_val.unit_add_lo   = parseInt($('#fill_unit_add'   ).val())        & 0xFF;
  smc_val.warning_unit  = parseInt($('#fill_warning_unit').val());
  smc_val.emer_unit     = parseInt($('#fill_emer_unit'   ).val());
//smc_val.buzz_silent   = parseInt($('#fill_buzz_silent' ).val());
  smc_val.meter_ctrl    = $('#fill_buzz_silent').val() | $('#fill_unit_update').val();
}

function pack_user()
{
  clear_smc_val();
  smc_val.card_type       = parseInt(cards.user);
  smc_val.meter_status    = parseInt($('#user_post_paid'  ).val())              ;
  smc_val.card_id_highest =(parseInt($('#user_card_id'    ).val()) >> 24) & 0xFF;
  smc_val.card_id_higher  =(parseInt($('#user_card_id'    ).val()) >> 16) & 0xFF;
  smc_val.card_id_lower   =(parseInt($('#user_card_id'    ).val()) >>  8) & 0xFF;
  smc_val.card_id_lowest  = parseInt($('#user_card_id'    ).val())        & 0xFF;
  smc_val.serial_lowest   = parseInt($('#user_serial_no'  ).val())        & 0xFF;
  smc_val.serial_lower    =(parseInt($('#user_serial_no'  ).val()) >>  8) & 0xFF;
  smc_val.serial_higher   =(parseInt($('#user_serial_no'  ).val()) >> 16) & 0xFF;
  smc_val.serial_highest  =(parseInt($('#user_serial_no'  ).val()) >> 24) & 0xFF;
  smc_val.area_id_lo      = parseInt($('#user_area_id'    ).val())        & 0xFF;
  smc_val.area_id_hi      =(parseInt($('#user_area_id'    ).val()) >>  8) & 0xFF;
  smc_val.customer_id_lo  = parseInt($('#user_customer_id').val())        & 0xFF;
  smc_val.customer_id_hi  =(parseInt($('#user_customer_id').val()) >>  8) & 0xFF;
  smc_val.business_id     = parseInt($('#user_business_id').val())        & 0xFF;
  smc_val.price_id        = parseInt($('#user_price_id'   ).val())        & 0xFF;
  smc_val.price_unit_lo   = parseInt($('#user_price_unit' ).val())        & 0xFF;
  smc_val.price_unit_hi   =(parseInt($('#user_price_unit' ).val()) >>  8) & 0xFF;
  //smc_val.unit_add_lo   = parseInt($('#user_unit_add'   ).val())        & 0xFF;
  //smc_val.unit_add_hi   =(parseInt($('#user_unit_add'   ).val()) >>  8) & 0xFF;
  smc_val.warning_unit    = parseInt($('#user_warning_unit').val());
  smc_val.emer_unit       = parseInt($('#user_emer_unit'   ).val());
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;
  /*
  smc_val.buzz_peri_warn =( parseFloat($('#user_buzz_peri_warn').val()) * 10) > 255 ? 255 :
                          ((parseFloat($('#user_buzz_peri_warn').val()) * 10) < 1   ?   1 :
                          ((parseFloat($('#user_buzz_peri_warn').val()) * 10)));
  smc_val.buzz_hold_warn =( parseFloat($('#user_buzz_hold_warn').val()) * 10) > 255 ? 255 :
                          ((parseFloat($('#user_buzz_hold_warn').val()) * 10) < 1   ?   1 :
                          ((parseFloat($('#user_buzz_hold_warn').val()) * 10)));

  var init_panel_peri_norm_val = parseFloat($('#user_panel_peri_norm').val()) * 10;
  var init_panel_hold_norm_val = parseFloat($('#user_panel_hold_norm').val()) * 10;
  var init_panel_peri_warn_val = parseFloat($('#user_panel_peri_warn').val()) * 10;
  var init_panel_hold_warn_val = parseFloat($('#user_panel_hold_warn').val()) * 10;

  if (init_panel_peri_norm_val > 9999) {init_panel_peri_norm_val = 9999;}
  if (init_panel_hold_norm_val > 9999) {init_panel_hold_norm_val = 9999;}
  if (init_panel_peri_warn_val > 9999) {init_panel_peri_warn_val = 9999;}
  if (init_panel_hold_warn_val > 9999) {init_panel_hold_warn_val = 9999;}
  if (init_panel_peri_norm_val < 1) {init_panel_peri_norm_val = 1;}
  if (init_panel_hold_norm_val < 1) {init_panel_hold_norm_val = 1;}
  if (init_panel_peri_warn_val < 1) {init_panel_peri_warn_val = 1;}
  if (init_panel_hold_warn_val < 1) {init_panel_hold_warn_val = 1;}

  smc_val.panel_peri_norm_hi =(parseInt(init_panel_peri_norm_val) >>  8) & 0xFF;
  smc_val.panel_peri_norm_lo = parseInt(init_panel_peri_norm_val)        & 0xFF;
  smc_val.panel_hold_norm_hi =(parseInt(init_panel_hold_norm_val) >>  8) & 0xFF;
  smc_val.panel_hold_norm_lo = parseInt(init_panel_hold_norm_val)        & 0xFF;
  smc_val.panel_peri_warn_hi =(parseInt(init_panel_peri_warn_val) >>  8) & 0xFF;
  smc_val.panel_peri_warn_lo = parseInt(init_panel_peri_warn_val)        & 0xFF;
  smc_val.panel_hold_warn_hi =(parseInt(init_panel_hold_warn_val) >>  8) & 0xFF;
  smc_val.panel_hold_warn_lo = parseInt(init_panel_hold_warn_val)        & 0xFF;
  */
}

function pack_initial()
{
  clear_smc_val();
  smc_val.card_type = cards.initial;
  smc_val.meter_status    =  parseInt($('#init_post_paid' ).val())              ;
  smc_val.serial_highest  = (parseInt($('#init_serial_no' ).val()) >> 24) & 0xFF;
  smc_val.serial_higher   = (parseInt($('#init_serial_no' ).val()) >> 16) & 0xFF;
  smc_val.serial_lower    = (parseInt($('#init_serial_no' ).val()) >>  8) & 0xFF;
  smc_val.serial_lowest   =  parseInt($('#init_serial_no' ).val())        & 0xFF;
  smc_val.pulse_1kWh_hi   = (parseInt($('#init_pulse_1kwh').val()) >>  8) & 0xFF;
  smc_val.pulse_1kWh_lo   =  parseInt($('#init_pulse_1kwh').val())        & 0xFF;
  smc_val.unit_add_hi     = (parseInt($('#init_unit_add'  ).val()) >>  8) & 0xFF;
  smc_val.unit_add_lo     =  parseInt($('#init_unit_add'  ).val())        & 0xFF;
  smc_val.warning_unit    =  parseInt($('#init_warning_unit').val());
  smc_val.emer_unit       =  parseInt($('#init_emer_unit' ).val());
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;
  smc_val.buzz_peri_warn =( parseFloat($('#init_buzz_peri_warn').val()) * 10) > 255 ? 255 :
                          ((parseFloat($('#init_buzz_peri_warn').val()) * 10) < 1   ?   1 :
                          ((parseFloat($('#init_buzz_peri_warn').val()) * 10)));
  smc_val.buzz_hold_warn =( parseFloat($('#init_buzz_hold_warn').val()) * 10) > 255 ? 255 :
                          ((parseFloat($('#init_buzz_hold_warn').val()) * 10) < 1   ?   1 :
                          ((parseFloat($('#init_buzz_hold_warn').val()) * 10)));

  var init_panel_peri_norm_val = parseFloat($('#init_panel_peri_norm').val()) * 10;
  var init_panel_hold_norm_val = parseFloat($('#init_panel_hold_norm').val()) * 10;
  var init_panel_peri_warn_val = parseFloat($('#init_panel_peri_warn').val()) * 10;
  var init_panel_hold_warn_val = parseFloat($('#init_panel_hold_warn').val()) * 10;

  if (init_panel_peri_norm_val > 9999) {init_panel_peri_norm_val = 9999;}
  if (init_panel_hold_norm_val > 9999) {init_panel_hold_norm_val = 9999;}
  if (init_panel_peri_warn_val > 9999) {init_panel_peri_warn_val = 9999;}
  if (init_panel_hold_warn_val > 9999) {init_panel_hold_warn_val = 9999;}
  if (init_panel_peri_norm_val < 1) {init_panel_peri_norm_val = 1;}
  if (init_panel_hold_norm_val < 1) {init_panel_hold_norm_val = 1;}
  if (init_panel_peri_warn_val < 1) {init_panel_peri_warn_val = 1;}
  if (init_panel_hold_warn_val < 1) {init_panel_hold_warn_val = 1;}

  smc_val.panel_peri_norm_hi =(parseInt(init_panel_peri_norm_val) >>  8) & 0xFF;
  smc_val.panel_peri_norm_lo = parseInt(init_panel_peri_norm_val)        & 0xFF;
  smc_val.panel_hold_norm_hi =(parseInt(init_panel_hold_norm_val) >>  8) & 0xFF;
  smc_val.panel_hold_norm_lo = parseInt(init_panel_hold_norm_val)        & 0xFF;
  smc_val.panel_peri_warn_hi =(parseInt(init_panel_peri_warn_val) >>  8) & 0xFF;
  smc_val.panel_peri_warn_lo = parseInt(init_panel_peri_warn_val)        & 0xFF;
  smc_val.panel_hold_warn_hi =(parseInt(init_panel_hold_warn_val) >>  8) & 0xFF;
  smc_val.panel_hold_warn_lo = parseInt(init_panel_hold_warn_val)        & 0xFF;
  smc_val.meter_ctrl         = $('#init_buzz_silent').val() | $('#init_unit_update').val();
}

function read_card()
{
  process_read    = true;
  recv_state      = 0;
  smc_buffer_size = 0;
  var smc_send    = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function fill_enery_unit_fn()
{
  pack_fill();
  process_read    = false;
  recv_state      = 0;
  smc_buffer_size = 0;
  var smc_send    = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function create_user()
{
  pack_user();
  process_read    = false;
  recv_state      = 0;
  smc_buffer_size = 0;
  var smc_send    = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function create_initial()
{
  pack_initial();
  process_read    = false;
  recv_state      = 0;
  smc_buffer_size = 0;
  var smc_send    = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function create_admin()
{
  clear_smc_val();
  smc_val.card_type = cards.admin;
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;
  process_read      = false;
  recv_state        = 0;
  smc_buffer_size   = 0;
  var smc_send      = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function create_reading()
{
  clear_smc_val();
  smc_val.card_type = cards.reading;
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;
  smc_val.card_remake++;
  if (smc_val.card_remake > 255)
  {
    smc_val.card_remake = 0;
  }
  process_read      = false;
  recv_state        = 0;
  smc_buffer_size   = 0;
  var smc_send      = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function create_reset()
{
  clear_smc_val();
  smc_val.card_type = cards.reset;
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;
  smc_val.card_remake++;
  if (smc_val.card_remake > 255)
  {
    smc_val.card_remake = 0;
  }
  process_read      = false;
  recv_state        = 0;
  smc_buffer_size   = 0;
  var smc_send      = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function create_master_reset()
{
  clear_smc_val();
  smc_val.card_type = cards.master_reset;
  var now = new Date();
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;
  smc_val.card_remake++;
  if (smc_val.card_remake > 255)
  {
    smc_val.card_remake = 0;
  }
  process_read      = false;
  recv_state        = 0;
  smc_buffer_size   = 0;
  var smc_send      = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function create_extended()
{
  clear_smc_val();
  smc_val.card_type = cards.extended;
  var now = new Date();
  smc_val.warning_unit     = parseInt($('#extended_warning_unit').val());
  smc_val.emer_unit        = parseInt($('#extended_emer_unit'   ).val());
  smc_val.create_date_day  = parseInt( now.getDate()    )       ;
  smc_val.create_date_month= parseInt( now.getMonth()   ) + 1   ;
  smc_val.create_date_year = parseInt( now.getFullYear()) % 100 ;
  smc_val.create_date_hour = parseInt( now.getHours()   )       ;
  smc_val.create_date_min  = parseInt( now.getMinutes() )       ;
  smc_val.create_date_sec  = parseInt( now.getSeconds() )       ;
  process_read      = false;
  recv_state        = 0;
  smc_buffer_size   = 0;
  var smc_send      = [ smc_func['connect'] ];
  smc_send_fn( smc_send, smc_send.length );
}

function MODBUSRTU_CRC(buf, len)
{
  var crc = 0xFFFF            ;
  var pos                     ;
  var i                       ;
  var CRC16_MODBUSRTU = 0xA001;

  for (pos = 0; pos < len; pos++)
  {
    crc ^= ((buf[pos]>>>0) & 0xFF); // XOR byte into least sig. byte of crc

    for (i = 8; i != 0; i--)
    {   // Loop over each bit
      if ((crc & 0x0001) != 0)
      { // If the LSB is set
        crc >>= 1;               // Shift right and XOR 0xA001
        crc  ^= CRC16_MODBUSRTU;
      }
      else
      {                     // Else LSB is not set
        crc >>= 1;               // Just shift right
      }
    }
  }
  // Note,
  // this number has low and high bytes swapped,
  // so use it accordingly (or swap bytes)
  return crc;
}

function updateProgress( val )
{
  var percent     = parseInt( val ) * parseFloat( 100. ) / parseFloat( 59. );
  //alert(percent);
  var percent_str = percent + '%';
  //alert(percent_str);
  $('.status').animate( { width: percent_str }, 0);
}
