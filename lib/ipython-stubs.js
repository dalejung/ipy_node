IPython.WidgetManager = function(){;};

IPython.Session.prototype._handle_start_success = function (data, status, xhr) {
    this.id = data.id;
    // since base_url can be absolute path, we just assume that the pathname will
    // always be '/'
    var kernel_service_url = "/api/kernels";
    this.kernel = new IPython.Kernel(kernel_service_url);
    this.kernel.base_url = this.base_url;
    this.kernel._kernel_started(data.kernel);
};

IPython.Kernel.prototype._kernel_started = function (json) {
    console.log("Kernel started: ", json.id);
    this.running = true;
    this.kernel_id = json.id;
    // trailing 's' in https will become wss for secure web sockets
    if (typeof location != 'undefined') {
        this.ws_host = location.protocol.replace('http', 'ws') + "//" + location.host;
    } else {
        // if location is undefined, we assume base_url is aboslute
        this.ws_host = this.base_url.replace('http', 'ws');
    }
    this.kernel_url = IPython.utils.url_path_join(this.kernel_service_url, this.kernel_id);
    this.start_channels();
};

/*
 * Changed to respect absolute urls
 */
IPython.utils.url_join_encode = function () {
    // join a sequence of url components with '/',
    // encoding each component with encodeURIComponent
    //
    var uri = IPython.utils.url_path_join.apply(null, arguments);
    if (uri.indexOf("://") == -1) { // relative path
        return IPython.utils.encode_uri_components(uri);
    }

    var bits = uri.split("/");
    // the first three represent the protocol and host
    var components = bits.splice(3);

    var protocol_host = bits.join('/');
    var path = components.map(encodeURIComponent).join('/');
    var ret = protocol_host + '/' + path;
    return ret;
};

/*
 * Will not replace '//' which would mess up absolute urls
 */
IPython.utils.url_path_join = function () {
    // join a sequence of url components with '/'
    var url = '';
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] === '') {
            continue;
        }
        if (url.length > 0 && (url[url.length-1] != '/' && arguments[i][0] != '/')) {
            url = url + '/' + arguments[i];
        } else {
            url = url + arguments[i];
        }
    }
    return url;
};
