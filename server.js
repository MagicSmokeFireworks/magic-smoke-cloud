
var http = require('http');

var spa_sw_arm = 'no data';
var spa_hw_arm = 'no data';
var spa_res = ['no data','no data','no data','no data','no data','no data','no data','no data'];
var spa_wifi_rssi = 'no data';

http.createServer(function(request, response) {
  request.on('error', function(err) {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });
  response.on('error', function(err) {
    console.error(err);
  });
  if (request.method === 'POST' && request.url === '/status') {
    var body = [];
    request.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      myStatus = JSON.stringify(request.headers);
      if (request.headers.id === '210043000347343138333038') {
        spa_sw_arm = request.headers.sw_arm;
        spa_hw_arm = request.headers.hw_arm;
        spa_res[0] = request.headers.r0;
        spa_res[1] = request.headers.r1;
        spa_res[2] = request.headers.r2;
        spa_res[3] = request.headers.r3;
        spa_res[4] = request.headers.r4;
        spa_res[5] = request.headers.r5;
        spa_res[6] = request.headers.r6;
        spa_res[7] = request.headers.r7;
        spa_wifi_rssi = request.headers.wifi_rssi;
      }
      //myStatus = body;
      response.end();
    })
  } else if (request.method === 'GET' && request.url === '/status') {
    var body = [];
    request.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      response.write("I know it's illegal, but it's the weekend!\n\n");
      response.write("Shemale Porn Addiction:\n");
      response.write("HW Arm: " + spa_sw_arm + "\n");
      response.write("SW Arm: " + spa_hw_arm + "\n");
      for (i = 0; i < 8; i++) {
        response.write("Res"+String(i)+": " + spa_res[i] + "\n");
      }
      response.write("WIFI RSSI: " + spa_wifi_rssi + "\n");
      response.end();
    })
  } else {
    response.statusCode = 404;
    response.end();
  }
}).listen(8080);

