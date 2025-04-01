const express = require("express");
const mysql = require("mysql2");
const app = express();
app.use(express.json());

const con = mysql.createPool({
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "root",
  password: "root",
  port: "8163",
  database: "api"
});

const addProduct = (res, name, price) => {
  con.query("INSERT INTO product (name, price) VALUES (?, ?)", [name, price], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(201).json({ message: "Product added", id: result.insertId });
  });
};

app.post("/api/product/add", (req, res) => {
  const { name, price } = req.body;
  if (!name || typeof name !== "string" || name.length > 255) return res.status(400).json({ error: "Invalid product name" });
  if (!price || isNaN(price) || price <= 0) return res.status(400).json({ error: "Invalid price" });

  con.query("SHOW TABLES LIKE 'product'", (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.length === 0) {
      const createTableQuery = `CREATE TABLE product (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, price DECIMAL(10, 2) NOT NULL);`;
      con.query(createTableQuery, (err) => {
        if (err) return res.status(500).json({ error: "Cannot create table" });
        setTimeout(() => addProduct(res, name, price), 500);
      });
    } else {
      addProduct(res, name, price);
    }
  });
});

app.post("/api/product/get", (req, res) => {
  let { id } = req.body;
  if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  id = Number(id);

  con.query("SELECT * FROM product WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ data: result[0] });
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));