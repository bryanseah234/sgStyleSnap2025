# Email Template Examples

This document shows all email templates used in the email notification system, along with enhanced versions you can use.

## Template Structure

All templates follow this structure:
- **Subject**: Clear, action-oriented subject line
- **HTML Body**: Responsive email with styling
- **Call-to-action**: Encourage app engagement
- **Footer**: Unsubscribe/preferences information

---

## 1. Friend Request Email

**Subject:** `You received a friend request on StyleSnap`

**Current Template:**
```html
<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
  <h2 style="margin:0 0 12px; color:#1f2937;">New friend request 👋</h2>
  <p style="margin:0 0 12px; color:#374151; font-size:16px;">${actorName} sent you a friend request on StyleSnap.</p>
  <p style="margin:0 0 12px; color:#374151; font-size:16px;">Open the app to accept or decline.</p>
  <div style="margin-top:24px; padding-top:24px; border-top:1px solid #e5e7eb;">
    <p style="margin:0; color:#6b7280; font-size:14px;">You're receiving this email because you have email notifications enabled.</p>
  </div>
</div>
```

**Enhanced Version (with button):**
```html
<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:0; background-color:#ffffff;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:32px 20px; text-align:center;">
    <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">StyleSnap</h1>
  </div>
  
  <!-- Content -->
  <div style="padding:40px 20px;">
    <div style="text-align:center; margin-bottom:32px;">
      <div style="width:80px; height:80px; border-radius:50%; background-color:#f3f4f6; display:inline-flex; align-items:center; justify-content:center; font-size:48px;">
        👋
      </div>
    </div>
    
    <h2 style="margin:0 0 16px; color:#1f2937; font-size:24px; font-weight:600; text-align:center;">New Friend Request</h2>
    
    <p style="margin:0 0 24px; color:#374151; font-size:18px; text-align:center; line-height:1.6;">
      <strong style="color:#1f2937;">${actorName}</strong> wants to connect with you on StyleSnap!
    </p>
    
    <!-- CTA Button -->
    <div style="text-align:center; margin:32px 0;">
      <a href="https://stylesnap.app/friends" 
         style="display:inline-block; padding:14px 32px; background-color:#667eea; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">
        View Request →
      </a>
    </div>
    
    <p style="margin:0 0 16px; color:#6b7280; font-size:14px; text-align:center;">
      Accept or decline the friend request in the app
    </p>
  </div>
  
  <!-- Footer -->
  <div style="padding:24px 20px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 8px; color:#6b7280; font-size:12px; text-align:center;">
      You're receiving this because you have email notifications enabled.
    </p>
    <p style="margin:0; color:#9ca3af; font-size:12px; text-align:center;">
      <a href="https://stylesnap.app/profile" style="color:#9ca3af; text-decoration:underline;">Manage preferences</a>
    </p>
  </div>
</div>
```

---

## 2. Friend Request Accepted Email

**Subject:** `Your friend request was accepted on StyleSnap`

**Enhanced Version:**
```html
<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:0; background-color:#ffffff;">
  <div style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); padding:32px 20px; text-align:center;">
    <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">StyleSnap</h1>
  </div>
  
  <div style="padding:40px 20px;">
    <div style="text-align:center; margin-bottom:32px;">
      <div style="width:80px; height:80px; border-radius:50%; background-color:#d1fae5; display:inline-flex; align-items:center; justify-content:center; font-size:48px;">
        🎉
      </div>
    </div>
    
    <h2 style="margin:0 0 16px; color:#1f2937; font-size:24px; font-weight:600; text-align:center;">Friend Request Accepted!</h2>
    
    <p style="margin:0 0 24px; color:#374151; font-size:18px; text-align:center; line-height:1.6;">
      <strong style="color:#1f2937;">${actorName}</strong> accepted your friend request. You can now view each other's closets and create outfits together!
    </p>
    
    <div style="text-align:center; margin:32px 0;">
      <a href="https://stylesnap.app/friends" 
         style="display:inline-block; padding:14px 32px; background-color:#10b981; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">
        View Friend's Closet →
      </a>
    </div>
  </div>
  
  <div style="padding:24px 20px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 8px; color:#6b7280; font-size:12px; text-align:center;">
      You're receiving this because you have email notifications enabled.
    </p>
    <p style="margin:0; color:#9ca3af; font-size:12px; text-align:center;">
      <a href="https://stylesnap.app/profile" style="color:#9ca3af; text-decoration:underline;">Manage preferences</a>
    </p>
  </div>
</div>
```

