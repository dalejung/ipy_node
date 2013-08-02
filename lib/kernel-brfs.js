var IPython = require('./ipython.js')
var fs = require('fs');
var Q = require('q');

var sync = require('inode').sync;

var startup_python = "import pandas as pd\nfrom pandas import json\nfrom IPython.display import JSON\n\ndef dataframe_json(df):\n    data = {}\n    for k, v in df.iteritems():\n        data[k] = v.values\n    data['index'] = df.index\n    data['__repr__'] = repr(df)\n    return json.dumps(data)\n\ndef _to_json(obj):\n    if isinstance(obj, pd.DataFrame):\n        return dataframe_json(obj)\n    if isinstance(obj, dict):\n        jdict = {}\n        for k, v in obj.iteritems():\n            jdict[k] = _to_json(v)\n        return json_dict(jdict)\n\n    if hasattr(obj, 'to_json'):\n        return obj.to_json()\n\n    return json.dumps(obj)\n\ndef json_dict(dct):\n    items = []\n    for k, v in dct.iteritems():\n        items.append(\"\\\"{k}\\\":{v}\".format(k=k, v=v))\n    return \"{\" + ','.join(items) + \"}\" \n\ndef to_json(obj):\n    return JSON(_to_json(obj));\n";
var deferred_callback_router = require('./callbacks.js').deferred_callback_router;

var Kernel = function(base_url, notebook_id, config) {
  if (config) {
    var context = config.context;
  }

  if (!context) {
    context = "undefined" != typeof window ? window : global;
  }
  this.context = context;

  this.base_url = base_url;
  this.notebook_id = notebook_id;
  this.kernel = null;
  this.kernel_ready = false;
  this.command_buffer = [];
  this.callback_reg = {};

  this.setup_iopub();

  // browserify won't import sync
  if (sync) {
    sync.syncrify(this, 'start');
    sync.syncrify(this, 'execute');
    sync.syncrify(this, 'pull');
  }
}

Kernel.prototype.start = function() {
  var deferred = Q.defer();
  var self = this;
  this.kernel = new IPython.Kernel(this.base_url, 'kernels');
  this.kernel.start(this.notebook_id);
  this.check_kernel(function() {
    self.execute(startup_python).then(function() {
      deferred.resolve(self);
    });
  });


  return deferred.promise.timeout(15000, "Kernel Start Timed Out");
};

Kernel.prototype.check_kernel = function(callback) {
  var self = this;
  if (!self.kernel.shell_channel) {
    setTimeout(function() { self.check_kernel(callback); }, 100);
  } 
  else {
    if (callback) {
      callback();
    }
    self.kernel_ready = true;
  }
}

Kernel.prototype._execute = function(code, deferred) {
  var self = this;
  var msg_id = this.kernel.execute(code, deferred_callback_router(self, deferred), {'silent':false});
  this.callback_reg[msg_id] = deferred;
}

Kernel.prototype.execute = function(code, callbacks) {
  // always push to buffer and htne try to execute. 
  // took out immediate execution so everything goes through the same path
  var deferred = Q.defer(); 
  this.command_buffer.push([code, deferred]);      
  this.execute_buffer();
  return deferred.promise;
}

Kernel.prototype.execute_buffer = function() {
  var self = this;
  if (!(self.kernel_ready)) {
    setTimeout(function() { self.execute_buffer(); }, 300);
    return;
  }
  if (self.command_buffer.length > 0) {
    var command = self.command_buffer.shift();
    var code = command[0];
    var deferred = command[1];
    self._execute(code, deferred);
  }
}

Kernel.prototype.pull = function(name) {
  var code = "to_json("+name+")";
  var pull_deferred = Q.defer();
  var deferred = this.execute(code);
  deferred.then(function(data) {
    var content = data.content;
    var context = data.context;
    var json = content['data']['application/json'];
    if (json) {
        var jsobj = JSON.parse(json);
        context[name] = jsobj;
        pull_deferred.resolve(jsobj);
    }
    pull_deferred.reject(new Error('did not get json back'));
  });
  pull_deferred.promise.pause_repl = true;
  return pull_deferred.promise;
}

Kernel.prototype.__repr__ = function() {
  return ' Bridge \nbase_url='+this.base_url+"\nnotebook_id="+this.notebook_id;
}

Kernel.prototype.setup_iopub = function() {
  // Kernel events
  var $ = IPython.$;
  var self = this;
  $([IPython.events]).on('status_idle.Kernel',function (event, msg_id) {
    var deferred = self.callback_reg[msg_id];
    if(!deferred) {
      // this kernel did not send this msg
      return;
    }
    var state = deferred.promise.inspect()['state'];
    if (state == 'pending') {
      deferred.resolve();
    }
    // for debug purposes keeping this around for now
    //delete self.callback_reg[msg_id]
  });
  $([IPython.events]).on('status_busy.Kernel',function () {
  });
};

module.exports = Kernel;
