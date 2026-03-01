import { Component } from "../base/Component";

export class ModalWindow extends Component<any> {
  modalContainer: HTMLElement;
  closeButton: HTMLButtonElement;
  contentContainer: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this.modalContainer = container;
    this.closeButton = container.querySelector(
      ".modal__close",
    ) as HTMLButtonElement;
    this.contentContainer = container.querySelector(
      ".modal__content",
    ) as HTMLElement;
    this.closeButton.addEventListener("click", () => this.close());
    this.modalContainer.addEventListener("click", (e) => {
      if (e.target === this.modalContainer) {
        this.close();
      }
    });
  }

  set content(item: HTMLElement) {
    this.contentContainer.innerHTML = "";
    this.contentContainer.appendChild(item);
  }

  open() {
    this.modalContainer.classList.add("modal_active");
  }

  close() {
    this.modalContainer.classList.remove("modal_active");
  }
}
