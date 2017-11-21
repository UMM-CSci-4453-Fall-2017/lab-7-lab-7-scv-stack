var credentials = require('./Matt_credentials.json');

mysql = require("mysql");
express = require('express');
Promise = require('bluebird');
var using = Promise.using;
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

credentials.host="ids";
var connection = mysql.createConnection(credentials);

var pool = mysql.createPool(credentials); //Setup the pool useing our credentials

var getConnection = function() {
  return pool.getConnectionAsync().disposer(
    function(connection) {return connection.release();}
  );
};

var query = function(command){
  return using(getConnection(),function(connection){
    return connection.queryAsync(command);
  });
};

var endPool = function(){
  pool.end(function(err){});
}

exports.query = query;
exports.releaseDBF = endPool;
