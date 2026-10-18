<template>
  <div class="search-panel">
    <el-form :model="searchForm" class="search-form" @submit.prevent>
      <el-form-item label="口味名称">
        <el-input
          v-model="searchForm.flavorName"
          placeholder="请输入口味名称"
          clearable
          class="search-input"
          @keyup.enter="$emit('search')"
        />
      </el-form-item>
      <div class="action-group">
        <el-button class="search-btn" @click="$emit('search')">搜索</el-button>
        <el-button class="reset-btn" @click="$emit('reset')">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchForm: {
    flavorName: string;
  };
}>();

defineEmits<{
  (e: "search"): void;
  (e: "reset"): void;
}>();
</script>
