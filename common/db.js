const mongoose = require('mongoose');
const config = require('../common/config');
const Test_connection = require('../common/models/test_connection');

const options = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, };
mongoose.connect(config.mongoURI, options)
    .then(() => {
        console.log('Connected to DB on Mongo Atlas.');
        console.log(`Mongoose says: ${mongoose.connection.readyState}`);
        console.log(`DB name:${mongoose.connection.db.databaseName}`);
        //test to bring test record.
        Test_connection.findById({ _id: '60d08cfa164d7e065df1f21a' }, function(err, found){
            if(err){ return console.log('Error connecting to the test record.', err)};
            return console.log(found.code);
        });
    })
    .catch(err => {
        console.log('Db connection error=======');
        console.log(err);
        process.exit(1); //force to terminate the program.
    });