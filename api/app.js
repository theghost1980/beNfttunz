const express = require('express');
const app = express();
const cors = require('cors');
const config = require('../common/config');

app.use(cors());

//Public handling EP
const PublicController = require('./routes/public');
const publicEP = config.routes.find(route => route.name === 'public').route;
app.use( publicEP, PublicController);

module.exports = app;
