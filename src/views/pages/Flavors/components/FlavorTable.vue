<template>
  <div class="table-panel">
    <div class="table-header">
      <div>
        <span class="table-title">口味列表</span>
        <span class="table-count">（共 {{ pagination.total }} 条）</span>
      </div>
      <div class="table-actions">
        <el-button class="add-btn" @click="$emit('add')">
          <el-icon><Plus /></el-icon> 新增口味
        </el-button>
        <el-button
          class="batch-delete-btn"
          :disabled="selectedIds.length === 0"
          @click="$emit('batch-delete')"
        >
          <el-icon><Delete /></el-icon>
          批量删除
          <template v-if="selectedIds.length > 0">
            ({{ selectedIds.length }})
          </template>
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="flavorList"
      border
      @selection-change="$emit('selection-change', $event)"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column
        prop="flavorName"
        label="口味名称"
        min-width="150"
        align="center"
      />
      <el-table-column
        prop="valueList"
        label="可选值列表"
        min-width="300"
        align="center"
      >
        <template #default="{ row }">
          <div class="value-tags">
            <el-tag
              v-for="(value, index) in row.valueList.split(',')"
              :key="index"
              size="small"
              type="primary"
              class="value-tag-item"
            >
              {{ value }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <div class="action-btns">
            <el-button
              type="primary"
              text
              size="small"
              @click="$emit('edit', row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              text
              size="small"
              @click="$emit('delete', row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('page-change')"
        @current-change="$emit('page-change')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Delete } from "@element-plus/icons-vue";
import type { Flavor } from "../types/flavor";

defineProps<{
  loading: boolean;
  flavorList: Flavor[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  selectedIds: number[];
}>();

defineEmits<{
  (e: "add"): void;
  (e: "edit", row: Flavor): void;
  (e: "delete", row: Flavor): void;
  (e: "batch-delete"): void;
  (e: "selection-change", rows: Flavor[]): void;
  (e: "page-change"): void;
}>();
</script>

<style scoped lang="scss">
@import "@/styles/common-page.scss";

/* 口味表格特有样式 */
.value-tag-item {
  margin: 2px;
}
</style>
