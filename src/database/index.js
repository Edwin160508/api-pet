const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/apipet', {});
mongoose.Promise = global.Promise;

module.exports = mongoose;