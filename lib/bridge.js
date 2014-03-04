var Q = require('q');
var http = require('http');
var Kernel = require('./kernel.js');
var url = require('url');
var IPythonService = require('./service.js');

var sync = require('inode').sync;

var Bridge = function(base_url) {
  var parsed = url.parse(base_url);
  this.base_url = base_url;
  this.hostname = parsed.hostname;
  this.port = parsed.port;
  this.service = new IPythonService(base_url);
  this.last_sessions;

  // browserify won't import sync
  if (sync) {
    sync.syncrify(this, 'active_kernels');
    sync.syncrify(this, 'list_kernels');
    sync.syncrify(this, 'start_kernel');
    sync.syncrify(this, 'attach');
  }
};

Bridge.prototype.start_kernel = function(model, config) {
  var kernel = new Kernel(this.base_url, model, config);
  var promise = kernel.start();
  return promise;
};

Bridge.prototype.active_kernels = function () {
    var that = this;
    return this.service.list_sessions().then(function(data) {
        that.last_sessions = data;
        return data;
    });
}

Bridge.prototype._list_kernels = function() {
  var deferred = this.active_kernels();
  var list_deferred = Q.defer();
  deferred.then(function(sessions) {
    var out = ["==== Active Kernels ===="];
    for (var i=0; i < sessions.length; i++) {
      var session = sessions[i];
      var o = ['['+i+']', session['notebook']['name'], session['kernel']['id']].join(' ');;
      out.push(o);
    }
    list_deferred.resolve(out.join("\n"));
  });
  return list_deferred.promise;
};

Bridge.prototype.list_kernels = function() {
  var deferred = this._list_kernels();
  var next = deferred.then(function(out) {
    console.log(out);
  });
  return next;
};

Bridge.prototype.attach = function(index, context) {
  var session = this.last_sessions[parseInt(index)];
  var config = {'context':context};
  var deferred = this.start_kernel(session['notebook']);
  var self = this;
  deferred.then(function(kernel) {
    console.log("kernel");
    self.kernel = kernel;
  });
  return deferred;
};


module.exports = Bridge;
