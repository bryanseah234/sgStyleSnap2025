# 📸 Cloudinary Setup Guide for StyleSnap

**Complete beginner-friendly guide to set up Cloudinary image storage for StyleSnap.**

This guide will walk you through creating a Cloudinary account, configuring upload presets, and integrating with your StyleSnap application step by step.

---

## 📋 What You'll Learn

After completing this guide, you will:
- ✅ Have a Cloudinary account set up
- ✅ Understand how to configure upload presets
- ✅ Know how to add Cloudinary credentials to your project
- ✅ Be able to upload images from your application
- ✅ Understand common issues and how to fix them

---

## 🎯 Prerequisites

Before you begin:
- [ ] Internet connection
- [ ] Email address (for account creation)
- [ ] Access to your `.env.local` file

**Estimated Setup Time:** 5-10 minutes

---

## 📝 Step 1: Create a Cloudinary Account

### 1.1 Sign Up for Cloudinary

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Click **"Sign Up for Free"** (top right corner)
3. Choose your sign-up method:
   - **Option A:** Sign up with email
     - Enter your email address
     - Create a password
     - Click **"Create Account"**
   - **Option B:** Sign up with social login (Google, GitHub, etc.)
     - Click your preferred provider
     - Authorize Cloudinary access

### 1.2 Verify Your Email

1. Check your email inbox
2. Look for an email from Cloudinary
3. Click the verification link in the email
4. You should be redirected to the Cloudinary dashboard

**If you don't see the email:**
- Check your spam/junk folder
- Wait a few minutes (email delivery can be delayed)
- Try resending the verification email

---

## 🔍 Step 2: Get Your Cloud Name

### 2.1 Find Your Cloud Name

1. Log into your Cloudinary dashboard
2. Your **Cloud Name** is displayed prominently at the top of the dashboard
3. It looks like: `dqxz8abcd` (8-12 characters, lowercase letters and numbers)
4. Copy this value - you'll need it for your `.env.local` file

**Where to find it:**
- At the top of the dashboard, next to your account name
- In the **Dashboard** section under account details
- In the URL: `https://console.cloudinary.com/console/dashboard/[YOUR_CLOUD_NAME]`

**Example:**
```
Cloud Name: dqxz8abcd
```

---

## ⚙️ Step 3: Create an Upload Preset

An upload preset defines how images are uploaded and processed. For StyleSnap, we need an **unsigned** preset (allows client-side uploads without exposing API secrets).

### 3.1 Navigate to Upload Settings

1. In your Cloudinary dashboard, click **Settings** (gear icon in the sidebar)
2. Click **Upload** in the settings menu
3. Scroll down to the **"Upload presets"** section

### 3.2 Create New Upload Preset

1. Click **"Add upload preset"** button
2. A form will appear with configuration options

### 3.3 Configure the Preset

Fill in the form with these settings:

