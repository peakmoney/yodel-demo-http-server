var express    = require('express')
  , app        = express()
  , redis      = require('redis').createClient()
  , _          = require('lodash')
  , bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/*', function (req, res) {
  res.sendStatus(400);
});

app.post('/notify', function (req, res) {
  var userId = req.body.user_id;
  var message = req.body.message;
  var payload = req.body.payload;

  if (!userId || _.isNaN(userId)) {
    res.status(406).send("Invalid or missing parameter: user_id");
    return;
  } 

  if (!message || !isString(message)) {
    res.status(406).send("Invalid or missing parameter: message");
    return;
  }

  if (!payload) {
    console.log(payload);
    res.status(406).send("Invalid or missing parameter: payload");
    return;
  }

  var queueRequest = {
    'user_id': userId,
    'message': message,
    'payload': payload,
    'include_notification_key': false
  }

  // Probably need a filter here, but this is just a demo server
  redis.lpush('yodel:notify', JSON.stringify(queueRequest), function(err, data) {
    console.log('yodel:notify', data);

    if (err) {
      console.log(err);
    }

    res.status(200).send('{ "status": "successful" }');

  });

})

app.post('/subscribe', function (req, res) {
  var userId = req.body.user_id;
  var token = req.body.token;
  var platform = req.body.platform;

  if (!userId || _.isNaN(userId)) {
    res.status(406).send("Invalid or missing parameter: user_id");
    return;
  } 

  if (!token || !isString(token)) {
    res.status(406).send("Invalid or missing parameter: token");
    return;
  }

  if (!platform || !isString(platform)) {
    console.log(platform);
    res.status(406).send("Invalid or missing parameter: platform");
    return;
  }

  var queueRequest = {
    'user_id': userId,
    'token': token,
    'platform': platform,
    'send_notification_key': true
  };

  redis.lpush('yodel:subscribe', JSON.stringify(queueRequest), function(err, data) {
    console.log('yodel:subscribe', data);

    if (err) {
      console.log(err);
    }

    res.status(200).send('{ "status": "successful" }');

  });

})

app.post('/unsubscribe', function (req, res) {
  var userId = req.body.user_id;
  var token = req.body.token;
  var platform = req.body.platform || 'android';

  if (!userId || _.isNaN(userId)) {
    res.status(406).send("Invalid or missing parameter: user_id");
    return;
  } 

  if (!token || !isString(token)) {
    res.status(406).send("Invalid or missing parameter: token");
    return;
  }

  if (!platform || !isString(platform)) {
    console.log(platform);
    res.status(406).send("Invalid or missing parameter: platform");
    return;
  }

  var queueRequest = {
    'user_id': userId,
    'token': token,
    'platform': platform
  };

  redis.lpush('yodel:unsubscribe', JSON.stringify(queueRequest), function(err, data) {
    console.log('yodel:unsubscribe', data);

    if (err) {
      console.log(err);
    }

    res.status(200).send('{ "status": "successful" }');

  });

})

var server = app.listen(3000, function () {

  var host = '10.0.1.22' //server.address().address
  var port = server.address().port

  console.log('Yodel demo HTTP server listening at http://%s:%s', host, port)

})

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (err) {
    console.log("JSON Parse Error: " + err);
    return false;
  }
  return true;
}

function isString(obj) {
  return typeof obj == 'string' || obj instanceof String;
}
