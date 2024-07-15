var createError = require('http-errors');
var express = require('express');
var path = require('path');
const cors = require("cors");
var cookieParser = require('cookie-parser');
require('dotenv').config();
var morgan = require("morgan");

// Import the winston logger
const winstonLogger = require('./utils/logger');

// Create a stream object with a 'write' function that will be used by `morgan`
const stream = {
  write: (message) => winstonLogger.info(message.trim())
};

// Initialize express app
var app = express();

// Setup morgan to use the stream with winston
app.use(morgan('combined', { stream }));


//import routes
const userRouter = require('./routes/userRouter');
const categoryRouter = require('./routes/categoryRouter');
const doctorRouter = require('./routes/doctorRouter');
const paymentRouter = require('./routes/paymentRouter');
const appointmentsRouter = require('./routes/appointmentsRouter');
const chatRouter = require('./routes/chatRouter');
const messageRouter = require('./routes/messageRouter');
const { connectToDatabase } = require('./helpers/connection');
// const validateResponse = require('./middlewares.js/validator');



app.use(cors());


//DB connection
connectToDatabase();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(validateResponse);
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/doctor', doctorRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/appointments', appointmentsRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/message', messageRouter);
// driver route
// app.use('/api/v1/user', userRouter);



// test route
app.get('/api/test', (req, res) => {
  res.send('I am responding!');
});

app.use('/public', express.static(__dirname + '/public'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


app.use((error, req, res, next) => {
  if (res.headersSent) {
    // If headers have already been sent, do nothing further
    return next("Something went wrong"); // You can choose the message you want to send.
  }
// console.log(error)
console.log(req?.url)
log
  if (error.message) {
    winstonLogger.error(error.message); // Log the error using winston
    console.error("Error:", error.message);
    return res.status(500).send(Response({ statusCode: 500, status: "error", message:` Endpoint ${error.message}`, data:req?.url}));
  } else {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message || "There was an error!",
    });
  }
});


app.use((err, req, res, next) => {
  //console.error("error tushar",err.message);
  winstonLogger.error(err.message); // Log the error using winston
  res.status(500).json({ message: err.message });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(500).json({ message: err.message });
  // res.status(err.status || 500);
  res.render("error");
});


// Initialize server
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT || 3000}`);
});

// Initialize Socket.IO
const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const socketIO = require("./utils/socketIO");
const Response = require('./helpers/response');
const { log } = require('console');
socketIO(io);

global.io = io;

module.exports = app;
