# Challenges Faced & Solutions

While building this real-time bookmark application using Next.js and Supabase, I encountered several technical challenges. Below is a summary of the key issues and how I resolved them.

---

## 1️⃣ Google OAuth Redirecting to `localhost` After Deployment

### Problem  
After deploying to Vercel, Google login redirected to:


instead of the production URL.

### 🔍 Root Cause  
Supabase `Site URL` was still configured as `localhost`.

### ✅ Solution  
- Updated **Authentication → URL Configuration → Site URL** to the production URL.
- Added both:
  - Production URL
  - `http://localhost:3000`
  
  to **Redirect URLs**.
- Used dynamic redirect in login:

```ts
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: window.location.origin,
  },
});


