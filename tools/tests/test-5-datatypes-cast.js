/*
Copyright (C) 2010, Oleg Efimov <efimovov@gmail.com>

See license text in LICENSE file
*/

// Load configuration
var cfg = require("../config").cfg;

// Require modules
var
  sys = require("sys"),
  mysql_libmysqlclient = require("../../mysql-libmysqlclient");

exports.createTestTableComplex = function (test) {
  test.expect(3);
  
  var
    conn = mysql_libmysqlclient.createConnectionSync(cfg.host, cfg.user, cfg.password, cfg.database),
    res,
    tables;

  conn.querySync("DROP TABLE IF EXISTS " + cfg.test_table + ";");
  conn.querySync("CREATE TABLE " + cfg.test_table +
    " (autoincrement_id BIGINT NOT NULL AUTO_INCREMENT," +
    " size ENUM('small', 'medium', 'large')," +
    " colors SET('red', 'green', 'blue')," +
    " PRIMARY KEY (autoincrement_id)) TYPE=MEMORY;");
  res = conn.querySync("SHOW TABLES");
  tables = res.fetchAllSync();
  
  test.ok(res.fieldCount === 1, "SHOW TABLES result field count === 1");
  test.ok(tables.some(function (r) {
    return r['Tables_in_' + cfg.database] === cfg.test_table;
  }), "Find the test table in result");
  
  res = conn.querySync("INSERT INTO " + cfg.test_table +
                   " (size, colors) VALUES ('small', 'red');");
  res = conn.querySync("INSERT INTO " + cfg.test_table +
                   " (size, colors) VALUES ('medium', 'red,green,blue');") && res;
  res = conn.querySync("INSERT INTO " + cfg.test_table +
                    " (size, colors) VALUES ('large', 'green');") && res;
  res = conn.querySync("INSERT INTO " + cfg.test_table +
                   " (size, colors) VALUES ('large', 'red,blue');") && res;
  test.ok(res, "conn.querySync('INSERT INTO test_table ...')");
  
  conn.closeSync();
  
  test.done();
};

exports.fetchDateAndTimeValues = function (test) {
  test.expect(9);
  
  var
    conn = mysql_libmysqlclient.createConnectionSync(cfg.host, cfg.user, cfg.password, cfg.database),
    rows;
  
  test.ok(conn, "mysql_libmysqlclient.createConnectionSync(host, user, password, database)");

  rows = conn.querySync("SELECT CAST('2000-01-01' AS DATE) as date;").fetchAllSync();
  test.ok(rows[0].date instanceof Date, "SELECT CAST('2000-01-01' AS DATE) is Date");
  test.equals(rows[0].date.toUTCString(), "Sat, 01 Jan 2000 00:00:00 GMT", "SELECT CAST('2000-01-01' AS DATE) is correct");
  //console.log(rows[0].date.toUTCString());
  //console.log("Expected Sat, 01 Jan 2000 00:00:00 GMT");

  rows = conn.querySync("SELECT CAST('2 2:50' AS TIME) as time;").fetchAllSync();
  test.ok(rows[0].time instanceof Date, "SELECT CAST('2 2:50' AS TIME) is Date");
  test.equals(rows[0].time.toUTCString(), "Sat, 03 Jan 1970 02:50:00 GMT", "SELECT CAST('2 2:50' AS TIME) is correct");
  //console.log(rows[0].time.toUTCString());
  //console.log("Expected Sat, 03 Jan 1970 02:50:00 GMT");

  rows = conn.querySync("SELECT CAST('1988-10-25 06:34' AS DATETIME) as datetime;").fetchAllSync();
  test.ok(rows[0].datetime instanceof Date, "SELECT CAST('1988-10-25 06:34' AS DATETIME) is Date");
  test.equals(rows[0].datetime.toUTCString(), "Tue, 25 Oct 1988 06:34:00 GMT", "SELECT CAST('1988-10-25 06:34' AS DATETIME) is correct");
  //console.log(rows[0].datetime.toUTCString());
  //console.log("Expected Tue, 25 Oct 1988 06:34:00 GMT");

  rows = conn.querySync("SELECT CAST('1988-10-25' AS DATETIME) as datetime;").fetchAllSync();
  test.ok(rows[0].datetime instanceof Date, "SELECT CAST('1988-10-25' AS DATETIME) is Date");
  test.equals(rows[0].datetime.toUTCString(), "Tue, 25 Oct 1988 00:00:00 GMT", "SELECT CAST('1988-10-25' AS DATETIME) is correct");
  //console.log(rows[0].datetime.toUTCString());
  //console.log("Expected Tue, 25 Oct 1988 00:00:00 GMT");

  conn.closeSync();
  
  test.done();
};

exports.fetchSetValues = function (test) {
  test.expect(5);
  
  var
    conn = mysql_libmysqlclient.createConnectionSync(cfg.host, cfg.user, cfg.password, cfg.database),
    rows;
  
  test.ok(conn, "mysql_libmysqlclient.createConnectionSync(host, user, password, database)");

  rows = conn.querySync("SELECT size, colors FROM " + cfg.test_table + " WHERE size='small';").fetchAllSync();
  test.ok(rows[0].colors instanceof Array, "SET fetched result is Array");
  test.same(rows[0].colors, ['red'], "SET fetched result is correct");

  rows = conn.querySync("SELECT size, colors FROM " + cfg.test_table + " WHERE size='medium';").fetchAllSync();
  test.ok(rows[0].colors instanceof Array, "SET fetched result is Array");
  test.same(rows[0].colors, ['red', 'green', 'blue'], "SET fetched result is correct");

  conn.closeSync();
  
  test.done();
};

