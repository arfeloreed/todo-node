import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import "dotenv/config";

// variables
const app = express();
const port = 3000;

// db setup
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todos",
  password: process.env.DB_PASS,
  port: 5432,
});
db.connect();

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// helper functions
async function getItems() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  return result.rows;
}

// endpoints
app.get("/", async (req, res) => {
  const items = await getItems();

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  await db.query("INSERT INTO items (title) VALUES ($1);", [req.body.newItem]);

  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  let updateItemId = parseInt(req.body.updatedItemId);
  await db.query("UPDATE items SET title = $1 WHERE id = $2", [
    req.body.updatedItemTitle,
    updateItemId,
  ]);

  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  let deleteItemId = parseInt(req.body.deleteItemId);
  await db.query("DELETE FROM items WHERE id = $1", [deleteItemId]);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
