const express = require('express');
const router = express.Router();
const config = require('../../common/config');
const Test_connection = require('../../common/models/test_connection');
const contact_info = {
    contact_email: 'nfttunz.io@protonmail.com',
    info: 'Feel free to contact us any time. We will answer you back ASAP.'
};
const { Client, Signature, cryptoUtils } = require('@hiveio/dhive');
const client = new Client(config.apiHive);
const cdnInfo = { cdnCloudName: config.cdnCloudName, cdnApiKey: config.cdnApiKey, cdnApiSecret: config.cdnApiSecret, };
const pingRouteCDN = `https://${cdnInfo.cdnApiKey}:${cdnInfo.cdnApiSecret}@api.cloudinary.com/v1_1/${cdnInfo.cdnCloudName}/ping`;

const axios = require('axios').default;

//////Routes for devs//////
router.get('/info', function(req,res){
    return res.status(200).send({ contact_info });
});
//-> ping server
router.get('/ping', async function(req,res){
    const services = {};
    //test CDN folder status
    let promise_testCDN = new Promise((resolve, reject) => {
        axios.get(pingRouteCDN).then(response => {
            // console.log('response CDN:');
            // console.log(response);
            resolve({ status: 'sucess', message: response.data, id: 'CDN' });
        }).catch(error => reject(error));
    });
    await promise_testCDN.then(result => {
        services['CDN'] = result;
    }).catch(reject => services['CDN'] = { status: 'failed', message: reject, id: 'CDN' });
    //test api hive.
    let promise_testHIVE = new Promise((resolve, reject) => {
        client.database.getAccounts(['theghost1980'])
        .then(results => {
            if(results.length > 0){ 
                resolve('API 200 - OK');
            }else{
                reject('API 404.');
            }
        }).catch(error => reject(`Error,${error}`));
    });
    await promise_testHIVE.then(result => {
        services['HIVE'] = { status: 'sucess', message: result, id: 'HIVE' };
    }).catch(reject => services['HIVE'] = { status: 'failed', message: reject, id: 'HIVE' } );
    //test to bring test record.
    let promise_testMongoDB = new Promise((resolve, reject) => {
        Test_connection.findById({ _id: '60d08cfa164d7e065df1f21a' }, function(err, found){
            if(err){ 
                services['DB'] = { status: 'failed', message: err, id: 'DB' }
                reject(err);
            };
            if(found){
                services['DB'] = { status: 'sucess', message: 'MongoDb 200 - OK.', id: 'DB' };
                resolve(found);
            }
        });
    });
    promise_testMongoDB.then(result => {
        return res.status(200).send({ services_status: [services.CDN, services.HIVE, services.DB] });
    }).catch(reject => {
        return res.status(200).send({ services_status: [services.CDN, services.HIVE, services.DB] });
    });
});
//////END Routes for devs//////

module.exports = router;