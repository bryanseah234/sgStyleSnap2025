<template>
  <button
    :class="cn(buttonVariants({ variant, size }), 'liquid-button', $attrs.class)"
    v-bind="$attrs"
    @mousedown="handleButtonPress"
    @mouseup="handleButtonRelease"
    @mouseleave="handleButtonRelease"
    @click="handleButtonClick"
  >
    <span class="liquid-button-content">
      <slot />
    </span>
    <div class="liquid-ripple" ref="rippleRef"></div>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useLiquidPress } from '@/composables/useLiquidGlass'

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Liquid glass composable
const { elementRef: buttonRef, pressIn: buttonPressIn, pressOut: buttonPressOut } = useLiquidPress()

// Ripple effect
const rippleRef = ref(null)

const handleButtonPress = (event) => {
  buttonPressIn(event.target)
  createRipple(event)
}

const handleButtonRelease = (event) => {
  buttonPressOut(event.target)
}

const handleButtonClick = (event) => {
  // Add click feedback
  event.target.classList.add('liquid-button-clicked')
  setTimeout(() => {
    event.target.classList.remove('liquid-button-clicked')
  }, 150)
}

const createRipple = (event) => {
  const button = event.target
  const ripple = rippleRef.value
  if (!ripple) return
  
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'
  ripple.classList.add('liquid-ripple-active')
  
  setTimeout(() => {
    ripple.classList.remove('liquid-ripple-active')
  }, 600)
}

defineProps({
  variant: {
    type: String,
    default: "default"
  },
  size: {
    type: String,
    default: "default"
  }
})
</script>
