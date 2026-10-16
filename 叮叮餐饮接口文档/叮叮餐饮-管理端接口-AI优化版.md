# 叮叮餐饮-管理端接口文档（AI优化版）

> 创建日期：2026-10-12
> 标签：#API #管理端 #TypeScript

## 通用说明

### 基础路径

```
Base URL: /admin
```

### 统一响应格式

```json
{
  "code": 1, // 状态码：1=成功，其他=失败（具体错误码见下方错误码表）
  "data": {}, // 响应数据（类型因接口而异）
  "msg": "操作成功" // 提示信息
}
```

### 统一分页响应格式

```json
{
  "code": 1,
  "data": {
    "total": 0, // 总记录数
    "records": [] // 当前页数据列表
  },
  "msg": null
}
```

### HTTP 状态码说明

后端采用 **HTTP 状态码 + 业务错误码** 双层设计：

| HTTP 状态码 | 含义                                   | 前端处理建议             |
| ----------- | -------------------------------------- | ------------------------ |
| `200`       | 请求成功                               | 正常处理响应数据         |
| `400`       | 参数校验失败                           | 提示用户检查输入         |
| `401`       | 认证失败（未登录/令牌过期/密码错误等） | 跳转登录页               |
| `403`       | 权限不足                               | 提示用户无权操作         |
| `409`       | 资源冲突（数据已存在/不允许删除等）    | 提示用户具体冲突原因     |
| `422`       | 业务规则不满足                         | 提示用户具体业务错误     |
| `500`       | 服务器内部错误                         | 提示系统异常，联系管理员 |

### 业务错误码表

当 `code != 1` 时，`code` 字段为以下业务错误码之一：

#### 认证模块（1xxx）

| 错误码 | 说明         | 对应 HTTP 状态码 |
| ------ | ------------ | ---------------- |
| `1001` | 令牌已过期   | 401              |
| `1002` | 令牌无效     | 401              |
| `1003` | 用户未登录   | 401              |
| `1004` | 账号不存在   | 401              |
| `1005` | 账号已被锁定 | 401              |
| `1006` | 密码错误     | 401              |
| `1007` | 登录失败     | 401              |

#### 员工模块（2xxx）

| 错误码 | 说明                   | 对应 HTTP 状态码 |
| ------ | ---------------------- | ---------------- |
| `2001` | 密码修改失败           | 422              |
| `2002` | 无权为其他用户操作数据 | 403              |

#### 分类模块（3xxx）

| 错误码 | 说明                         | 对应 HTTP 状态码 |
| ------ | ---------------------------- | ---------------- |
| `3001` | 当前分类关联了套餐，不能删除 | 409              |
| `3002` | 当前分类关联了菜品，不能删除 | 409              |

#### 菜品模块（4xxx）

| 错误码 | 说明                         | 对应 HTTP 状态码 |
| ------ | ---------------------------- | ---------------- |
| `4001` | 起售中的菜品不能删除         | 409              |
| `4002` | 当前菜品关联了套餐，不能删除 | 409              |
| `4003` | 菜品不存在                   | 409              |

#### 套餐模块（5xxx）

| 错误码 | 说明                           | 对应 HTTP 状态码 |
| ------ | ------------------------------ | ---------------- |
| `5001` | 起售中的套餐不能删除           | 409              |
| `5002` | 套餐内包含未启售菜品，无法启用 | 409              |
| `5003` | 套餐不存在                     | 409              |

#### 订单模块（6xxx）

| 错误码 | 说明         | 对应 HTTP 状态码 |
| ------ | ------------ | ---------------- |
| `6001` | 订单状态错误 | 422              |
| `6002` | 订单不存在   | 422              |
| `6003` | 订单业务异常 | 422              |

#### 购物车模块（7xxx）

| 错误码 | 说明                     | 对应 HTTP 状态码 |
| ------ | ------------------------ | ---------------- |
| `7001` | 购物车数据为空，不能下单 | 422              |
| `7002` | 购物车业务异常           | 422              |

#### 地址簿模块（8xxx）

| 错误码 | 说明                   | 对应 HTTP 状态码 |
| ------ | ---------------------- | ---------------- |
| `8001` | 用户地址为空，不能下单 | 422              |
| `8002` | 地址业务异常           | 422              |

#### 通用/系统模块（9xxx）

| 错误码 | 说明                     | 对应 HTTP 状态码 |
| ------ | ------------------------ | ---------------- |
| `9001` | 参数校验失败             | 400              |
| `9002` | 数据已存在               | 409              |
| `9003` | 文件上传失败             | 500              |
| `9004` | JSON 序列化/反序列化异常 | 500              |
| `9005` | 不允许删除               | 409              |
| `9999` | 未知错误                 | 500              |

### 前端拦截器建议

