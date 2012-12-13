"option strict";
var
    util = require('util'),
    nest = require('./lib/unofficial_nest.js');

//Johnny-Five
var five = require("./johnny-five/lib/johnny-five.js"),
    board;
//this is ugly and should be done a different way
var targetTemp = 69;
var tempF = '';

var username = process.argv[2];
var password = process.argv[3];

board = new five.Board();

board.on("ready", function() {

  temperature = new five.Sensor({
    pin: "A0"
  });

  board.repl.inject({
    temp: temperature
  });

  //it would be nice to make this only check at a set interval

  console.log('temp',temp);

  temp.on('change', function(err, voltage){
    var volts = voltage * 0.004882814;
    tempF = (((volts - 0.5) * 100) * 1.8) + 32;
    console.log('tempF', tempF);
    });
    
});

function trimQuotes(str) {
    if (!str || str.length === 0) {
        return '';
    }
    var c = str.charAt(0);
    var start = (c === '\'' || c === '"') ? 1 : 0;
    var end = str.length;
    c = str.charAt(end - 1);
    end -= (c === '\'' || c === '"') ? 1 : 0;
    return str.substring(start, end);
}

function merge(o1, o2) {
    o1 = o1 || {};
    if (!o2) {
        return o1;
    }
    for (var p in o2) {
        o1[p] = o2[p];
    }
    return o1;
}

if (username && password) {
    username = trimQuotes(username);
    password = trimQuotes(password);
    nest.login(username, password, function (data) {
        if (!data) {
            console.log('Login failed.');
            process.exit(1);
            return;
        }
        console.log('Logged in.');
        nest.fetchStatus(function (data) {
            for (var deviceId in data.device) {
                if (data.device.hasOwnProperty(deviceId)) {
                    var device = data.shared[deviceId];
                    console.log(util.format("%s [%s], Current temperature = %d F target=%d",
                        device.name, deviceId,
                        nest.ctof(device.current_temperature),
                        nest.ctof(device.target_temperature)));
                }
            }
            //subscribe();
        });
    });
}

function subscribe() {
    nest.subscribe(subscribeDone, ['shared', 'energy_latest']);
}

function subscribeDone(deviceId, data, type) {
    // data if set, is also stored here: nest.lastStatus.shared[thermostatID]
    if (deviceId) {
        console.log('Device: ' + deviceId + " type: " + type);
        console.log(JSON.stringify(data));
        console.log('targetTemp', targetTemp);
        //nest.setTemperature(deviceId, nest.ftoc(targetTemp));
    } else {
        console.log('No data');
    }
    setTimeout(subscribe, 2000);
}