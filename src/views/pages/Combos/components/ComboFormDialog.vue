<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="960px"
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

        <el-form-item label="启售状态">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启售"
            inactive-text="停售"
          />
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
              <el-icon class="icon-inverse"><Plus /></el-icon> 添加菜品
            </el-button>

            <div
              v-if="formData.setmealDishes.length > 0"
              class="dish-card-list"
            >
              <div
                v-for="(dish, index) in formData.setmealDishes"
                :key="dish.dishId + '-' + index"
                class="dish-card"
              >
                <div class="dish-card-header">
                  <div class="dish-info">
                    <span class="dish-name">{{ dish.name }}</span>
                    <span class="dish-unit-price"
                      >¥{{ dish.price.toFixed(2) }}/份</span
                    >
                  </div>
                  <div class="dish-controls">
                    <el-input-number
                      v-model="dish.copies"
                      :min="1"
                      :max="99"
                      size="small"
                      controls-position="right"
                      :disabled="isDetailMode"
                      class="copies-input"
                    />
                    <span class="dish-subtotal"
                      >小计 ¥{{ (dish.price * dish.copies).toFixed(2) }}</span
                    >
                    <el-button
                      v-if="!isDetailMode"
                      type="danger"
                      size="small"
                      @click="removeDish(index)"
                      class="remove-dish-btn"
                    >
                      删除
                    </el-button>
                  </div>
                </div>

                <!-- 口味区域 -->
                <div class="flavor-section">
                  <div
                    v-if="
                      dish.setmealDishFlavors &&
                      dish.setmealDishFlavors.length > 0
                    "
                    class="flavor-tags"
                  >
                    <el-tag
                      v-for="(flavor, fi) in dish.setmealDishFlavors"
                      :key="fi"
                      :closable="!isDetailMode"
                      size="small"
                      type="info"
                      class="flavor-tag"
                      @close="removeFlavor(index, fi)"
                    >
                      {{ getFlavorLabel(flavor.flavorId) }}：{{
                        flavor.flavorValue
                      }}
                    </el-tag>
                  </div>

                  <div
                    v-if="!isDetailMode && flavorList.length > 0"
                    class="flavor-add"
                  >
                    <template v-if="expandedFlavorIndex === index">
                      <el-select
                        v-model="flavorForm.flavorId"
                        placeholder="选择口味类型"
                        size="small"
                        class="flavor-type-select"
                        @change="onFlavorTypeChange"
                      >
                        <el-option
                          v-for="fl in availableFlavorTypes(index)"
                          :key="fl.id"
                          :label="fl.flavorName"
                          :value="fl.id"
                        />
                      </el-select>
                      <el-select
                        v-model="flavorForm.flavorValue"
                        placeholder="口味值"
                        size="small"
                        class="flavor-value-select"
                      >
                        <el-option
                          v-for="val in flavorValueOptions"
                          :key="val"
                          :label="val"
                          :value="val"
                        />
                      </el-select>
                      <el-button
                        class="confirm-btn"
                        :disabled="
                          !flavorForm.flavorId || !flavorForm.flavorValue
                        "
                        @click="confirmAddFlavor(index)"
                      >
                        确定
                      </el-button>
                      <el-button
                        class="cancel-btn"
                        @click="expandedFlavorIndex = -1"
                      >
                        取消
                      </el-button>
                    </template>
                    <el-button
                      v-else
                      class="add-btn"
                      @click="startAddFlavor(index)"
                    >
                      <el-icon class="icon-inverse"><Plus /></el-icon> 添加口味
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

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

        <!-- 详情模式：展示创建人/更新人 -->
        <template v-if="isDetailMode">
          <el-form-item label="创建人">
            <span class="detail-text">{{
              formData.createEmployeeName || "-"
            }}</span>
          </el-form-item>
          <el-form-item label="最后修改">
            <span class="detail-text"
              >{{ formData.updateEmployeeName || "-" }} ·
              {{ formatTime(formData.updateTime) }}</span
            >
          </el-form-item>
        </template>
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
              <el-icon class="icon-info"><Search /></el-icon>
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
        <el-button class="cancel-btn" @click="showDishSelector = false"
          >取消</el-button
        >
        <el-button class="submit-btn" @click="confirmAddDishes">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, reactive } from "vue";
import { Plus, Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules, UploadProps } from "element-plus";
import type {
  SetmealForm,
  SetmealDishItem,
  SetMealDishFlavor,
  FlavorListItem,
} from "../types/combo";
import request from "@/utils/request";

