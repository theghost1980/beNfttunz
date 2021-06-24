const express = require('express');
const app = express();
const cors = require('cors');
const config = require('../common/config');
const bodyParser = require('body-parser');
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

//Uploads Handlings to CDN
const CDNController = require('./routes/cdn');
const cdnEP = config.routes.find(route => route.name === 'cdn').route;
app.use(cdnEP, CDNController);

//Users handling EP
const UsersController = require('./routes/users');
const usersEP = config.routes.find(route => route.name === 'users').route;
app.use(usersEP, UsersController);

//SSC operations, for now on Test Server
const SSCController = require('./routes/sschain');
const sscEP = config.routes.find(route => route.name === 'ssc').route;
app.use(sscEP, SSCController);

app.use(bodyParser.urlencoded( { extended: true }));
app.use(bodyParser.json());

module.exports = app;
