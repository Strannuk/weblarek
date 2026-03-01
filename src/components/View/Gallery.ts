import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface GalleryData {
  gallery: HTMLElement[];
}

export class Gallery extends Component<GalleryData> {
  protected galleryElement: HTMLElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    if (container.classList.contains("gallery")) {
      this.galleryElement = container;
    } else {
      const element = container.querySelector(".gallery");
      if (!element) {
        throw new Error("Gallery element not found");
      }
      this.galleryElement = element as HTMLElement;
    }
  }

  set gallery(items: HTMLElement[]) {
    this.galleryElement.replaceChildren(...items);
  }
}
