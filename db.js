/** Database setup for BizTime. */
//process.env.PGUSER = 'postgres';
const pass = require("./password")
process.env.PGPASSWORD = pass;
const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

let db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;