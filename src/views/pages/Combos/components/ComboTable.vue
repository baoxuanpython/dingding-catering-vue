<template>
  <div class="table-panel" v-loading="loading">
    <div class="table-header">
      <span class="table-title">套餐列表</span>
      <span class="table-count">共 {{ pagination.total }} 条记录</span>
    </div>

    <el-table
      :data="comboList"
      stripe
      border
      class="combo-table"
      row-key="id"
      @selection-change="handleSelectionChange"
      :header-cell-style="{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontWeight: '600',
        textAlign: 'center',
      }"
    >
      <el-table-column type="selection" width="50" align="center" />

      <el-table-column label="图片" width="100" align="center" fixed>
        <template #default="{ row }">
          <el-image
            :src="row.image || defaultImage"
            :preview-src-list="[row.image]"
            fit="cover"
            class="combo-image"
            preview-teleported
          >
            <template #error>
              <div class="image-error">
                <el-icon :size="24"><PictureFilled /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>

      <el-table-column
        prop="name"
        label="套餐名称"
        min-width="150"
        resizable
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span class="combo-name">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="categoryName"
        label="分类"
        width="120"
        resizable
        align="center"
      >
        <template #default="{ row }">
          <el-tag size="small" effect="light" class="category-tag">{{
            row.categoryName
          }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="售价" width="120" resizable align="center">
        <template #default="{ row }">
          <span class="price-highlight">¥{{ row.price?.toFixed(2) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="描述"
        min-width="180"
        resizable
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span class="description-text">{{
            row.description || "暂无描述"
          }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120" resizable align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 1 ? 'success' : 'info'"
            effect="dark"
            class="status-tag"
            @click="handleStatusToggle(row)"
          >
            {{ row.status === 1 ? "已启售" : "已停售" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="更新时间" width="170" resizable align="center">
        <template #default="{ row }">
          <span class="time-text">{{ formatTime(row.updateTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="240"
        fixed="right"
        resizable
        align="center"
      >
        <template #default="{ row }">
          <div class="action-btns">
            <el-button
              type="primary"
              text
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button type="info" text size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button
              type="danger"
              text
              size="small"
              @click="handleDelete(row.id)"
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
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PictureFilled } from "@element-plus/icons-vue";
import type { SetmealVO } from "../types/combo";

const props = defineProps<{
  loading: boolean;
  comboList: SetmealVO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}>();

const emit = defineEmits<{
  (e: "selectionChange", rows: SetmealVO[]): void;
  (e: "statusToggle", row: SetmealVO): void;
  (e: "edit", row: SetmealVO): void;
  (e: "detail", row: SetmealVO): void;
  (e: "delete", id: number): void;
  (e: "sizeChange"): void;
  (e: "currentChange"): void;
}>();

const defaultImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f5f7fa' width='100' height='100'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='14' fill='%23909399' text-anchor='middle'%3E暂无图片%3C/text%3E%3C/svg%3E";

function formatTime(time?: string): string {
  if (!time) return "-";
  return time.replace("T", " ").substring(0, 19);
}

function handleSelectionChange(rows: SetmealVO[]) {
  emit("selectionChange", rows);
}

function handleStatusToggle(row: SetmealVO) {
  emit("statusToggle", row);
}

function handleEdit(row: SetmealVO) {
  emit("edit", row);
}

function handleDetail(row: SetmealVO) {
  emit("detail", row);
}

function handleDelete(id: number) {
  emit("delete", id);
}

function handleSizeChange() {
  emit("sizeChange");
}

function handleCurrentChange() {
  emit("currentChange");
}
</script>

<style scoped lang="scss">
.combo-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--primary);
    transform: scale(1.05);
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    color: var(--text-secondary);
  }
}

.combo-name {
  font-weight: 500;
  color: var(--text-primary);
}

.category-tag {
  font-weight: 500;
}

.description-text {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.price-highlight {
  font-weight: 700;
  font-size: 16px;
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding: 4px 12px;
  border-radius: 8px;
  display: inline-block;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--primary-bg) 0%, transparent 100%);
    border-radius: 8px;
    z-index: -1;
    opacity: 0.6;
  }
}

html.dark .price-highlight {
  background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  &::before {
    background: linear-gradient(135deg, var(--primary-bg) 0%, transparent 100%);
  }
}

.status-tag {
  cursor: pointer;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }
}

.combo-table {
  :deep(.el-table__row) {
    transition: background 0.2s;

    &:hover {
      background: rgba(103, 194, 58, 0.04);
    }
  }
}
</style>
