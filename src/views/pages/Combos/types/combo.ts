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
}

export interface SetmealPageQuery {
  name?: string;
  categoryId?: number;
  status?: number;
  page: number;
  pageSize: number;
}

export interface SetmealDetail {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  price: number;
  status: number;
  description: string;
  image: string;
  updateTime: string;
  setmealDishes: SetmealDishItem[];
}

export interface SetmealDishItem {
  copies: number;
  dishId: number;
  id?: number;
  name: string;
  price: number;
  setmealId?: number;
}

export interface CreateSetmealRequest {
  categoryId: number;
  description?: string;
  id?: number;
  image: string;
  name: string;
  price: number;
  setmealDishes: CreateSetmealDishItem[];
  status: number;
}

export interface CreateSetmealDishItem {
  copies: number;
  dishId: number;
  id?: number;
  name: string;
  price: number;
  setmealId: number;
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
}

export interface PageResult<T> {
  total: number;
  records: T[];
}
