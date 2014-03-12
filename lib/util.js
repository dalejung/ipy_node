function path_to_notebook_model(pathname) {
    var parts = pathname.split('/');
    var path = [];
    var notebook_name = '';
    for(var i=2; i < parts.length; i++) {
        var bit = parts[i];
        if (bit.indexOf('.ipynb') == bit.length - 6) {
            notebook_name = bit;
            break;
        }
        path.push(bit);
    }
    notebook_path = path.join('/');
    notebook_path = notebook_path.split('/').map(decodeURIComponent).join('/')
    notebook_name = notebook_name.split('/').map(decodeURIComponent).join('/')
    return {'path':notebook_path, 'name':notebook_name}
}

module.exports.path_to_notebook_model = path_to_notebook_model;
