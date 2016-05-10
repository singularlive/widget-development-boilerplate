console.log('------------------------------------');
console.log('---Start deploying widget to Singular.Live---');

var config = require('./singularwidget.json');
if (!config.deploykey) {
  console.error('No deploy key provided in singularwidget.json');
  return;
}

var fs = require('fs');
var zipdir = require('zip-dir');
var xhr = require('superagent');
var deployUrl = 'http://localhost:3000/widgets/deploywithkey';

console.log('---------------------');
console.log('Validate files in "source"');

// Check for output.html and icon.png
try {
  var stats = fs.lstatSync('./source');

  if (stats.isDirectory()) {

    try {
      var outputHtmlFile = fs.lstatSync('./source/output.html');
    } catch(e) {
      console.error('Can\'t find "source/output.html" file');
      return;
    }

    try {
      var iconPngFile = fs.lstatSync('./source/icon.png');
    } catch(e) {
      console.error('Can\'t find "source/icon.png" file');
      return;
    }

  } else {
    console.error('Can\'t find "source" directory');
    return;
  }

} catch(e) {
  console.error('Can\'t find "source" directory');
  return;
}

// Zip source folder
console.log('Make widget package');

zipdir('./source', { saveTo: './widgetpack.zip' }, function (err, buffer) {
  // `buffer` is the buffer of the zipped file
  // And the buffer was saved to `~/myzip.zip`
  if (err) {
    console.error('Can\'t make package from "source" directory');
    return;
  } else {
    console.log('Deploy widget to Singular.Live');

    // Upload source folder to Singular.Live
    var req = xhr.put(deployUrl);
    req.field('key', config.deploykey)
    req.attach('zipfile', './widgetpack.zip');
    req.end(function(err, res) {
      if(err) {
        console.error(err);
      } else {
        console.log('Deployed success with widget id: ' + res.body);
      }

      // Cleanup
      fs.unlink('./widgetpack.zip');
    });
  }
});