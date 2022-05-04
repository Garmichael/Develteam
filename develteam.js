let express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express(),
    server = undefined,
    io = undefined,
    http = require('http'),
    socketHandler = require('./modules/module_socketHandler'),
    compression = require('compression'),
    mcache = require('memory-cache'),
    _ = require('underscore');

let cache = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url;
        let cachedBody = mcache.get(key);
        if (cachedBody) {
            res.send(cachedBody);
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body)
            };
            next()
        }
    }
};

global.appRoot = path.resolve(__dirname);
let connections = [];

let setup = {
    setupEngine: function () {
        app.use(compression())
            .use(favicon(__dirname + '/public/favicon.ico'))
            .set('view engine', 'ejs')
            .use(morgan('dev'))
            .use(bodyParser.json()).use(bodyParser.urlencoded({extended: false}))
            .use(cookieParser())
            .use(
                express.static(
                    path.join(__dirname, '/public'),
                    {
                        maxAge: 86400000 * 30, expires: Date.now() + (86400000 * 30),
                        setHeaders: (res, path) => {
                            res.setHeader('Expires', new Date(Date.now() + (86400000 * 30)))
                        }
                    }
                )
            );
    },

    setupServer: function () {
        app.set('port', 1337);
        app.set('charset', 'utf8');

        server = require('http').createServer(app);
    },

    setupSocketIO: function () {
        io = require('socket.io')(server);
        socketHandler.setIoInstance(io);

        io.on('connection', function (socket) {
            connections.push(socket);

            console.log(' ╔═══════════════════════════════════════╗');
            console.log(' ║  ADD Socket: ' + socket.id);
            console.log(' ║  Total Sockets: ' + connections.length);
            console.log(' ╚═══════════════════════════════════════╝');

            socketHandler.getIoInstance().emit('serverReconnect');

            socket.on('setUserSocketData', function (user) {
                socket.userInfo = user;
                socket.join('user_' + user.passkey);
            });

            socket.on('unsetUserSocketData', function () {
                socket.userInfo = undefined;
            });

            socket.on('joinedRoom', function (room) {
                socket.join('chatroom_' + room);
            });

            socket.on('leftRoom', function (room) {
                socket.leave(room);
            });

            socket.on('disconnect', function (data) {
                connections.splice(connections.indexOf(socket), 1);

                console.log(' ╔═══════════════════════════════════════╗');
                console.log(' ║  DEL Socket: ' + socket.id);
                console.log(' ║  Total Sockets: ' + connections.length);
                console.log(' ╚═══════════════════════════════════════╝');
            });
        });

        setInterval(function () {
            if (io) {
                let onlineUsers = {};

                _.each(io.sockets.sockets, function (socketInfo) {
                    if (socketInfo.userInfo) {
                        onlineUsers[socketInfo.userInfo.passkey] = socketInfo.userInfo;
                    }
                });

                let output = [];

                _.each(onlineUsers, function (onlineUser) {
                    output.push({
                        id: onlineUser.id,
                        alias: onlineUser.alias,
                        stringUrl: onlineUser.stringUrl,
                        hasAvatar: onlineUser.hasAvatar
                    });
                });

                io.emit('onlineUsersUpdate', output);
            }
        }, 1000);
    },

    startServer: function () {
        server.listen(app.get('port'), function () {
            console.log("Server Booted Up on Port: " + app.get('port'));
        });
    },

    setupRouting: function () {
        require("./modules/module_routing")(app, cache);
    },
};

setup.setupEngine();
setup.setupServer();
setup.setupSocketIO();
setup.startServer();
setup.setupRouting();


