<!--
  QuotaIndicator Component - StyleSnap
  
  Purpose: Displays user's closet upload quota (50 upload limit, unlimited catalog additions)
  
  Props:
  - currentCount: number (items currently in closet)
  - maxCount: number (default: 50, the upload quota limit)
  - showDetails: boolean (default: true - shows "X / 200 items" text)
  
  Usage:
  <QuotaIndicator :currentCount="userItemCount" />
  
  Business Logic:
  - Each user has a 50 upload quota (catalog items unlimited)
  - Show warning when approaching limit (>45 uploads = 90%)
  - Block uploads when at limit
  - Use ProgressBar component internally
  - Color changes: green (0-80%), yellow (80-90%), red (90-100%)
  
  Reference: 
  - requirements/database-schema.md (closet_items table has user quota enforcement)
  - tasks/06-quotas-maintenance.md for quota business logic
  - utils/quota-calculator.js for quota calculation utilities
-->

<template>
  <div class="quota-indicator">
    <div
      v-if="showDetails"
      class="quota-header"
    >
      <span class="quota-count">
        {{ currentCount }} / {{ maxCount }} uploads
      </span>
      <span 
        v-if="quota.isNearLimit" 
        class="quota-badge"
        :class="quota.isFull ? 'quota-badge-danger' : 'quota-badge-warning'"
      >
        {{ quota.isFull ? 'Full' : 'Near Limit' }}
      </span>
    </div>
    
    <ProgressBar 
      :value="currentCount" 
      :max="maxCount" 
      :color="quotaColor"
      size="md"
    />
    
    <p
      v-if="showDetails"
      class="quota-message"
    >
      {{ quotaMessage }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressBar from './ProgressBar.vue'
import { calculateQuota, getQuotaColor, getQuotaMessage } from '@/utils/quota-calculator'

const props = defineProps({
  currentCount: {
    type: Number,
    required: true,
    validator: (value) => value >= 0
  },
  maxCount: {
    type: Number,
    default: 50
  },
  showDetails: {
    type: Boolean,
    default: true
  }
})

const quota = computed(() => calculateQuota(props.currentCount, props.maxCount))
const quotaColor = computed(() => getQuotaColor(quota.value.percentage))
const quotaMessage = computed(() => getQuotaMessage(quota.value))
</script>

<style scoped>
.quota-indicator {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.quota-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quota-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.quota-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.quota-badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.quota-badge-danger {
  background-color: #fee2e2;
  color: #991b1b;
}

.quota-message {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .quota-count {
    color: #d1d5db;
  }
  
  .quota-badge-warning {
    background-color: #78350f;
    color: #fef3c7;
  }
  
  .quota-badge-danger {
    background-color: #7f1d1d;
    color: #fee2e2;
  }
  
  .quota-message {
    color: #9ca3af;
  }
}
</style>
