const express = require('express');
const app = express();

app.use(express.static('public'));

/********************************************************************/
var cookieParser = require('cookie-parser')
app.use(cookieParser())


var url = require('url');

function generateRedirectURI(req) {


    return url.format({
        protocol: req.protocol,
        host: 'localhost:8081',
        pathname: '/success'
    });
}
const crypto = require('crypto');

function generateCSRFToken() {
    return crypto.randomBytes(18).toString('base64').replace(/\//g, '-')
    //.replace(/+/g, '_');
}


app.get('/', function (req, res) {
    var csrfToken = generateCSRFToken();
    res.cookie('csrf', csrfToken);
    var r_uri = generateRedirectURI(req)
    console.log('*********' + r_uri + '*********')
    res.redirect(url.format({
        protocol: 'https',
        hostname: 'www.dropbox.com',
        pathname: '/oauth2/authorize',
        query: {
            client_id: 'u3j9cuok8v64ih1',//App key of dropbox api
            response_type: 'code',
            state: csrfToken,
            redirect_uri: r_uri
        }
    }));
});
var request = require('request');
let session = require('express-session');
app.use(session({ resave: true, secret: '123456', saveUninitialized: true }));

app.get('/success', function (req, res) {
    if (req.query.error) {
        return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
    }
    if (req.query.state !== req.cookies.csrf) {
        return res.status(401).send(
            'CSRF token mismatch, possible cross-site request forgery attempt.'
        );
    }

    request.post('https://api.dropbox.com/oauth2/token', {
        form: {
            code: req.query.code,
            grant_type: 'authorization_code',
            redirect_uri: generateRedirectURI(req)
        },
        auth: {
            user: 'u3j9cuok8v64ih1', //APP_KEY
            pass: 'i3tvcvotkn7txew' //APP_SECRET
        }
    }, function (error, response, body) {
        var data = JSON.parse(body);
        if (data.error) {
            return res.send('ERROR: ' + data.error);
        }
        var token = data.access_token;
        req.session.token = data.access_token;
        request.post('https://api.dropbox.com/2/users/get_current_account', {
            headers: { Authorization: 'Bearer ' + token }
        }, function (error, response, body) {
            var display_name = JSON.parse(body).name.display_name;
            var res_body = JSON.parse(body);

            res.send('Logged in successfully as ' + body + '.');
        });
    });
});
var fs = require("fs");


app.get('/uploadfile', function (req, res) {
    var localpath = __dirname + "/tmp/qwe.png";//path of the file which is to be uploaded
    if (req.query.error) {
        return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
    }
    fs.readFile(localpath, 'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        content = data;
        fileupload(req.session.token, content);
    });
});



function fileupload(token, content) {
    request.post('https://content.dropboxapi.com/2/files/upload', {
        headers: {
            Authorization: 'Bearer ' + token,
            'Dropbox-API-Arg': {
                path: "/qwe.png" ,
                mode: "add",
                autorename: true,
                mute: false
            },

            'Content-Type': 'image/png'
        }, body: content
    }, function optionalCallback(err, httpResponse, bodymsg) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(bodymsg);
        }
    });
}


/********************************************************************/

var server = app.listen(8081)