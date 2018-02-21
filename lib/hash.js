var crypto = require('crypto');
function genRandomString(length){
  return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0,length);   /** return required number of characters */
}

function sha512(password, salt){
  var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
  var value = hash.digest('hex');
  return {
    salt:salt,
    passwordHash:value
  };
}

function hash(password){
  return sha512(password, genRandomString(16));
}

function compare(password, hash, salt){
  if(typeof hash == 'object') { salt = hash.salt; hash = hash.passwordHash; }
  var res = sha512(password, salt);
  return res.passwordHash === hash;
}

module.exports = {hash, compare, genRandomString};
