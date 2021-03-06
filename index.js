'use strict';

const express           = require('express');
const app               = express();
const session           = require('express-session')({
    secret: 'chatsomeIsAwesome!',
    resave: true,
    saveUninitialized: true
});
const socketsession     = require('express-socket.io-session');
const http              = require('http').Server(app);
const io                = require('socket.io')(http);
const messaging         = require('./app/server/messaging.js');

const bunyan            = require('bunyan');
const expressBunyan     = require('express-bunyan-logger');

// LOGGING
const bunyanConfig = {
    name: 'ChatSome'
};
const expressBunyanConfig = {
    name: 'ChatSome',
    excludes: [
        'user-agent',
        'body',
        'short-body',
        'req-headers',
        'res-headers',
        'req',
        'res',
        'incoming',
        'response-hrtime'
    ]
};
const log = bunyan.createLogger(bunyanConfig);

// MIDDLEWARE
app.use(expressBunyan(expressBunyanConfig));
app.use(expressBunyan.errorLogger(expressBunyanConfig));

    // SESSION MIDDLEWARE
app.use(session);
io.use(socketsession(session, {
    autoSave:true
}));

// ENDPOINTS

//Frontend static files
app.use('/public', express.static(__dirname + '/app/public'));

// Fallthrough
app.use('/', express.static(__dirname + '/app/pages'));


//Start the HTTP server on port 3000
http.listen(process.env.PORT || 3000, function(){
    log.info('listening on *:' + (process.env.PORT || 3000));
});

//Handle messaging on the broadcast channel
messaging.handle_messaging(io, log);

module.exports = app;
