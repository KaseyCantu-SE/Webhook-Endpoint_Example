const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Custom end-point created to handle incoming webhook data from ShipEngine's Tracking webhook.
app.post('/consume-webhooks', function (req, res) {
  res.json({request: 'Accepted'}); // Sending generic response when request is made.
  console.log(req.body); // Logs request body to console for visualization of incoming data.
  let f = req.body; // Converts incoming data into JSON and stores it variable 'f'.
  let t = new Date().toString(); // Gets current day, date, and time and stores it in variable 't'.

  // Creates a write stream process to write incoming webhook payload to a .txt file, in a production setting
  // You will write to your database or data store of choice here; we are writing to a file.
  let stream = fs.createWriteStream('./Webhook-Data.txt', {flags: 'a'});
  stream.write('\n' + `${t} - ShipEngine Webhook Message:\n` + JSON.stringify(f, null, 4) + '\n');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
