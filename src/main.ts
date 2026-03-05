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
import { cloneTemplate } from "./utils/utils";
import { IOrderRequest, IProduct } from "./types";

const events = new EventEmitter();
const products = new Products(events);
const basket = new Basket(events);
const buyer = new Buyer(events);
const api = new Api(API_URL);
const apiService = new ApiService(api);
const header = new Header(document.querySelector("header")!, events);
const gallery = new Gallery(document.querySelector("main")!, events);
const modal = new ModalWindow(document.querySelector("#modal-container")!);

const templates = {
  productCard: document.querySelector("#card-catalog") as HTMLTemplateElement,
  productPreview: document.querySelector(
    "#card-preview",
  ) as HTMLTemplateElement,
  basketItem: document.querySelector("#card-basket") as HTMLTemplateElement,
  basketModal: document.querySelector("#basket") as HTMLTemplateElement,
  orderForm: document.querySelector("#order") as HTMLTemplateElement,
  contactsForm: document.querySelector("#contacts") as HTMLTemplateElement,
  success: document.querySelector("#success") as HTMLTemplateElement,
};
const preview = new ProductPreview(
  cloneTemplate(templates.productPreview),
  events,
);
const basketModal = new BasketModal(
  cloneTemplate(templates.basketModal),
  events,
);
const paymentForm = new PaymentAddressForm(
  cloneTemplate(templates.orderForm),
  events,
);
const contactsForm = new EmailPhoneForm(
  cloneTemplate(templates.contactsForm),
  events,
);
const success = new OrderSuccess(cloneTemplate(templates.success), events);

events.on<IProduct>("product:selected", (product) => {
  products.setPreviewProducts(product);
  events.emit("product:preview");
});

events.on<IProduct>("basket:remove", (product) => {
  basket.removeItem(product);
});

events.on("products:changed", () => {
  const list = products.getProducts();
  const items = list.map((product) => {
    const container = cloneTemplate(templates.productCard);
    const card = new ProductInGallery(container, {
      onClick: () => events.emit("product:selected", product),
    });

    card.title = product.title;
    card.price = product.price;
    card.category = product.category;
    card.image = product.image;

    return container;
  });

  gallery.render({ gallery: items });
});

events.on("basket:changed", () => {
  const items = basket.getItems().map((product, index) => {
    const container = cloneTemplate(templates.basketItem);

    const card = new ProductInBasket(container, {
      onClick: () => events.emit("basket:remove", product),
    });

    card.title = product.title;
    card.price = product.price;
    card.index = index + 1;

    return container;
  });

  basketModal.render({
    item: items,
    totalPrice: basket.getTotalPrice(),
  });

  header.counter = basket.getItemsCount();
  if (modal.isOpen()) {
    modal.render({ content: basketModal.render() });
  }
});

events.on("product:preview", () => {
  const product = products.getPreviewProducts();
  if (!product) return;

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

  modal.render({
    content: preview.render(),
  });
  modal.open();
});

events.on("product:choose", () => {
  const product = products.getPreviewProducts();
  if (!product) return;

  basket.hasItem(product.id)
    ? basket.removeItem(product)
    : basket.addItem(product);

  modal.close();
});

events.on("basket:open", () => {
  modal.open();
});

function openPaymentAddressForm() {
  const updateForm = () => {
    const buyerData = buyer.getData();
    paymentForm.payment = buyerData.payment;
    paymentForm.address = buyerData.address;
    const errors = buyer.validate();
    paymentForm.errors = errors.address ?? "";
    paymentForm.allowed = !errors.address && !errors.payment;
  };

  updateForm();
  events.on("buyer:changed", updateForm);

  modal.render({
    content: paymentForm.render(),
  });
  modal.open();
}

events.on("basket:submit", openPaymentAddressForm);

events.on("payment:card", () => {
  buyer.setData({ payment: "card" });
  events.emit("buyer:changed");
});

events.on("payment:cash", () => {
  buyer.setData({ payment: "cash" });
  events.emit("buyer:changed");
});

events.on<{ value: string }>("address:input", ({ value }) => {
  buyer.setData({ address: value });
  events.emit("buyer:changed");
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
  const updateForm = () => {
    const buyerData = buyer.getData();
    contactsForm.email = buyerData.email;
    contactsForm.phone = buyerData.phone;
    const errors = buyer.validate();
    contactsForm.allowed = !errors.email && !errors.phone;
  };

  updateForm();
  events.on("buyer:changed", updateForm);

  modal.render({
    content: contactsForm.render(),
  });
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

    openSuccess(response.total);
    events.emit("buyer:changed");
  } catch {
    alert("Ошибка при оформлении заказа");
  }
});

function openSuccess(total: number) {
  success.render({
    totalSum: total,
  });

  modal.render({
    content: success.render(),
  });
  modal.open();
}

events.on("orderSuccess:close", () => modal.close());

try {
  const data = await apiService.fetchProducts();
  products.setProducts(data);
} catch {
  products.setProducts(apiProducts.items);
}
