
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// cors          -> To allow requests from a different origin (frontend).
// cookie-parser -> To read cookies sent by the client.
const app = express();



app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
// Allows the frontend to communicate with the backend when they have
// different origins (e.g., different ports or domains).
// WHY:
// Browsers enforce Cross-Origin Resource Sharing (CORS) rules.
// Without the correct CORS configuration, the browser may block
// frontend requests to the backend.
// origin:
// Specifies which frontend origin is allowed to make requests.
// credentials: true
// Allows browser requests to include credentials, such as cookies.
// The frontend must also send credentials with its requests.

app.use(express.json({ limit: '16kb' }));
// Parses incoming request bodies containing JSON data and makes the
// parsed data available through req.body.
// WHY:
// When a client sends JSON, Express needs to parse it before your
// route handlers can conveniently access its values.
//
// EXAMPLE:
// If the client sends:
// { "username": "Manas", "age": 20 }
//
// You can access the values in a route using:
// req.body.username
// req.body.age
//
// limit: '16kb'
// Limits the size of the JSON request body to 16 kilobytes.
// This helps prevent unnecessarily large request bodies.


app.use(express.urlencoded({ extended: true, limit: '16kb' }));
// Parses data sent in URL-encoded form format, commonly used by HTML
// forms submitted using application/x-www-form-urlencoded.
//
// WHY:
// It allows your backend to read form fields through req.body.
//
// extended: true
// Allows parsing of richer, nested objects and arrays using the
// underlying query-string parser.
//
// limit: '16kb'
// Restricts the maximum size of the parsed request body.
//
// NOTE:
// This middleware is for URL-encoded data, not JSON.
// express.json() handles JSON separately.


// 4. Static Files Middleware
app.use(express.static('public'));
// Serves static files stored inside the 'public' directory.
// WHY:
// It lets clients access files such as images, CSS, JavaScript,
// and other public assets without creating a separate route.
//
// EXAMPLE:
// If you have:
// public/logo.png
//
// A request to:
// http://localhost:8000/logo.png
//
// can return that image, assuming the server is running on port 8000.

app.use(cookieParser());
// Reads the Cookie header sent with incoming HTTP requests and parses
// its cookies into an object available through req.cookies.
//
// WHY:
// It makes it easier to read cookies in routes, such as cookies used
// for login sessions or authentication tokens.
//
// EXAMPLE:
// If the browser sends a cookie named 'token', you can access it using:
// req.cookies.token

import userRoute from "./routes/user.routes.js"
app.use("/api/v1/users",userRoute)
export { app };

