const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js").books;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});


public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/booksdb');
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching books:', error); 
    return res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const response = await axios.get(`http://localhost:5000/booksdb/${isbn}`);
    const book = response.data;

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by ISBN" });
  }
});

public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params;
  try {
    const response = await axios.get('http://localhost:5000/booksdb');
    const filteredBooks = Object.values(response.data).filter(book => book.author === author);

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Books by this author not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const response = await axios.get('http://localhost:5000/booksdb');
    const filteredBooks = Object.values(response.data).filter(book => book.title === title);

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Books with this title not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});

public_users.get('/review/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const response = await axios.get(`http://localhost:5000/booksdb/${isbn}`);
    const book = response.data;

    if (book && book.reviews) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "Reviews not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching reviews by ISBN" });
  }
});

module.exports.general = public_users;