---

## 3. Outfit Like Email

**Subject:** `Someone liked your outfit on StyleSnap`

**Enhanced Version:**
```html
<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:0; background-color:#ffffff;">
  <div style="background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding:32px 20px; text-align:center;">
    <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">StyleSnap</h1>
  </div>
  
  <div style="padding:40px 20px;">
    <div style="text-align:center; margin-bottom:32px;">
      <div style="width:80px; height:80px; border-radius:50%; background-color:#fce7f3; display:inline-flex; align-items:center; justify-content:center; font-size:48px;">
        ❤️
      </div>
    </div>
    
    <h2 style="margin:0 0 16px; color:#1f2937; font-size:24px; font-weight:600; text-align:center;">Your Outfit Got a Like!</h2>
    
    <p style="margin:0 0 24px; color:#374151; font-size:18px; text-align:center; line-height:1.6;">
      <strong style="color:#1f2937;">${actorName}</strong> liked your outfit on StyleSnap.
    </p>
    
    <div style="text-align:center; margin:32px 0;">
      <a href="https://stylesnap.app/outfits" 
         style="display:inline-block; padding:14px 32px; background-color:#ec4899; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">
        View Outfit →
      </a>
    </div>
  </div>
  
  <div style="padding:24px 20px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 8px; color:#6b7280; font-size:12px; text-align:center;">
      You're receiving this because you have email notifications enabled.
    </p>
    <p style="margin:0; color:#9ca3af; font-size:12px; text-align:center;">
      <a href="https://stylesnap.app/profile" style="color:#9ca3af; text-decoration:underline;">Manage preferences</a>
    </p>
  </div>
</div>
```

---

## 4. Outfit Shared Email

**Subject:** `A friend shared an outfit with you on StyleSnap`

**Enhanced Version:**
```html
<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:0; background-color:#ffffff;">
  <div style="background:linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding:32px 20px; text-align:center;">
    <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">StyleSnap</h1>
  </div>
  
  <div style="padding:40px 20px;">
    <div style="text-align:center; margin-bottom:32px;">
      <div style="width:80px; height:80px; border-radius:50%; background-color:#ede9fe; display:inline-flex; align-items:center; justify-content:center; font-size:48px;">
        👗
      </div>
    </div>
    
    <h2 style="margin:0 0 16px; color:#1f2937; font-size:24px; font-weight:600; text-align:center;">Outfit Shared With You</h2>
    
    <p style="margin:0 0 24px; color:#374151; font-size:18px; text-align:center; line-height:1.6;">
      <strong style="color:#1f2937;">${actorName}</strong> shared an outfit with you. Check it out!
    </p>
    
    <div style="text-align:center; margin:32px 0;">
      <a href="https://stylesnap.app/outfits" 
         style="display:inline-block; padding:14px 32px; background-color:#8b5cf6; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">
        View Shared Outfit →
      </a>
    </div>
  </div>
  
  <div style="padding:24px 20px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 8px; color:#6b7280; font-size:12px; text-align:center;">
      You're receiving this because you have email notifications enabled.
    </p>
    <p style="margin:0; color:#9ca3af; font-size:12px; text-align:center;">
      <a href="https://stylesnap.app/profile" style="color:#9ca3af; text-decoration:underline;">Manage preferences</a>
    </p>
  </div>
</div>
```

---

## 5. Outfit Suggestion Email

**Subject:** `You have an outfit suggestion on StyleSnap`

