const express = require('express');
const router = express.Router();
const config = require('../../common/config');
const axios = require('axios').default;
const authToken = require('../../common/utils/authToken');
const sscjs = require('sscjs');
const sscNode = new sscjs(config.rpcServer);
const sscNodeOfi = new sscjs("https://api.hive-engine.com/rpc/");

const testNode = "https://hetest.cryptoempirebot.com";
const sscTestNode = new sscjs(testNode);

//dhive
const { Client, Signature, cryptoUtils } = require('@hiveio/dhive');
const client = new Client(config.apiHive);

///Routes but testing on official API for now.
//TODO add authToken if necessary.

////Special method to get HIVE + token in one request.
router.get('/mybalances', function(req,res){
    const account = req.query.account;
    if(!account){ return res.status(500).send({ status: 'failed', message: 'Missing Query Params! '})};
    client.database.getAccounts([`${account}`])
    .then(result => {
        if(result.length > 0){
            const balance_hive = result[0].balance;
            sscNodeOfi.find('tokens', 'balances', { account: account }, 100, 0, [], (err, result) => {
                if(err){ return res.status(500).send({ status: 'failed', result: 'error', error: err });}
                return res.status(200).send({ status: 'sucess', balance_hive: balance_hive, tokens: result });
            });
        }else{ //by some reason not found
            return res.status(404).send({ status: 'failed', message: 'User not Found!' });
        }
    }).catch(error => { return res.status(500).send({ status: 'failed', message: 'Error API HIVE', error: error }) });
});
////END special method to get HIVE + token in one request.

////query many contract/table.
router.get('/queryct', function(req,res){
    const { contract, table, query, limit, offset, indexes } = req.query; //find(contract, table, query, limit = 1000, offset = 0, indexes = [], callback = null) 
    if(!contract || !table || !query || !limit || !offset || !indexes){ return res.status(400).send({ status: 'failed', message: 'Missing Query params. Check Documentation please.'})};
    sscNodeOfi.find(contract, table, JSON.parse(query), Number(limit), Number(offset), JSON.parse(indexes), (err, result) => {
        if(err){ return res.status(500).send({ result: 'error', error: err});}
        return res.status(200).send({ status: 'sucess', result: result });
    });
});

/////query one record by contract/table
router.get('/queryonect', function(req,res){
    const { contract, table, query, } = req.query; //findOne(contract, table, query, callback  =  null)
    if(!contract || !table || !query ){ return res.status(400).send({ status: 'failed', message: 'Missing Query params. Check Documentation please.'})};
    sscNodeOfi.findOne(contract, table, JSON.parse(query), (err, result) => {
        if(err){ return res.status(500).send({ result: 'error', error: err});}
        return res.status(200).send({ status: 'sucess', result: result });
    });
});

///query blockchain
router.get('/blockinfo', function(req,res){
    const { method, block, txid} = req.query;
    // console.log(req.query);
    if(!method){ return res.status(400).send({ status: 'failed', message: 'Missing Query params. Check Documentation please.'})};
    switch (method) {
        case 'getLatestBlockInfo':
            sscNodeOfi.getLatestBlockInfo((err, result) => {
                if(err){ return res.status(500).send({ result: 'error', error: err });}
                return res.status(200).send({ status: 'sucess', result: result });
            });
            break;
        case 'getBlockInfo':
            if(!block){ return res.status(400).send({ status: 'failed', message: 'Missing Query params. Check Documentation please.'})};
            sscNodeOfi.getBlockInfo(Number(block), (err, result) => {
                if(err){ return res.status(500).send({ result: 'error', error: err });}
                return res.status(200).send({ status: 'sucess', result: result });
            });
            break;
        case 'getTransactionInfo':
            if(!txid){ return res.status(400).send({ status: 'failed', message: 'Missing Query params. Check Documentation please.'})};
            sscNodeOfi.getTransactionInfo(txid, (err, result) => {
                if(err){ return res.status(500).send({ result: 'error', error: err });}
                return res.status(200).send({ status: 'sucess', result: result });
            });
            break;
        default:
            break;
    }
});
////////////////

//////Look Up tx/block/username
// router.get('/testRpc', authToken, function(req,res){
//     if(Object.keys(req.query).length === 0){ return res.status(400).send({ status: 'failed', message: 'Missing Query!' })};  
//     console.log('To process:', req.query);
//     const type = req.query.type; //for now as type: 'tx'
//     const dataQ = req.query.dataQ;
//     // sscNode.find("tokens", "tokens", {}, 1000, 0, [], (err, result) => {
//     //     // if(result === null){ return res.status(200).send({ status: 'askAgain'})}
//     //     if(err){ return res.status(500).send({ result: 'error', error: err});}
//     //     res.status(200).send(result);
//     // });
//     // sscNodeOfi.find("tokens", "tokens", {}, 1000, 0, [], (err, result) => {
//     //     // if(result === null){ return res.status(200).send({ status: 'askAgain'})}
//     //     if(err){ return res.status(500).send({ result: 'error', error: err});}
//     //     res.status(200).send(result);
//     // });
    
// });
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