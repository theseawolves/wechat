var WS_PORT = require('./config').wsPort
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:WS_PORT})

wss.on('connection',function connection(ws){
  ws.on('message',function incoming(message){
    console.log('received: %s',message);
  })

  console.log('new client connnected');
})

wss.broadcast = function broadcast(data){
  wss.clients.forEach(function each(client){
    client.send(JSON.stringify(data))
  })
}

module.exports = {
  wss: wss
}