```typescript
// axios 响应拦截器示例
axios.interceptors.response.use(
  (response) => {
    // HTTP 2xx：正常处理
    const { code, msg, data } = response.data;
    if (code === 1) return data;
    ElMessage.error(msg);
    return Promise.reject(new Error(msg));
  },
  (error) => {
    // HTTP 4xx/5xx：按状态码分流
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      ElMessage.error("登录已过期，请重新登录");
      router.push("/login");
    } else if (status === 400) {
      ElMessage.error(data?.msg || "参数错误");
    } else if (status === 403) {
      ElMessage.error(data?.msg || "无权操作");
    } else if (status === 409) {
      ElMessage.error(data?.msg || "资源冲突");
    } else if (status === 422) {
      ElMessage.error(data?.msg || "业务规则不满足");
    } else if (status === 500) {
      ElMessage.error(data?.msg || "系统异常，请联系管理员");
    } else {
      ElMessage.error("网络错误");
    }
    return Promise.reject(error);
  },
);
```

### 认证方式

- 登录后返回 JWT token
- 后续请求需在 Header 中携带 token（具体 Header 名称待确认，通常为 `Authorization` 或 `token`）

---

## 1. 分类管理 (Category)

### 1.1 修改分类

- **Path**: `PUT /admin/category`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface CategoryDTO {
  id: number; // 分类id（必填，int64）
  name: string; // 分类名称（必填，string）
  sort: number; // 排序权重（数值越小越靠前，必填，int32）
  type: number; // 分类类型：1=菜品分类，2=套餐分类（必填，int32）
}
```

- **响应**: `ApiResponse<string>`

### 1.2 分类分页查询

- **Path**: `GET /admin/category/page`
- **查询参数**:

```typescript
interface CategoryPageQueryDTO {
  name?: string; // 分类名称（可选，模糊查询，string）
  page: number; // 页码（必填，int32）
  pageSize: number; // 每页记录数（必填，int32）
  type?: number; // 分类类型：1=菜品分类，2=套餐分类（可选，int32）
}
```

- **响应**: `ApiResponse<PageResult<Category>>`

```typescript
interface Category {
  id: number; // 分类id（int64）
  type: number; // 分类类型：1=菜品分类，2=套餐分类（int32）
  name: string; // 分类名称（string）
  sort: number; // 排序权重（数值越小越靠前，int32）
  status: number; // 状态：1=启用，0=禁用（int32，1=启用），0=禁用（int32）
  createTime: string; // 创建时间（date-time）
  updateTime: string; // 更新时间（date-time）
  createUser: number; // 创建人id（int64）
  updateUser: number; // 更新人id（int64）
}
```

### 1.3 启用/禁用分类

- **Path**: `POST /admin/category/status/{status}`
- **路径参数**:
  - `status`: 1=启用，0=禁用
- **查询参数**:
  - `id`: 分类id（必填）
- **响应**: `ApiResponse<string>`

### 1.4 新增分类

- **Path**: `POST /admin/category`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface CategoryDTO {
  name: string; // 分类名称（必填，string）
  sort: number; // 排序权重（数值越小越靠前，必填，int32）
  type: number; // 分类类型：1=菜品分类，2=套餐分类（必填，int32）
}
```

- **响应**: `ApiResponse<string>`

### 1.5 根据id删除分类

- **Path**: `DELETE /admin/category`
- **查询参数**:
  - `id`: 分类id（必填）
- **响应**: `ApiResponse<string>`

### 1.6 根据类型查询分类列表

- **Path**: `GET /admin/category/list`
- **查询参数**:
  - `type?`: 分类类型：1=菜品分类，2=套餐分类（可选）
- **响应**: `ApiResponse<Category[]>`

```typescript
interface Category {
  createTime?: string; // 创建时间（date-time）
  createUser?: number; // 创建人id（int64）
  id?: number; // 分类id（int64）
  name?: string; // 分类名称（string）
  sort?: number; // 排序权重（数值越小越靠前，int32）
  status?: number; // 状态（int32）
  type?: number; // 类型（int32）
  updateTime?: string; // 更新时间（date-time）
  updateUser?: number; // 更新人id（int64）
}
```

---

## 2. 员工管理 (Employee)

### 2.1 修改密码

