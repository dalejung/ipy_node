var Contextify = require('Contextify');
var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom').jsdom

function create_ipython() {
  /*
   * Creates an the baseline IPython namespace. 
   *
   * Files included:
   *    namespace.js
   *    utils.js
   *    kernel.js
   *
   * Exports
   *  IPython
   */ 
  // kernel needs document var for document.cookies
  document = jsdom('<!doctype html><html><head></head><body></body></html>');
  window = document.createWindow();
  var $ = require('jquery')(window);
  var WebSocket = require('ws');
  var sandbox = { 
    console : console, 
    $ : $, 
    WebSocket : WebSocket, 
    setTimeout : setTimeout,
    document : document,
  };

  Contextify(sandbox);
  var content = fs.readFileSync(path.join(__dirname, 'ipython-browser.js'), 'utf8');
  sandbox.run(content);
  var IPython = sandbox.IPython;
  IPython.$ = sandbox.$;
  return IPython;
}

var IPython = create_ipython();
module.exports = IPython