**Enhanced Version:**
```html
<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:0; background-color:#ffffff;">
  <div style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding:32px 20px; text-align:center;">
    <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">StyleSnap</h1>
  </div>
  
  <div style="padding:40px 20px;">
    <div style="text-align:center; margin-bottom:32px;">
      <div style="width:80px; height:80px; border-radius:50%; background-color:#fef3c7; display:inline-flex; align-items:center; justify-content:center; font-size:48px;">
        💡
      </div>
    </div>
    
    <h2 style="margin:0 0 16px; color:#1f2937; font-size:24px; font-weight:600; text-align:center;">New Outfit Suggestion!</h2>
    
    <p style="margin:0 0 24px; color:#374151; font-size:18px; text-align:center; line-height:1.6;">
      <strong style="color:#1f2937;">${actorName}</strong> created an outfit suggestion using items from your closet!
    </p>
    
    <div style="text-align:center; margin:32px 0;">
      <a href="https://stylesnap.app/outfits" 
         style="display:inline-block; padding:14px 32px; background-color:#f59e0b; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">
        Review Suggestion →
      </a>
    </div>
    
    <p style="margin:0; color:#6b7280; font-size:14px; text-align:center;">
      Approve it to add to your outfits, or reject it if it's not your style.
    </p>
  </div>
  
  <div style="padding:24px 20px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 8px; color:#6b7280; font-size:12px; text-align:center;">
      You're receiving this because you have email notifications enabled.
    </p>
    <p style="margin:0; color:#9ca3af; font-size:12px; text-align:center;">
      <a href="https://stylesnap.app/profile" style="color:#9ca3af; text-decoration:underline;">Manage preferences</a>
    </p>
  </div>
</div>
```

---

## 6. Comment Email

**Subject:** `New comment on your outfit on StyleSnap`

**Enhanced Version:**
```html
<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; padding:0; background-color:#ffffff;">
  <div style="background:linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding:32px 20px; text-align:center;">
    <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">StyleSnap</h1>
  </div>
  
  <div style="padding:40px 20px;">
    <div style="text-align:center; margin-bottom:32px;">
      <div style="width:80px; height:80px; border-radius:50%; background-color:#cffafe; display:inline-flex; align-items:center; justify-content:center; font-size:48px;">
        💬
      </div>
    </div>
    
    <h2 style="margin:0 0 16px; color:#1f2937; font-size:24px; font-weight:600; text-align:center;">New Comment on Your Outfit</h2>
    
    <p style="margin:0 0 24px; color:#374151; font-size:18px; text-align:center; line-height:1.6;">
      <strong style="color:#1f2937;">${actorName}</strong> commented on your outfit. See what they said!
    </p>
    
    <div style="text-align:center; margin:32px 0;">
      <a href="https://stylesnap.app/outfits" 
         style="display:inline-block; padding:14px 32px; background-color:#06b6d4; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">
        View Comment →
      </a>
    </div>
  </div>
  
  <div style="padding:24px 20px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 8px; color:#6b7280; font-size:12px; text-align:center;">
      You're receiving this because you have email notifications enabled.
    </p>
    <p style="margin:0; color:#9ca3af; font-size:12px; text-align:center;">
      <a href="https://stylesnap.app/profile" style="color:#9ca3af; text-decoration:underline;">Manage preferences</a>
    </p>
  </div>
</div>
```

---

## Template Customization Tips

1. **Colors**: Each notification type has a unique color gradient for brand consistency
2. **Emojis**: Visual icons make emails more engaging and scannable
3. **Buttons**: Clear CTAs drive users back to the app
4. **Mobile-friendly**: All templates use inline styles for email client compatibility
5. **Footer**: Always include preference management link

---

## Testing Templates

You can test templates by:

1. **Preview in browser**: Save HTML to `.html` file and open
2. **Email testing service**: Use services like Litmus or Email on Acid
3. **Brevo preview**: Brevo dashboard has a preview feature
4. **Send test email**: Use Edge Function with test notification data

