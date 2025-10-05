<!--
  AddItemForm Component - StyleSnap
  
  Purpose: Form for adding new clothing items to closet (also used for editing)
  
  Form Fields:
  - name: string (required, max 100 chars)
  - category: enum (required, one of: tops, bottoms, shoes, outerwear, accessories)
  - color: string (optional, max 50 chars)
  - brand: string (optional, max 100 chars)
  - season: enum (optional, one of: spring, summer, fall, winter, all)
  - image: file upload (required, max 5MB, formats: jpg, png, webp)
  
  Features:
  - Image preview before upload
  - Client-side image compression (using utils/image-compression.js)
  - Validation for all fields
  - Check quota before allowing upload (200 item limit)
  - Upload progress indicator
  - Error handling
  
  Upload Flow:
  1. User selects image -> compress on client side
  2. Upload compressed image to Cloudinary
  3. Get Cloudinary URL
  4. Save item metadata + Cloudinary URL to Supabase
  5. Update closet store
  
  Usage:
  <AddItemForm @success="handleSuccess" @cancel="handleCancel" />
  (typically shown in a modal)
  
  Reference:
  - docs/design/mobile-mockups/04-add-item.png for form design
  - requirements/database-schema.md for closet_items schema
  - requirements/api-endpoints.md for POST /api/closet endpoint
  - tasks/03-closet-crud-image-management.md for image upload implementation
-->

<template>
  <!-- TODO: Implement form with all fields -->
  <!-- TODO: Add image upload with preview -->
  <!-- TODO: Show quota check before allowing submission -->
  <!-- TODO: Add progress bar for upload -->
  <!-- TODO: Validate all fields before submission -->
</template>

<script setup>
// TODO: Define emits (success, cancel)
// TODO: Import image compression utility
// TODO: Import closet store for quota check
// TODO: Handle image selection and preview
// TODO: Implement form submission with Cloudinary upload
// TODO: Handle errors and show notifications
</script>

<style scoped>
/* TODO: Add form styles */
/* TODO: Add image preview styles */
</style>
