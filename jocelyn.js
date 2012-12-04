// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
//Johnny-Five
var five = require("./johnny-five/lib/johnny-five.js"),
    board;

board = new five.Board();

board.on("ready", function() {

  temperature = new five.Sensor({
    pin: "A0"
  });


  board.repl.inject({
    temp: temperature
  });

  temp.on('change', function(err, voltage){
    var volts = voltage * 0.004882814;
    var tempF = (((volts - 0.5) * 100) * 1.8) + 32;

    //if the temp falls below 77 post the info
    //to the web service
    if (tempF < 74) {
      PostCode(tempF);
    };
    
  });

});

function PostCode(codestring) {
  // Build the post string from an object
  var post_data = querystring.stringify({
      'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
      'output_format': 'json',
      'output_info': 'compiled_code',
        'warning_level' : 'QUIET',
        'js_code' : codestring
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'jocelynsRoom.dev',
      port: '80',
      path: '/',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}
