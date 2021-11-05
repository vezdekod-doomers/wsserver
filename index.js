var port = 8002;
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: port, host: '0.0.0.0' });

console.log('listening on port: ' + port);

var connections = {};
var idCounter = 0;

wss.on('connection', function connection(ws) {
    var groups = []
    var id = idCounter++;
    ws.on('ping', function() {
        ws.pong()
    })
    ws.on('message', function(message) {
        console.log(id + '/message: ' + message);
        if (message === '!ping') {
            ws.send('!pong')
        } else if (message.startsWith('join:')) {
            var group = message.substring(5)
            if (!connections[group]) {
                connections[group] = []
            }
            groups.push(group)
            connections[group].push(ws)
        } else if (message.startsWith('bcast:')) {
            var msg = message.substring(6)
            for (const g of groups) {
                for (const c of connections[g]) {
                    if (c === ws) continue;
                    c.send(msg)
                }
            }
        }
    });
    ws.on('close', function () {
        console.log(id + '/client disconnected!');
        for (const g of groups) {
            connections[g].splice(connections[g].indexOf(ws), 1)
        }
    })

    console.log(id + '/new client connected!');
});
