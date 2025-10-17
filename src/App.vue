<!--
  StyleSnap - Main Application Component
  
  Root component that wraps the entire application with the main layout
  and provides the router-view for page navigation.
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <!-- Main application layout wrapper -->
  <Layout>
    <!-- Router view for page components -->
    <router-view />
  </Layout>
</template>

<script setup>
/**
 * Main Application Component
 * 
 * This is the root component of the StyleSnap application. It provides
 * the main layout structure and renders page components through Vue Router.
 * 
 * The Layout component handles:
 * - Navigation sidebar/bottom bar
 * - Theme management
 * - User authentication state
 * - Responsive design
 */
import Layout from './components/Layout.vue'
</script>
