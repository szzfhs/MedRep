<template>
  <div>
    <!-- 章（chapter）— 不可选中，只展开折叠 -->
    <button
      v-if="section.sectionType === 'chapter'"
      class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition"
      @click="open = !open"
    >
      <span class="truncate">{{ section.title }}</span>
      <span class="material-symbols-outlined text-base shrink-0 ml-1">
        {{ open ? 'expand_less' : 'expand_more' }}
      </span>
    </button>

    <!-- 节（section）— 可选中 -->
    <button
      v-else
      class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition"
      :class="
        currentId === section.sectionId
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-slate-600 hover:bg-surface-container'
      "
      @click="$emit('select', section)"
    >
      <span
        class="material-symbols-outlined text-base shrink-0"
        :class="section.completed ? 'text-green-500' : 'text-slate-300'"
      >
        {{ section.completed ? 'check_circle' : 'radio_button_unchecked' }}
      </span>
      <span class="truncate text-left">{{ section.title }}</span>
    </button>

    <!-- 子章节 -->
    <div v-if="section.children?.length && open" class="ml-3 border-l border-outline-variant pl-1 mt-0.5">
      <SectionTreeItem
        v-for="child in section.children"
        :key="child.sectionId"
        :section="child"
        :current-id="currentId"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  section: { type: Object, required: true },
  currentId: { type: Number, default: null }
})

defineEmits(['select'])

// 章默认展开
const open = ref(true)
</script>