- **Path**: `PUT /admin/employee/editPassword`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface PasswordEditDTO {
  empId: number; // 员工id（必填，int64）
  newPassword: string; // 新密码（必填，string）
  oldPassword: string; // 旧密码（必填，string）
}
```

- **响应**: `ApiResponse<string>`

### 2.2 启用/禁用员工账号

- **Path**: `POST /admin/employee/status/{status}`
- **路径参数**:
  - `status`: 1=启用，0=禁用
- **查询参数**:
  - `id`: 员工id（必填）
- **响应**: `ApiResponse<string>`

### 2.3 员工分页查询

- **Path**: `GET /admin/employee/page`
- **查询参数**:

```typescript
interface EmployeePageQueryDTO {
  name?: string; // 员工姓名（可选，模糊查询，string）
  page: number; // 页码（必填，int32）
  pageSize: number; // 每页记录数（必填，int32）
  status?: number; // 状态（可选，int32）
  phone?: string; // 手机号（可选，模糊查询，string）
}
```

- **响应**: `ApiResponse<PageResult<Employee>>`

```typescript
interface Employee {
  id: number; // 员工id（int64）
  username: string; // 用户名（string）
  name: string; // 姓名（string）
  password: string; // 密码（string）
  phone: string; // 手机号（string）
  sex: string; // 性别（男1，女2，string）
  idNumber: string; // 身份证号（string）
  status: number; // 账号状态（int32）
  createTime: string | null; // 创建时间（date-time）
  updateTime: string; // 更新时间（date-time）
  createUser: number | null; // 创建人id（int64）
  updateUser: number; // 更新人id（int64）
}
```

### 2.4 员工登录

- **Path**: `POST /admin/employee/login`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface EmployeeLoginDTO {
  password: string; // 密码（必填，string）
  username: string; // 用户名（必填，string）
}
```

- **响应**: `ApiResponse<LoginResponse>`

```typescript
interface EmployeeLoginVO {
  id?: number; // 主键值（int64）
  name?: string; // 姓名（string）
  token?: string; // JWT令牌（string）
  userName?: string; // 用户名（string）
}
```

### 2.5 新增员工

- **Path**: `POST /admin/employee`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface EmployeeDTO {
  id?: number; // 员工id（可选，int64）
  idNumber: string; // 身份证号（必填，string）
  name: string; // 姓名（必填，string）
  phone: string; // 手机号（必填，string）
  sex: string; // 性别（必填，string）
  username: string; // 用户名（必填，string）
}
```

- **响应**: `ApiResponse<object>`

### 2.6 根据id查询员工

- **Path**: `GET /admin/employee/{id}`
- **路径参数**:
  - `id`: 员工id
- **响应**: `ApiResponse<EmployeeDetail>`

```typescript
interface Employee {
  createTime?: string; // 创建时间（date-time）
  createUser?: number; // 创建人id（int64）
  id?: number; // 员工id（int64）
  idNumber?: string; // 身份证号（string）
  name?: string; // 姓名（string）
  password?: string; // 密码（string）
  phone?: string; // 手机号（string）
  sex?: string; // 性别（男1，女2，string）
  status?: number; // 账号状态（int32）
  updateTime?: string; // 更新时间（date-time）
  updateUser?: number; // 更新人id（int64）
  username?: string; // 用户名（string）
}
```

### 2.7 编辑员工信息

- **Path**: `PUT /admin/employee`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface EmployeeDTO {
  id: number; // 员工id（必填，int64）
  idNumber: string; // 身份证号（必填，string）
  name: string; // 姓名（必填，string）
  phone: string; // 手机号（必填，string）
  sex: string; // 性别（男1，女2，string）
  username: string; // 用户名（必填，string）
}
```

- **响应**: `ApiResponse<string>`

### 2.8 退出登录

- **Path**: `POST /admin/employee/logout`
- **Content-Type**: `application/json`
- **请求体**: 无
- **响应**: `ApiResponse<string>`

---

## 3. 套餐管理 (Setmeal)

### 3.1 修改套餐

- **Path**: `PUT /admin/setmeal`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface SetMealDTO {
  categoryId: number; // 分类id（必填，int64）
  description?: string; // 套餐描述（可选，string）
  id: number; // 套餐id（必填，int64）
  image: string; // 套餐图片路径（必填，string）
  name: string; // 套餐名称（必填，string）
  price: number; // 套餐价格（必填，double）
  status?: number; // 套餐起售状态（可选，int32）
  setmealDishes: SetMealDish[]; // 套餐和菜品关联关系（必填，SetMealDish[]）
}

