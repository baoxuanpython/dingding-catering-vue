# 主题：JSON OpenAPI 文件与 MD 接口文档对比检查报告

> 创建日期：2026-10-18
> 标签：#API #OpenAPI #检查报告

## 内容

### 一、路径不一致问题（严重）

以下路径在 JSON 文件中**缺少 `/admin` 前缀**，与 .md 文档不一致：

| 模块 | JSON 中的路径（错误） | .md 中的路径（正确） |
|------|----------------------|---------------------|
| 员工管理 | `/employee/login` | `/admin/employee/login` |
| 员工管理 | `/employee/logout` | `/admin/employee/logout` |
| 员工管理 | `/employee` | `/admin/employee` |
| 员工管理 | `/employee/editPassword` | `/admin/employee/editPassword` |
| 员工管理 | `/employee/page` | `/admin/employee/page` |
| 员工管理 | `/employee/{id}` | `/admin/employee/{id}` |
| 员工管理 | `/employee/status/{status}` | `/admin/employee/status/{status}` |
| 套餐管理 | `/setmeal` | `/admin/setmeal` |
| 套餐管理 | `/setmeal/page` | `/admin/setmeal/page` |
| 套餐管理 | `/setmeal/{id}` | `/admin/setmeal/{id}` |
| 套餐管理 | `/setmeal/status/{status}` | `/admin/setmeal/status/{status}` |
| 口味管理 | `/flavor` | `/admin/flavor` |
| 口味管理 | `/flavor/page` | `/admin/flavor/page` |
| 口味管理 | `/flavor/list` | `/admin/flavor/list` |
| 口味管理 | `/flavor/{id}` | `/admin/flavor/{id}` |
| 店铺操作 | `/shop/status` | `/admin/shop/status` |
| 数据统计 | `/report/turnoverStatistics` | `/admin/report/turnoverStatistics` |
| 数据统计 | `/report/userStatistics` | `/admin/report/userStatistics` |
| 菜品管理 | `/dish` | `/admin/dish` |
| 菜品管理 | `/dish/page` | `/admin/dish/page` |
| 菜品管理 | `/dish/{id}` | `/admin/dish/{id}` |
| 菜品管理 | `/dish/status/{status}` | `/admin/dish/status/{status}` |
| 菜品管理 | `/dish/list` | `/admin/dish/list` |
| 订单管理 | `/order` | `/admin/order` |
| 订单管理 | `/order/confirm` | `/admin/order/confirm` |
| 订单管理 | `/order/rejection` | `/admin/order/rejection` |
| 订单管理 | `/order/cancel` | `/admin/order/cancel` |
| 订单管理 | `/order/statistics` | `/admin/order/statistics` |
| 通用接口 | `/common/upload` | `/admin/common/upload` |

**共 29 个路径缺少 `/admin` 前缀。**

### 二、接口数量对比

| 模块 | .md 接口数 | JSON 接口数 | 状态 |
|------|-----------|------------|------|
| 1. 分类管理 | 6 | 6 | ✅ 一致 |
| 2. 员工管理 | 8 | 8 | ✅ 一致 |
| 3. 套餐管理 | 6 | 6 | ✅ 一致 |
| 4. 口味字典管理 | 6 | 6 | ✅ 一致 |
| 5. 工作台 | 4 | 4 | ✅ 一致 |
| 6. 店铺操作 | 2 | 2 | ✅ 一致 |
| 7. 数据统计 | 5 | 5 | ✅ 一致 |
| 8. 菜品管理 | 7 | 7 | ✅ 一致 |
| 9. 订单管理 | 8 | 8 | ✅ 一致 |
| 10. 通用接口 | 1 | 1 | ✅ 一致 |
| **总计** | **53** | **53** | ✅ 一致 |

### 三、需要补充的内容

#### 3.1 JSON 中缺少的业务规则说明

以下业务规则在 .md 中有详细说明，但 JSON 的 `description` 字段中未体现：

1. **分类删除**（DELETE /admin/category）：
   - .md 中说明了错误码 `3001`（关联套餐）和 `3002`（关联菜品）
   - JSON 中缺少这些业务规则的 description

2. **套餐启用**（POST /admin/setmeal/status/{status}）：
   - .md 中说明了错误码 `5002`（包含未启售菜品）
   - JSON 中缺少此说明

3. **菜品删除**（DELETE /admin/dish）：
   - .md 中说明了错误码 `4001`（起售中不能删除）和 `4002`（被套餐关联不能删除）
   - JSON 中缺少这些说明

