import pandas as pd
from pandas import json
from IPython.display import JSON

def dataframe_json(df, obj_name):
    data = {}
    for k, v in df.iteritems():
        data[k] = v.values
    data['index'] = df.index
    data['__repr__'] = repr(df)
    data['__obj_name__'] = obj_name
    return json.dumps(data)

def _to_json(obj_name):
    obj = globals()[obj_name]
    if isinstance(obj, pd.DataFrame):
        return dataframe_json(obj, obj_name)
    if isinstance(obj, dict):
        jdict = {}
        for k, v in obj.iteritems():
            jdict[k] = _to_json(v)
        return json_dict(jdict)

    if hasattr(obj, 'to_json'):
        return obj.to_json()

    return json.dumps(obj)

def json_dict(dct):
    items = []
    for k, v in dct.iteritems():
        items.append("\"{k}\":{v}".format(k=k, v=v))
    return "{" + ','.join(items) + "}"

def to_json(obj_name):
    return JSON(_to_json(obj_name));
