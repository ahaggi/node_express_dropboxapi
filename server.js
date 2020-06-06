
const express = require('express');
const app = express();

var Dropbox = require('dropbox').Dropbox
var fs = require('fs');
var path = require('path');
require('isomorphic-fetch'); // or another library of choice.

var _Drop_box = require('dropbox').Dropbox;
var dbx = new _Drop_box({ accessToken: 'rDngjYV7g6IAAAAAAAAMoNL6AlC3iQ2KRj9yLipY5rD6yFIoh2zqwJB6e7XzzneF' });

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));

  console.log("Cookies: ", req.cookies)
  // res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/listfiles', function (req, res) {
  dbx.filesListFolder({path: ''})
    .then(function(response) {
      res.end(JSON.stringify(response, null, "\t"));
    })
    .catch(function(error) {
      console.log(error);
    });
})


app.get('/getinfo', function (req, res) {
  dbx.usersGetAccount({path: ''})
    .then(function(response) {
      res.end(JSON.stringify(response, null, "\t"));
    })
    .catch(function(error) {
      console.log(error);
    });
})






var fs = require("fs");
var multer = require('multer');

var _storage = multer.memoryStorage()
var upload = multer({ storage: _storage })

// app.use(multer({dest:'./tmp/'}).single('avatar'));    app.post('/file_upload',  function (req, res) {
app.post('/file_upload_memoryStorage', upload.single('avatar'), function (req, res) {


  var bufferFile = req.file.buffer ;
  var outputFile =  req.file.originalname;

        // This uploads basic.js to the root of your dropbox
        dbx.filesUpload({ path: '/'+ outputFile, contents: bufferFile })
        .then(function (response) {
          res.end(JSON.stringify(response, null, "\t"));

        })
        .catch(function (err) {
          console.log(err);
        });
})


var server = app.listen(8082)

