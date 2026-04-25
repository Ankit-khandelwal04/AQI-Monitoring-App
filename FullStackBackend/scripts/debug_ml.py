"""Debug ML endpoints."""
import sys, json
sys.path.insert(0, '.')
import urllib.request
from urllib.parse import quote

base = 'http://localhost:8000'

# Login
data = json.dumps({'email': 'admin@nashikaqi.in', 'password': 'Admin@123'}).encode()
r = urllib.request.Request(base + '/auth/login', data=data,
    headers={'Content-Type': 'application/json'}, method='POST')
token = json.loads(urllib.request.urlopen(r).read()).get('access_token', '')
headers = {'Authorization': f'Bearer {token}'}

# model-info
r = urllib.request.Request(base + '/ml/model-info', headers=headers)
raw = json.loads(urllib.request.urlopen(r).read())
print('=== /ml/model-info ===')
print('Top-level keys:', list(raw.keys()))
print('data type:', type(raw.get('data')))
print('Full response (truncated):', str(raw)[:600])
print()

# forecast
zone = quote('Satpur')
r = urllib.request.Request(base + f'/ml/forecast?zone={zone}&hours=6', headers=headers)
raw2 = json.loads(urllib.request.urlopen(r).read())
print('=== /ml/forecast ===')
print('Top-level keys:', list(raw2.keys()))
print('data type:', type(raw2.get('data')))
print('Full response (truncated):', str(raw2)[:600])
print()

# feature-importance
r = urllib.request.Request(base + '/ml/feature-importance', headers=headers)
raw3 = json.loads(urllib.request.urlopen(r).read())
print('=== /ml/feature-importance ===')
print('Top-level keys:', list(raw3.keys()))
print('Full response:', str(raw3)[:400])
