# 🔑 API Key Usage Guide
**Last Updated:** October 3, 2025 (After Security Fix)  
**Status:** ✅ **PRODUCTION READY WITH SECURITY ENHANCEMENT**

---

## 📋 Quick Start

### Step 1: Create Your API Key

1. Go to **Settings** page in your terminal app
2. Click **"New API Key"**
3. Enter a name (e.g., "My External App")
4. Click **Generate**

### Step 2: Save the FULL Key Immediately

**⚠️ CRITICAL:** The full key is shown **ONLY ONCE**! You'll see:

```
api_2574a32ca2f176114f0bdcae7f7d2db46a61753b65fb384d93215ee9df6801c9:9c8181de13f012f635a221abb3cb0bb8b9d79753d2d2be2c7c717d078e547af8
     ↑ Public Key (visible in settings later)                ↑ Secret (NEVER shown again!)
```

**✅ YOU MUST SAVE:**
- The **COMPLETE key** with the colon `:` separator
- Format: `api_xxx:secret`
- Store it in: Password manager, `.env` file, or secure vault

**❌ After closing the modal, you can ONLY see:**
- Public key: `api_2574a32ca...`
- Secret: `••••••••••••••••••`

---

## 🔒 Security Requirement (Updated Oct 3, 2025)

### Authentication Format (REQUIRED):
```
Authorization: Bearer api_xxx:secret
                       ↑         ↑
                  public key  secret
                  (both parts required!)
```

### ❌ This Will NOT Work:
```bash
# Public key only - REJECTED with 401
curl -H "Authorization: Bearer api_2574a32ca..." \
  https://ttyd.ekddigital.com/api/terminal/sessions

# Response:
{
  "error": "Invalid API key format. Expected: api_xxx:secret"
}
```

### ✅ This WILL Work:
```bash
# Full key with both parts - SUCCESS
curl -H "Authorization: Bearer api_2574a32ca...:9c8181de13f..." \
  https://ttyd.ekddigital.com/api/terminal/sessions

# Response:
{
  "success": true,
  "sessions": [],
  "count": 0
}
```

---

## 📚 Integration Examples

### Node.js / JavaScript
```javascript
// Store in .env file
// TTYD_API_KEY=api_2574a32ca2f176114f0bdcae7f7d2db46a61753b65fb384d93215ee9df6801c9:9c8181de13f012f635a221abb3cb0bb8b9d79753d2d2be2c7c717d078e547af8

const API_KEY = process.env.TTYD_API_KEY;

// Example: List terminal sessions
const response = await fetch('https://ttyd.ekddigital.com/api/terminal/sessions', {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data); // { success: true, sessions: [...], count: 0 }
```

### Python
```python
import os
import requests

# Store in .env file or environment
API_KEY = os.getenv('TTYD_API_KEY')

# Example: List terminal sessions
headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://ttyd.ekddigital.com/api/terminal/sessions',
    headers=headers
)

print(response.json())  # {'success': True, 'sessions': [], 'count': 0}
```

### cURL
```bash
# Store in environment variable
export TTYD_API_KEY="api_2574a32ca2f176114f0bdcae7f7d2db46a61753b65fb384d93215ee9df6801c9:9c8181de13f012f635a221abb3cb0bb8b9d79753d2d2be2c7c717d078e547af8"

# Example: List terminal sessions
curl -X GET https://ttyd.ekddigital.com/api/terminal/sessions \
  -H "Authorization: Bearer $TTYD_API_KEY" \
  -H "Content-Type: application/json"
```

---

## ⚠️ IMPORTANT: What to Save When Creating API Key

### ✅ When You Click "Generate", You'll See:

```
🔑 API Key Generated!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your API Key (copy now - shown only once):

api_2574a32ca2f176114f0bdcae7f7d2db46a61753b65fb384d93215ee9df6801c9:9c8181de13f012f635a221abb3cb0bb8b9d79753d2d2be2c7c717d078e547af8
                         ↑ BOTH PARTS REQUIRED ↑
                    (public key : secret)

[Copy to Clipboard] ← Click this immediately!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Important:
• Copy the FULL key including both parts (api_xxxxx:secret)
• This key will not be shown again - save it now!
• Store it securely (password manager or .env file)
```

### ❌ After Closing, You Can ONLY See:

