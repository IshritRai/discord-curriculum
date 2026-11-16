<script setup>
import DefaultTheme from 'vitepress/theme'
import LessonHeader from './components/LessonHeader.vue'
import LessonFooter from './components/LessonFooter.vue'
import SidebarProgress from './components/SidebarProgress.vue'
import OsPicker from './components/OsPicker.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <ClientOnly><OsPicker /></ClientOnly>
    </template>
    <template #nav-screen-content-after>
      <ClientOnly><OsPicker /></ClientOnly>
    </template>
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
