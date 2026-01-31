import './scss/styles.scss';

import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { apiProducts } from './utils/data';

const products = new Products();
products.setProducts(apiProducts.items);
console.log("Массив товаров:", products.getProducts());
console.log("Товар по id:", products.getProductsById("1"));
console.log("Товар для просмотра:", products.getPreviewProducts());

const basket = new Basket();
basket.addItem(apiProducts.items[0]);
basket.addItem(apiProducts.items[1]);
console.log("Товары в корзине:", basket.getItems());
console.log("Количество товаров в корзине:", basket.getItemsCount());
console.log("Общая стоимость товаров в корзине:", basket.getTotalPrice());
console.log("Проверка на наличие товара с ID - 1", basket.hasItem("1"));
basket.removeItem(apiProducts.items[0]);
console.log("Корзина после удаления товара:", basket.getItems());
basket.clear();
console.log("Корзина после очистки:", basket.getItems());

const buyer = new Buyer();
buyer.setData({
  payment: "cash",
  email: "belokamensky.kirill@yandex.ru",
  phone: "+79786511797",
  address: "Россия, Крым, г. Симферополь, ул. Пушкина, д. 22"
});
console.log("Данные покупателя:", buyer.getData());
console.log("Результат проверки данных:", buyer.validate());
buyer.clear();
console.log("Данные покупателя после очистки:", buyer.getData());
