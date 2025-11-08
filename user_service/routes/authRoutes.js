const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

require("dotenv").config();

const router = express.Router();

const gerateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
};

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await db.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (userExists.rows.length) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await db.query(
    "INSERT INTO users (username,email,password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, hashedPassword]
  );
  return res
    .status(201)
    .json({ message: "User Created", user: newUser.rows[0] });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  if (!user.rows.length) {
    return res.status(400).json({ message: "User Not Found" });
  }
  const validatePassword = await bcrypt.compare(
    password,
    user.rows[0].password
  );
  if (!validatePassword) {
    return res.status(400).json({ message: "Invalid Password" });
  }
  const token = gerateToken({ id: user.rows[0].id, email: user.rows[0].email });
  return res.status(200).json({ message: "Login Successful", token });
});

router.get("/validate", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const tokenData = token.split(" ")[1];
    const user = jwt.verify(tokenData, process.env.JWT_SECRET);
    return res.status(200).json({ ...user });
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token" });
  }
});

module.exports = router;
