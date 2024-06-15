const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username && user.password === password);
  return !!user;
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
  return res.status(200).json({ message: "Login successful", token: accessToken });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token.replace('Bearer ', ''), 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews) {
      book.reviews = [];
    }

    book.reviews.push({ username: decoded.username, review });
    return res.status(200).json({ message: "Review added successfully", reviews: book.reviews });
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token.replace('Bearer ', ''), 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const originalReviewCount = book.reviews.length;
    book.reviews = book.reviews.filter(review => review.username !== decoded.username);

    if (book.reviews.length === originalReviewCount) {
      return res.status(404).json({ message: "Review not found or not authorized to delete this review" });
    }

    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
