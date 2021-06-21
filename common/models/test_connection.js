const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
    message: String,
    code: {
        unique: true,
        type: String,
        default: '200OK',
    },
});
mongoose.model('test_connection',TestSchema);

module.exports = mongoose.model('test_connection');