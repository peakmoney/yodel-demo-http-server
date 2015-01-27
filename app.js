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
  var data = req.body.data;

  if (!userId || _.isNaN(userId)) {
    res.status(406).send("Invalid or missing parameter: user_id");
    return;
  } 

  if (!data || !isJsonString(data)) {
    console.log(data);
    res.status(406).send("Invalid or missing parameter: data");
    return;
  }

  var queueRequest = {
    'user_id': userId,
    'data': data
  }

  // Probably need a filter here, but this is just a demo server
  redis.lpush('stentor:notify', JSON.stringify(queueRequest), function(err, data) {
    console.log('stentor:notify', data);

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

  if (!token || !(token instanceof String)) {
    res.status(406).send("Invalid or missing parameter: token");
    return;
  }

  if (!platform || !(platform instanceof String)) {
    res.status(406).send("Invalid or missing parameter: token");
    return;
  }

  var queueRequest = {
    'user_id': userId,
    'token': token,
    'platform': platform
  }

  redis.lpush('stentor:subscribe', JSON.stringify(queueRequest), function(err, data) {
    console.log('stentor:subscribe', data);

    if (err) {
      console.log(err);
    }

    res.status(200).send('{ "status": "successful" }');

  });

})

app.post('/unsubscribe', function (req, res) {
  var userId = req.body.user_id;
  var token = req.body.token;

  if (!userId || _.isNaN(userId)) {
    res.status(406).send("Invalid or missing parameter: user_id");
    return;
  } 

  if (!token || !(token instanceof String)) {
    res.status(406).send("Invalid or missing parameter: token");
    return;
  }

  var queueRequest = {
    'user_id': userId,
    'token': token
  }

  redis.lpush('stentor:subscribe', JSON.stringify(queueRequest), function(err, data) {
    console.log('stentor:subscribe', data);

    if (err) {
      console.log(err);
    }

    res.status(200).send('{ "status": "successful" }');

  });

})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Stentor demo HTTP server listening at http://%s:%s', host, port)

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