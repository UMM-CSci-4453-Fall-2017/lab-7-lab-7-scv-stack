Promise = require('bluebird')
mysql = require('mysql')
DBF = require('./Matt_Mitchell.dbf-setup.js')

var getDatabases = function() { // Returns a promise that can tak a handler ready to process the results
  var sql = "SHOW DATABASES";
  return DBF.query(mysql.format(sql)); // Return a Promise
}

var processDBFs = function(queryResults){ // Returns a promes that foces all dbfPromises to reslvoed before .thening()
  var dbfs = queryResults;
  return(Promise.all(dbfs.map(dbfToPromise)).then(processTables));
}

var processTables = function(results){ //Retuns a promes that foces all teble description Promioes to reslove befoe .thening()
  var descriptionPromises = results.map(tableAndDbfToPromise);
  var allTables = Promise.all(descriptionPromises).then(function(results){return(results)});
  return(allTables);
}

var dbfToPromise = function(dbfObj){
  var dbf = dbfObj.Database;
  var sql = mysql.format("SHOW TABLES IN ??", dbf);
  var queryPromise = DBF.query(sql)
  queryPromise = queryPromise.then(function(results){return({table:results, dbf:dbf})});
  return(queryPromise);
}

var tableAndDbfToPromise=function(obj){
  var dbf=obj.dbf;
  var tableObj=obj.table;
  var key = "Tables_in_"+dbf;

  var tables=tableObj.map(function(val){return(val[key])})
  var describeTable=function(val,index){

    var table=dbf+"."+val;
    var printer=function(results){
      var desc=results;
      if(index==0){console.log("---|",dbf,">")};
      console.log(".....|"+table,">");
      desc.map(function(field){ // show the fields nicely
        console.log("\tFieldName: `"+field.Field+"` \t("+field.Type+")");
      })
    }
    var describeSQL=mysql.format("DESCRIBE ??",table);
    var promise=DBF.query(describeSQL).then(printer);
    return(promise);
  }
  var describePromises = tables.map(describeTable);
  return(Promise.all(describePromises))
}

var dbf=getDatabases()
.then(processDBFs)
.then(DBF.releaseDBF)
.catch(function(err){console.log("DANGER:",err)});
