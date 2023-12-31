import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import multer from "multer";
import path from "path";
import csv from"fast-csv";
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  const tableRow = req.session.tableRow;
  const tableCol = req.session.tableCol;
  const tableAgr = req.session.tableAgr;

  console.log(tableRow)

  const barRow = req.session.barRow;

  console.log(barRow)
  const barCol = req.session.barCol;
  const barAgr = req.session.barAgr;

  const scatterRow = req.session.scatterRow;
  const scatterCol = req.session.scatterCol;
  const scatterAgr = req.session.scatterAgr;

  res.render("home-page", {tableRow, tableCol, tableAgr, barRow, barCol, barAgr, scatterRow, scatterCol, scatterAgr});
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

let storage=multer.diskStorage({
  destination:(req,file,callback)=> {
    callback(null,"./uploads/")
  },
  filename:(req,file,callback)=>{
    callback(null,file.fieldname+"-"+Date.now +path.extname(file.originalname))
  }
});
let upload=multer({
  storage:storage
}) ;
app.post('/import-csv',upload.single('file'),(req,res)=>{
console.log(req.file.path)
uploadCsv(__dirname+"/uploads/"+req.file.filename)
});
function uploadCsv(path){
  let stream=fs.createReadStream(path)
  let csvDataColl=[]
  let fileStream=csv
  .parse()
  .on('data',function(data){
    csvDataColl.push(data)
  })
  .on('end',function(){
    pool.getConnection((error,connection)=>{
      if(error){
        console.log(error)
      }
      else{
        let query="INSERT INTO marketing_campaign(ID,Year_Birth,Education,Marital_Status,Income,Kidhome,Teenhome,Dt_Customer,Recency,MntWines,MntFruits,MntMeatProducts,MntFishProducts,MntSweetProducts,MntGoldProds,NumDealsPurchases,NumWebPurchases,NumCatalogPurchases,NumStorePurchases,NumWebVisitsMonth,AcceptedCmp3,AcceptedCmp4,AcceptedCmp5,AcceptedCmp1,AcceptedCmp2,Complain,Z_CostContact,Z_Revenue,Response) VALUES ?"
        connection.query(query,[csvDataColl],(error,res)=>{

          if (error) {
            console.log(error);
          }

        })
      }
    })
    fs.unlinkSync(path)
  })
  stream.pipe(fileStream)
}

app.get("/getTableData", async (req, res) => {
  try { 
    const table = req.query.table;
    console.log(table)
    // Construct the SQL query based on the selectedRow, selectedCol, and selectedAgr
    const sqlQuery = `SELECT * FROM \`${table}\``;
 
    pool.query(sqlQuery, (err, result) => {
      if (err) {
        console.error("Error fetching table data:", err.message);
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
    const tableRow = req.query.row;
    const tableCol = req.query.col;
    const tableAgr = req.query.agr;

    req.session.tableRow = tableRow;
    req.session.tableCol = tableCol;
    req.session.tableAgr = tableAgr;

    // Construct the SQL query based on the selectedRow, selectedCol, and selectedAgr
    const sqlQuery = `SELECT ${tableRow}, ${tableAgr}(${tableCol}) AS aggregatedValue FROM marketing_campaign GROUP BY ${tableRow}`;

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
    const barRow = req.query.row;
    const barCol = req.query.col;
    const barAgr = req.query.agr;

    req.session.barRow = barRow;
    req.session.barCol = barCol;
    req.session.barAgr = barAgr;

    // Construct the SQL query based on the selected options
    const sqlQuery = `SELECT ${barRow} AS label, ${barAgr}(${barCol}) AS value FROM marketing_campaign GROUP BY ${barRow}`;

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
    const scatterRow = req.query.row;
    const scatterCol = req.query.col;

    req.session.scatterRow = scatterRow;
    req.session.scatterCol = scatterCol;

    // Construct the SQL query based on the selectedRow, selectedCol, and selectedAgr
    const sqlQuery = `SELECT ${scatterRow} AS xValue, ${scatterCol} AS yValue FROM marketing_campaign`;

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
