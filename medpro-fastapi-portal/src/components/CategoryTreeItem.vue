<template>
  <div>
    <li v-for="cat in [category]" :key="cat.categoryId" class="list-none">
      <button
        class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
        :class="selectedId === cat.categoryId ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface'"
        @click="$emit('select', cat.categoryId)"
      >
        <span
          v-if="cat.children?.length"
          class="material-symbols-outlined text-sm cursor-pointer"
          @click.stop="open = !open"
        >{{ open ? 'expand_more' : 'chevron_right' }}</span>
        <span v-else class="w-4 inline-block" />
        {{ cat.categoryName }}
      </button>
      <ul v-if="open && cat.children?.length" class="ml-4 mt-1 space-y-1">
        <CategoryTreeItem
          v-for="child in cat.children"
          :key="child.categoryId"
          :category="child"
          :selected-id="selectedId"
          @select="$emit('select', $event)"
        />
      </ul>
    </li>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ category: Object, selectedId: { default: null } })
defineEmits(['select'])
const open = ref(false)
</script>
