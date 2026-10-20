<template>
  <div class="search-panel">
    <el-form :model="form" inline class="search-form" @submit.prevent>
      <el-form-item label="分类名称">
        <el-input
          v-model="form.name"
          placeholder="请输入分类名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button class="search-btn" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button class="reset-btn" @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Search, Refresh } from "@element-plus/icons-vue";

const emit = defineEmits<{
  (e: "search", name: string): void;
  (e: "reset"): void;
}>();

const form = ref({ name: "" });

const handleSearch = () => {
  emit("search", form.value.name);
};

const handleReset = () => {
  form.value.name = "";
  emit("reset");
};
</script>

<style scoped>
@use "@/styles/common-page.scss";

/* 分类搜索栏特有样式（如有） */
</style>
