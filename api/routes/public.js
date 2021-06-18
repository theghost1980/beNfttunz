const express = require('express');
const router = express.Router();
const config = require('../../common/config');
const bodyParser = require('body-parser');
// const axios = require('axios').default;
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//Available requests for public router
const requests = [
    { id: 'req-0', name: 'Get Available Requests.', typeRequest: 'GET', params: false, expected: 'Request List.' },
    { id: 'req-1', name: 'Ping Server', typeRequest: 'GET', params: false, expected: '200 - OK' },
];
//

//////Routes for devs//////
//=> ask for current available requests.
router.get('/requests', function(req,res){
    return res.status(200).send({ requests });
});
//-> ping server
router.get('/ping', function(req,res){
    //TODO 
    // - somehow test the DB connection
    // - test hive API.
    // - test cloudinary.
    // - test coingecko.
    // send a replay as
    // [
    //  { service: 'mongoDB', status: 'OK' },
    //  { service: 'hiveAPI', status: 'OK' }, ...
    // ]
    return res.status(200).send({ status: 'OK', message: 'All Systems ready on BE.'});
});
//////END Routes for devs//////

module.exports = router;