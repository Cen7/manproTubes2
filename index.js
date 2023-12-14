import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";

const app = express();

const port = 8080;
app.set("view engine", "ejs");
app.use(express.static("Assets"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
const pool = mysql.createPool({
  multipleStatements: true,
  user: "root",
  password: "",
  database: "tubes",
  host: "127.0.0.1",
  port: 3306,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to database");
    connection.release();
  }
});

app.get("/", (req, res) => {
  res.render("home-page");
});

app.get("/data-summary", (req, res) => {
  res.render("data-summary");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
