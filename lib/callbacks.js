var util = require('util');

var IPythonOutput = function(msg_type, content, metadata, context) {
  this.msg_type = msg_type;
  this.content = content;
  this.metadata = metadata;
  this.context = context;
}

IPythonOutput.prototype.__repr__ = function() {
  var out = util.format("IPythonOutput(msg_type=%s)", this.msg_type);
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
  handlers['output'] = defer_wrap(defer_output, ctx, deferred);
  handlers['execute_reply'] = defer_wrap(defer_exec_reply, ctx, deferred);
  return handlers;
}

var defer_output = function (msg_type, content, metadata, context, deferred) {
  var data = new IPythonOutput(msg_type, content, metadata, context);
  deferred.resolve(data);
}

var defer_exec_reply = function (content, parent, context, _deferred) {
  /*
   * Clean up if we didn't resolve with output. 
   *
   * Note: exec_reply should come after output is flushed. So if there is 
   * any output, defer_output should have already been called. This is to
   * handle code that doesn't result in output
   */
  var deferred = _deferred;
  var state = deferred.promise.inspect()['state'];
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
