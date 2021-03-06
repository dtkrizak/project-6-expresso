const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const cors = require('cors');
const apiRouter = require('./api/api');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(errorHandler());
app.use(cors());
app.use('/api', apiRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`server is listening on port: ${PORT}`);
});

module.exports = app;
