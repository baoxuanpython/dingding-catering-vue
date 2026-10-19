<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="900px"
    destroy-on-close
    class="form-dialog"
  >
    <div class="dialog-content form-dialog-content">
      <!-- 价格对比展示 -->
      <div v-if="showPriceComparison" class="price-comparison">
        <div class="price-item original-price">
          <span class="price-label">套餐原价</span>
          <span class="price-value">¥{{ originalPrice.toFixed(2) }}</span>
        </div>
        <div class="price-divider">→</div>
        <div class="price-item combo-price">
          <span class="price-label">套餐价</span>
          <span class="price-value">¥{{ formData.price.toFixed(2) }}</span>
        </div>
        <div v-if="savedAmount > 0" class="price-item saved-amount">
          <span class="price-label">立省</span>
          <span class="price-value">¥{{ savedAmount.toFixed(2) }}</span>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="combo-form"
        :disabled="isDetailMode"
      >
        <el-form-item label="套餐名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入套餐名称"
            maxlength="32"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="套餐分类" prop="categoryId">
          <el-select
            v-model="formData.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="cat in categoryList"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="套餐价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="0.5"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="套餐图片" prop="image">
          <el-upload
            class="avatar-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            accept=".jpg,.jpeg,.png,.webp"
          >
            <img v-if="previewUrl" :src="previewUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 jpg、png、webp 格式，大小不超过 2MB</div>
        </el-form-item>

        <el-form-item label="套餐菜品" prop="setmealDishes">
          <div class="dish-section">
            <el-button
              v-if="!isDetailMode"
              type="primary"
              @click="showDishSelector = true"
              class="add-btn"
            >
              <el-icon><Plus /></el-icon> 添加菜品
            </el-button>

            <el-table
              v-if="formData.setmealDishes.length > 0"
              :data="formData.setmealDishes"
              border
              class="dish-table"
              size="small"
              style="margin-top: 12px"
            >
              <el-table-column prop="name" label="菜品名称" min-width="150" />
              <el-table-column
                prop="price"
                label="单价"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  ¥{{ row.price.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="copies"
                label="份数"
                width="180"
                align="center"
              >
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.copies"
                    :min="1"
                    :max="99"
                    size="small"
                    controls-position="right"
                    :disabled="isDetailMode"
                  />
                </template>
              </el-table-column>
              <el-table-column label="小计" width="100" align="center">
                <template #default="{ row }">
                  ¥{{ (row.price * row.copies).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="80"
                align="center"
                v-if="!isDetailMode"
              >
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeDish($index)"
                    class="batch-delete-btn"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty
              v-else
              description="暂无菜品，请点击「添加菜品」按钮"
              :image-size="80"
            />
          </div>
        </el-form-item>

        <el-form-item label="套餐描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入套餐描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button
        v-if="!isDetailMode"
        class="cancel-btn"
        @click="visible = false"
        >取消</el-button
      >
      <el-button v-else class="cancel-btn" @click="visible = false"
        >关闭</el-button
      >
      <el-button
        v-if="!isDetailMode"
        class="submit-btn"
        @click="handleConfirm"
        :loading="submitLoading"
        >确定</el-button
      >
    </template>

    <!-- 菜品选择弹窗 -->
    <el-dialog
      v-model="showDishSelector"
      title="选择菜品"
      width="700px"
      append-to-body
      class="dish-selector-dialog"
    >
      <div class="selector-content">
        <div class="selector-search">
          <el-input
            v-model="dishSearchName"
            placeholder="搜索菜品名称"
            clearable
            @input="fetchAvailableDishes"
            style="width: 200px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="dishSearchCategory"
            placeholder="菜品分类"
            clearable
            @change="fetchAvailableDishes"
            style="width: 150px; margin-left: 12px"
          >
            <el-option
              v-for="cat in dishCategoryList"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </div>

        <el-table
          :data="availableDishes"
          v-loading="dishLoading"
          border
          class="available-dish-table"
          size="small"
          style="margin-top: 16px"
          @selection-change="handleDishSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="name" label="菜品名称" min-width="150" />
          <el-table-column
            prop="categoryName"
            label="分类"
            width="100"
            align="center"
          />
          <el-table-column prop="price" label="单价" width="100" align="center">
            <template #default="{ row }">
              ¥{{ row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'info'"
                size="small"
              >
                {{ row.status === 1 ? "启售" : "停售" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="selector-pagination">
          <el-pagination
            v-model:current-page="dishPagination.page"
            v-model:page-size="dishPagination.pageSize"
            :total="dishPagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            small
            @size-change="fetchAvailableDishes"
            @current-change="fetchAvailableDishes"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="showDishSelector = false">取消</el-button>
        <el-button type="primary" @click="confirmAddDishes">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, reactive } from "vue";
import { Plus, Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules, UploadProps } from "element-plus";
import type { SetmealForm, SetmealDishItem } from "../types/combo";
import request from "@/utils/request";

const props = defineProps<{
  modelValue: boolean;
  isEdit: boolean;
  isDetail: boolean;
  submitLoading: boolean;
  formData: SetmealForm;
  categoryList: { id: number; name: string }[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "submit", imageUrl?: string): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const isDetailMode = computed(() => props.isDetail);

const dialogTitle = computed(() => {
  if (isDetailMode.value) return "套餐详情";
  return props.isEdit ? "编辑套餐" : "新增套餐";
});

const formRef = ref<FormInstance>();

const pendingFile = ref<File | null>(null);
const previewUrl = ref<string>("");

const formRules: FormRules = {
  name: [{ required: true, message: "请输入套餐名称", trigger: "blur" }],
  categoryId: [
    { required: true, message: "请选择套餐分类", trigger: "change" },
  ],
  price: [
    { required: true, message: "请输入套餐价格", trigger: "blur" },
    { type: "number", min: 0, message: "价格不能为负数", trigger: "blur" },
  ],
  setmealDishes: [
    {
      validator: (_rule: any, value: SetmealDishItem[], callback: any) => {
        if (!value || value.length === 0) {
          callback(new Error("请至少添加一个菜品"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
};

const showPriceComparison = computed(() => {
  return props.isEdit || props.isDetail;
});

const originalPrice = computed(() => {
  return props.formData.setmealDishes.reduce(
    (sum, dish) => sum + dish.price * dish.copies,
    0,
  );
});

const savedAmount = computed(() => {
  return Math.max(0, originalPrice.value - props.formData.price);
});

const showDishSelector = ref(false);
const dishLoading = ref(false);
const availableDishes = ref<any[]>([]);
const dishCategoryList = ref<{ id: number; name: string }[]>([]);
const selectedDishes = ref<any[]>([]);
const dishSearchName = ref("");
const dishSearchCategory = ref<number | undefined>(undefined);

const dishPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initPreview();
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    } else {
      cleanupPreview();
    }
  },
);

function initPreview() {
  cleanupPreview();
  if (props.formData.image) {
    previewUrl.value = props.formData.image;
    pendingFile.value = null;
  } else {
    previewUrl.value = "";
    pendingFile.value = null;
  }
}

function cleanupPreview() {
  if (pendingFile.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  pendingFile.value = null;
  previewUrl.value = "";
}

function handleFileChange(file: any) {
  const rawFile = file.raw as File;
  if (!rawFile) return;

  const isImage = rawFile.type.startsWith("image/");
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("只能上传 JPG、PNG、WebP 格式的图片！");
    return;
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB！");
    return;
  }

  cleanupPreview();
  pendingFile.value = rawFile;
  previewUrl.value = URL.createObjectURL(rawFile);
}

const beforeUpload: UploadProps["beforeUpload"] = () => {
  return false;
};

async function uploadImage(): Promise<string | null> {
  if (!pendingFile.value) {
    return props.formData.image || null;
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", pendingFile.value);

  try {
    const imageUrl = await request.post<string>(
      "/common/upload",
      uploadFormData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return imageUrl;
  } catch {
    ElMessage.error("图片上传失败，请重试");
    return null;
  }
}

function removeDish(index: number) {
  props.formData.setmealDishes.splice(index, 1);
}

async function fetchAvailableDishes() {
  dishLoading.value = true;
  try {
    const params: any = {
      page: dishPagination.page,
      pageSize: dishPagination.pageSize,
    };
    if (dishSearchName.value) {
      params.name = dishSearchName.value;
    }
    if (dishSearchCategory.value !== undefined) {
      params.categoryId = dishSearchCategory.value;
    }

    const res = await request.get<any>("/dish/page", { params });
    availableDishes.value = res.records || [];
    dishPagination.total = res.total || 0;
  } catch (error) {
    console.error("获取菜品列表失败:", error);
  } finally {
    dishLoading.value = false;
  }
}

async function fetchDishCategories() {
  try {
    const res = await request.get<any[]>("/category/list", {
      params: { type: 1 },
    });
    dishCategoryList.value = res || [];
  } catch (error) {
    console.error("获取菜品分类失败:", error);
  }
}

function handleDishSelectionChange(rows: any[]) {
  selectedDishes.value = rows;
}

function confirmAddDishes() {
  if (selectedDishes.value.length === 0) {
    ElMessage.warning("请选择要添加的菜品");
    return;
  }

  const existingDishIds = new Set(
    props.formData.setmealDishes.map((d) => d.dishId),
  );

  const newDishes = selectedDishes.value.filter(
    (dish) => !existingDishIds.has(dish.id),
  );

  if (newDishes.length === 0) {
    ElMessage.warning("所选菜品已全部添加，无需重复添加");
    showDishSelector.value = false;
    selectedDishes.value = [];
    return;
  }

  newDishes.forEach((dish) => {
    props.formData.setmealDishes.push({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      copies: 1,
    });
  });

  showDishSelector.value = false;
  selectedDishes.value = [];
  ElMessage.success(`已添加 ${newDishes.length} 个菜品`);
}

async function handleConfirm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return;

    const imageUrl = await uploadImage();
    if (imageUrl === null && pendingFile.value) {
      return;
    }

    emit("submit", imageUrl || undefined);
  });
}

watch(
  () => showDishSelector.value,
  (val) => {
    if (val) {
      fetchDishCategories();
      fetchAvailableDishes();
    }
  },
);
</script>

<style scoped lang="scss">
@import "@/styles/common-page.scss";

/* 套餐表单弹窗特有样式 */

/* 让公共样式在对话框内生效 */
.form-dialog-content {
  :deep(.add-btn) {
    height: 36px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    background: var(--btn-confirm-bg);
    color: var(--btn-confirm-text);

    &:hover {
      background: var(--btn-confirm-hover);
      box-shadow: var(--btn-confirm-shadow-hover);
      transform: translateY(-2px);
    }
  }

  :deep(.batch-delete-btn) {
    height: 28px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    background: var(--btn-danger-bg);
    color: var(--btn-danger-text);
    border: 1px solid var(--btn-danger-border);
    box-shadow: var(--btn-danger-shadow);

    &:hover:not(:disabled) {
      background: var(--btn-danger-hover);
      box-shadow: var(--btn-danger-shadow-hover);
      transform: translateY(0px);
    }

    &:disabled {
      background: var(--btn-danger-disabled);
      color: var(--btn-danger-text);
      border: 1px solid var(--btn-danger-border);
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
}

.combo-form {
  padding-right: 16px;
}

.price-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 24px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--primary-bg) 0%, transparent 100%);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .price-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .price-value {
    font-size: 20px;
    font-weight: 700;
  }
}

.original-price .price-value {
  color: var(--text-secondary);
  text-decoration: line-through;
}

.combo-price .price-value {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.saved-amount .price-value {
  color: var(--danger);
}

.price-divider {
  font-size: 24px;
  color: var(--text-secondary);
  opacity: 0.5;
}

html.dark .combo-price .price-value {
  background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dish-section {
  width: 100%;
}

.add-dish-btn {
  border-radius: 8px;
  font-weight: 500;
}

.dish-table {
  :deep(.el-table__cell) {
    text-align: center;
    vertical-align: middle;
  }
}

.selector-content {
  padding: 0 8px;
}

.selector-search {
  display: flex;
  align-items: center;
}

.available-dish-table {
  :deep(.el-table__cell) {
    text-align: center;
    vertical-align: middle;
  }
}

.selector-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
