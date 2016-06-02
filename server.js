var express = require('express'),
    app = express();

app.use(express.static(__dirname + '/dist'));

app.listen(8080);