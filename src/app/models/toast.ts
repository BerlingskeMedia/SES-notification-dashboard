import {ToastType} from './toast-type.enum';

export class Toast {
  public type: ToastType;
  public content: string;

  constructor(type: ToastType, content: string) {
    this.type = type;
    this.content = content;
  }
}
