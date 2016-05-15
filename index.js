var express = require('express');
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send('success');
});

app.listen(process.env.PORT||3000, function () {
  console.log('Example app listening on port !'+(process.env.PORT||3000));
});
