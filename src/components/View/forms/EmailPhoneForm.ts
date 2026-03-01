import { Form } from "./Form";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";

interface EmailPhoneFormData {
  email: string;
  phone: string;
}

export class EmailPhoneForm extends Form<EmailPhoneFormData> {
  protected emailInputElement: HTMLInputElement;
  protected phoneInputElement: HTMLInputElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container, events);

    this.emailInputElement = ensureElement<HTMLInputElement>(
      "input[name=email]",
      this.container,
    );

    this.phoneInputElement = ensureElement<HTMLInputElement>(
      "input[name=phone]",
      this.container,
    );

    this.emailInputElement.addEventListener("input", () => {
      this.events.emit("email:input", {
        value: this.emailInputElement.value,
      });
      this.updateButtonState();
    });

    this.phoneInputElement.addEventListener("input", () => {
      this.events.emit("phone:input", {
        value: this.phoneInputElement.value,
      });
      this.updateButtonState();
    });

    this.submitButton.addEventListener("click", () => {
      this.events.emit("contacts:submit");
    });
  }

  validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  validatePhone(value: string): boolean {
    return /^\+?\d{10,15}$/.test(value);
  }

  updateButtonState() {
    const email = this.emailInputElement.value.trim();
    const phone = this.phoneInputElement.value.trim();

    let error = "";

    if (!email) {
      error = "Укажите email";
    } else if (!this.validateEmail(email)) {
      error = "Некорректный email";
    } else if (!phone) {
      error = "Укажите телефон";
    } else if (!this.validatePhone(phone)) {
      error = "Некорректный номер телефона";
    }

    this.errors = error;
    this.isallowedButton(Boolean(error));
  }

  set email(value: string) {
    this.emailInputElement.value = value;
    this.updateButtonState();
  }

  set phone(value: string) {
    this.phoneInputElement.value = value;
    this.updateButtonState();
  }
}
