# EduVault - Cloudflare Setup Guide

## Cloudflare pe Live kaise karein - Complete Step by Step Guide

---

## Prerequisites (Zaroori cheezein)

1. **Cloudflare Account** - https://dash.cloudflare.com/sign-up
2. **GitHub Account** - https://github.com
3. **Node.js** - https://nodejs.org (latest version install karein)
4. **Razorpay Account** - https://razorpay.com (payment gateway ke liye)

---

## Step 1: Cloudflare Account Setup

1. https://dash.cloudflare.com/sign-up pe jayein
2. Email aur password se sign up karein
3. Email verify karein
4. Dashboard mein login karein

---

## Step 2: Wrangler CLI Install karein

Wrangler Cloudflare ka command-line tool hai.

```bash
npm install -g wrangler
```

Install hone ke baad login karein:

```bash
wrangler login
```

Browser mein Cloudflare ka page khulega, authorize karein.

---

## Step 3: D1 Database Create karein

```bash
wrangler d1 create eduvault-db
```

Output mein aapko `database_id` milega. Ise copy karein:

```
✅ Successfully created DB 'eduvault-db'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← YE COPY KAREIN
```

---

## Step 4: wrangler.toml Update karein

`wrangler.toml` file mein `database_id` ko apne actual ID se replace karein:

```toml
[[d1_databases]]
binding = "DB"
database_name = "eduvault-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← APNA ID DALEIN
```

---

## Step 5: Database Schema Run karein

```bash
wrangler d1 execute eduvault-db --file=schema.sql
```

Ye command saari tables create karega aur default data insert karega.

---

## Step 6: Razorpay Setup

1. https://dashboard.razorpay.com pe login karein
2. Settings → API Keys pe jayein
3. "Generate Test Key" click karein
4. **Key ID** copy karein

`wrangler.toml` mein update karein:

```toml
[vars]
RAZORPAY_KEY_ID = "rzp_test_xxxxxxxxxxxxxxxx"  ← APNI KEY ID DALEIN
```

---

## Step 7: Local Testing

Local server start karein:

```bash
wrangler pages dev .
```

Browser mein khulega: `http://localhost:8788`

Test karein:
- Website load ho rahi hai
- Admin portal open ho raha hai
- Products/Courses add ho rahe hain
- Database mein save ho raha hai

---

## Step 8: GitHub pe Push karein

```bash
# Git initialize karein (agar nahi hai)
git init

# Saari files add karein
git add .

# Commit karein
git commit -m "Initial commit - EduVault with Cloudflare"

# GitHub repository banayein aur push karein
git remote add origin https://github.com/YOUR_USERNAME/eduvault.git
git branch -M main
git push -u origin main
```

---

## Step 9: Cloudflare Pages pe Deploy karein

### Option A: CLI se Deploy

```bash
wrangler pages deploy .
```

### Option B: Cloudflare Dashboard se (Recommended)

1. https://dash.cloudflare.com pe jayein
2. Left sidebar mein **"Workers & Pages"** click karein
3. **"Create"** → **"Pages"** → **"Connect to Git"**
4. GitHub repository select karein: `eduvault`
5. Build settings:
   - **Framework preset:** None
   - **Build command:** (khali chhodein)
   - **Build output directory:** `.`
6. **"Save and Deploy"** click karein

---

## Step 10: D1 Database Bind karein

Deploy hone ke baad:

1. Cloudflare Dashboard → Workers & Pages → apna project
2. **"Settings"** tab → **"Functions"**
3. **"Bindings"** section mein **"Add"** click karein
4. **Binding type:** D1 Database
5. **Variable name:** `DB`
6. **D1 database:** `eduvault-db` select karein
7. **"Save"** click karein

---

## Step 11: Environment Variables Set karein

1. Settings → Variables → **"Add variable"**
2. Add karein:

| Variable | Value |
|----------|-------|
| `RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxxxxxxxxxx` |

3. **"Save and Deploy"** click karein

---

## Step 12: Custom Domain Add karein (Optional)

Agar apna domain hai (e.g., eduvault.com):

1. Settings → Custom domains → **"Set up a custom domain"**
2. Domain name daalein: `eduvault.com`
3. Cloudflare automatically DNS setup karega
4. Apne domain registrar pe nameservers update karein

---

## Step 13: Test karein Live

1. Apni live URL kholein (e.g., `eduvault.pages.dev`)
2. Admin portal test karein
3. Product add karein with PDF
4. Customer flow test karein:
   - Product add to cart
   - Checkout with test email
   - Razorpay test payment
   - PDF download check karein

---

## Troubleshooting

### Problem: "Database not found"
**Solution:** wrangler.toml mein database_id check karein aur D1 binding verify karein.

### Problem: "API not working"
**Solution:** Functions tab mein check karein ki DB binding hai ya nahi.

### Problem: "PDF download nahi ho raha"
**Solution:** Check karein ki product/course mein PDF upload hua hai ya nahi.

### Problem: "Razorpay payment fail"
**Solution:** Razorpay Key ID verify karein wrangler.toml aur environment variables mein.

---

## Admin Login

- **URL:** `your-site.pages.dev`
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Pehli baar login karne ke baad, Credentials tab se password change karein!**

---

## Cloudflare Free Plan Limits

| Resource | Free Limit |
|----------|------------|
| D1 Database | 5 GB storage |
| Reads | 5 million/day |
| Writes | 100,000/day |
| Pages Bandwidth | Unlimited |
| Functions | 100,000 requests/day |

**Ye sab FREE hai!** Aapko kuch pay nahi karna padega.

---

## Support

Agar koi problem aaye toh:
1. Cloudflare Docs: https://developers.cloudflare.com/pages/
2. D1 Docs: https://developers.cloudflare.com/d1/
3. Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/

---

## Summary

✅ Cloudflare D1 Database - FREE (5 GB)
✅ Cloudflare Pages Hosting - FREE (Unlimited bandwidth)
✅ Razorpay Payment - Test mode FREE
✅ Total Cost: ₹0

**Aapki website ab live hai!** 🎉
