// if this is run in the browser, overwrite console.log with SERVER prefix
1&&function(){if(typeof GLOBAL == 'undefined'){ ['log', 'warn', 'error'].forEach(function(e){ var _log = console[e]; console[e] = (x=>{_log.apply(console, ['SERVER:'].concat(arguments))}); }); }}
// Carefull, Leaf nodes only

// function makeid(){
//   // need lowercase and not containing / or =
//   var id = crypto.randomBytes(10).toString('base64')
//   .toLowerCase()
//   .replace(/\//g, '_')
//   .replace(/=/g, '');
//   return 'u'+id;
// }

function makeid(len){
  var text = "";
  // var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789_+-";

  for( var i=0; i < (len||10); i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return 'u'+text;
}

function dateID(){
  return new Date().toISOString()+'_'+makeid(2).replace(/_/g, '-');
}

exports.makeid = makeid;
exports.dateID = dateID;
