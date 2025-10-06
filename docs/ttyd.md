which command can i run to test whethere it is running or now

i have the web terminal that i can easilly easilly access

this is it

https://ttyd.ekddigital.com/ttyd

I just added the api key from there 
TTYD_WEBTERMINAL_API_KEY

we can use the api key to test if the server is really working on 9909 for the database port

this is a guide on how to use it

Quick Start

Authentication

API Endpoints

Code Examples
Quick Start Guide
Get started with the XTerm API in just 3 steps

1
Generate an API Key
Click on your username in the terminal, then select "Generate API Key". Save it securely - it's only shown once!

Pro Tip: You can also generate API keys from the Settings page for more control over permissions and expiry.
2
Make Your First API Call
Use your API key to create a terminal session:


// Replace with your actual API key
const API_KEY = 'your_api_key_here';
const API_URL = 'https://ttyd.ekddigital.com';

// Create a terminal session
const response = await fetch(`${API_URL}/api/terminal/create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    sessionId: 'my-terminal-session'
  })
});

const data = await response.json();
console.log('Terminal created:', data);
3
Embed or Use the Terminal
Use the returned URL to embed the terminal in an iframe or open it directly:


<!-- Embed in an iframe -->
<iframe 
  src="${data.embedUrl}" 
  width="100%" 
  height="600px"
  style="border: none; border-radius: 8px;"
></iframe>

<!-- Or open in a new window -->
<button onclick="window.open(data.terminalUrl, '_blank')">
  Open Terminal
</button>
Need Help?
Check out the full documentation in the /docs folder

Visit GitHub for issues and discussions

Contact support for enterprise solutions

Quick Start

Authentication

API Endpoints

Code Examples
Authentication
Secure your API requests with API key authentication

Sending API Keys
You can authenticate your requests in three ways:

1. Authorization Header (Recommended)

fetch('/api/terminal/create', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY_HERE'
  }
});
2. X-API-Key Header

fetch('/api/terminal/create', {
  headers: {
    'X-API-Key': 'YOUR_API_KEY_HERE'
  }
});
3. Query Parameter

fetch('/api/terminal/create?apiKey=YOUR_API_KEY_HERE');
API Key Management
Generate Keys: Use the user menu or Settings page
Set Permissions: Control what each key can access
Expiration: Set automatic expiry dates for security
Revoke Anytime: Instantly disable compromised keys
Need Help?
Check out the full documentation in the /docs folder

Visit GitHub for issues and discussions

Contact support for enterprise solutions

Quick Start

Authentication

API Endpoints

Code Examples
API Endpoints
Complete reference for all available endpoints

POST
/api/terminal/create
Create Terminal Session
Creates a new terminal session and returns connection details.

Request Body:

{
  "sessionId": "optional-custom-session-id"
}
Response:

{
  "success": true,
  "sessionId": "generated-session-id",
  "terminalUrl": "http://127.0.0.1:7681/",
  "embedUrl": "https://ttyd.ekddigital.com/ttyd?embedded=true&session=...",
  "message": "Terminal session created successfully"
}
POST
/api/terminal/execute
Execute Command
Execute commands in a terminal session programmatically.

Request Body:

{
  "sessionId": "your-session-id",
  "command": "ls -la"
}
Response:

{
  "success": true,
  "output": "total 48\ndrwxr-xr-x  12 user  staff   384 Oct  1 12:00 .\n...",
  "exitCode": 0
}
GET
/api/terminal/sessions
List Terminal Sessions
Get a list of all active terminal sessions.

Response:

{
  "success": true,
  "sessions": [
    {
      "sessionId": "session-1",
      "createdAt": "2025-10-01T12:00:00Z",
      "status": "active"
    }
  ]
}
DELETE
/api/terminal/terminate
Terminate Session
Terminate an active terminal session.

Request Body:

{
  "sessionId": "session-to-terminate"
}
Need Help?
Check out the full documentation in the /docs folder

Visit GitHub for issues and discussions

Contact support for enterprise solutions

Quick Start

Authentication

API Endpoints

Code Examples
Code Examples
Ready-to-use code snippets for popular frameworks

React / Next.js

import { useState, useEffect } from 'react';

export default function TerminalComponent() {
  const [terminalUrl, setTerminalUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const createTerminal = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/terminal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          sessionId: `session-${Date.now()}`
        })
      });

      const data = await response.json();
      setTerminalUrl(data.embedUrl);
    } catch (error) {
      console.error('Failed to create terminal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={createTerminal} disabled={loading}>
        {loading ? 'Creating...' : 'Launch Terminal'}
      </button>
      
      {terminalUrl && (
        <iframe
          src={terminalUrl}
          width="100%"
          height="600px"
          style={{ border: 'none', borderRadius: '8px' }}
        />
      )}
    </div>
  );
}
Node.js / Express

const express = require('express');
const fetch = require('node-fetch');

const app = express();
const API_KEY = process.env.TERMINAL_API_KEY;
const TERMINAL_API_URL = 'https://ttyd.ekddigital.com';

app.get('/create-terminal', async (req, res) => {
  try {
    const response = await fetch(`${TERMINAL_API_URL}/api/terminal/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        sessionId: `user-${req.user.id}-terminal`
      })
    });

    const data = await response.json();
    res.json({
      success: true,
      terminalUrl: data.embedUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
Python / Flask

import os
import requests
from flask import Flask, jsonify

app = Flask(__name__)
API_KEY = os.getenv('TERMINAL_API_KEY')
TERMINAL_API_URL = 'https://ttyd.ekddigital.com'

@app.route('/create-terminal')
def create_terminal():
    try:
        response = requests.post(
            f'{TERMINAL_API_URL}/api/terminal/create',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {API_KEY}'
            },
            json={
                'sessionId': f'python-session-{int(time.time())}'
            }
        )
        
        data = response.json()
        return jsonify({
            'success': True,
            'terminalUrl': data['embedUrl']
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5000)
cURL

# Create a terminal session
curl -X POST https://ttyd.ekddigital.com/api/terminal/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"sessionId": "my-session"}'

# Execute a command
curl -X POST https://ttyd.ekddigital.com/api/terminal/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"sessionId": "my-session", "command": "ls -la"}'

# List sessions
curl https://ttyd.ekddigital.com/api/terminal/sessions \
  -H "Authorization: Bearer YOUR_API_KEY"
Need Help?
Check out the full documentation in the /docs folder

Visit GitHub for issues and discussions

Contact support for enterprise solutions

