import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Toast} from '../models/toast';
import {ToastType} from '../models/toast-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private subject: Subject<Toast> = new Subject<Toast>();

  public addSuccess(message: string): void {
    if (!message) {
      return;
    }

    this.addToast(new Toast(ToastType.Success, message));
  }

  public addDanger(message: string): void {
    if (!message) {
      return;
    }

    this.addToast(new Toast(ToastType.Danger, message));
  }

  public get(): Observable<Toast> {
    return this.subject.asObservable();
  }

  private addToast(toast: Toast): void {
    this.subject.next(toast);
  }
}
