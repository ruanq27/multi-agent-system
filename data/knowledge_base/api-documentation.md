# API Documentation

## Getting Started

Our API provides a RESTful interface for integrating with our platform.

### Base URL
```
https://api.example.com/v1
```

### Authentication
All API requests require an API key in the `Authorization` header:
```
Authorization: Bearer YOUR_API_KEY
```

### Rate Limiting
- Standard tier: 1000 requests per hour
- Premium tier: 10000 requests per hour
- Enterprise tier: Custom limits

If you exceed the rate limit, you'll receive a 429 (Too Many Requests) response.

## Common Error Codes

| Code | Error | Meaning |
|------|-------|---------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Temporary maintenance |

## Endpoints

### List Resources
```
GET /resources
```

### Get Resource
```
GET /resources/{id}
```

### Create Resource
```
POST /resources
Content-Type: application/json

{
  "name": "My Resource",
  "description": "Resource description"
}
```

### Update Resource
```
PUT /resources/{id}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

### Delete Resource
```
DELETE /resources/{id}
```

## Response Format
All responses are in JSON format:

### Success Response (200)
```json
{
  "status": "success",
  "data": {
    "id": "123",
    "name": "Example"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "code": "INVALID_REQUEST",
  "message": "Detailed error message"
}
```

## Code Examples

### JavaScript/Node.js
```javascript
const response = await fetch('https://api.example.com/v1/resources', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Python
```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
response = requests.get('https://api.example.com/v1/resources', headers=headers)
data = response.json()
```

### cURL
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.example.com/v1/resources
```

## Support
For API support, email: api-support@example.com
