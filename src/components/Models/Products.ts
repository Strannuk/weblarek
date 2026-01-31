import { IProduct } from "../../types";

export class Products {
  private products: IProduct[] = [];
  private previewProducts: IProduct | null = null;

  setProducts(products: IProduct[]): void {
    this.products = products;
  }

  getProducts(): IProduct[] {
    return this.products;
  }

  getProductsById (id:string): IProduct | undefined {
    return this.products.find(p => p.id === id);
  }

  setPreviewProducts (products: IProduct) : void {
    this.previewProducts = products;
  }

  getPreviewProducts() : IProduct | null {
    return this.previewProducts;
  }
}