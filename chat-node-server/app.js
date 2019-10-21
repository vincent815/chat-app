const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Redis = require('redis');
const sub = Redis.createClient(6379, process.env.REDIS || '127.0.0.1');
const pub = Redis.createClient(6379, process.env.REDIS || '127.0.0.1');

sub.psubscribe("redis-*");

http.listen(3000, '0.0.0.0', function(){
  console.log('listening on 0.0.0.0:3000');
});

app.get('/', function(req, res){
  res.send(process.env.MESSAGE);
});

io.on('connection', function(socket){
  let currentUser = '';

  /**
   * Listen to Redis events and emit to socket-client
   */
  sub.on("pmessage", function(_, channel, data) {
    if (data) {
      const parseData = JSON.parse(data);
      if (channel === 'redis-message-sent') {
        // emit message to user
        console.log(data);
        io.emit('message-receive', parseData);
      } else if (channel === 'redis-typing') {
        // emit to others that user is typing
        io.emit('typing-' + parseData.user, parseData);
      } else if (channel === 'redis-online') {
        // tell everyone that user is online
        io.emit('is-online', parseData);
      } else if (channel === 'redis-disconnected') {
        // user disconnected
        io.emit('disconnected', parseData);
      }
    }
  });

  /**
   * Listen to socket-client events and emit to Redis
   */
  // check online
  socket.on('online', function(data) {
    // attach specific socket id to user
    currentUser = data.user;
    data.socketId = socket.id
    console.log('online => ' + currentUser);
    pub.publish('redis-online', JSON.stringify(data));
  });

  socket.on('disconnect', function() {
    pub.publish('redis-disconnected', JSON.stringify({'user': currentUser, 'socketId': socket.id}));
  });

  socket.on('message-sent', (data) => {
    data.socketId = socket.id
    pub.publish('redis-message-sent', JSON.stringify(data));
  });

  socket.on('typing', (data) => {
    data.socketId = socket.id
    pub.publish('redis-typing', JSON.stringify(data));
  });
});