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
          Privacy Policy
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
              1. Introduction
            </h2>
            <p class="mb-2">
              Welcome to StyleSnap's Privacy Policy. We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
            <p>
              StyleSnap ("we," "our," or "us") operates a digital wardrobe management platform. 
              This policy applies to all users of our website, mobile applications, and related services.
            </p>
          </section>

          <!-- Information We Collect -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              2. Information We Collect
            </h2>
            
            <h3 class="font-semibold mb-2 mt-4">2.1 Information You Provide</h3>
            <ul class="list-disc pl-6 space-y-1 mb-3">
              <li><strong>Account Information:</strong> Name, email address, username, password, and profile picture</li>
              <li><strong>Wardrobe Content:</strong> Photos of clothing items, item descriptions, categories, and outfit combinations</li>
              <li><strong>Social Features:</strong> Friend connections, outfit shares, likes, and comments</li>
              <li><strong>Communications:</strong> Messages, feedback, and support requests</li>
            </ul>

            <h3 class="font-semibold mb-2 mt-4">2.2 Automatically Collected Information</h3>
            <ul class="list-disc pl-6 space-y-1 mb-3">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service, and interaction patterns</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers, and mobile network information</li>
              <li><strong>Location Data:</strong> General location information based on IP address (we do not collect precise GPS location)</li>
              <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience and analyze usage</li>
            </ul>

            <h3 class="font-semibold mb-2 mt-4">2.3 Third-Party Information</h3>
            <p>
              If you sign in using third-party services (e.g., Google), we may receive information from those services, 
              such as your name, email address, and profile picture, in accordance with their privacy policies.
            </p>
          </section>

          <!-- How We Use Your Information -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              3. How We Use Your Information
            </h2>
            <p class="mb-2">We use your information to:</p>
            <ul class="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve the Service</li>
              <li>Create and manage your account</li>
              <li>Enable social features like friend connections and outfit sharing</li>
              <li>Generate AI-powered outfit suggestions and recommendations</li>
              <li>Send you notifications about friend requests, outfit likes, and other activities</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </section>

          <!-- AI and Machine Learning -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              4. AI and Machine Learning
            </h2>
            <p class="mb-2">
              StyleSnap uses artificial intelligence and machine learning technologies to provide outfit suggestions, 
              color matching, and style recommendations.
            </p>
            <p class="mb-2">
              <strong>How AI Uses Your Data:</strong> Your wardrobe items, outfit combinations, and usage patterns may be analyzed 
              by our AI systems to generate personalized recommendations. This analysis happens automatically and is designed to 
              improve your experience.
            </p>
            <p>
              <strong>Data Privacy:</strong> Your personal wardrobe data is used only for your personalized experience and is not 
              shared with other users unless you explicitly choose to share specific outfits or items.
            </p>
          </section>

          <!-- Data Sharing -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              5. How We Share Your Information
            </h2>
            <p class="mb-2">We may share your information in the following circumstances:</p>
            
            <h3 class="font-semibold mb-2 mt-4">5.1 With Other Users</h3>
            <p class="mb-3">
              When you use social features, certain information becomes visible to other users:
            </p>
            <ul class="list-disc pl-6 space-y-1 mb-3">
              <li>Profile information (name, username, profile picture)</li>
              <li>Outfits you share with friends</li>
              <li>Items you choose to make public</li>
              <li>Likes and comments on shared content</li>
            </ul>

            <h3 class="font-semibold mb-2 mt-4">5.2 With Service Providers</h3>
            <p class="mb-3">
              We work with third-party service providers who perform services on our behalf, such as:
            </p>
            <ul class="list-disc pl-6 space-y-1 mb-3">
              <li>Cloud storage providers (for your photos and data)</li>
              <li>Analytics services (to understand usage patterns)</li>
              <li>Authentication services (for secure login)</li>
              <li>Email delivery services (for notifications)</li>
            </ul>

            <h3 class="font-semibold mb-2 mt-4">5.3 For Legal Reasons</h3>
            <p>
              We may disclose your information if required by law, court order, or to protect the rights, 
              property, or safety of StyleSnap, our users, or the public.
            </p>
          </section>

          <!-- Data Security -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              6. Data Security
            </h2>
            <p class="mb-2">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized 
              access, alteration, disclosure, or destruction.
            </p>
            <p class="mb-2">
              <strong>Security Measures:</strong>
            </p>
            <ul class="list-disc pl-6 space-y-1 mb-3">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure backup and recovery procedures</li>
            </ul>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure. 
              While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <!-- Data Retention -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              7. Data Retention
            </h2>
            <p class="mb-2">
              We retain your personal information for as long as necessary to provide the Service and fulfill the purposes 
              outlined in this Privacy Policy.
            </p>
            <p class="mb-2">
              <strong>Account Data:</strong> We retain your account information until you delete your account.
            </p>
            <p class="mb-2">
              <strong>Wardrobe Content:</strong> Your clothing items and outfits are retained until you delete them or close your account.
            </p>
            <p>
              <strong>Deleted Data:</strong> When you delete items or your account, we may retain certain information for legal compliance, 
              fraud prevention, or backup purposes for a limited period (typically 30-90 days).
            </p>
          </section>

          <!-- Your Rights -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              8. Your Privacy Rights
            </h2>
            <p class="mb-2">You have the right to:</p>
            <ul class="list-disc pl-6 space-y-1 mb-3">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restriction:</strong> Request limitation on how we use your data</li>
            </ul>
            <p>
              To exercise these rights, please contact us at privacy@stylesnap.com. We will respond to your request within 30 days.
            </p>
          </section>

          <!-- Children's Privacy -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              9. Children's Privacy
            </h2>
            <p class="mb-2">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information 
              from children under 13.
            </p>
            <p>
              If you are a parent or guardian and believe your child has provided us with personal information, 
              please contact us, and we will delete such information.
            </p>
          </section>

          <!-- Cookies -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              10. Cookies and Tracking Technologies
            </h2>
            <p class="mb-2">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and personalize content.
            </p>
            <p class="mb-2">
              <strong>Types of Cookies:</strong>
            </p>
            <ul class="list-disc pl-6 space-y-1 mb-3">
              <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
            </ul>
            <p>
              You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of the Service.
            </p>
          </section>

          <!-- International Users -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              11. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
            </p>
          </section>

          <!-- Changes to Policy -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              12. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
              on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <!-- Contact -->
          <section>
            <h2 :class="`text-xl font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              13. Contact Us
            </h2>
            <p class="mb-2">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <p class="mt-2 font-medium">
              Email: privacy@stylesnap.com<br>
              Address: StyleSnap, Inc.<br>
              Data Protection Officer: dpo@stylesnap.com<br>
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

