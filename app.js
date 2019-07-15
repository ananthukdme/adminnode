var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongodb = require('mongodb');
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var config = require('./config/dbConfig')
var app = express();
var cors = require('cors');
// view engine setup
var server = app.listen(process.env.PORT || 8081, function () {
  var port = server.address().port

  console.log('App now running on http://localhost:' + port)})
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');
var bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
 app.use(logger('dev'));
app.use(express.json());
 app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
 app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
var db
//mongodb connection
mongodb.MongoClient.connect(config.dbString, function (err, database) {
  if (err) {
    console.log(err)
    console.log('Database connection error')
  } else {
    // Save database object from the callback for reuse.
    db = database
   
    console.log('Database connection ready')}
    require('./router')(app,db)
   
  })
  var originsWhitelist = [
  'http://localhost:4200']
  
  var corsOptions = {
    origin: function (origin, callback) {
      var isWhitelisted = originsWhitelist.indexOf(origin) !== -1
      callback(null, isWhitelisted)
    },
    credentials: true
  }
  // here is the magic
  app.use(cors(corsOptions))
  
// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
