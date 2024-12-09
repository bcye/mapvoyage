import mysql, { Connection } from "mysql2/promise";

// Create the connection pool. The pool-specific settings are the defaults
const connection = mysql.createConnection(process.env.DATABASE_URL!);

export default connection;
