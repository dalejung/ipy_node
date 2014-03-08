/*
 * This would have easier except I didn't want to touch the source files.
 * The ipython stuff sets the IPython namespace with var which means that 
 * it won't affect globals in browserify. So instead I grab the script
 * contents with the help of brfs and add a return.
 *
 * Note: This file is called when using browserify via the 'browser' section
 * in package.json
 */
var fs = require('fs');
var path = require('path');

var content = fs.readFileSync(__dirname + '/ipython-browser.js', 'utf8');
// Assume that jquery is coming externally
if (typeof($) === 'undefined') {
  window.$ = require('jquery-browserify');
}
$.support.cors = true;
module.exports = new Function(content + ";IPython.$ = $;return IPython;")();
