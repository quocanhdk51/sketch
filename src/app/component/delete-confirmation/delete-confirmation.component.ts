import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeleteConfirmation } from '../../model/delete-confirmation.model';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss']
})
export class DeleteConfirmationComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmation
  ) { }

  public ngOnInit(): void {
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  public onDelete(): void {
    this.dialogRef.close(true);
  }
}
