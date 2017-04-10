var requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname,

    nodeRequire: require,

    paths: {
        'plotly-js': './node_modules/plotly.js/dist/'
    }
});

window.$ = window.jQuery = require('jquery');

var parser = requirejs('./parser.js');
var userparser = requirejs('./userParser.js');
var plotter = requirejs('./plotter.js');
//var plotly = require('plotly.js/dist/plotly.js');
