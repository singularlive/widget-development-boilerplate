console.log('-----------------------------------------------');
console.log('Singular.Live widget deploy - version 1.0');

try {
	var config = require('./singularwidget.json');
	if (!config.deploykey) {
		console.error('ERROR: Cannot find deploy key in singularwidget.json');
		return;
	}
}
catch (e) {
	console.error('ERROR: Cannot access singularwidget.json: ' + e);
	return;
}

var fs = require('fs');
var zipdir = require('zip-dir');
var xhr = require('superagent');
var deployUrl = 'https://staging-enigmatic-ocean-3936.herokuapp.com/widgets/deploywithkey';

console.log('Validating files in directory "source"');

// Check for output.html and icon.png
try {
  var stats = fs.lstatSync('./source');

  if (stats.isDirectory()) {
    try {
      var outputHtmlFile = fs.lstatSync('./source/output.html');
    } catch(e) {
      console.error('ERROR: Cannot find file "source/output.html"');
      return;
    }
    try {
      var iconPngFile = fs.lstatSync('./source/icon.png');
    } catch(e) {
      console.error('ERROR: Cannot find file "source/icon.png"');
      return;
    }
  } else {
    console.error('ERROR: "source" is not a directory');
    return;
  }
} catch(e) {
  console.error('ERROR: Cannot find directory "source"');
  return;
}

// Zip source folder
console.log('Creating zip file');

zipdir('./source', { saveTo: './SingularWidget.zip' }, function (err, buffer) {
  if (err) {
    console.error('ERROR: Cannot zip directory "source"');
    return;
  } else {
    console.log('Deploying widget to Singular.Live');

    // Upload source folder to Singular.Live
    var req = xhr.put(deployUrl);
    req.field('key', config.deploykey)
    req.attach('zipfile', './SingularWidget.zip');
    req.end(function(err, res) {
      if(err) {
        console.error(err);
      } else {
        console.log('Widget ID: ' + res.body + ' successfully deployed');
      }

      // Cleanup
      fs.unlink('./SingularWidget.zip');
    });
  }
});
