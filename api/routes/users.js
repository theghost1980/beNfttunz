const express = require('express');
const router = express.Router();
const User = require('../../common/models/user');
const authToken = require('../../common/utils/authToken');

/////CRUD USERS - token required -> when decoded as decoded.usernameHive

////////Query User
router.get('/queryUser', authToken, function(req, res){
    const query = req.query; 
    if(Object.keys(query).length === 0){ return res.status(400).send({ status: 'failed', message: 'Missing Query!' })};
    User.findOne(query, function(err, found){ 
        if(err){ return res.status(500).send({ status: 'failed', message: err })};
        return res.status(200).send({ status: 'sucess', data: found })
    });
});
////////END Query User

/////////Update User fields
router.post('/updateFields', authToken, function(req,res){ 
    const query = req.query;
    if(Object.keys(query).length === 0){ return res.status(400).send({ status: 'failed', message: 'Missing Query!' })};    
    // console.log(req.body); 
    User.findOneAndUpdate(query, req.body, { new: true }, function(err, updated){
        if(err){ return res.statu(500).send({ status: 'failed', message: err })};
        const msg = updated ? 'Field(s) Updated!' : 'User not found!';
        return res.status(200).send({ status: 'sucess', message: msg, data: updated })
    });
});
/////////END Update User field

/////END CRUD USERS


module.exports = router;