const props = defineProps<{
  modelValue: boolean;
  isEdit: boolean;
  isDetail: boolean;
  submitLoading: boolean;
  formData: SetmealForm;
  categoryList: { id: number; name: string }[];
  flavorList: FlavorListItem[];
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

// --- 口味相关 ---
const expandedFlavorIndex = ref(-1);
const flavorForm = reactive({
  flavorId: undefined as number | undefined,
  flavorValue: "",
});

const flavorValueOptions = computed(() => {
  if (!flavorForm.flavorId) return [];
  const flavor = props.flavorList.find((f) => f.id === flavorForm.flavorId);
  if (!flavor) return [];
  return flavor.valueList.split(",").map((v) => v.trim());
});

function availableFlavorTypes(dishIndex: number) {
  const dish = props.formData.setmealDishes[dishIndex];
  const usedIds = new Set(
    (dish.setmealDishFlavors || []).map((f) => f.flavorId),
  );
  return props.flavorList.filter((f) => !usedIds.has(f.id));
}

function getFlavorLabel(flavorId: number): string {
  const flavor = props.flavorList.find((f) => f.id === flavorId);
  return flavor?.flavorName || "口味";
}

function startAddFlavor(index: number) {
  expandedFlavorIndex.value = index;
  flavorForm.flavorId = undefined;
  flavorForm.flavorValue = "";
}

function onFlavorTypeChange() {
  flavorForm.flavorValue = "";
}

function confirmAddFlavor(dishIndex: number) {
  if (!flavorForm.flavorId || !flavorForm.flavorValue) return;
  const dish = props.formData.setmealDishes[dishIndex];
  if (!dish.setmealDishFlavors) {
    dish.setmealDishFlavors = [];
  }
  dish.setmealDishFlavors.push({
    id: 0,
    setmealDishId: 0,
    flavorId: flavorForm.flavorId,
    flavorValue: flavorForm.flavorValue,
    flavorName: getFlavorLabel(flavorForm.flavorId),
    valueList:
      props.flavorList.find((f) => f.id === flavorForm.flavorId)?.valueList ||
      "",
  } as SetMealDishFlavor);
  expandedFlavorIndex.value = -1;
  flavorForm.flavorId = undefined;
  flavorForm.flavorValue = "";
}

function removeFlavor(dishIndex: number, flavorIndex: number) {
  const dish = props.formData.setmealDishes[dishIndex];
  if (dish.setmealDishFlavors) {
    dish.setmealDishFlavors.splice(flavorIndex, 1);
  }
}

function formatTime(time?: string): string {
  if (!time) return "-";
  return time.replace("T", " ").substring(0, 19);
}

// --- 图片上传 ---
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
      expandedFlavorIndex.value = -1;
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
      setmealDishFlavors: [],
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
@use "@/styles/common-page.scss";

.form-dialog-content {
  :deep(.add-btn),
  :deep(.confirm-btn) {
    height: 36px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    box-shadow: var(--btn-confirm-shadow);
    background: var(--btn-confirm-bg);
    color: var(--btn-confirm-text);

    &:hover {
      background: var(--btn-confirm-hover);
      box-shadow: var(--btn-confirm-shadow-hover);
      transform: translateY(-2px);
    }
  }
}

:deep(.cancel-btn) {
  height: 36px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: var(--btn-reset-bg);
  color: var(--btn-reset-text);
  border: 1px solid var(--btn-reset-border);
  box-shadow: var(--btn-reset-shadow);

  &:hover {
    background: var(--btn-reset-hover);
    color: var(--btn-reset-text);
    border-color: var(--btn-reset-border);
    box-shadow: var(--btn-reset-shadow-hover);
    transform: translateY(-1px);
  }
}

:deep(.submit-btn) {
  height: 36px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  box-shadow: var(--btn-confirm-shadow);
  background: var(--btn-confirm-bg);
  color: var(--btn-confirm-text);

  &:hover {
    background: var(--btn-confirm-hover);
    box-shadow: var(--btn-confirm-shadow-hover);
    transform: translateY(-2px);
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
  background: linear-gradient(
    135deg,
    var(--color-primary-bg) 0%,
    transparent 100%
  );
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
    var(--color-primary) 0%,
    var(--color-primary-dark) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.saved-amount .price-value {
  color: var(--color-danger);
}

.price-divider {
  font-size: 24px;
  color: var(--text-secondary);
  opacity: 0.5;
}

.dish-section {
  width: 100%;
}

.dish-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.dish-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px 16px;
  background: var(--bg-card);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-primary);
  }
}

.dish-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.dish-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .dish-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
  }

  .dish-unit-price {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.dish-controls {
  display: flex;
  align-items: center;
  gap: 12px;

  .copies-input {
    width: 120px;
  }

  .dish-subtotal {
    font-weight: 600;
    color: var(--color-primary);
    font-size: 14px;
    min-width: 80px;
  }
}

.remove-dish-btn {
  height: 28px;
  border-radius: 6px;
  font-weight: 500;
  background: var(--btn-danger-bg);
  color: var(--btn-danger-text);
  border: 1px solid var(--btn-danger-border);

  &:hover {
    background: var(--btn-danger-hover);
  }
}

.flavor-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
}

.flavor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.flavor-tag {
  cursor: default;
}

.flavor-add {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .flavor-type-select {
    width: 160px;
  }

  .flavor-value-select {
    width: 140px;
  }

  .confirm-btn,
  .cancel-btn,
  .add-btn {
    height: 32px;
    font-size: 13px;
  }
}

.detail-text {
  color: var(--text-secondary);
  font-size: 14px;
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
