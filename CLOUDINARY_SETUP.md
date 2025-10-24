# Cloudinary Setup Guide for StyleSnap

## Overview
StyleSnap uses Cloudinary for image uploads and management. This guide will help you set up Cloudinary for your application.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Cloud Name

1. Log into your Cloudinary dashboard
2. Your **Cloud Name** is displayed at the top of the dashboard
3. Copy this value - you'll need it for `VITE_CLOUDINARY_CLOUD_NAME`

## Step 3: Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `stylesnap-unsigned` (or any name you prefer)
   - **Signing Mode**: `Unsigned` (important for client-side uploads)
   - **Folder**: `stylesnap` (optional, for organization)
   - **Access mode**: `Public`
   - **Auto-upload**: `Enabled`
5. Click **Save**
6. Copy the **Preset name** - you'll need it for `VITE_CLOUDINARY_UPLOAD_PRESET`

## Step 4: Configure Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Cloudinary credentials:
   ```env
   # Cloudinary Configuration
   VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name_here
   VITE_CLOUDINARY_UPLOAD_PRESET=your_actual_preset_name_here
   ```

## Step 5: Test the Configuration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try uploading an image in the app
3. Check the browser console for upload logs
4. Verify the image appears in your Cloudinary dashboard

## Troubleshooting

### Error: "Cloudinary not configured"
- Check that your `.env.local` file exists and contains the correct variables
- Ensure variable names start with `VITE_`
- Restart your development server after adding environment variables

### Error: "Upload failed: 400 Bad Request"
- Verify your Cloud Name is correct
- Ensure your Upload Preset is set to "Unsigned"
- Check that the Upload Preset name matches exactly

### Error: "Upload failed: 401 Unauthorized"
- Your Upload Preset might be set to "Signed" instead of "Unsigned"
- Create a new unsigned preset or modify the existing one

### Error: "Upload failed: 403 Forbidden"
- Check your Cloudinary account status
- Ensure you haven't exceeded your free tier limits
- Verify the Upload Preset is enabled

## File Upload Limits

- **Maximum file size**: 10MB
- **Supported formats**: JPEG, PNG, WebP, GIF
- **Free tier limits**: 25GB storage, 25GB bandwidth per month

## Security Notes

- Upload presets are configured for unsigned uploads (client-side)
- Images are stored in public folders
- Consider implementing server-side uploads for production applications
- Monitor your usage to avoid exceeding free tier limits

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Cloudinary dashboard shows the uploaded images
3. Check your Cloudinary account usage and limits
4. Review the Cloudinary documentation: [docs.cloudinary.com](https://docs.cloudinary.com)