4. **口味删除**（DELETE /admin/flavor）：
   - .md 中说明了错误码 `99006`（被关联使用不能删除）
   - JSON 中缺少此说明

#### 3.2 JSON 中缺少的字段说明

1. **Employee 响应**：
   - .md 中明确说明"响应中的 `password` 字段不返回"
   - JSON 的 Employee schema 中未体现此说明

2. **分类新增**：
   - .md 中说明"新增时 `status` 由后端默认设为 `1`，前端无需传递"
   - JSON 的 CategoryDTO 中未体现此说明

3. **分类修改**：
   - .md 中说明"修改时不允许修改 `type`（分类类型），前端应禁用该字段"
   - JSON 中未体现此说明

4. **套餐修改**：
   - .md 中说明"修改套餐时，`setmealDishes` 采用全量覆盖逻辑"
   - JSON 中 description 较简单，未详细说明此逻辑

5. **菜品修改**：
   - .md 中说明"修改菜品时，后端会先删除该菜品的所有口味关联，再重新插入"
   - JSON 中 description 较简单

6. **订单明细展示规则**：
   - .md 中有大量关于 `orderDetailList` 的展示规则说明
   - JSON 中 OrderDetail schema 的 description 较简单

#### 3.3 JSON 中缺少的响应示例

1. **文件上传**（POST /admin/common/upload）：
   - .md 中有完整的响应示例和前端调用方式
   - JSON 中缺少 `200` 响应的 example

2. **导出运营报表**（GET /admin/report/export）：
   - .md 中说明返回 `application/vnd.ms-excel` 文件流
   - JSON 中未体现此特殊响应类型

### 四、Schema 对比

| Schema 名称 | .md 中有 | JSON 中有 | 状态 |
|------------|---------|----------|------|
| ApiResponse | ✅ | ✅ | 一致 |
| PageResult | ✅ | ✅ | 一致 |
| CategoryDTO | ✅ | ✅ | 一致 |
| Category | ✅ | ✅ | 一致 |
| EmployeeLoginDTO | ✅ | ✅ | 一致 |
| EmployeeLoginVO | ✅ | ✅ | 一致 |
| EmployeeDTO | ✅ | ✅ | 一致 |
| PasswordEditDTO | ✅ | ✅ | 一致 |
| Employee | ✅ | ✅ | 一致 |
| SetMealDTO | ✅ | ✅ | 一致 |
| SetMealVO | ✅ | ✅ | 一致 |
| SetMealDish | ✅ | ✅ | 一致 |
| SetMealDishFlavor | ✅ | ✅ | 一致 |
| FlavorDTO | ✅ | ✅ | 一致 |
| Flavor | ✅ | ✅ | 一致 |
| BusinessDataVO | ✅ | ✅ | 一致 |
| DishOverViewVO | ✅ | ✅ | 一致 |
| SetMealOverViewVO | ✅ | ✅ | 一致 |
| OrderOverViewVO | ✅ | ✅ | 一致 |
| TurnoverReportVO | ✅ | ✅ | 一致 |
| OrderReportVO | ✅ | ✅ | 一致 |
| UserReportVO | ✅ | ✅ | 一致 |
| SalesTop10ReportVO | ✅ | ✅ | 一致 |
| DishDTO | ✅ | ✅ | 一致 |
| DishVO | ✅ | ✅ | 一致 |
| Dish | ✅ | ✅ | 一致 |
| OrderVO | ✅ | ✅ | 一致 |
| OrderDetail | ✅ | ✅ | 一致 |
| OrderStatisticsVO | ✅ | ✅ | 一致 |
| OrdersConfirmDTO | ✅ | ✅ | 一致 |
| OrdersRejectionDTO | ✅ | ✅ | 一致 |
| OrdersCancelDTO | ✅ | ✅ | 一致 |

### 五、总结

1. **路径问题（必须修复）**：29 个路径缺少 `/admin` 前缀，这是最严重的问题
2. **接口数量**：53 个接口完全一致，无遗漏
3. **Schema 定义**：所有 Schema 都已包含，无遗漏
4. **业务规则**：JSON 中的 description 字段可以补充更多业务规则说明
5. **响应示例**：部分接口缺少响应示例

### 六、修复建议

1. 批量为 29 个路径添加 `/admin` 前缀
2. 为关键接口补充业务规则 description
3. 为文件上传和导出接口补充响应示例
4. 为特殊业务逻辑（如全量覆盖、默认值等）补充说明
