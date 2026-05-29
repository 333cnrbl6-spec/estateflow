# Premiso Auth Pages — Copy Update Guide

## Overview
The login, register, and password reset pages are managed by **Base44's built-in authentication system**, not by custom page files in the code. You'll update the copy through the **Dashboard Settings**.

---

## How to Update

### 1. **Login Page Copy**
**Location:** Dashboard → Settings → Authentication → Custom Login Page

**New Text:**
```
Heading: Welcome back to Premiso.

Body:
This platform is designed for property professionals who need clarity, 
compliance, and operational efficiency. Please sign in to access your 
dashboard, tenancy workflows, maintenance tracking, communication logs, 
and portfolio tools.

If you are participating in the BETA programme, your feedback helps shape 
the next generation of SynergyFlow Group products.

Form Fields Required:
• Email address
• Password

Additional Options:
• Forgot password
• Create an account
• Contact support

Footer:
By signing in, you agree to use this platform responsibly and in 
accordance with professional standards.
```

---

### 2. **Register Page Copy**
**Location:** Dashboard → Settings → Authentication → Custom Register Page

**New Text:**
```
Heading: Create your Premiso account.

Body:
This platform is intended for property professionals, agents, landlords, 
and operational teams who require a structured and reliable environment 
for managing tenancies, maintenance, communication, and portfolio activity.

Please provide the following information to begin:
• Full name
• Email address
• Password
• Organisation or role (optional)

Info Box:
Once registered, you will receive full access to all professional 
features for 14 days as part of the BETA programme. Extensions may be 
granted upon request.

Footer:
By creating an account, you confirm that you will use this platform 
responsibly and in line with relevant laws, regulations, and 
professional expectations.
```

---

### 3. **Communications Log Page Copy**
**Location:** Code file `pages/MessagesAdmin.jsx` → Already Updated ✓

The page header and description have been updated in the codebase.

---

## Implementation Steps

1. Go to your **Base44 Dashboard**
2. Click **Settings** → **Authentication**
3. Find "Custom Login Page" section
4. Click **Edit Copy** and paste the login page text above
5. Find "Custom Register Page" section
6. Click **Edit Copy** and paste the register page text above
7. Save changes

---

## Notes
- The Communications Log page (`MessagesAdmin`) has been updated in code
- Login/Register pages use Base44's auth system and must be updated via Dashboard
- All text aligns with Premiso brand voice and BETA messaging
- SynergyFlow Group is referenced as the parent company