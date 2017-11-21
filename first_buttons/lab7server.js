
var express=require('express'),
mysql = require('mysql'),
credentials = require('../node_examples/credentials.json'),
app = express(),
port = process.env.PORT || 1337;

var connection = mysql.createConnection(credentials);
var buttons;
app.use(express.static(__dirname + '/public')); //Serves the web pages
app.get("/buttons",function(req,res){ // handles the /buttons API
  var sql = 'SELECT * FROM fluto006.till_buttons';
  connection.query(sql, (function(res){
    return function(err, rows, fields){
      if(err){
        console.log(err);
      } else {
        res.send(rows);
      }
  }})(res));
});

app.listen(port);
