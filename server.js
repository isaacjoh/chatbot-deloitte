/* =================================================================================================
 * Module dependencies
================================================================================================= */

var express = require('express'),
    http = require('http'),
    livereload = require('connect-livereload');
    path = require('path');

var app = module.exports = express();

app.engine('html', require('ejs').renderFile);

/* =================================================================================================
* Configuration
================================================================================================= */

// All environments
app.use(express.static(__dirname));
app.set('view engine', 'html');
app.set('views', path.join(__dirname));
app.set('port', process.env.PORT || 3000);
app.use(livereload());


/* =================================================================================================
* Routes
================================================================================================= */

app.get('*', function(request, resolve) {
  resolve.render('index');
});

/* =================================================================================================
* Start Server
================================================================================================= */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});