In the Settings table, you'll see:
```
Name: My External App
Key ID: api_2574a32ca... [Copy]  ← Only shows PUBLIC part!
Status: Active
```

**The secret is HIDDEN forever:** `••••••••••••••••••••••••••`

---

## 🔒 Why Both Parts Are Required

### Security Architecture:

1. **Public Key** (`api_xxx`):
   - Visible in settings table
   - Used to identify which key in database
   - Like a username - not secret

2. **Secret** (`after the colon`):
   - Never shown again after creation
   - Hashed (SHA-256) in database
   - Like a password - MUST be kept secret

3. **Authentication Process:**
   ```
   1. You send: api_xxx:secret
   2. System finds: api_xxx in database
   3. System hashes: your secret
   4. System compares: hashed secret with stored hash
   5. If match: ✅ Access granted
   6. If no match: ❌ 401 Unauthorized
   ```

---

## ✅ Best Practices

### ✅ DO:
- Copy the FULL key immediately when generated
- Store in `.env` file or password manager
- Use environment variables in your code
- Keep the secret part private
- Regenerate if compromised

### ❌ DON'T:
- Try to use public key alone (will fail with 401)
- Commit API keys to git/GitHub
- Share keys in chat/email
- Store in plain text files in your codebase
- Screenshot and share the full key

---

## 🧪 Testing Your API Key

### Quick Test (Copy/Paste Your Full Key):
```bash
# Replace with your FULL key (public:secret)
curl -X GET https://ttyd.ekddigital.com/api/terminal/sessions \
  -H "Authorization: Bearer YOUR_FULL_API_KEY_HERE" \
  -H "Content-Type: application/json"

# Success Response:
{
  "success": true,
  "sessions": [],
  "count": 0
}

# If you only use public key:
{
  "error": "Invalid API key format. Expected: api_xxx:secret"
}
```

---

## 📖 Summary

### To Answer Your Questions:

**Q1: Do I need to save both the public key and secret?**  
**A:** YES! You MUST save the **COMPLETE** key:
```
api_2574a32ca2f176114f0bdcae7f7d2db46a61753b65fb384d93215ee9df6801c9:9c8181de13f012f635a221abb3cb0bb8b9d79753d2d2be2c7c717d078e547af8
```

**Q2: What happens after I close the creation modal?**  
**A:** The secret is **HIDDEN FOREVER**. You can only see:
- Public key: `api_2574a32ca...` (visible in settings)
- Secret: `••••••••••••••••••` (hidden forever)

**Q3: Can I authenticate with just the public key?**  
**A:** NO! After the security fix (Oct 3, 2025), you MUST use the full format:
- ❌ Public only: Returns 401 error
- ✅ Full key: Works correctly

---

## 🎯 TL;DR (Too Long; Didn't Read)

1. **Create API Key** → Copy the FULL key immediately (includes colon!)
2. **Store Securely** → Password manager or `.env` file
3. **Use Full Format** → Always include both `api_xxx:secret`
4. **Never Share** → Keep the secret part private
5. **Can't Recover** → If lost, generate a new key

---

**Need Help?** See [SECURITY-FIX-TEST-RESULTS.md](./SECURITY-FIX-TEST-RESULTS.md) for detailed security information.

---

## 🔒 Security Status

### ✅ Security Features Working
1. **Invalid Key Rejection**: Returns 401 with proper error message
2. **Missing Auth Rejection**: Returns 401 when no header provided
3. **Format Flexibility**: Supports both key formats for convenience
4. **CORS Headers**: Proper CORS configuration for cross-origin requests
5. **Rate Limiting**: (Built into API routes)

---

## 🎉 Conclusion

**Status:** ✅ **PRODUCTION READY**

Your API key authentication system is fully functional and ready for external integrations! Both the public-key-only format and the full key format work correctly, providing flexibility for different use cases.

**Next Steps:**
- ✅ API authentication working
- ✅ Mobile UX improvements deployed
- ✅ Security validation passed
- ✅ Auto-deployment via webhook working
- 🎯 Ready for external application integration!

---

**Generated:** October 3, 2025  
**Project:** EKD Digital Web Terminal  
**KINGDOM Deployment System:** 7-Stage Architecture  
**Auto-Deployment:** ✅ Webhook-Triggered (https://autod.ekddigital.com)
