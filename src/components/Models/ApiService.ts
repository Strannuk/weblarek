import { IApi, IProduct, IOrderRequest, IOrderResponse } from "../../types";

export class ApiService {
  private api: IApi;

  constructor (api: IApi) {
    this.api = api;
  }

  async fetchProducts(): Promise<IProduct[]> {
    const response = await this.api.get<{items: IProduct[]} > ('product/');
    return response.items;
  }

  async sendOrder(orderData: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('order/', orderData);
  }
}