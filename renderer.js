var remote = require('electron').remote;
var dialog = remote.dialog;

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname,

    nodeRequire: require,

    paths: {
        'plotly-js': './node_modules/plotly.js/dist/'
    }
});

var fs = require('fs');

window.$ = window.jQuery = require('jquery');

var parser = requirejs('./parser.js');
var userparser = requirejs('./userParser.js');
var plotter = requirejs('./plotter.js');
var d3 = requirejs('d3');
//var plotly = require('plotly.js/dist/plotly.js');

dialog.showOpenDialog(function (fileNames) {
		if(fileNames === undefined)
				console.log("No file selected");
		else {
        console.log("Opened " + fileNames);
        fs.readFile(fileNames[0], 'utf-8', function(err, data) {
            if (err) {
                alert("Couldn't open the file: " + err.message);
                return;
            }
            // init vars
            var a = fileNames[0],
                datas = {},
	              first_time = undefined,
	              last_time = undefined;
            // parse the log
            datas[a] = parser.getDataFromAttribute(data);
            var aliases = Object.keys(datas[a]);
			      aliases.map((key) => {
				        var d = datas[a][key].data;
				        var first_entry = d[0];
				        var last_entry = d[d.length-1];
				        if ( first_time === undefined || first_time > first_entry[0] ) {
				            first_time = first_entry[0];
				        }
				        if ( last_time === undefined || last_time < last_entry[0] ) {
				            last_time = last_entry[0];
				        }
			      });
            // plot the logs
        });
		}
});