interface SetMealDish {
  copies: number; // 菜品份数（必填，int32）
  dishId: number; // 菜品id（必填，int64）
  id?: number; // 关系表主键值（可选，int64）
  name: string; // 菜品名称（必填，string）
  price: number; // 菜品价格（必填，double）
  setmealId?: number; // 套餐id（可选，int64，修改时不强制要求）
  flavors?: Flavor[]; // 口味类型id列表（可选，Flavor[]，修改时不强制要求）
}
interface Flavor {
  id?: number; // 口味类型id（可选，int64）
  flavorName: string; // 口味类型名称（必填，如"辣度"、"麻度"）
  flavorValue?: string; // 口味类型值（可选，如"不辣"、"微辣"）
  valueList?: string[]; // 口味类型值列表（必填，逗号分隔，如"不辣,微辣,中辣,特辣"）
}
```

- **响应**: `ApiResponse<object>`

### 3.2 套餐分页查询

- **Path**: `GET /admin/setmeal/page`
- **查询参数**:

```typescript
interface SetMealPageQueryDTO {
  categoryId?: number; // 分类id（可选，int64）
  name?: string; // 套餐名称（可选，模糊查询，string）
  page: number; // 页码（必填，int32）
  pageSize: number; // 每页记录数（必填，int32）
  status?: number; // 套餐起售状态（可选，int32）
}
```

- **响应**: `ApiResponse<PageResult<SetmealVO>>`

```typescript
interface SetmealVO {
  id: number; // 套餐id（int64）
  categoryId: number; // 分类id（int64）
  name: string; // 套餐名称（string）
  price: number; // 套餐价格（double）
  status: number; // 套餐起售状态（int32）
  description: string; // 套餐描述（string）
  image: string; // 套餐图片路径（string）
  updateTime: string; // 更新时间（date-time）
  categoryName: string; // 分类名称（后端关联查询返回，string）
  setmealDishes: SetMealDish[]; // 套餐包含的菜品（后端关联查询返回，SetMealDish[]）
}

interface SetMealDish {
  copies: number; // 菜品份数（必填，int32）
  dishId: number; // 菜品id（必填，int64）
  id?: number; // 关系表主键值（可选，int64）
  name: string; // 菜品名称（必填，string）
  price: number; // 菜品价格（必填，double）
  setmealId?: number; // 套餐id（可选，int64，修改时不强制要求）
  flavors?: Flavor[]; // 口味类型id列表（可选，Flavor[]，修改时不强制要求）
}
interface Flavor {
  id?: number; // 口味类型id（可选，int64）
  flavorName: string; // 口味类型名称（必填，如"辣度"、"麻度"）
  flavorValue?: string; // 口味类型值（可选，如"不辣"、"微辣"）
  valueList?: string[]; // 口味类型值列表（必填，逗号分隔，如"不辣,微辣,中辣,特辣"）
}
```

### 3.3 套餐起售/停售

- **Path**: `POST /admin/setmeal/status/{status}`
- **路径参数**:
  - `status`: 1=起售，0=停售
- **查询参数**:
  - `id`: 套餐id（必填）
- **响应**: `ApiResponse<object>`

### 3.4 批量删除套餐

- **Path**: `DELETE /admin/setmeal`
- **查询参数**:
  - `ids`: 套餐id列表（必填，逗号分隔或数组）
- **响应**: `ApiResponse<object>`

### 3.5 新增套餐

- **Path**: `POST /admin/setmeal`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface SetMealDTO {
  categoryId: number; // 分类id（必填，int64）
  description?: string; // 套餐描述（可选，string）
  id?: number; // 套餐id（可选，int64）
  image: string; // 套餐图片路径（必填，string）
  name: string; // 套餐名称（必填，string）
  price: number; // 套餐价格（必填，double）
  setmealDishes: SetMealDish[]; // 套餐包含的菜品（必填，SetMealDish[]）
  status?: number; // 套餐起售状态（可选，int32）
}

interface SetMealDish {
  copies: number; // 菜品份数（必填，int32）
  dishId: number; // 菜品id（必填，int64）
  id?: number; // 关系表主键值（可选，int64）
  name: string; // 菜品名称（必填，string）
  price: number; // 菜品价格（必填，double）
  setmealId?: number; // 套餐id（可选，int64，修改时不强制要求）
  flavors?: Flavor[]; // 口味类型id列表（可选，Flavor[]，修改时不强制要求）
}
interface Flavor {
  id?: number; // 口味类型id（可选，int64）
  flavorName: string; // 口味类型名称（必填，如"辣度"、"麻度"）
  flavorValue?: string; // 口味类型值（可选，如"不辣"、"微辣"）
  valueList?: string[]; // 口味类型值列表（必填，逗号分隔，如"不辣,微辣,中辣,特辣"）
}
```

- **响应**: `ApiResponse<object>`

### 3.6 根据id查询套餐

- **Path**: `GET /admin/setmeal/{id}`
- **路径参数**:
  - `id`: 套餐id
- **响应**: `ApiResponse<SetmealDetail>`

