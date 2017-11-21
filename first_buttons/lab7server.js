var credentials = require("../node_examples/credentials.json");
var mysql = require("mysql");
var Promise = require('bluebird');
var using = Promise.using;
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

var pool = mysql.createPool(credentials); // Setup the connection pool using our credentials.

var getConnection=function(){
  return pool.getConnectionAsync().disposer(
    function(connection){return connection.release();}
  );
};

var query=function(command){
  return using(getConnection(), function(connection){
    return connection.queryAsync(command);
  });
};

sql="select * from fluto006.till_buttons";

var result=query(mysql.format(sql)); //result is a promise
result.then(function(dbfs,err){
  var express=require('express'),
  app = express(),
  port = process.env.PORT || 1337;

  var buttons = JSON.stringify(dbfs);

  app.use(express.static(__dirname + '/public')); //Serves the web pages
  app.get("/buttons",function(req,res){ // handles the /buttons API
    res.send(buttons);
  });

  app.listen(port);
}).then(function(){pool.end()});
