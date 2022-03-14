import { CrudService } from './../../service/crud.service';
import { MatDialog } from '@angular/material/dialog';
import { Sketch } from './../../model/canvas.model';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SketchCreateEditDialogComponent } from '../sketch-create-edit-dialog/sketch-create-edit-dialog.component';
import { SketchCreateEditDialogData } from '../../model/sketch-create-edit.model';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() public sketch!: Sketch;
  @Output() public onEventSuccess: EventEmitter<void> = new EventEmitter();

  constructor(
    private crudService: CrudService,
    private router: Router,
    private toastSv: ToastrService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  public getImageSrc(sketch: Sketch): string {
    return (sketch.imageURL) ? sketch.imageURL : "";
  }

  public onCardClick(sketch: Sketch): void {
    this.router.navigate(['/whiteboard', {
      id: sketch.id as number
    }]);
  }

  public onEditSketch(sketch: Sketch): void {
    const data: SketchCreateEditDialogData = {
      isCreating: false,
      sketch: sketch
    };
    const dialogRef = this.dialog.open(
      SketchCreateEditDialogComponent,
      {
        data: data
      }
    );
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.onEventSuccess.emit();
        this.toastSv.success(`Sketch '${data.name}' is edited successfully`);
      }
    });
  }

  public deleteSketch(sketch: Sketch): void {
    const dialogRef = this.dialog.open(DeleteConfirmationComponent);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.crudService.deleteSketch(sketch.id as number).subscribe(
            (_sketch) => {
              this.onEventSuccess.emit();
            },
            (error: HttpErrorResponse) => {
              this.toastSv.error(error.error.message);
            }
          );
        }
      }
    );
  }
}
