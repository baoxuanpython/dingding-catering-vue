<template>
  <div class="search-panel">
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="套餐名称">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入套餐名称"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
          :teleported="false"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="套餐分类">
        <el-select
          v-model="searchForm.categoryId"
          placeholder="请选择分类"
          clearable
          class="search-input"
          :teleported="false"
        >
          <el-option
            v-for="cat in categoryList"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="请选择状态"
          clearable
          class="search-input"
          :teleported="false"
        >
          <el-option label="已启售" :value="1" />
          <el-option label="已停售" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item class="action-group">
        <el-button type="primary" @click="handleSearch" class="search-btn">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="handleReset" class="reset-btn">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="handleAdd" class="add-btn">
          <el-icon><Plus /></el-icon>
          新增套餐
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
          class="batch-delete-btn"
        >
          <el-icon><Delete /></el-icon>
          批量删除
          <template v-if="selectedIds.length > 0">
            ({{ selectedIds.length }})
          </template>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Search, RefreshLeft, Plus, Delete } from "@element-plus/icons-vue";

defineProps<{
  searchForm: {
    name: string;
    categoryId: number | undefined;
    status: number | undefined;
  };
  categoryList: { id: number; name: string }[];
  selectedIds: number[];
}>();

const emit = defineEmits<{
  (e: "search"): void;
  (e: "reset"): void;
  (e: "add"): void;
  (e: "batchDelete"): void;
}>();

function handleSearch() {
  emit("search");
}

function handleReset() {
  emit("reset");
}

function handleAdd() {
  emit("add");
}

function handleBatchDelete() {
  emit("batchDelete");
}
</script>