```typescript
interface SetmealVO {
  id: number; // 套餐id（int64）
  categoryId: number; // 分类id（int64）
  name: string; // 套餐名称（string）
  price: number; // 套餐价格（double）
  status: number; // 套餐起售状态（int32）
  description: string; // 套餐描述（string）
  image: string; // 套餐图片路径（string）
  updateTime: string; // 更新时间（date-time）
  categoryName: string; // 分类名称（后端关联查询返回，string）
  setmealDishes: SetMealDish[]; // 套餐包含的菜品（后端关联查询返回，SetMealDish[]）
}

interface SetMealDish {
  copies: number; // 菜品份数（必填，int32）
  dishId: number; // 菜品id（必填，int64）
  id?: number; // 关系表主键值（可选，int64）
  name: string; // 菜品名称（必填，string）
  price: number; // 菜品价格（必填，double）
  setmealId?: number; // 套餐id（可选，int64，修改时不强制要求）
  flavors?: Flavor[]; // 口味类型id列表（可选，Flavor[]，修改时不强制要求）  
}
interface Flavor {
  id?: number; // 口味类型id（可选，int64）
  flavorName: string; // 口味类型名称（必填，如"辣度"、"麻度"）
  flavorValue?: string; // 口味类型值（可选，如"不辣"、"微辣"）
  valueList?: string[]; // 口味类型值列表（必填，逗号分隔，如"不辣,微辣,中辣,特辣"）
}
```

---

## 4. 菜品管理 (Dish)

### 4.1 修改菜品

- **Path**: `PUT /admin/dish`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface DishDTO {
  id: number; // 菜品id（必填，int64）
  name: string; // 菜品名称（必填，string）
  categoryId: number; // 分类id（必填，int64）
  price: number; // 菜品价格（必填，double）
  image: string; // 菜品图片路径（必填，string）
  description?: string; // 菜品描述（可选，string）
  status?: number; // 菜品状态：1=起售，0=停售（可选，int32）
  flavors?: Flavor[]; // 口味类型id列表（可选，Flavor[]，修改时不强制要求）
}
interface Flavor {
  id?: number; // 口味类型id（可选，int64）
  flavorName: string; // 口味类型名称（必填，如"辣度"、"麻度"）
  flavorValue?: string; // 口味类型值（可选，如"不辣"、"微辣"）
  valueList?: string[]; // 口味类型值列表（必填，逗号分隔，如"不辣,微辣,中辣,特辣"）
}
```

- **响应**: `ApiResponse<string>`

### 4.2 批量删除菜品

- **Path**: `DELETE /admin/dish`
- **查询参数**:
  - `ids`: 菜品id列表，用逗号分隔（必填，示例：`1,2,3`）
- **响应**: `ApiResponse<string>`

### 4.3 新增菜品

- **Path**: `POST /admin/dish`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface DishDTO {
  name: string; // 菜品名称（必填，string）
  categoryId: number; // 分类id（必填，int64）
  price: number; // 菜品价格（必填，double）
  image: string; // 菜品图片路径（必填，string）
  description?: string; // 菜品描述（可选，string）
  status?: number; // 菜品状态：1=起售，0=停售（可选，int32）
  flavors?: Flavor[]; // 口味类型id列表（可选，Flavor[]，修改时不强制要求）
}

interface Flavor {
  id?: number; // 口味类型id（可选，int64）
  flavorName: string; // 口味类型名称（必填，如"辣度"、"麻度"）
  flavorValue?: string; // 口味类型值（可选，如"不辣"、"微辣"）
  valueList?: string[]; // 口味类型值列表（必填，逗号分隔，如"不辣,微辣,中辣,特辣"）
}
```

- **响应**: `ApiResponse<string>`

### 4.4 根据id查询菜品

- **Path**: `GET /admin/dish/{id}`
- **路径参数**:
  - `id`: 菜品id（必填）
- **响应**: `ApiResponse<DishDetail>`

```typescript
interface DishVO {
  id: number; // 菜品id（int64）
  name: string; // 菜品名称（string）
  categoryId: number; // 分类id（int64）
  categoryName: string; // 分类名称（string）
  price: number; // 菜品价格（double）
  image: string; // 菜品图片路径（string）
  description: string; // 菜品描述（string）
  status: number; // 菜品状态（1=起售，0=停售，int32）
  updateTime: string; // 更新时间（date-time）
  flavors: Flavor[]; // 口味类型id列表（可选，Flavor[]，修改时不强制要求）
}
interface Flavor {
  id?: number; // 口味类型id（可选，int64）
  flavorName: string; // 口味类型名称（必填，如"辣度"、"麻度"）
  flavorValue?: string; // 口味类型值（可选，如"不辣"、"微辣"）
  valueList?: string[]; // 口味类型值列表（必填，逗号分隔，如"不辣,微辣,中辣,特辣"）
}
```

### 4.5 根据分类id查询菜品

- **Path**: `GET /admin/dish/list`
- **查询参数**:
  - `categoryId`: 分类id（必填）
- **响应**: `ApiResponse<Dish[]>`

