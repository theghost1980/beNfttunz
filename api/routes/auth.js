const express = require('express');
const router = express.Router();
const config = require('../../common/config');
const bodyParser = require('body-parser');
const User = require('../../common/models/user');
const jwt = require('jsonwebtoken');

//dhive
const { Client, Signature, cryptoUtils } = require('@hiveio/dhive');
const client = new Client(config.apiHive);

router.use(bodyParser.urlencoded( { extended: false }));
router.use(bodyParser.json());

//Available requests for auth router
const requests = [
    { id: 'req-0', ep: '/authrequests', name: 'Get Available Requests.', typeRequest: 'GET', params: 'token -H', expected: 'Auth Request List.' },
    { id: 'req-1', ep: '/authme', name: 'Auth User', typeRequest: 'POST', params: 'ts, sig, acc on BODY', expected: '200 - OK, userdata, JWT token. All in response.' },
    { id: 'req-2', ep: '/authValid', name: 'Check Token', typeRequest: 'GET', params: 'token -H', expected: '200 - Token still valid.'},
];
//

//functions/CB
function createToken(acc){
    return jwt.sign({ usernameHive: acc }, config.jwtSecret, { expiresIn: config.tokenExp });
}
//END functions/CB

//regular auth
router.post('/authMe', async function(req, res){
    const welcomeMsg = 'Welcome to NFTTunz';
    const { ts, sig, acc } = req.body;
    console.log('Reading an Auth request, body:', req.body);
    if( !ts || !sig || !acc ){ //no params provided return error.
        return res.status(400).send({ status: 'failed', message: 'I cannot auth like this. Missing parameters. Check documentation please.'});
    }
    try {
        Signature.fromString(sig).recover(cryptoUtils.sha256(ts)).toString();
    } catch (error) {
        //possible the signature do not have same lenght/corrupted/wrong data
        console.log(error);
        return res.status(400).send({ auth: false, message: 'Signature provided wrong format!!!.' });
    }
    const dataRemote = Signature.fromString(sig).recover(cryptoUtils.sha256(ts)).toString();
    client.database.getAccounts([`${acc}`])
    .then(results => {
        if(results.length > 0){ //we found one record // console.log(results[0]);
            const postingAccount = results[0].posting;
            const key = postingAccount.key_auths[0].find(item => item === dataRemote); // console.log(key);
            if(key){ //if(config.testingData){ console.log(results[0]); }
                User.findOne({ username: acc }, function(err, found){
                    if(err){ return res.status(500).send( { status: 'failed', message: err })};
                    if(found){ //send user data back.
                        return res.status(200).send({ status: 'sucess', message: welcomeMsg + `@${acc}`, token: createToken(acc), tokenExp: config.tokenExp, dataUser: JSON.stringify(found), newUser: false });
                    }else{  // creates newuser + send user data back.
                        User.create({ username: acc }, function(err, newRecord){
                            if(err){ return res.status(500).send( { status: 'failed', message: err })};
                            return res.status(200).send({ status: 'sucess', message: welcomeMsg + `@${acc}`, token: createToken(acc), tokenExp: config.tokenExp, dataUser: JSON.stringify(newRecord) , newUser: true });
                        });
                    }
                });
            }else{ //signature failed test, maybe corrupted or altered but with same lenght
                return res.status(400).send({ status: 'failed', message: 'Signature provided failed authentication!.' });
            }
        }else{//no user found on API DB Hive //user fo not exists on hive chain.
            return res.status(404).send({ status: 'failed', message: 'Failed to Find this user on API HIVE.' });
        }
    }).catch(error => {
        console.log('Error fecthing data API HIVE.', error);
        return res.status(500).send({ status: 'failed', message: 'Error API HIVE', error: error });
    });
});

//validate token
router.get('/authValid', function(req, res){
    const token = req.headers['token'];
    if(!token){ return res.status(400).send({ status: 'failed', message: 'No token. No sauce!'})};
    jwt.verify(token, config.jwtSecret, function(err, decoded){
        if(err) return res.status(500).send({ status: 'failed', message: 'Failed to authenticate token.'});
        if(!decoded) res.status(500).send({ status: 'failed', message: 'Invalid token.'}); //invalid token
        return res.status(200).send({status: 'sucess', message: 'Still valid token.'}); //good  token
    });
});

//////Routes for devs//////
//=> ask for current available requests.
router.get('/requests', function(req,res){
    const token = req.headers['token'];
    if(!token){ return res.status(400).send({ status: 'failed', message: 'No authorization found!'})};
    jwt.verify(token, config.jwtSecret, function(err, decoded){
        if(err) return res.status(500).send({ status: 'failed', message: 'Failed to authenticate token.'});
        if(!decoded) res.status(500).send({ status: 'failed', message: 'Invalid token.'}); //invalid token
        return res.status(200).send({ status: 'sucess', requests: requests });
    });
});
///end routes for devs.

module.exports = router;

// mongoDB data sample connection
// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://qC7udpFYxm1Z47OM:<password>@cluster0.ajucy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

