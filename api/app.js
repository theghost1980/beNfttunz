const express = require('express');
const app = express();
const cors = require('cors');
const config = require('../common/config');
const db = require('../common/db');

app.use(cors());

//Public handling EP
const PublicController = require('./routes/public');
const publicEP = config.routes.find(route => route.name === 'public').route;
app.use( publicEP, PublicController);

//Auth handling EP
const AuthController = require('./routes/auth');
const authEP = config.routes.find(route => route.name === 'auth').route;
app.use(authEP, AuthController);

module.exports = app;