```typescript
interface Dish {
  id?: number; // 菜品id（int64）
  name?: string; // 菜品名称（string）
  categoryId?: number; // 分类id（int64）
  price?: number; // 菜品价格（double）
  image?: string; // 菜品图片路径（string）
  description?: string; // 菜品描述（string）
  status?: number; // 菜品状态（1=起售，0=停售，int32）
  createTime?: string; // 创建时间（date-time）
  updateTime?: string; // 更新时间（date-time）
  createUser?: number; // 创建用户id（int64）
  updateUser?: number; // 更新用户id（int64）
}
```

### 4.6 菜品分页查询

- **Path**: `GET /admin/dish/page`
- **查询参数**:

```typescript
interface DishPageQuery {
  page: number; // 页码（必填，int32）
  pageSize: number; // 每页记录数（必填，int32）
  name?: string; // 菜品名称（可选，模糊查询，string）
  categoryId?: number; // 分类id（可选，int64）
  status?: number; // 菜品状态（可选，int32）
}
```

- **响应**: `ApiResponse<PageResult<DishVO>>`

```typescript
interface DishVO {
  id: number; // 菜品id（int64）
  name: string; // 菜品名称（string）
  categoryId: number; // 分类id（int64）
  categoryName: string; // 分类名称（string）
  price: number; // 菜品价格（double）
  image: string; // 菜品图片路径（string）
  description: string; // 菜品描述（string）
  status: number; // 菜品状态（1=起售，0=停售，int32）
  updateTime: string; // 更新时间（date-time）
  flavors?: Flavor[]; // 口味类型id列表（可选，Flavor[]，修改时不强制要求）
}
interface Flavor {
  id?: number; // 口味类型id（可选，int64）
  flavorName: string; // 口味类型名称（必填，如"辣度"、"麻度"）
  flavorValue?: string; // 口味类型值（可选，如"不辣"、"微辣"）
  valueList?: string[]; // 口味类型值列表（必填，逗号分隔，如"不辣,微辣,中辣,特辣"）
}
```

### 4.7 菜品起售/停售

- **Path**: `POST /admin/dish/status/{status}`
- **路径参数**:
  - `status`: 1=起售，0=停售
- **查询参数**:
  - `id`: 菜品id（必填）
- **响应**: `ApiResponse<string>`

---

## 5. 订单管理 (Order)

### 5.1 取消订单

- **Path**: `PUT /admin/order/cancel`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface CancelOrderRequest {
  id: number; // 订单id（必填，int64）
  cancelReason: string; // 订单取消原因（必填，string）
}
```

- **响应**: `ApiResponse<object>`

### 5.2 各个状态的订单数量统计

- **Path**: `GET /admin/order/statistics`
- **响应**: `ApiResponse<OrderStatistics>`

```typescript
interface OrderStatistics {
  toBeConfirmed: number; // 待接单数量（int32）
  confirmed: number; // 待派送数量（int32）
  deliveryInProgress: number; // 派送中数量（int32）
  completed: number; // 已完成数量（int32）
  cancelled: number; // 已取消数量（int32）
  refunded: number; // 已退款数量（int32）
}
```

### 5.3 完成订单

- **Path**: `PUT /admin/order/complete/{id}`
- **路径参数**:
  - `id`: 订单id（必填）
- **响应**: `ApiResponse<object>`

### 5.4 拒单

- **Path**: `PUT /admin/order/rejection`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface RejectOrderRequest {
  id: number; // 订单id（必填，int64）
  rejectionReason: string; // 拒单原因（必填，string）
}
```

- **响应**: `ApiResponse<object>`

### 5.5 接单

- **Path**: `PUT /admin/order/confirm`
- **Content-Type**: `application/json`
- **请求体**:

```typescript
interface ConfirmOrderRequest {
  id: number; // 订单id（必填，int64）
}
```

- **响应**: `ApiResponse<object>`

### 5.6 查询订单详情

- **Path**: `GET /admin/order/details/{id}`
- **路径参数**:
  - `id`: 订单id（必填）
- **响应**: `ApiResponse<OrderDetail>`

```typescript
interface OrderDetail {
  id?: number; // 订单id（int64）
  number?: string; // 订单号（string）
  status?: number; // 订单状态（int32）
  userId?: number; // 用户id（int64）
  addressBookId?: number; // 地址本id（int64）
  address?: string; // 地址（string）
  consignee?: string; // 收货人（string）
  phone?: string; // 手机号（string）
  amount?: number; // 订单金额（double）
  remark?: string; // 备注（string）
  orderTime?: string; // 下单时间（date-time）
  checkoutTime?: string | null; // 取货时间（date-time）可为空
  payMethod?: number; // 支付方式（int32）
  payStatus?: number; // 支付状态（int32）
  cancelReason?: string; // 取消原因（string）
  rejectionReason?: string; // 拒单原因（string）
  cancelTime?: string; // 取消时间（date-time）
  estimatedDeliveryTime?: string; // 预计送达时间（date-time）
  deliveryStatus?: number; // 派送状态（int32）
  deliveryTime?: string; // 派送时间（date-time）
  packAmount?: number; // 打包费（double）
  tablewareNumber?: number; // 餐具数量（int32）
  tablewareStatus?: number; // 餐具状态（int32）
  userName?: string; // 用户名（string）
  orderDishes?: string; // 订单包含的菜品（string）
  orderDetailList?: OrderDetailItem[]; // 订单明细列表（可选，OrderDetailItem[]）
}

interface OrderDetailItem {
  id?: number; // 订单明细id（int64）
  name?: string; // 菜品名称（string）
  image?: string; // 菜品图片（string）
  orderId?: number; // 订单id（int64）
  dishId?: number; // 菜品id（int64）
  setmealId?: number; // 套餐id（int64）
  dishFlavor?: string; // 口味（string）
  number?: number; // 数量（int32）
  amount?: number; // 金额（double）
}
```

