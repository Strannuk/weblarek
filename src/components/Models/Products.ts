  import { IProduct } from "../../types";
  import { IEvents } from "../base/Events";

  export class Products {
    private products: IProduct[] = [];
    private previewProducts: IProduct | null = null;
    private events?: IEvents;

    constructor(events?: IEvents) {
      this.events = events;
    }

    setProducts(products: IProduct[]): void {
      this.products = products;
      this.events?.emit("products:changed");
    }

    getProducts(): IProduct[] {
      return this.products;
    }

    getProductsById(id: string): IProduct | undefined {
      return this.products.find((p) => p.id === id);
    }

    setPreviewProducts(product: IProduct): void {
      this.previewProducts = product;
      this.events?.emit("product:preview");
    }

    getPreviewProducts(): IProduct | null {
      return this.previewProducts;
    }
  }
