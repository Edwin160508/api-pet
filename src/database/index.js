const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/apipet', { useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;