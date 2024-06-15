const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const books = require('./router/booksdb.js');
const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.get('/booksdb', (req, res) => {
  res.json(books);
});

app.get('/booksdb/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

app.use("/customer/auth/*", function auth(req,res,next){
    app.use("/customer/auth/*", function auth(req, res, next) {
        const token = req.headers['authorization'];
        if (!token) {
          return res.status(401).json({ message: 'No token provided' });
        }
      
        jwt.verify(token, 'your_secret_key', (err, decoded) => {
          if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
          }
          req.user = decoded;
          next();
        });
      });
      
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
