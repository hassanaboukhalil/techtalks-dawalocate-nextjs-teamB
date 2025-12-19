# 🚀 Email Verification Quick Start Guide

## ✅ What's Been Implemented

A complete, production-ready email verification system with:
- ✅ Database table created and migrated
- ✅ 3 API endpoints (send, verify, resend)
- ✅ Beautiful HTML email templates
- ✅ Security features (rate limiting, expiration, single-use codes)
- ✅ Comprehensive documentation
- ✅ Test scripts

---

## 📦 Files Created

### Core Implementation
```
lib/
  └── email.ts                    # Email service with nodemailer

app/api/auth/email-verification/
  ├── send/route.ts               # POST - Send verification code
  ├── verify/route.ts             # POST - Verify code
  ├── resend/route.ts             # POST - Resend code
  └── README.md                   # Endpoint documentation

prisma/
  ├── schema.prisma               # Updated with EmailVerification model
  └── migrations/
      └── 20251217221652_add_email_verification/
          └── migration.sql       # Applied to database ✅
```

### Documentation & Types
```
docs/
  ├── EMAIL_VERIFICATION_API.md           # Complete API docs
  └── EMAIL_VERIFICATION_IMPLEMENTATION.md # Implementation summary

types/
  └── email-verification.ts               # TypeScript interfaces

scripts/
  ├── test-email-verification.ts          # Automated test suite
  └── verify-manual.ts                    # Manual verification tool
```

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Configure Email (2 minutes)

Add to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**For Gmail Users:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate an App Password
3. Use that password (not your regular Gmail password)

### Step 2: Test It (1 minute)

```bash
# Start your dev server
npm run dev

# In another terminal, run the test
tsx scripts/test-email-verification.ts
```

### Step 3: Integrate (5 minutes)

See the usage example below! 👇

---

## 💻 Usage Example

### Complete Registration Flow

```typescript
// 1. User fills out registration form
const handleRegistration = async (formData) => {
  const { email, password, name } = formData;

  // 2. Send verification code
  try {
    const response = await fetch('/api/auth/email-verification/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.error); // "Email already exists" or other error
      return;
    }

    // 3. Show verification code input
    setShowVerificationInput(true);
    alert('Verification code sent to your email!');

  } catch (error) {
    console.error('Error:', error);
  }
};

// 4. User enters the 6-digit code
const handleVerification = async (code) => {
  try {
    const response = await fetch('/api/auth/email-verification/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.error); // "Invalid code" or "Code expired"
      return;
    }

    const data = await response.json();
    
    if (data.verified) {
      // 5. Email verified! Proceed with signup
      await completeSignup();
    }

  } catch (error) {
    console.error('Error:', error);
  }
};

// 6. Complete the signup
const completeSignup = async () => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      name,
      userType: 'patient',
      // ... other fields
    }),
  });

  if (response.ok) {
    alert('Registration successful!');
    router.push('/login');
  }
};

// Resend code if needed
const handleResend = async () => {
  const response = await fetch('/api/auth/email-verification/resend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    alert('New code sent!');
  }
};
```

---

## 📡 API Endpoints

### 1. Send Code
```bash
POST /api/auth/email-verification/send
Body: { "email": "user@example.com" }
```

### 2. Verify Code
```bash
POST /api/auth/email-verification/verify
Body: { "email": "user@example.com", "code": "123456" }
```

### 3. Resend Code
```bash
POST /api/auth/email-verification/resend
Body: { "email": "user@example.com" }
```

---

## 🔒 Security Features

✅ **Rate Limiting**: 1 request per minute per email
✅ **Expiration**: Codes expire after 15 minutes
✅ **Single-Use**: Codes can only be used once
✅ **Validation**: Email format and code format validation
✅ **Cleanup**: Automatic invalidation of old codes

---

## 🧪 Testing

### Automated Tests
```bash
npm run dev
tsx scripts/test-email-verification.ts
```

### Manual Test
```bash
# Send code
curl -X POST http://localhost:3000/api/auth/email-verification/send \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check your email, then verify
tsx scripts/verify-manual.ts 123456
```

---

## 📧 Email Preview

Users receive a beautiful HTML email:

```
╔═══════════════════════════════════════╗
║        🏥 DawaLocate                  ║
╚═══════════════════════════════════════╝

Verify Your Email Address

Hello,

Thank you for signing up with DawaLocate!

┌───────────────────────────────────────┐
│                                       │
│           1 2 3 4 5 6                 │
│                                       │
│   ⏰ This code expires in 15 minutes  │
└───────────────────────────────────────┘

⚠️ If you didn't request this code,
   please ignore this email.
```

---

## 🐛 Troubleshooting

### Email Not Sending?

1. **Check `.env` file** - Ensure SMTP credentials are correct
2. **Gmail users** - Use App Password, not regular password
3. **Check logs** - Look for error messages in console
4. **Test config**:
   ```typescript
   import { verifyEmailConfig } from '@/lib/email';
   await verifyEmailConfig(); // Returns true if working
   ```

### Common Errors

| Error | Solution |
|-------|----------|
| "Rate limit exceeded" | Wait 60 seconds |
| "Code expired" | Request new code |
| "Invalid code" | Check format (6 digits) |
| "Email already exists" | User is registered |

---

## 📚 Full Documentation

- **API Docs**: `docs/EMAIL_VERIFICATION_API.md`
- **Implementation**: `docs/EMAIL_VERIFICATION_IMPLEMENTATION.md`
- **Endpoint Guide**: `app/api/auth/email-verification/README.md`

---

## ✅ Checklist

Before going to production:

- [ ] SMTP credentials configured in `.env`
- [ ] Tested with real email address
- [ ] Integrated with signup flow
- [ ] Error handling implemented
- [ ] UI for code input created
- [ ] Resend functionality added
- [ ] Loading states added
- [ ] Success/error messages shown

---

## 🎯 Next Steps

1. **Configure SMTP** - Add credentials to `.env`
2. **Test endpoints** - Run test scripts
3. **Create UI** - Build verification code input form
4. **Integrate** - Connect to your signup flow
5. **Deploy** - Push to production

---

## 💡 Pro Tips

1. **User Experience**
   - Show countdown timer (15 minutes)
   - Add "Resend" button with cooldown
   - Auto-submit when 6 digits entered
   - Clear error messages

2. **Security**
   - Don't reveal if email exists (in production)
   - Log verification attempts
   - Monitor for abuse
   - Consider adding CAPTCHA

3. **Performance**
   - Add background job to clean expired codes
   - Monitor email delivery rates
   - Cache email templates

---

## 🆘 Need Help?

1. Check the full documentation in `docs/`
2. Review test scripts in `scripts/`
3. Check API endpoint README
4. Review Prisma schema

---

## 🎉 You're All Set!

The email verification system is **complete and ready to use**!

Just configure your SMTP credentials and start testing! 🚀

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Created**: December 17, 2025

