import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Toast} from '../../models/toast';
import {ToastService} from '../../services/toast.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  public toast: Toast;
  private timeout: number;
  private ngDestroyed: Subject<void> = new Subject<void>();

  constructor(private toastService: ToastService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.toastService
      .get()
      .pipe(takeUntil(this.ngDestroyed))
      .subscribe(toast => {
        this.toast = null;
        this.clearTimeout();
        this.toast = toast;
        if (this.toast) {
          this.timeout = window.setTimeout(() => {
            this.closeToast();
            this.changeDetector.detectChanges();
          }, 5 * 1000);
        }
      });
  }

  ngOnDestroy(): void {
    this.clearTimeout();
    this.ngDestroyed.next();
    this.ngDestroyed.complete();
  }

  public closeToast(): void {
    this.clearTimeout();
    this.removeToast();
  }

  private removeToast(): void {
    this.toast = null;
  }

  private clearTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
