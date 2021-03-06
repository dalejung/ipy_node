var util = require('util');

var IPythonOutput = function(msg_type, content, metadata, context) {
  this.msg_type = msg_type;
  this.content = content;
  this.metadata = metadata;
  this.context = context;
}

IPythonOutput.prototype.__repr__ = function() {
  var out = util.format("IPythonOutput(msg_type=%s)", this.msg_type);
  out += "\n";
  if(this.msg_type == 'pyout') {
      data = this.content['data'];
      if (data['text/plain'] !== undefined) {
          text = data['text/plain'];
          out += text.replace(/\\n/g, '\n');
      }
  }
  return out;
};

// TODO: Figure out how to override node.js console.log or 
// just switch all __repr__ calls to inspect.
IPythonOutput.prototype.inspect = function() {
  return this.__repr__();
};

module.exports.deferred_callback_router = function (ctx, deferred) {
  var self = ctx;
  var handlers = {}
  handlers['iopub'] = {};
  handlers['iopub']['output'] = defer_wrap(defer_output, ctx, deferred);
  handlers['iopub']['status'] = defer_wrap(defer_status, ctx, deferred);

  handlers['shell'] = {};
  handlers['shell']['reply'] = defer_wrap(defer_exec_reply, ctx, deferred);
  return handlers;
}

var defer_output = function (msg, context, deferred) {
  // Note that this only works for execution that have a single output
  var msg_type = msg.header.msg_type;
  var content = msg.content;
  var metadata = content.metadata;
  var data = new IPythonOutput(msg_type, content, metadata, context);
  deferred.resolve(data);
}

var defer_status = function(msg, context, deferred) {
    // if status == idle, close out deferred since this is 
    // last message
    var state = deferred.promise.inspect()['state'];
    var is_idle = msg['content']['execution_state'] == 'idle'
    if(is_idle && state == 'pending') {
        deferred.resolve();
    }
}

var defer_exec_reply = function (msg, context, _deferred) {
}

var defer_wrap = function (func, ctx, _deferred) {
  var self = ctx;
  var deferred = _deferred;
  return function() {
    var context = self.context;
    [].push.call(arguments, context);
    [].push.call(arguments, deferred);
    return func.apply(self, arguments);
  }
}
