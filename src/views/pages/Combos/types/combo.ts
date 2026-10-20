export interface SetMealDishFlavor {
  id: number;
  setmealDishId: number;
  flavorId: number;
  flavorValue: string;
  flavorName: string;
  valueList: string;
}

export interface SetmealVO {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  status: number;
  description: string;
  image: string;
  updateTime: string;
  categoryName: string;
  createEmployeeName: string;
  updateEmployeeName: string;
  setmealDishes: SetmealDishItem[];
}

export interface SetmealPageQuery {
  name?: string;
  categoryId?: number;
  status?: number;
  page: number;
  pageSize: number;
}

export interface SetmealDishItem {
  id?: number;
  setmealId?: number;
  dishId: number;
  name: string;
  price: number;
  copies: number;
  setmealDishFlavors?: SetMealDishFlavor[];
}

export interface CreateSetmealRequest {
  categoryId: number;
  description?: string;
  id?: number;
  image: string;
  name: string;
  price: number;
  setmealDishes: CreateSetmealDishItem[];
  status?: number;
}

export interface CreateSetmealDishItem {
  dishId: number;
  name: string;
  price: number;
  copies: number;
  setmealDishFlavors?: SetMealDishFlavor[];
}

export interface UpdateSetmealRequest {
  categoryId: number;
  description?: string;
  id: number;
  image: string;
  name: string;
  price: number;
  setmealDishes: SetmealDishItem[];
  status?: number;
}

export interface SetmealForm {
  id?: number;
  name: string;
  categoryId: number | undefined;
  price: number;
  image: string;
  description: string;
  status: number;
  setmealDishes: SetmealDishItem[];
  createEmployeeName?: string;
  updateEmployeeName?: string;
  updateTime?: string;
}

export interface PageResult<T> {
  total: number;
  records: T[];
}

export interface FlavorListItem {
  id: number;
  flavorName: string;
  valueList: string;
}
