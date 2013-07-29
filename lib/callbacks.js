module.exports.deferred_callback_router = function (ctx, deferred) {
  var self = ctx;
  var handlers = {}
  handlers['output'] = defer_wrap(defer_output, ctx, deferred);
  handlers['execute_reply'] = defer_wrap(defer_exec_reply, ctx, deferred);
  return handlers;
}

var defer_output = function (msg_type, content, metadata, context, deferred) {
  var data = {}
  data['msg_type'] = msg_type
  data['content'] = content
  data['metadata'] = metadata
  data['context'] = context
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
