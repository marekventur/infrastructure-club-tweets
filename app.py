import os
from bottle import route, run, request
import json

@route('/slack-webhook', method='POST')
def index(name='World'):
  data = request.json
  if "challenge" in data:
    return data['challenge']
  print("Unsure what to do with", data)
  return "?"


if __name__ == '__main__':
  # Get required port, default to 5000.
  port = os.environ.get('PORT', 5000)

  # Run the app.
  run(host='0.0.0.0', port=port)