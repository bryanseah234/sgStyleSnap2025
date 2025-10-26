<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click="close"
  >
    <div
      :class="`relative w-full max-w-3xl max-h-[90vh] rounded-2xl p-8 overflow-y-auto ${
        theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
      }`"
      @click.stop
    >
      <!-- Close Button -->
      <button
        @click="close"
        :class="`absolute top-4 right-4 p-2 rounded-lg transition-all ${
          theme.value === 'dark'
            ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            : 'hover:bg-stone-100 text-stone-500 hover:text-black'
        }`"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Content -->
      <div class="pr-4">
        <h1 :class="`text-3xl font-bold mb-2 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          Terms of Service
        </h1>
        
        <p :class="`text-sm mb-6 ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Last Updated: January 2025
        </p>

        <div :class="`space-y-6 text-sm ${
          theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
        }`">
          <!-- Introduction -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              1. Acceptance of Terms
            </h2>
            <p class="mb-2">
              Welcome to StyleSnap! By accessing or using our service, you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, please do not use our service.
            </p>
            <p>
              StyleSnap ("we," "our," or "us") provides a digital wardrobe management and outfit creation platform. 
              These Terms govern your access to and use of our website, mobile applications, and related services (collectively, the "Service").
            </p>
          </section>

          <!-- User Accounts -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              2. User Accounts
            </h2>
            <p class="mb-2">
              <strong>Account Creation:</strong> To use certain features of the Service, you must create an account. 
              You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
            </p>
            <p class="mb-2">
              <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            <p>
              <strong>Age Requirement:</strong> You must be at least 13 years old to use StyleSnap. 
              If you are under 18, you must have permission from a parent or guardian.
            </p>
          </section>

          <!-- User Content -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              3. User Content
            </h2>
            <p class="mb-2">
              <strong>Your Content:</strong> You retain ownership of any content you upload, post, or share through the Service 
              ("User Content"), including photos of clothing items and outfit combinations.
            </p>
            <p class="mb-2">
              <strong>License to StyleSnap:</strong> By uploading User Content, you grant StyleSnap a worldwide, non-exclusive, 
              royalty-free license to use, reproduce, modify, adapt, publish, and display your User Content solely for the purpose 
              of providing and improving the Service.
            </p>
            <p class="mb-2">
              <strong>Prohibited Content:</strong> You agree not to upload content that is illegal, offensive, defamatory, 
              infringing on intellectual property rights, or otherwise violates these Terms or applicable laws.
            </p>
            <p>
              <strong>Content Moderation:</strong> We reserve the right to remove any User Content that violates these Terms 
              or is otherwise objectionable at our sole discretion.
            </p>
          </section>

          <!-- Privacy -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              4. Privacy and Data Protection
            </h2>
            <p>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. 
              By using the Service, you agree to our collection and use of information as described in the Privacy Policy.
            </p>
          </section>

          <!-- Acceptable Use -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              5. Acceptable Use
            </h2>
            <p class="mb-2">You agree not to:</p>
            <ul class="list-disc pl-6 space-y-1">
              <li>Use the Service for any illegal purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Upload viruses, malware, or other harmful code</li>
              <li>Scrape, data-mine, or collect information about other users without permission</li>
              <li>Use the Service for commercial purposes without our prior written consent</li>
            </ul>
          </section>

          <!-- Intellectual Property -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              6. Intellectual Property
            </h2>
            <p class="mb-2">
              The Service and its original content (excluding User Content), features, and functionality are owned by StyleSnap 
              and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written permission.
            </p>
          </section>

          <!-- AI and Automated Features -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              7. AI and Automated Features
            </h2>
            <p class="mb-2">
              StyleSnap may use artificial intelligence and machine learning to provide outfit suggestions and recommendations. 
              These suggestions are provided "as is" and should be considered as general guidance only.
            </p>
            <p>
              We do not guarantee the accuracy, completeness, or suitability of AI-generated suggestions. 
              You are solely responsible for your fashion choices and outfit decisions.
            </p>
          </section>

          <!-- Disclaimers -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              8. Disclaimers
            </h2>
            <p class="mb-2">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              StyleSnap does not warrant that the Service will be uninterrupted, secure, or error-free, 
              or that defects will be corrected.
            </p>
          </section>

          <!-- Limitation of Liability -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              9. Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, StyleSnap SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, 
              OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <!-- Termination -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              10. Termination
            </h2>
            <p class="mb-2">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, 
              for any reason, including if you breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their 
              nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          <!-- Changes to Terms -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              11. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms 
              on this page and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes 
              your acceptance of the new Terms.
            </p>
          </section>

          <!-- Governing Law -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              12. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which StyleSnap operates, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <!-- Contact -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              13. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p class="mt-2 font-medium">
              Email: legal@stylesnap.com<br>
              Address: StyleSnap, Inc.<br>
              Last Updated: January 2025
            </p>
          </section>
        </div>

        <!-- Accept Button -->
        <div class="mt-8 pt-6 border-t" :class="theme.value === 'dark' ? 'border-zinc-800' : 'border-stone-200'">
          <button
            @click="close"
            :class="`w-full px-6 py-3 rounded-xl font-medium transition-all ${
              theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800'
            }`"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { X } from 'lucide-vue-next'

const { theme } = useTheme()

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

