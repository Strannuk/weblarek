export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IBuyer {
    payment: any;
    email:string;
    phone:string;
    address: string;
}

export interface IOrder {
    buyer: IBuyer;
    items: IProduct[];
}

export type BuyerValidationErrors = Partial<Record<keyof IBuyer, string>>;

export interface IOrderRequest {
  payment: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export interface IOrderResponse {
  id: string;
  total: number;
}