var Q = require('q');
var http = require('http');
var url = require('url');

var sync = require('inode').sync;

var IPythonService = function(endpoint) {
    var parsed = url.parse(endpoint);
    this.hostname = parsed.hostname;
    this.port = parsed.port;
    this.endpoint = endpoint

    // browserify won't import sync
    if (sync) {
        sync.syncrify(this, 'list_sessions');
    }
}

IPythonService.prototype.request = function(path) {
  var deferred = Q.defer();
  var options = {
    hostname: this.hostname,
    port: this.port,
    path: path
  };
  var self = this;
  var callback = function(response) {
    var str = '';
    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });
    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      var data = JSON.parse(str);
      deferred.resolve(data);
    });
  }
  http.request(options, callback).end();
  return deferred.promise;
}

IPythonService.prototype.list_sessions = function() {
    return this.request('/api/sessions');
};

module.exports = IPythonService;

sess = new IPythonService("http://idale.local:8888");
