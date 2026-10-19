<template>
  <div class="page-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-row">
      <div
        class="stat-card stat-all"
        :class="{
          'stat-active': activeStatus === undefined && !isCustomQuery,
          'stat-custom': isCustomQuery,
        }"
        @click="handleStatusFilter(undefined)"
      >
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <span class="stat-value">{{ displayCount }}</span>
          <span class="stat-label">{{
            isCustomQuery ? "指定查询员工" : "全部员工"
          }}</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-enabled"
        :class="{ 'stat-active': activeStatus === 1 && !isCustomQuery }"
        @click="handleStatusFilter(1)"
      >
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.enabled }}</span>
          <span class="stat-label">启用中</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-disabled"
        :class="{ 'stat-active': activeStatus === 0 && !isCustomQuery }"
        @click="handleStatusFilter(0)"
      >
        <div class="stat-icon">⛔</div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.disabled }}</span>
          <span class="stat-label">已禁用</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
    </div>

    <!-- 搜索面板 -->
    <div class="search-panel">
      <el-form :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="员工姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入员工姓名"
            clearable
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            class="search-input"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item class="action-group">
          <el-button class="search-btn" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button class="reset-btn" @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button v-if="isAdmin" class="add-btn" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增员工
          </el-button>
          <el-button
            v-if="isAdmin"
            class="batch-delete-btn"
            type="danger"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格面板 -->
    <div class="table-panel">
      <div class="table-header">
        <span class="table-title">员工列表</span>
        <span class="table-count">共 {{ pagination.total }} 条记录</span>
      </div>
      <el-table
        v-loading="loading"
        :data="employeeList"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="isAdmin"
          type="selection"
          width="55"
          :selectable="(row: EmployeeVO) => row.username !== 'admin'"
        />
        <el-table-column label="姓名" min-width="80">
          <template #default="{ row }">
            <div class="name-cell">
              <div
                class="avatar-placeholder"
                :style="{
                  backgroundColor: getAvatarColor(row.name),
                }"
              >
                {{ getSurnamePinyin(row.name).substring(0, 2) }}
              </div>
              <span class="name-text">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column label="手机号" min-width="140">
          <template #default="{ row }">
            {{ maskPhone(row.phone) }}
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            <el-tag type="success" size="small">
              {{ row.sex === "1" ? "男" : "女" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="身份证号" min-width="180">
          <template #default="{ row }">
            {{ maskIdNumber(row.idNumber) }}
          </template>
        </el-table-column>
        <el-table-column v-if="isAdmin" label="账号状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-if="row.id !== currentEmpId"
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val: number) => handleStatusChange(row, val)"
            />
            <el-tag v-else type="success" size="small">启用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">
            <span class="time-text">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button link type="primary" @click="handleView(row)">
                查看
              </el-button>
              <el-button
                v-if="isAdmin || row.id === currentEmpId"
                link
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="isAdmin || row.id === currentEmpId"
                link
                type="warning"
                @click="handleEditPassword(row)"
              >
                修改密码
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchEmployees"
          @current-change="fetchEmployees"
        />
      </div>
    </div>

    <!-- 新增/编辑员工弹窗 -->
    <EmployeeFormDialog
      v-model="editFormVisible"
      :is-edit="isEdit"
      :form-data="editForm"
      @submit="handleSubmit"
      @reset="resetEditForm"
    />

    <!-- 查看详情弹窗 -->
    <EmployeeDetailDialog
      v-model="viewDialogVisible"
      :employee="currentEmployee"
    />

    <!-- 修改密码弹窗 -->
    <PasswordDialog
      v-model="passwordDialogVisible"
      @submit="handlePasswordSubmit"
      @reset="resetPasswordForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { Search, RefreshLeft, Plus, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import EmployeeFormDialog from "./components/EmployeeFormDialog.vue";
import EmployeeDetailDialog from "./components/EmployeeDetailDialog.vue";
import PasswordDialog from "./components/PasswordDialog.vue";
import {
  getEmployeePage,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  editPassword,
  batchDeleteEmployee,
} from "./api/employeeApi";
import type {
  EmployeeVO,
  EmployeePageQuery,
  EmployeeForm,
} from "./types/employee";
import { getSurnamePinyin, getAvatarColor } from "./utils/pinyin";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const isAdmin = computed(() => userStore.userInfo?.role === "admin");
const currentEmpId = computed(() => userStore.userInfo?.id ?? 0);

// ==================== 统计卡片 ====================
interface EmployeeStatistics {
  enabled: number;
  disabled: number;
}

const statistics = reactive<EmployeeStatistics>({
  enabled: 0,
  disabled: 0,
});

const activeStatus = ref<number | undefined>(undefined);
const isCustomQuery = ref(false);

const displayCount = computed(() => {
  if (isCustomQuery.value) {
    return pagination.total;
  }
  if (activeStatus.value === 1) return statistics.enabled;
  if (activeStatus.value === 0) return statistics.disabled;
  return statistics.enabled + statistics.disabled;
});

async function fetchStatistics() {
  try {
    const [enabledRes, disabledRes] = await Promise.all([
      getEmployeePage({ page: 1, pageSize: 1, status: 1 }),
      getEmployeePage({ page: 1, pageSize: 1, status: 0 }),
    ]);
    statistics.enabled = enabledRes.total || 0;
    statistics.disabled = disabledRes.total || 0;
  } catch (error) {
    console.error("获取统计数据失败:", error);
  }
}

function handleStatusFilter(status: number | undefined) {
  activeStatus.value = status;
  isCustomQuery.value = false;
  searchForm.name = "";
  searchForm.phone = "";
  searchForm.status = undefined;
  pagination.page = 1;
  fetchEmployees();
}

// ==================== 搜索和分页 ====================
const searchForm = reactive({
  name: "",
  phone: "",
  status: undefined as number | undefined,
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const employeeList = ref<EmployeeVO[]>([]);
const loading = ref(false);
const selectedRows = ref<EmployeeVO[]>([]);
const selectedIds = computed(() => selectedRows.value.map((row) => row.id));

function handleSelectionChange(rows: EmployeeVO[]) {
  selectedRows.value = rows;
}

async function fetchEmployees() {
  loading.value = true;
  try {
    const params: EmployeePageQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      phone: searchForm.phone || undefined,
      status: searchForm.status,
    };
    const res = await getEmployeePage(params);
    employeeList.value = res.records || [];
    pagination.total = res.total || 0;
  } catch (error) {
    console.error("获取员工列表失败:", error);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.page = 1;

  // 判断是否为自定义查询
  const hasNameOrPhone = searchForm.name || searchForm.phone;
  const hasStatusOnly = searchForm.status !== undefined && !hasNameOrPhone;

  if (hasNameOrPhone || (searchForm.status !== undefined && hasNameOrPhone)) {
    isCustomQuery.value = true;
  } else if (hasStatusOnly) {
    isCustomQuery.value = false;
    activeStatus.value = searchForm.status;
  } else {
    isCustomQuery.value = false;
    activeStatus.value = undefined;
  }

  fetchEmployees();
}

function handleReset() {
  searchForm.name = "";
  searchForm.phone = "";
  searchForm.status = undefined;
  isCustomQuery.value = false;
  activeStatus.value = undefined;
  pagination.page = 1;
  fetchEmployees();
}

// ==================== 新增/编辑 ====================
const editFormVisible = ref(false);
const isEdit = ref(false);
const editForm = reactive<EmployeeForm>({
  name: "",
  username: "",
  phone: "",
  sex: "1",
  idNumber: "",
});

function handleAdd() {
  isEdit.value = false;
  editFormVisible.value = true;
}

function handleEdit(row: EmployeeVO) {
  isEdit.value = true;
  Object.assign(editForm, {
    id: row.id,
    name: row.name,
    username: row.username,
    phone: row.phone,
    sex: row.sex,
    idNumber: row.idNumber,
  });
  editFormVisible.value = true;
}

async function handleSubmit() {
  try {
    if (isEdit.value) {
      await updateEmployee(editForm);
      ElMessage.success("编辑成功");
    } else {
      await createEmployee(editForm);
      ElMessage.success("新增成功");
    }
    editFormVisible.value = false;
    fetchEmployees();
    fetchStatistics();
  } catch (error) {
    console.error("操作失败:", error);
  }
}

function resetEditForm() {
  Object.assign(editForm, {
    id: undefined,
    name: "",
    username: "",
    phone: "",
    sex: "1",
    idNumber: "",
  });
}

// ==================== 查看详情 ====================
const viewDialogVisible = ref(false);
const currentEmployee = ref<EmployeeVO | null>(null);

function handleView(row: EmployeeVO) {
  currentEmployee.value = row;
  viewDialogVisible.value = true;
}

// ==================== 修改密码 ====================
const passwordDialogVisible = ref(false);
const currentPasswordEmpId = ref(0);

function handleEditPassword(row: EmployeeVO) {
  currentPasswordEmpId.value = row.id;
  passwordDialogVisible.value = true;
}

async function handlePasswordSubmit(data: {
  oldPassword: string;
  newPassword: string;
}) {
  try {
    await editPassword({
      empId: currentPasswordEmpId.value,
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
    ElMessage.success("密码修改成功");
    passwordDialogVisible.value = false;
  } catch (error) {
    console.error("修改密码失败:", error);
  }
}

function resetPasswordForm() {
  currentPasswordEmpId.value = 0;
}

// ==================== 状态切换 ====================
async function handleStatusChange(row: EmployeeVO, val: number) {
  try {
    if (val === 0) {
      await ElMessageBox.confirm(
        `确定要禁用员工"${row.name}"吗？禁用后该员工将无法登录系统。`,
        "禁用确认",
        {
          confirmButtonText: "确定禁用",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
    }

    await updateEmployeeStatus(row.id, val);
    ElMessage.success(val === 1 ? "已启用" : "已禁用");
    fetchStatistics();
  } catch (error) {
    if (error !== "cancel") {
      console.error("状态切换失败:", error);
      row.status = val === 1 ? 0 : 1;
    }
  }
}

// ==================== 批量删除 ====================
async function handleBatchDelete() {
  const deletableIds = selectedIds.value.filter(
    (id) => id !== currentEmpId.value,
  );
  if (deletableIds.length === 0) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${deletableIds.length} 个员工吗？此操作不可恢复`,
      "批量删除确认",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    await batchDeleteEmployee(deletableIds.join(","));
    ElMessage.success("删除成功");
    selectedRows.value = [];
    fetchEmployees();
    fetchStatistics();
  } catch (error) {
    if (error !== "cancel") {
      console.error("批量删除失败:", error);
    }
  }
}

// ==================== 脱敏工具 ====================
function maskPhone(phone: string): string {
  if (isAdmin.value || phone.length !== 11) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(7);
}

function maskIdNumber(idNumber: string): string {
  if (isAdmin.value || idNumber.length !== 18) return idNumber;
  return idNumber.slice(0, 4) + "**********" + idNumber.slice(14);
}

// ==================== 初始化 ====================
onMounted(() => {
  fetchEmployees();
  fetchStatistics();
});
</script>

<style scoped lang="scss">
@import "@/styles/common-page.scss";

/* 员工页面特有样式（如有） */
</style>
