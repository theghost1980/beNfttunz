//docu https://cloudinary.com/documentation/admin_api#folders
const express = require('express');
const router = express.Router();
const config = require('../../common/config');
const jwt = require('jsonwebtoken');
const cdnInfo = { cdnCloudName: config.cdnCloudName, cdnApiKey: config.cdnApiKey, cdnApiSecret: config.cdnApiSecret, };
const authToken = require('../../common/utils/authToken');
// const pingRoute = `https://${cdnInfo.cdnApiKey}:${cdnInfo.cdnApiSecret}@api.cloudinary.com/v1_1/${cdnInfo.cdnCloudName}/ping`;

//declarations
//cloudinary CDN images
const cloudinary = require('cloudinary').v2;
//config
cloudinary.config({
    cloud_name: cdnInfo.cdnCloudName,
    api_key: cdnInfo.cdnApiKey,
    api_secret: cdnInfo.cdnApiSecret,
});
/////////////
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        (file) ? console.log('Destination:::::::File::::::',file) : console.log('No file from client');
        callback(null, __dirname + '/uploads')
    },
    filename: function (req, file, callback) {
        (file) ? console.log('Filename:::::::File::::::',file) : console.log('No file from client');
        callback(null, file.fieldname + '_' + Date.now() + "_" + file.originalname);
    }
});  
const uploadOne = multer({ storage: storage }).single("file");
const uploadMany = multer({ storage: storage }).array("file");
//////to delete the file after sending it to cloud
const fs = require('fs');
let resultHandler = function (err) {
    if (err) {
        console.log("unlink failed", err);
    } else {
        console.log("file deleted from temporary server storage");
    }
}
////////////////////////////////////////////////////////////////////

////functions/CB
////END functions/CB

/////query user folder(s)
router.get('/cdndata', authToken, function(req,res){
    // console.log(req.user);
    const username = req.query.username; 
    const subFolder = req.query.subfolder;
    if(!username){ return res.status(400).send({ status: 'failed', message: 'Missing Query!' })};
    const _subF = subFolder ? subFolder : '*';
    cloudinary.search
    .expression(`folder:${username}/${_subF}`) // 'folder:xx/*'
    .execute().then(result => {
        return res.status(200).send({ status: 'sucess', result: result });
    });
});
/////END query user folder(s)

/////upload test 
router.post('/upload', authToken, function(req,res){
    const username = req.query.username; 
    if(!username){ return res.status(400).send({ status: 'failed', message: 'Missing Query!' })};
    const baseFolder = username;
    uploadMany(req, res, function (err) {
        if(err) return res.status(500).send({ status: 'failed', message: 'Error on Multer.', error: err });
        const { fileType, date } = req.body;
        let path = baseFolder + `/${fileType}`;
        const options = fileType === 'image' ? { folder: path  } : { folder: path, resource_type: 'video' }; //for now we treat the rest as video.
        console.log(`About to upload to ${path}.`);
        console.log(req.files); //now we will handle from FE between options: video, image, audio.
        let upPromise = req.files.map(file => new Promise((resolve,reject) => {
            cloudinary.uploader.upload(file.path, options, function(err, upFile){
                if(err) reject(err) 
                else {
                    resolve(upFile);
                    fs.unlink(file.path, resultHandler);
                }
            });
        }));
        Promise.all(upPromise)
        .then(result => {
            return res.status(200).send({ status: 'sucess', result: result });
        }).catch(error => {
            return res.status(400).send({ status: 'failed', result: error });
        })
    });
});
/////END upload test

// On a first login
// 1. use the auth route -> get jwt + check user on hive api.
// 2. cdn route -> create the users folders.

/////initial methods on user account creation -> create 1 main folder as /$username + /audio /video /images.
router.post('/cdnMakeFolders', authToken, function(req,res){ //we will only use headers no body.
    const username = req.query.username; 
    if(!username){ return res.status(400).send({ status: 'failed', message: 'Missing Query!' })};
    const folders = [`${username}`,'audio','video','image'];
    const resultsOp = [];
    let mainCreated = false;
    let promises = folders.map((folder, index) => new Promise((resolve, reject) => {
        if(index > 0){ mainCreated = true };
        const path = mainCreated ? username+"/"+folder : folder;
        console.log(`Trying to create: ${path}`);
        // Handle the metadata for each uploaded file.
        cloudinary.api.create_folder(path, async function(error, result){
            if(error){
                resultsOp.push( { status: 'failed', message: error, path: path });
                reject(error);
            }else{
                resultsOp.push( { status: 'sucess', message: result, path: path });
                resolve(result);
            }
        });
    }));
    Promise.all(promises)
    .then(result => { // console.log(result);
        return res.status(200).send({ status: 'sucess', results: resultsOp });
    })
    .catch(error => { // console.log(error);
        return res.status(500).send({ status: 'failed', results: resultsOp });
    });
});
/////END initial methods


module.exports = router;