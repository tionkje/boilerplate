var util = require('../Util.js');
var WebSocketServer = require('ws').Server;

var wss;
var eventListeners = [];
var connections = {};
var log;

function Init(conf){
  log = conf.log;
  // add listener to print everything
  eventListeners.push(function(eventName, data, conn){
    if(!data.nolog) conn.log.trace(conn.log.colors.recv+'RECV<', eventName, data);
  });
  wss = new WebSocketServer(conf);

  wss.on('connection', function connection(ws) {
    var connId = util.makeid();
    var connection = connections[connId] = {
      ws:ws, connId:connId, remoteAddress:ws.upgradeReq.headers['x-forwarded-for'] || ws.upgradeReq.connection.remoteAddress,
      log:log.child(connId+log.colors.transport)
    };
    if(conf.validateConnection){
      return conf.validateConnection(connection, function(err, res){
        if(!err && res) connected();
        else {
          connection.log.warn('Denied connection', err, res);
          ws.close();
        }
      })
    } else connected();

    function connected(){
      eventListeners.forEach(function(f){ f('connected', {ip:connection.remoteAddress}, connection); });
      ws.on('message', function incoming(message) { 
        if(message == 'ping') return ws.send('pong');
        var data;
        try{
          data = JSON.parse(message);
        } catch(e){
          data = {event:'error', data:{info:'Failed to Parse', err:e, message:message}};
        }

        if(!data.eventName || !data.data) return connection.log.warn('Received invalid message', message);

        eventListeners.forEach(function(f){ f(data.eventName, data.data, connection); })
      });

      ws.on('error', function(err){
        connection.log.error({connId:connId, err:err}, 'Websocket Failed');
        throw err;
      });

      ws.on('close', function(code, message){
        delete connections[connId];
        eventListeners.forEach(function(f){ f('disconnected', {connId, code, message}, connection); });
      });
    }
  });

  wss.on('error', function(err){
    log.fatal(err, 'Websocket Server Failed');
    throw err;
  });
}

function _send(connId, data){
  if(!connections[connId]) {
    log.warning('connId:'+connId+' does not exist');
    return false;
  }
  connections[connId].ws.send(data);
  return true;
}

function sendEvent(connId, eventName, data, noLog){
  if(!noLog && !data.nolog && connections[connId]) connections[connId].log.trace(log.colors.send+'SEND>', eventName, data);
  return _send(connId, JSON.stringify({eventName, data}));
}

function broadcast(eventName, data, nolog){
  if(!nolog && !data.nolog) log.trace('BRDCST>', Object.keys(connections).length, eventName, data);
  var sendData = JSON.stringify({eventName, data});
  Object.keys(connections).forEach(function(connId){
    _send(connId, sendData);
  });
}

function addEventListener(listener){
  eventListeners.push(listener);
}

function removeEventListener (listener){
  var idx = eventListeners.indexOf(listener);
  if(idx == -1) throw new Error('listener not found');
  eventListeners.splice(idx,1);
}

function getConnections(){ 
  return Object.keys(connections).map(c=>({connId:connections[c].connId, ip:connections[c].remoteAddress})); 
}

exports.Init = Init;
exports.send= sendEvent;
exports.sendEvent = sendEvent;
exports.broadcast = broadcast;
exports.addListener = addEventListener;
exports.addEventListener = addEventListener;
exports.removeListener = removeEventListener;
exports.removeEventListener = removeEventListener;
exports.getConnections = getConnections;
