var credentials = require('./Matt_credentials.json');
var mysql = require("mysql");
var user = credentials.user;
credentials.host="ids";

var connection = mysql.createConnection(credentials);
var data = {};
var processed = {}

sql = "SHOW DATABASES";
connection.query(sql, function(err, rows, fields){
  if(err){
    console.log('Error Looking up databases ' + user);
    connection.end();
  }
  else{
    processDBFs(rows); //Gets Called once... so its safe!
  }
});

function processDBFs(dbfs){
  for(var index in dbfs){
    var dbf = dbfs[index].Database;
    var sql = "SHOW TABLES IN " +dbf;
    data[dbf] = Number.POSITIVE_INFINITY;
    connection.query(sql, (function(dbf){
      return function(err, tables, fields){
        if(err){
          console.log("Error finding tables in dbf" + dbf);
          connection.end();
        }else{
          processTables(tables, dbf);
        }
      };
    })(dbf));
  }
}


function processDBFs(dbfs){
  for(var index in dbfs){
    var dbf = dbfs[index].Database;
    var sql = "SHOW TABLES IN " +dbf;
      data[dbf] = Number.POSITIVE_INFINITY; //Make sure the value exists, but it not yet set so we can process later.
      connection.query(sql, (function(dbf){
        return function(err, tables, fields){
	  if(err){
	    console.log("Error finding tables in dbf" + dbf);
	    connection.end();
	  } else {
	    processTables(tables, dbf);
	  }
	};
      })(dbf));
  }
}

function processTables(tables,dbf){ // Asynchronous row handler
  data[dbf] = tables.length; // Now it is set
  processed[dbf] = 0;        // And has not yet been used as a label
  for(var index in tables){
    var tableObj = tables[index];
    for(key in tableObj){
      var table = tableObj[key];
      table = dbf+"."+table;
      var sql = 'DESCRIBE '+table;
      connection.query(sql, (function(table,dbf){
        return function(err,desc,fields){
          if(err){
            console.log('Error describing table '+ table);
          } else {
            processDescription(desc,table,dbf);
          }
        };
      })(table,dbf));
    }
  }
}

function processDescription(desc,table,dbf){
  data[dbf]--; //Processed one tables
  if(processed[dbf]==0){
    processed[dbf] = 1;
    console.log('---|' + dbf + '>');
  }
  console.log('.....|' + dbf + '.' + table + '>');
  desc.map(function(field){ //Shows the fields nicely
    console.log("\t FieldName: `"+field.Field+"`  \t("+field.Type+")");
  });
  if(allZero(data)){connection.end()}
}

function allZero(object) {
  allzero = true;
  for(obj in object){
    if(object[obj] !=0){allzero = false}
  }
  return(allzero);
}
