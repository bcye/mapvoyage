import mysql, { Connection } from "mysql2/promise";

// Create the connection pool. The pool-specific settings are the defaults
const connection = new Promise<Connection>((res, rej) =>
  setTimeout(() => {
    console.log("timeout");
    mysql
      .createConnection(process.env.DATABASE_URL!)
      .then((conn) => {
        console.log("connected");
        res(conn);
      })
      .catch(rej);
  }, 10000),
);

export default connection;
