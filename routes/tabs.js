var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET tabs listing. */
router.get('/', function(req, res, next) {
  res.send(JSON.stringify({
    files: fs.readdirSync("./tabs")
  }));
});

router.get('/:filename', function(req, res, next) {
  res.send(JSON.stringify({
    tab: fs.readFileSync("./tabs/"+req.params.filename).toString()
  }));
});

module.exports = router;
