const {remote} = require('electron');
const {Menu, MenuItem} = remote;
var dialog = remote.dialog;

var path = require('path');
var _ = require('lodash');
var fs = require('fs');

var requirejs = require('requirejs');
requirejs.config({
    baseUrl: __dirname,

    nodeRequire: require,

    paths: {
        'plotly-js': './node_modules/plotly.js/dist/'
    }
});


try {
    console.log('looking for deps here.');

    var plotHtml = fs.readFileSync('plot.html').toString();
    var parser = requirejs('./parser.js');
    var userparser = requirejs('./userParser.js');
    var plotter = requirejs('./plotter.js');
    var plotly = requirejs('plotly-js/plotly.min');
    var d3 = requirejs('d3');
}
catch (err) {
    console.log('looking for deps in electron dist.');

    var plotHtml = fs.readFileSync('./resources/app/plot.html').toString();
    var parser = requirejs('./resources/app/parser.js');
    var userparser = requirejs('./resources/app/userParser.js');
    var plotter = requirejs('./resources/app/plotter.js');
    var plotly = requirejs('plotly-js/plotly.min');
    var d3 = requirejs('d3');
}


var plotIDs = [];

function removeExtension(filename){
    var lastDotPosition = filename.lastIndexOf(".");
    if (lastDotPosition === -1) return filename;
    else return filename.substr(0, lastDotPosition);
}

const menu = new Menu();
menu.append(new MenuItem({label: 'Open Log', click() {
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
		            fileNames[0] = removeExtension(path.basename(fileNames[0])).replace(/\./g, '_');
		            // init vars
		            var a = fileNames[0],
                    datas = {};

		            // Prepare hide plot func
		            var hidePlotFunc = function(a) {
		                var active = datas[a].active ? false : true;
		                var opacity = active ? 0 : 1;
		                var visibility = active ? 'hidden' : 'visible';
		                var display = active ? 'none' : 'block';
		                d3.select('#plot_'+a)
			                  .style('display', display);
		                datas[a].active = active;
		            };

		            // parse the log
		            var parsed = parser.getDataFromAttribute(data);
		            if (_.isEmpty(parsed))
                    parsed = userparser.getDataFromAttribute(data);
		            datas[a] = parsed;
		            // plot the logs
		            for (var a in datas) {
		                // setup the html
		                $(plotHtml).appendTo('#main');
		                var container = $('#log');
		                $(container).attr('id', 'log_'+a);

		                var title = $(container).find('#title');
		                $(title).attr('id','title_'+a)
			                  .on('click', function(_a) {
			                      return function() {
				                        hidePlotFunc(_a);
			                      };
			                  }(a));

		                title.append('<b>'+a+'</b>');

		                var p = $(container).find('#plot');
		                $(p).attr('id',"plot_" + a);

		                var data = datas[a];
		                if (!_.isEmpty(data)) {
			                  plotter.plotData('plot_'+a, data);
			                  plotIDs.push('#plot_'+a);		    }
		                else
			                  $(container).detach();
		            }
            });
	      }
    });
}}));

$( window ).resize(function() {
    plotIDs.map(function(plotID) {
	      plotly.Plots.resize(d3.select(plotID).node());
    });
});

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu.popup(remote.getCurrentWindow());
}, false);
