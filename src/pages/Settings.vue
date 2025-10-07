<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <button
            @click="goBack"
            class="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 class="text-xl font-semibold text-gray-900">Settings</h1>
          <div class="w-16"></div> <!-- Spacer for centering -->
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
        <button
          @click="loadProfile"
          class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>

      <!-- Settings Content -->
      <div v-else class="space-y-6">
        <!-- Profile Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          
          <div class="space-y-4">
            <!-- Username (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div class="flex items-center">
                <input
                  type="text"
                  :value="profile.username"
                  readonly
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <span class="ml-2 text-xs text-gray-500">
                  (Auto-generated from email)
                </span>
              </div>
            </div>

            <!-- Name (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div class="flex items-center">
                <input
                  type="text"
                  :value="profile.name"
                  readonly
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <span class="ml-2 text-xs text-gray-500">
                  (From Google)
                </span>
              </div>
            </div>

            <!-- Email (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                :value="profile.email"
                readonly
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- Profile Photo -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
          
          <!-- Current Avatar -->
          <div class="mb-6">
            <p class="text-sm text-gray-700 mb-2">Current photo:</p>
            <img
              :src="profile.avatar_url || defaultAvatars[0].url"
              :alt="profile.name"
              class="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
            />
          </div>

          <!-- Avatar Selection Grid -->
          <div>
            <p class="text-sm text-gray-700 mb-3">Choose a profile photo:</p>
            <div class="grid grid-cols-3 gap-4">
              <button
                v-for="avatar in defaultAvatars"
                :key="avatar.id"
                @click="selectAvatar(avatar.url)"
                :disabled="updatingAvatar"
                class="relative group"
                :class="[
                  'rounded-lg overflow-hidden transition-all',
                  profile.avatar_url === avatar.url
                    ? 'ring-4 ring-blue-500 ring-offset-2'
                    : 'hover:ring-2 hover:ring-blue-300'
                ]"
              >
                <img
                  :src="avatar.url"
                  :alt="avatar.alt"
                  class="w-full h-auto aspect-square object-cover"
                  :class="[
                    updatingAvatar ? 'opacity-50' : 'opacity-100'
                  ]"
                />
                
                <!-- Selected Indicator -->
                <div
                  v-if="profile.avatar_url === avatar.url"
                  class="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20"
                >
                  <svg class="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>

                <!-- Hover Overlay -->
                <div
                  v-if="profile.avatar_url !== avatar.url && !updatingAvatar"
                  class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"
                >
                  <span class="text-white text-sm font-medium opacity-0 group-hover:opacity-100">
                    Select
                  </span>
                </div>
              </button>
            </div>

            <!-- Update Status -->
            <div v-if="updatingAvatar" class="mt-4 text-center text-sm text-gray-600">
              Updating profile photo...
            </div>
            <div v-if="updateSuccess" class="mt-4 text-center text-sm text-green-600">
              ✓ Profile photo updated successfully!
            </div>
            <div v-if="updateError" class="mt-4 text-center text-sm text-red-600">
              {{ updateError }}
            </div>
          </div>

          <!-- Future: Custom Upload -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-500 italic">
              Custom photo uploads coming soon!
            </p>
          </div>
        </div>

        <!-- Sign Out -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Account</h2>
          <button
            @click="handleSignOut"
            :disabled="signingOut"
            class="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ signingOut ? 'Signing out...' : 'Sign Out' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUserProfile, updateUserAvatar, getDefaultAvatars } from '../services/user-service.js';
import { signOut } from '../services/auth-service.js';

const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const profile = ref({});
const defaultAvatars = ref(getDefaultAvatars());
const updatingAvatar = ref(false);
const updateSuccess = ref(false);
const updateError = ref(null);
const signingOut = ref(false);

// Load user profile
async function loadProfile() {
  loading.value = true;
  error.value = null;
  
  try {
    profile.value = await getUserProfile();
  } catch (err) {
    console.error('Failed to load profile:', err);
    error.value = 'Failed to load profile. Please try again.';
  } finally {
    loading.value = false;
  }
}

// Select avatar
async function selectAvatar(avatarUrl) {
  if (profile.value.avatar_url === avatarUrl) {
    return; // Already selected
  }
  
  updatingAvatar.value = true;
  updateSuccess.value = false;
  updateError.value = null;
  
  try {
    const updatedProfile = await updateUserAvatar(avatarUrl);
    profile.value = updatedProfile;
    updateSuccess.value = true;
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      updateSuccess.value = false;
    }, 3000);
  } catch (err) {
    console.error('Failed to update avatar:', err);
    updateError.value = err.message || 'Failed to update profile photo. Please try again.';
    
    // Hide error message after 5 seconds
    setTimeout(() => {
      updateError.value = null;
    }, 5000);
  } finally {
    updatingAvatar.value = false;
  }
}

// Handle sign out
async function handleSignOut() {
  if (!confirm('Are you sure you want to sign out?')) {
    return;
  }
  
  signingOut.value = true;
  
  try {
    await signOut();
    router.push('/login');
  } catch (err) {
    console.error('Failed to sign out:', err);
    alert('Failed to sign out. Please try again.');
  } finally {
    signingOut.value = false;
  }
}

// Go back to previous page
function goBack() {
  router.back();
}

// Load profile on mount
onMounted(() => {
  loadProfile();
});
</script>