**Preset Name:**
```
stylesnap-unsigned
```
(Or any name you prefer - remember this name, you'll need it!)

**Signing Mode:**
```
Unsigned
```
⚠️ **CRITICAL:** This must be set to "Unsigned" for client-side uploads!

**Folder (Optional):**
```
stylesnap
```
This organizes your uploads into a folder. Optional but recommended.

**Access Mode:**
```
Public
```
Images will be publicly accessible (required for displaying in your app).

**Auto-upload:**
```
Enabled
```
Allows automatic uploads from your application.

**Eager Transformations (Optional):**
```
w_800,h_600,c_fill,q_auto,f_auto
```
This automatically creates optimized versions of your images. Optional but recommended for performance.

**What these transformations do:**
- `w_800,h_600` - Resize to 800x600 pixels
- `c_fill` - Crop to fill dimensions
- `q_auto` - Automatic quality optimization
- `f_auto` - Automatic format selection (WebP when supported)

### 3.4 Save the Preset

1. Review all settings
2. Click **"Save"** button
3. The preset will be created and saved

### 3.5 Copy the Preset Name

1. Note the **Preset name** you just created
2. Copy it - you'll need it for your `.env.local` file

**Example:**
```
Preset Name: stylesnap-unsigned
```

---

## 🔧 Step 4: Configure Environment Variables

### 4.1 Open Your `.env.local` File

1. In your project root directory, open `.env.local`
2. If the file doesn't exist, create it by copying `env.example`:
   ```bash
   cp env.example .env.local
   ```

### 4.2 Add Cloudinary Credentials

Add these lines to your `.env.local` file:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=stylesnap-unsigned
```

**Replace with your actual values:**

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dqxz8abcd
VITE_CLOUDINARY_UPLOAD_PRESET=stylesnap-unsigned
```

**Important Notes:**
- All variables must start with `VITE_` for Vite to expose them
- No quotes needed around values
- No spaces around the `=` sign
- Replace `your_actual_cloud_name_here` with your actual Cloud Name from Step 2
- Replace `stylesnap-unsigned` with your actual preset name if different

### 4.3 Verify Your File

Your `.env.local` should now include Cloudinary configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dqxz8abcd
VITE_CLOUDINARY_UPLOAD_PRESET=stylesnap-unsigned

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

---

## ✅ Step 5: Test the Configuration

### 5.1 Restart Development Server

**Important:** Environment variable changes require restarting the dev server.

1. Stop your development server (if running):
   - Press `Ctrl+C` in the terminal
2. Start it again:
   ```bash
   npm run dev
   ```

### 5.2 Test Image Upload

1. Open your application in the browser: `http://localhost:5173`
2. Sign in (if not already signed in)
3. Navigate to the **Closet** page
4. Click **"Add Item"** or the upload button
5. Select an image file from your computer
6. Fill in item details (name, category, etc.)
7. Click **"Save"** or **"Upload"**

### 5.3 Verify Upload Success

**Expected Results:**
- ✅ Image uploads successfully
- ✅ Item appears in your closet
- ✅ No errors in browser console (F12)
- ✅ Image displays correctly

**Check Cloudinary Dashboard:**
1. Go to **Media Library** in Cloudinary dashboard
2. You should see your uploaded image
3. If you set a folder, check the `stylesnap` folder

---

## 🐛 Troubleshooting

### Error: "Cloudinary not configured"

**Symptoms:**
- Error message appears when trying to upload
- Environment variables seem undefined

**Solutions:**

1. **Check `.env.local` file exists:**
   ```bash
   ls -la .env.local
   ```
   (Or check in your file explorer)

2. **Verify variable names start with `VITE_`:**
   ```env
   ✅ Correct: VITE_CLOUDINARY_CLOUD_NAME
   ❌ Wrong: CLOUDINARY_CLOUD_NAME
   ```

3. **Restart development server:**
   - Stop server (Ctrl+C)
   - Start again: `npm run dev`

4. **Check file location:**
   - `.env.local` must be in project root directory
   - Not in `src/` or `docs/` folders

### Error: "Upload failed: 400 Bad Request"

**Symptoms:**
- Upload fails with 400 error
- Image doesn't upload

**Solutions:**

1. **Verify Cloud Name is correct:**
   - Check Cloud Name in Cloudinary dashboard
   - Match exactly in `.env.local` (case-sensitive)

2. **Check Upload Preset is set to "Unsigned":**
   - Go to Cloudinary → Settings → Upload → Upload presets
   - Click your preset
   - Verify "Signing Mode" is "Unsigned"

3. **Verify Upload Preset name matches exactly:**
   - Check preset name in Cloudinary dashboard
   - Match exactly in `.env.local` (case-sensitive)

### Error: "Upload failed: 401 Unauthorized"

**Symptoms:**
- 401 error when uploading
- Authorization issues

**Solutions:**

1. **Check Upload Preset Signing Mode:**
   - Must be set to **"Unsigned"**
   - If set to "Signed", you'll need API keys (not recommended for client-side)

2. **Create new unsigned preset:**
   - Follow Step 3 again
   - Ensure "Signing Mode" is "Unsigned"
   - Update `.env.local` with new preset name

### Error: "Upload failed: 403 Forbidden"

**Symptoms:**
- 403 error when uploading
- Access denied

**Solutions:**

1. **Check Cloudinary account status:**
   - Ensure account is active (not suspended)
   - Check email for any account notifications

2. **Verify free tier limits:**
   - Check Cloudinary dashboard for usage limits
   - Free tier: 25GB storage, 25GB bandwidth/month
   - If exceeded, upgrade plan or wait for reset

3. **Check Upload Preset is enabled:**
   - Go to Settings → Upload → Upload presets
   - Verify preset shows as "Enabled"

### Images Not Appearing After Upload

**Symptoms:**
- Upload succeeds but images don't display
- Broken image links

**Solutions:**

1. **Check image URL format:**
   - Cloudinary URLs should start with `https://res.cloudinary.com/`
   - Check browser console for image loading errors

2. **Verify Access Mode:**
   - Upload preset must be set to "Public"
   - Private images won't be accessible

3. **Check CORS settings:**
   - Cloudinary allows CORS by default
   - If issues persist, check browser console for CORS errors

---

## 📊 File Upload Limits

### Free Tier Limits

- **Maximum file size:** 10MB per file
- **Storage:** 25GB total
- **Bandwidth:** 25GB/month
- **Supported formats:** JPEG, PNG, WebP, GIF

### Best Practices

1. **Optimize images before upload:**
   - Use image compression tools
   - Reduce file size while maintaining quality

2. **Use eager transformations:**
   - Configure in upload preset
   - Automatically creates optimized versions

3. **Monitor usage:**
   - Check Cloudinary dashboard regularly
   - Plan for upgrade if approaching limits

---

## 🔒 Security Notes

### Client-Side Uploads (Current Setup)

**What we're using:**
- ✅ Unsigned upload preset
- ✅ Client-side uploads (from browser)
- ✅ Public access mode

**Security considerations:**
- Upload preset is public (anyone can use it)
- Images are stored in public folders
- No authentication required for uploads

**For production:**
- Consider implementing server-side uploads
- Add upload limits and validation
- Monitor for abuse

### API Keys (Server-Side Only)

**⚠️ Important:** We're NOT using API keys for client-side uploads.

If you see references to API keys in Cloudinary dashboard:
- **Do NOT** add them to `.env.local`
- They're only needed for server-side operations
- Keep them secret if you use them later

---

## 📚 Additional Resources

### Cloudinary Documentation

- **[Cloudinary Documentation](https://docs.cloudinary.com)** - Complete Cloudinary docs
- **[Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)** - Upload preset configuration
- **[Image Transformations](https://cloudinary.com/documentation/image_transformations)** - Image optimization

### Related StyleSnap Documentation

- **[Getting Started Guide](GETTING_STARTED.md)** - Complete setup from scratch
- **[Complete Setup Guide](SETUP_COMPLETE.md)** - Detailed setup instructions
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Fix common issues

---

## ✅ Verification Checklist

Before moving on, verify:

- [ ] Cloudinary account created and verified
- [ ] Cloud Name copied and added to `.env.local`
- [ ] Upload preset created (unsigned mode)
- [ ] Preset name added to `.env.local`
- [ ] Development server restarted after adding variables
- [ ] Test upload successful
- [ ] Image appears in Cloudinary Media Library
- [ ] No errors in browser console

**If all checkboxes are checked, Cloudinary is properly configured! 🎉**

---

## 🎯 Next Steps

Now that Cloudinary is set up:

1. **Test Image Uploads**
   - Upload images from your application
   - Verify they appear correctly

2. **Configure Transformations (Optional)**
   - Add eager transformations to preset
   - Optimize images automatically

3. **Monitor Usage**
   - Check Cloudinary dashboard regularly
   - Track storage and bandwidth usage

4. **Read More Documentation**
   - Explore Cloudinary features
   - Learn about image transformations

---

**Last Updated:** January 2025  
**Maintained by:** StyleSnap Team
