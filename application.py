from flask import Flask, jsonify
from flask import render_template
from yelp_sample import query_api
app = Flask(__name__)

import json
import random

@app.route('/')
def index():
    """Render home page"""
    return render_template('index.html')

@app.route('/search/<string:term>/<string:lat>/<string:lng>')
def search(term, lat, lng):
    key = '4Ra9ADtqXDLUhbebEnA3uccwMcidVYRkAXE-uf1oYIoFdc1LaZGEB3Mb-AoFBmuspGbs4V_hQuX7d3P-zVUykCmsuiBe3qxdbypXzgAwqG8S4Ym6dziaeNX70RM1W3Yx'
    lat = float(lat)
    lng = float(lng)
    response = ''
    try:
        response = query_api(term, lat, lng, key)
    except HTTPError as error:
        sys.exit(
            'Encountered HTTP error {0} on {1}:\n {2}\nAbort program.'.format(
                error.code,
                error.url,
                error.read(),
            )
        )
    return jsonify(response)

if __name__ == '__main__':
 app.debug = True
 app.run()
