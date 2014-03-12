var IPython = require('./lib/ipython.js');
var Bridge = require('./lib/bridge.js');
var Kernel = require('./lib/kernel.js');

module.exports.IPython = IPython;
module.exports.Bridge = Bridge;
module.exports.Kernel = Kernel;
module.exports.util = require('./lib/util.js');

module.exports.magic = require('./lib/magic.js');