### 5.7 派送订单

- **Path**: `PUT /admin/order/delivery/{id}`
- **路径参数**:
  - `id`: 订单id（必填）
- **响应**: `ApiResponse<object>`

### 5.8 订单搜索

- **Path**: `GET /admin/order/conditionSearch`
- **查询参数**:

```typescript
interface OrderSearchQuery {
  page: number; // 页码（必填，int32）
  pageSize: number; // 每页记录数（必填，int32）
  number?: string; // 订单号（可选，string）
  phone?: string; // 手机号（可选，string）
  status?: number; // 订单状态（可选，int32）
  beginTime?: string; // 开始时间（可选，date-time）
  endTime?: string; // 结束时间（可选，date-time）
}
```

- **响应**: `ApiResponse<PageResult<OrderVO>>`

```typescript
interface OrderVO {
  id: number; // 订单id（int64）
  number: string; // 订单号（string）
  status: number; // 订单状态（int32）
  userId: number; // 用户id（int64）
  addressBookId: number; // 地址本id（int64）
  orderTime: string; // 下单时间（date-time）
  checkoutTime: string | null; // 取货时间（date-time）
  payMethod: number; // 支付方式（int32）
  payStatus: number; // 支付状态（int32）
  amount: number; // 订单金额（double）
  remark: string; // 备注（string）
  userName: string; // 用户名（string）
  phone: string; // 手机号（string）
  address: string; // 地址（string）
  consignee: string; // 收货人（string）
  cancelReason: string; // 取消原因（string）
  rejectionReason: string; // 拒单原因（string）
  cancelTime: string; // 取消时间（date-time）
  estimatedDeliveryTime: string; // 预计送达时间（date-time）
  deliveryStatus: number; // 派送状态（int32）
  deliveryTime: string; // 派送时间（date-time）
  packAmount: number; // 打包费（double）
  tablewareNumber: number; // 餐具数量（int32）
  tablewareStatus: number; // 餐具状态（int32）
  orderDishes: string; // 订单包含的菜品（string）

}
```

## 6. 工作台 (Workspace)

### 6.1 查询今日运营数据

- **Path**: `GET /admin/workspace/businessData`
- **响应**: `ApiResponse<BusinessData>`

```typescript
interface BusinessData {
  newUsers: number; // 新增用户数（int32）
  turnover: number; // 营业额（double）
  validOrderCount: number; // 有效订单数（int32）
  orderCompletionRate: number; // 订单完成率（double）
  unitPrice: number; // 平均客单价（double）
}
```

### 6.2 查询套餐总览

- **Path**: `GET /admin/workspace/overviewSetmeals`
- **响应**: `ApiResponse<SetmealOverview>`

```typescript
interface SetmealOverview {
  sold: number; // 已启售套餐数量（int32）
  discontinued: number; // 已停售套餐数量（int32）
}
```

### 6.3 查询菜品总览

- **Path**: `GET /admin/workspace/overviewDishes`
- **响应**: `ApiResponse<DishOverview>`

```typescript
interface DishOverview {
  sold: number; // 已启售菜品数量（int32）
  discontinued: number; // 已停售菜品数量（int32）
}
```

### 6.4 查询订单管理数据

- **Path**: `GET /admin/workspace/overviewOrders`
- **响应**: `ApiResponse<OrderOverview>`

```typescript
interface OrderOverview {
  waitingOrders: number; // 待接单数量（int32）
  deliveredOrders: number; // 待派送数量（int32）
  allOrders: number; // 全部订单（int32）
  completedOrders: number; // 已完成数量（int32）
  cancelledOrders: number; // 已取消数量（int32）
}
```

---

## 7. 店铺操作 (Shop)

### 7.1 获取营业状态

- **Path**: `GET /admin/shop/status`
- **响应**: `ApiResponse<number>`
  - 返回值为店铺营业状态：`1`=营业，`0`=打烊

