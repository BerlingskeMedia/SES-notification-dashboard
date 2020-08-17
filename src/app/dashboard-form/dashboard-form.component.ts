import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-dashboard-form',
  templateUrl: './dashboard-form.component.html',
  styleUrls: ['./dashboard-form.component.scss']
})
export class DashboardFormComponent implements OnInit, OnChanges {
  @Input() data: any[];
  @Output() getData: EventEmitter<Date> = new EventEmitter<Date>();
  public form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    const currentDate = new Date();
    const date_from = new Date(currentDate.setMonth(currentDate.getMonth()-1)).toISOString().slice(0,10);
    const date_to = new Date().toISOString().slice(0,10);
    this.form = this.formBuilder.group({date_from, date_to, user_mail: ['', Validators.email],
      sender_mail: ['', Validators.email], email_subject: '', sent_from: ''
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges')
    console.log(changes)
  }

  public get() {
    this.getData.emit(this.form.controls.from.value)
  }



}
