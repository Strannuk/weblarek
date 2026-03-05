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

    this.galleryElement = container;
  }

  set gallery(items: HTMLElement[]) {
    this.galleryElement.replaceChildren(...items);
  }
}
