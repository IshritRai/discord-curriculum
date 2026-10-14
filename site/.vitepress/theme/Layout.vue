<script setup>
import DefaultTheme from 'vitepress/theme'
import LessonHeader from './components/LessonHeader.vue'
import LessonFooter from './components/LessonFooter.vue'
import SidebarProgress from './components/SidebarProgress.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #sidebar-nav-before>
      <ClientOnly><SidebarProgress /></ClientOnly>
    </template>
    <template #doc-before>
      <LessonHeader />
    </template>
    <template #doc-footer-before>
      <ClientOnly><LessonFooter /></ClientOnly>
    </template>
  </Layout>
</template>
