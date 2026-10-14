<script setup>
// Lists the concepts this lesson introduces, straight from concepts.json.
import { computed } from 'vue'
import { useData } from 'vitepress'
import ledger from '../../../../concepts.json'
import { tokenLabel } from './tokenLabel.js'

const { frontmatter } = useData()
const concepts = computed(() => ledger.concepts.filter((c) => c.lesson === frontmatter.value.lesson))
</script>

<template>
  <div class="concept-list">
    <p class="concept-list-title">New in this lesson (from the <a href="../concepts">concept ledger</a>)</p>
    <ul>
      <li v-for="c in concepts" :key="c.id">
        <strong>{{ c.title }}</strong>
        <span class="concept-tokens">
          <code v-for="t in c.tokens.slice(0, 8)" :key="t">{{ tokenLabel(t) }}</code>
          <span v-if="c.tokens.length > 8">+{{ c.tokens.length - 8 }} more</span>
        </span>
      </li>
    </ul>
  </div>
</template>
