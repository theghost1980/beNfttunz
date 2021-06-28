const express = require('express');
const router = express.Router();
const config = require('../../common/config');
const cdnInfo = { cdnCloudName: config.cdnCloudName, cdnApiKey: config.cdnApiKey, cdnApiSecret: config.cdnApiSecret, };
const User = require('../../common/models/user');
const authToken = require('../../common/utils/authToken');
const sharp = require('sharp');

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
    const username = req.query.username;
    if(!username){ return res.status(400).send({ status: 'failed', message: 'Missing Query!' })};    
    uploadOne(req, res, function (err) {
        if(err) return res.status(500).send({ status: 'failed', message: 'Error on Multer.', error: err });
        // console.log(req.body); 
        User.findOneAndUpdate({ username: username}, req.body, { new: true }, function(err, updated){
            if(err){ return res.status(500).send({ status: 'failed', message: err })};
            const msg = updated ? 'Field(s) Updated!' : 'User not found!';
            return res.status(200).send({ status: 'sucess', message: msg, data: updated })
        });
    });
});
/////////END Update User field

/////Avatar requests - POST & GET.
router.get('/avatar', authToken, function(req,res){
    const username = req.query.username;
    if(!username){ return res.status(404).send({ status: 'failed', message: 'Missing Params. Check Documentation please.' })};
    User.findOne({ username: username }, function(err, found){
        if(err){ return res.statu(500).send({ status: 'failed', message: err })};
        return res.status(200).send({ status: 'sucess', avatar: found.avatar, thumb: found.thumb })
    });
});

router.post('/avatar', authToken, function(req,res){
    const username = req.query.username;
    if(!username){ return res.status(404).send({ status: 'failed', message: 'Missing Params. Check Documentation please.' })};
    const path = username + "/image";
    const options = { folder: path, resource_type: 'image', tags: 'user_avatar' };
    uploadOne(req, res, function (err) {
        if(err) return res.status(500).send({ status: 'failed', message: 'Error on Multer.', error: err });
        if(!req.file){ 
            return res.status(404).send({ status: 'failed', message: 'File needed!.'});
        }else{
            cloudinary.uploader.upload(req.file.path, options, function(err, upFile){
                if(err) return res.status(500).send({ status: 'failed', message: 'Error on multer.', err: err }); 
                else {
                    let avatar = upFile.secure_url; //get the new secure url
                    let inputFile = req.file.path;
                    let outputFile = "thumb-" + Date.now() + req.file.originalname;
                    sharp(inputFile).resize({ width: config.thumb_size }).toFile(outputFile)
                    .then(function(newFileInfo) {
                        newFileInfo.path = outputFile;
                        // console.log('Now we handle to upload:', newFileInfo);
                        cloudinary.uploader.upload(newFileInfo.path, options, function(error, thumbUploaded){
                            if(error){ return res.status(500).send({ status: 'failed', message: "Error uploading thumb, please check.", error: error }); };
                            // console.log('Sucess, thumb uploaded. Now we get the new name.');
                            let thumb = thumbUploaded.secure_url;
                            // console.log(`Thumb uploaded. ${thumb}`);
                            fs.unlink(req.file.path, resultHandler);
                            fs.unlink(newFileInfo.path, resultHandler);
                             User.findOneAndUpdate({ username: username }, { avatar: avatar, thumb: thumb }, { new: true }, function(err, updated){ //now we update the record.
                                if(err){ return res.statu(500).send({ status: 'failed', message: err })};
                                return res.status(200).send({ status: 'sucess', avatar: updated.avatar, thumb: updated.thumb, message: 'User Avatar Updated!' });
                            });
                            //TODO: Delete the old avatar + old thumb -> if needed.
                        });
                    })
                    .catch(function(err) { // console.log("Error occured when resizing img",err);
                        return res.status(500).send({ status: 'failed', message: 'Error when resizing avatar.', error: err });
                    });
                }
            });
        }
    });
});
/////END Avatar requests - POST & GET.

/////END CRUD USERS


module.exports = router;