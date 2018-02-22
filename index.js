var HttpServer = require('./lib/httpServer.js');
var log = require('./lib/logger.js');


// Create a httpserver entrypoint
var server = new HttpServer({log}, function(){
  log.trace('Started logging on ', server.port);
});

// Add a handler which converts to serverApi function calls
server.addHandler('/', function(params, cb, req, res){
  if(!params.body.action || !serverApi[params.body.action])
    return cb(new Error('Unknown action'));
  return serverApi[params.body.action](params.body.params, params, cb, req, res);
});

// close server when we receive signal
process.on('SIGTERM', function(){
  log.trace('Received SIGTERM, closing httpserver');
  server.server.close();
});



var serverApi = {};

// specify the functions the server supplies here
serverApi.Test = function(params, ctx, cb){
  cb(null, "Test Success!!");
};
