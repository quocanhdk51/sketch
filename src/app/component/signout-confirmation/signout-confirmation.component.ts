import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-signout-confirmation',
  templateUrl: './signout-confirmation.component.html',
  styleUrls: ['./signout-confirmation.component.scss']
})
export class SignoutConfirmationComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SignoutConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public ngOnInit(): void {
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  public onConfirm(): void {
    this.dialogRef.close(true);
  }
}
