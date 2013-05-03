/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , io = require('socket.io')
    , _ = require('underscore')
    , colConsole = require('colorize').console;

var app = express();
var users = [];

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use('/public/', express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
io = io.listen(server);

setSocketListeners(io);

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

function setSocketListeners(io) {
    io.sockets.on('connection', function (socket) {
        socket.on('send_message_to_server', function (data) {
            socket.get('username', function (err, name) {
                if (err) {
                    io.sockets.emit('send_message_to_clients', {text: data.text});
                    return;
                }
                io.sockets.emit('send_message_to_clients', {text: name + ': ' + data.text});
            });
        });

        socket.on('user_login', function (data) {
            socket.set('username', data.username);
            users[data.username] = socket;
            io.sockets.emit('broadcast_users', _.keys(users));
        });

        socket.on('disconnect', function () {
            socket.get('username', function (err, name) {
                if (err) {
                    return;
                }
                delete users[name];
                io.sockets.emit('broadcast_users', _.keys(users));
            });
        });
    });
}