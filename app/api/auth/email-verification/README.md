# Email Verification Endpoints

This directory contains the email verification API endpoints for DawaLocate.

## 📁 Structure

```
email-verification/
├── send/
│   └── route.ts      # POST - Send verification code
├── verify/
│   └── route.ts      # POST - Verify code
├── resend/
│   └── route.ts      # POST - Resend verification code
└── README.md         # This file
```

## 🚀 Quick Start

### 1. Environment Setup

Ensure your `.env` file has the SMTP configuration:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Usage Examples

#### Send Verification Code

```typescript
const response = await fetch('/api/auth/email-verification/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' }),
});

const data = await response.json();
// { message: "Verification code sent successfully", email: "...", expiresAt: "..." }
```

#### Verify Code

```typescript
const response = await fetch('/api/auth/email-verification/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com',
    code: '123456'
  }),
});

const data = await response.json();
// { message: "Email verified successfully", email: "...", verified: true }
```

#### Resend Code

```typescript
const response = await fetch('/api/auth/email-verification/resend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' }),
});

const data = await response.json();
// { message: "Verification code resent successfully", email: "...", expiresAt: "..." }
```

## 🔒 Security Features

- ✅ **Rate Limiting**: 1 request per minute per email
- ✅ **Code Expiration**: Codes expire after 15 minutes
- ✅ **Single-Use Codes**: Codes can only be used once
- ✅ **Email Validation**: Validates email format
- ✅ **Case-Insensitive**: Email addresses are normalized
- ✅ **Automatic Cleanup**: Old codes are automatically invalidated

## 📊 Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad request (invalid input) |
| 404  | Resource not found |
| 409  | Conflict (email already exists) |
| 429  | Rate limit exceeded |
| 500  | Internal server error |

## 🧪 Testing

Run the test suite:

```bash
# Start development server
npm run dev

# In another terminal, run tests
tsx scripts/test-email-verification.ts
```

Manual verification:

```bash
# After receiving email with code
tsx scripts/verify-manual.ts 123456
```

## 📚 Full Documentation

See [docs/EMAIL_VERIFICATION_API.md](../../../../docs/EMAIL_VERIFICATION_API.md) for complete API documentation.

## 🛠️ Troubleshooting

### Email Not Sending

1. Check SMTP credentials in `.env`
2. For Gmail: Use App Password (not regular password)
3. Ensure port 587 is not blocked by firewall
4. Check server logs for detailed error messages

### Common Errors

- **"Rate limit exceeded"** - Wait 60 seconds between requests
- **"Code expired"** - Request a new code (15-minute timeout)
- **"Invalid code"** - Check code format (must be 6 digits)
- **"Email already exists"** - User is already registered

## 🔗 Related Files

- **Email Service**: `lib/email.ts`
- **Types**: `types/email-verification.ts`
- **Database Schema**: `prisma/schema.prisma` (EmailVerification model)
- **Test Scripts**: `scripts/test-email-verification.ts`

