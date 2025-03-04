import mysql, { Connection } from "mysql2/promise";

// Create the connection pool. The pool-specific settings are the defaults
const connection = new Promise<Connection>((res, rej) =>
  setTimeout(
    () =>
      mysql.createConnection(process.env.DATABASE_URL!).then(res).catch(rej),
    20000,
  ),
);

export default connection;
