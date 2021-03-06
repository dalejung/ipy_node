var IPython = require('./lib/ipython.js');
var Bridge = require('./lib/bridge.js');
var Kernel = require('./lib/kernel.js');

ipy_node = {
  Bridge : Bridge, 
  Kernel : Kernel, 
  IPython : IPython
}

module.exports = ipy_node;
