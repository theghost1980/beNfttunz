const express = require('express');
const router = express.Router();
const config = require('../../common/config');
const axios = require('axios').default;
const authToken = require('../../common/utils/authToken');
const sscjs = require('sscjs');
const sscNode = new sscjs(config.rpcServer);
const sscNodeOfi = new sscjs("https://api.hive-engine.com/rpc/");

//////Look Up tx/block/username
router.get('/testRpc', authToken, function(req,res){
    if(Object.keys(req.query).length === 0){ return res.status(400).send({ status: 'failed', message: 'Missing Query!' })};  
    console.log('To process:', req.query);
    const type = req.query.type; //for now as type: 'tx'
    const dataQ = req.query.dataQ;
    sscNode.find("tokens", "tokens", {}, 1000, 0, [], (err, result) => {
        // if(result === null){ return res.status(200).send({ status: 'askAgain'})}
        if(err){ return res.status(500).send({ result: 'error', error: err});}
        res.status(200).send(result);
    });
    // sscNodeOfi.find("tokens", "tokens", {}, 1000, 0, [], (err, result) => {
    //     // if(result === null){ return res.status(200).send({ status: 'askAgain'})}
    //     if(err){ return res.status(500).send({ result: 'error', error: err});}
    //     res.status(200).send(result);
    // });
});
//////END Look Up tx/block/username


module.exports = router;

// help data code
// taken from postman
// "config": {
//     "url": "blockchain",
//     "method": "post",
//     "data": "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getTransactionInfo\",\"params\":{\"txid\":\"960398d959aa55a6219fb55f5594af816dde5bea\"}}",
//     "headers": {
//         "Accept": "application/json, text/plain, */*",
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*",
//         "User-Agent": "axios/0.19.2",
//         "Content-Length": 115
//     },
//     "baseURL": "http://185.130.45.130:5000",
//     "transformRequest": [
//         null
//     ],
//     "transformResponse": [
//         null
//     ],
//     "timeout": 15000,
//     "xsrfCookieName": "XSRF-TOKEN",
//     "xsrfHeaderName": "X-XSRF-TOKEN",
//     "maxContentLength": -1
// },

// axios rpc request example
// const url = "http://185.130.45.130:5000/blockchain";
//     const url2 = "https://api.hive-engine.com/rpc/blockchain";
//     const data = {
//         "jsonrpc": "2.0",
//         "method": "getStatus",
//         "id": 1
//     };
//     const  config = {
//         "method": "post",
//         "headers": {
//             "Accept": "application/json, text/plain, */*",
//             "Content-Type": "application/json",
//             "Access-Control-Allow-Origin": "*",
//         },
//     };
//     axios.post(url, data, config).then(response => {
//         console.log(response);
//     }).catch(error => console.log(error));