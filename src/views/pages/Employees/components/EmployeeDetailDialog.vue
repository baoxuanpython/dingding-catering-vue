<template>
  <el-dialog v-model="visible" title="员工详情" width="600px">
    <div v-if="employee" class="detail-grid">
      <div class="detail-item">
        <span class="detail-label">姓名</span>
        <span class="detail-value">{{ employee.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">用户名</span>
        <span class="detail-value">{{ employee.username }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">手机号</span>
        <span class="detail-value">{{ maskPhone(employee.phone) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">性别</span>
        <span class="detail-value">{{
          employee.sex === "1" ? "男" : "女"
        }}</span>
      </div>
      <div class="detail-item full-width">
        <span class="detail-label">身份证号</span>
        <span class="detail-value">{{ maskIdNumber(employee.idNumber) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">账号状态</span>
        <span class="detail-value">
          <el-tag :type="employee.status === 1 ? 'success' : 'info'">
            {{ employee.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">创建时间</span>
        <span class="detail-value">{{ employee.createTime }}</span>
      </div>
      <div class="detail-item full-width">
        <span class="detail-label">更新时间</span>
        <span class="detail-value">{{ employee.updateTime }}</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { EmployeeVO } from "../types/employee";

const props = defineProps<{
  modelValue: boolean;
  employee: EmployeeVO | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

function maskPhone(phone?: string): string {
  if (!phone) return "-";
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}

function maskIdNumber(idNumber?: string): string {
  if (!idNumber) return "-";
  return idNumber.replace(/^(.{4}).*(.{4})$/, "$1**************$2");
}
</script>

<style scoped lang="scss">
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.detail-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary);
  word-break: break-all;
}
</style>