### 7.2 设置营业状态

- **Path**: `PUT /admin/shop/{status}`
- **路径参数**:
  - `status`: 1=营业，0=打烊
- **响应**: `ApiResponse<string>`

---

## 8. 数据统计 (Report)

### 8.1 导出Excel报表

- **Path**: `GET /admin/report/export`
- **响应**: 返回 Excel 文件流（非 JSON 格式）

### 8.2 查询销量排名top10

- **Path**: `GET /admin/report/top10`
- **查询参数**:

```typescript
interface Top10Query {
  begin: string; // 开始日期（必填，date-time）
  end: string; // 结束日期（必填，date-time）
}
```

- **响应**: `ApiResponse<Top10Data>`

```typescript
interface Top10Data {
  nameList: string; // 商品名称列表，以逗号分隔（string）
  numberList: string; // 销量列表，以逗号分隔（string）
}
```

### 8.3 用户统计

- **Path**: `GET /admin/report/userStatistics`
- **查询参数**:

```typescript
interface UserStatisticsQuery {
  begin: string; // 开始日期（必填，date-time）
  end: string; // 结束日期（必填，date-time）
}
```

- **响应**: `ApiResponse<UserStatisticsData>`

```typescript
interface UserStatisticsData {
  dateList: string; // 日期列表，以逗号分隔（string）
  newUserList: string; // 新增用户数列表，以逗号分隔（string）
  totalUserList: string; // 总用户量列表，以逗号分隔（string）
}
```

### 8.4 营业额统计

- **Path**: `GET /admin/report/turnoverStatistics`
- **查询参数**:

```typescript
interface TurnoverStatisticsQuery {
  begin: string; // 开始日期（必填，date-time）
  end: string; // 结束日期（必填，date-time）
}
```

- **响应**: `ApiResponse<TurnoverStatisticsData>`

```typescript
interface TurnoverStatisticsData {
  dateList: string; // 日期列表，以逗号分隔（string）
  turnoverList: string; // 营业额列表，以逗号分隔（string）
}
```

### 8.5 订单统计

- **Path**: `GET /admin/report/ordersStatistics`
- **查询参数**:

```typescript
interface OrdersStatisticsQuery {
  begin: string; // 开始日期（必填，date-time）
  end: string; // 结束日期（必填，date-time）
}
```

- **响应**: `ApiResponse<OrdersStatisticsData>`

```typescript
interface OrdersStatisticsData {
  dateList: string; // 日期列表，以逗号分隔（string）
  orderCountList: string; // 订单数列表，以逗号分隔（string）
  validOrderCountList: string; // 有效订单数列表，以逗号分隔（string）
  totalOrderCount: number; // 订单总数（int32）
  validOrderCount: number; // 有效订单数（int32）
  orderCompletionRate: number; // 订单完成率（double）
}
```

---

## 9. 通用接口 (Common)

### 9.1 文件上传

- **Path**: `POST /admin/common/upload`
- **Content-Type**: `multipart/form-data`
- **请求体**:

```typescript
interface UploadRequest {
  file: File; // 文件（必填，文件大小不超过 10MB）
}
```

- **响应**: `ApiResponse<string>`
  - `data` 字段返回文件上传路径

---

## 类型定义汇总

### 通用类型

```typescript
// 统一响应
interface ApiResponse<T> {
  code: number; // 1=成功，0=失败（int32）
  data: T; // 响应数据（T）
  msg?: string; // 提示信息（string）
}

// 分页结果
interface PageResult<T> {
  total: number; // 总记录数（int32）
  records: T[]; // 当前页数据（T[]）
}

// 分页查询参数
interface PageQuery {
  page: number; // 页码（int32）
  pageSize: number; // 每页记录数（int32）
}
```

### 枚举

```typescript
// 分类类型
enum CategoryType {
  DISH = 1, // 菜品分类
  SETMEAL = 2, // 套餐分类
}

// 状态
enum Status {
  DISABLED = 0, // 禁用/停售/打烊
  ENABLED = 1, // 启用/起售/营业
}

// 订单状态（待确认具体值）
enum OrderStatus {
  // 具体状态值待补充
}
```

---

## 注意事项

1. **日期格式**：所有日期参数均为 `YYYY-MM-DD` 格式（如 `2022-05-01`）
2. **日期时间格式**：响应中的日期为 ISO 8601 格式（`date-time`，如 `2022-05-01T12:00:00`）
3. **逗号分隔**：统计接口返回的列表数据以逗号分隔的字符串形式返回，前端需自行拆分
4. **文件上传**：使用 `multipart/form-data` 格式，返回值为文件路径字符串
5. **导出报表**：`/admin/report/export` 返回 Excel 文件流，非 JSON 格式
6. **订单状态**：具体状态值需参考后端代码或接口文档进一步确认
