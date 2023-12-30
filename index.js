import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";

const app = express();
 
const port = 355;
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
  database: "manpro",
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

app.get("/datasets", (req, res) => {
  try {
    const showTablesQuery = "SHOW TABLES";
    pool.query(showTablesQuery, (err, result) => {
      if (err) {
        console.error("Error fetching tables:", err.message);
        res.status(500).send('Internal Server Error');
      } else {
        const tables = result.map(table => table[Object.keys(table)[0]]); // Extract table names
        res.render("datasets", { tables });
      }
    });  
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/data-summary", async (req, res) => {
  try {
    pool.query("SHOW COLUMNS FROM marketing_campaign", (err, result) => {
      if (err) {
        console.error("Error fetching column names:", err.message);
        res.status(500).send('Internal Server Error');
      } else {
        // Extract column names from the result
        const columns = result.map(column => column.Field);

        // Render the template with the column names
        res.render('data-summary', { columns });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/getData", async (req, res) => {
  try {
    const selectedRow = req.query.row;
    const selectedCol = req.query.col;
    const selectedAgr = req.query.agr;

    // Construct the SQL query based on the selectedRow, selectedCol, and selectedAgr
    const sqlQuery = `SELECT ${selectedRow}, ${selectedAgr}(${selectedCol}) AS aggregatedValue FROM marketing_campaign GROUP BY ${selectedRow}`;

    pool.query(sqlQuery, (err, result) => {
      if (err) {
        console.error("Error fetching aggregated data:", err.message);
        res.status(500).send('Internal Server Error');
      } else {
        // Send the aggregated data as JSON response
        res.json(result);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.get("/bar-chart", async (req, res) => {
  try {
    pool.query("SHOW COLUMNS FROM marketing_campaign", (err, result) => {
      if (err) {
        console.error("Error fetching column names:", err.message);
        res.status(500).send('Internal Server Error');
      } else {
        // Extract column names from the result
        const columns = result.map(column => column.Field);

        // Render the template with the column names
        res.render('bar-chart', { columns });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/getDataForChart", async (req, res) => {
  try {
    const selectedRow = req.query.row;
    const selectedCol = req.query.col;
    const selectedAgr = req.query.agr;

    // Construct the SQL query based on the selected options
    const sqlQuery = `SELECT ${selectedRow} AS label, ${selectedAgr}(${selectedCol}) AS value FROM marketing_campaign GROUP BY ${selectedRow}`;

    pool.query(sqlQuery, (err, result) => {
      if (err) {
        console.error("Error fetching chart data:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        // Send the chart data as JSON response
        res.json(result);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/scatter-plot", async (req, res) => {
  try {
    pool.query("SHOW COLUMNS FROM marketing_campaign", (err, result) => {
      if (err) {
        console.error("Error fetching column names:", err.message);
        res.status(500).send('Internal Server Error');
      } else {
        // Extract column names from the result
        const columns = result.map(column => column.Field);

        // Render the template with the column names
        res.render('scatter-plot', { columns });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



app.get("/getDataForScatterPlot", async (req, res) => {
  try {
    const selectedRow = req.query.row;
    const selectedCol = req.query.col;
    const selectedAgr = req.query.agr;

    // Construct the SQL query based on the selectedRow, selectedCol, and selectedAgr
    const sqlQuery = `SELECT ${selectedRow} AS xValue, ${selectedCol} AS yValue FROM marketing_campaign`;

    pool.query(sqlQuery, (err, result) => {
      if (err) {
        console.error("Error fetching scatter plot data:", err.message);
        res.status(500).send('Internal Server Error');
      } else {
        // Send the scatter plot data as JSON response
        res.json(result);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
