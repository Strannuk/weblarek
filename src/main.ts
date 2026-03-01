import "./scss/styles.scss";

import { Products } from "./components/Models/Products";
import { Basket } from "./components/Models/Basket";
import { Buyer } from "./components/Models/Buyer";
import { apiProducts } from "./utils/data";
import { ApiService } from "./components/Models/ApiService";
import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/Events";

import { Header } from "./components/View/Header";
import { Gallery } from "./components/View/Gallery";
import { ModalWindow } from "./components/View/ModalWindow";
import { BasketModal } from "./components/View/BasketModal";
import { OrderSuccess } from "./components/View/OrderSuccess";
import { ProductInGallery } from "./components/View/cards/ProductInGallery";
import { ProductInBasket } from "./components/View/cards/ProductInBasket";
import { ProductPreview } from "./components/View/cards/ProductPreview";
import { PaymentAddressForm } from "./components/View/forms/PaymentAddressForm";
import { EmailPhoneForm } from "./components/View/forms/EmailPhoneForm";

import { IOrderRequest, IProduct } from "./types";

document.addEventListener("DOMContentLoaded", async () => {
  const events = new EventEmitter();

  const products = new Products(events);
  const basket = new Basket();
  const buyer = new Buyer();

  const api = new Api(API_URL);
  const apiService = new ApiService(api);

  const header = new Header(document.querySelector("header")!, events);
  const gallery = new Gallery(document.querySelector("main")!, events);
  const modal = new ModalWindow(document.querySelector("#modal-container")!);

  let paymentForm: PaymentAddressForm | null = null;

  events.on<{ products: IProduct[] }>(
    "products:changed",
    ({ products: list }) => {
      const items = list.map((product) => {
        const template = document.querySelector(
          "#card-catalog",
        ) as HTMLTemplateElement;
        const container = template.content.firstElementChild!.cloneNode(
          true,
        ) as HTMLElement;

        const card = new ProductInGallery(container, {
          onClick: () => products.setPreviewProducts(product),
        });

        card.title = product.title;
        card.price = product.price;
        card.category = product.category;
        card.image = product.image;

        return container;
      });

      gallery.gallery = items;
    },
  );

  events.on<{ product: IProduct }>("product:preview", ({ product }) => {
    const template = document.querySelector(
      "#card-preview",
    ) as HTMLTemplateElement;
    const container = template.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;

    const preview = new ProductPreview(container, events);

    preview.title = product.title;
    preview.price = product.price;
    preview.category = product.category;
    preview.description = product.description;
    preview.image = product.image;

    if (product.price === null) {
      preview.buttonText = "Недоступно";
      preview.buttonDisabled = true;
    } else if (basket.hasItem(product.id)) {
      preview.buttonText = "Удалить из корзины";
      preview.buttonDisabled = false;
    } else {
      preview.buttonText = "Купить";
      preview.buttonDisabled = false;
    }

    modal.content = container;
    modal.open();
  });

  events.on("product:choose", () => {
    const product = products.getPreviewProducts();
    if (!product) return;

    basket.hasItem(product.id)
      ? basket.removeItem(product)
      : basket.addItem(product);

    header.counter = basket.getItemsCount();
    modal.close();
  });

  function renderBasketModal() {
    const template = document.querySelector("#basket") as HTMLTemplateElement;
    const container = template.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;

    const basketModal = new BasketModal(container, events);

    const items = basket.getItems().map((product, index) => {
      const itemTemplate = document.querySelector(
        "#card-basket",
      ) as HTMLTemplateElement;
      const itemContainer = itemTemplate.content.firstElementChild!.cloneNode(
        true,
      ) as HTMLElement;

      const card = new ProductInBasket(itemContainer, {
        onClick: () => {
          basket.removeItem(product);
          header.counter = basket.getItemsCount();
          renderBasketModal();
        },
      });

      card.title = product.title;
      card.price = product.price;
      card.index = index + 1;

      return itemContainer;
    });

    basketModal.item = items;
    basketModal.totalPrice = basket.getTotalPrice();

    modal.content = container;
    modal.open();
  }

  events.on("basket:open", renderBasketModal);

  function openPaymentAddressForm() {
    const template = document.querySelector("#order") as HTMLTemplateElement;
    const container = template.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;

    const form = new PaymentAddressForm(container, events);
    paymentForm = form;

    const buyerData = buyer.getData();
    form.payment = buyerData.payment;
    form.address = buyerData.address;

    const hasErrors = !buyerData.address || !buyerData.payment;
    form.isallowedButton(hasErrors);

    modal.content = container;
    modal.open();
  }

  events.on("basket:submit", () => {
    if (basket.getItemsCount() > 0) openPaymentAddressForm();
  });

  events.on("payment:card", () => {
    buyer.setData({ payment: "card" });

    if (paymentForm) {
      paymentForm.payment = "card";

      const buyerData = buyer.getData();

      if (!buyerData.address) {
        paymentForm.errors = "Необходимо указать адрес";
      } else {
        paymentForm.errors = "";
      }

      const hasErrors = !buyerData.address || !buyerData.payment;
      paymentForm.isallowedButton(hasErrors);
    }
  });

  events.on("payment:cash", () => {
    buyer.setData({ payment: "cash" });

    if (paymentForm) {
      paymentForm.payment = "cash";

      const buyerData = buyer.getData();

      if (!buyerData.address) {
        paymentForm.errors = "Необходимо указать адрес";
      } else {
        paymentForm.errors = "";
      }

      const hasErrors = !buyerData.address || !buyerData.payment;
      paymentForm.isallowedButton(hasErrors);
    }
  });

  events.on<{ value: string }>("address:input", ({ value }) => {
    buyer.setData({ address: value });
    if (paymentForm) {
      const buyerData = buyer.getData();
      if (!buyerData.address) {
        paymentForm.errors = "Необходимо указать адрес";
      } else {
        paymentForm.errors = "";
      }
      const hasErrors = !buyerData.address || !buyerData.payment;
      paymentForm.isallowedButton(hasErrors);
    }
  });

  events.on("order:submit", () => {
    const errors = buyer.validate();

    if (errors.address || errors.payment) {
      alert(Object.values(errors).join("\n"));
      return;
    }

    openContactsForm();
  });

  function openContactsForm() {
    const template = document.querySelector("#contacts") as HTMLTemplateElement;
    const container = template.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;

    const form = new EmailPhoneForm(container, events);

    const buyerData = buyer.getData();
    form.email = buyerData.email;
    form.phone = buyerData.phone;

    modal.content = container;
    modal.open();
  }

  events.on<{ value: string }>("email:input", ({ value }) => {
    buyer.setData({ email: value });
  });

  events.on<{ value: string }>("phone:input", ({ value }) => {
    buyer.setData({ phone: value });
  });

  events.on("contacts:submit", async () => {
    const errors = buyer.validate();

    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join("\n"));
      return;
    }

    const buyerData = buyer.getData();
    const items = basket.getItems();

    const order: IOrderRequest = {
      payment: buyerData.payment,
      email: buyerData.email,
      phone: buyerData.phone,
      address: buyerData.address,
      total: basket.getTotalPrice(),
      items: items.map((i) => i.id),
    };

    try {
      const response = await apiService.sendOrder(order);

      basket.clear();
      buyer.clear();
      header.counter = 0;

      openSuccess(response.total);
    } catch {
      alert("Ошибка при оформлении заказа");
    }
  });

  function openSuccess(total: number) {
    const template = document.querySelector("#success") as HTMLTemplateElement;
    const container = template.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;

    const success = new OrderSuccess(container, events);
    success.totalSum = total;

    modal.content = container;
    modal.open();
  }

  events.on("orderSucces:close", () => modal.close());

  try {
    const data = await apiService.fetchProducts();
    products.setProducts(data);
  } catch {
    products.setProducts(apiProducts.items);
  }
});
