<template>
  <div class="table-panel">
    <div class="table-header">
      <span class="table-title">分类列表</span>
      <el-button class="add-btn" @click="$emit('add')">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <el-table
      :data="data"
      v-loading="loading"
      stripe
      border
      class="category-table"
    >
      <el-table-column prop="name" label="分类名称" min-width="150" />
      <el-table-column prop="sort" label="排序" width="100" align="center" />
      <el-table-column prop="type" label="分类类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'primary' : 'warning'" size="small">
            {{ row.type === 1 ? "菜品分类" : "套餐分类" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === 1"
            @change="handleStatusChange(row.id, $event)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="$emit('edit', row)">
            编辑
          </el-button>
          <el-button type="danger" link @click="$emit('delete', row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import type { Category } from "../types/category";
import { CategoryType } from "../types/category";

interface Props {
  data: Category[];
  loading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "add"): void;
  (e: "edit", row: Category): void;
  (e: "delete", id: number): void;
  (e: "statusChange", id: number, status: number): void;
}>();

const handleStatusChange = (id: number, enabled: boolean | string | number) => {
  const status = enabled ? 1 : 0;
  emit("statusChange", id, status);
};
</script>

<style scoped>
.table-panel {
  padding: 24px;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-light);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.category-table {
  --el-table-border-color: var(--border-color);
  --el-table-header-bg-color: var(--bg-secondary);
}
</style>
