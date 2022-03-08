import { SketchErrorResponse } from 'src/app/model/sketch-response.model';
import { Sketch } from './../../model/canvas.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CrudService } from './../../service/crud.service';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SketchCreateEditDialogData } from 'src/app/model/sketch-create-edit.model';
import { Subject } from 'rxjs';
import { takeUntil, tap, switchMap, startWith, filter, take } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sketch-create-edit-dialog',
  templateUrl: './sketch-create-edit-dialog.component.html',
  styleUrls: ['./sketch-create-edit-dialog.component.scss']
})
export class SketchCreateEditDialogComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public isCreating: boolean = true;

  private _formSubmit$: Subject<any> = new Subject();
  private _destroying$: Subject<void> = new Subject();

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private toastSv: ToastrService,
    public dialogRef: MatDialogRef<SketchCreateEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SketchCreateEditDialogData
  ) {
    this.isCreating = this.data.isCreating;
    this.form = this.fb.group({
      name: [(this.isCreating) ? '' : this.data.sketch?.name, [Validators.required]],
      background: [(this.isCreating) ? '#000000' : this.data.sketch?.background, [Validators.required]],
      width: [(this.isCreating) ? 0 : this.data.sketch?.width, [Validators.required]],
      height: [(this.isCreating) ? 0 : this.data.sketch?.height, [Validators.required]]
    });
  }

  public ngOnInit(): void {
    this._formSubmit$.pipe(
      takeUntil(this._destroying$),
      tap(() => this.form.markAsDirty()),
      switchMap(
        () => this.form.statusChanges.pipe(
          startWith(this.form.status),
          filter((status) => status !== 'PENDING'),
          take(1)
        )
      ),
      filter((status) => status === 'VALID')
    ).subscribe((_validationSuccessful) => this.handleOnSubmit());
  }

  public ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.unsubscribe();
  }

  public onSubmit(): void {
    this._formSubmit$.next();
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  private handleOnSubmit(): void {
    if (this.isCreating) {
      this.handleOnCreate();
    }
    else {
      this.handleOnEdit();
    }
  }

  private handleOnCreate(): void {
    const sketch: Sketch = {
      name: this.form.get('name')?.value as string,
      background: this.form.get('background')?.value as string,
      width: this.form.get('width')?.value as number,
      height: this.form.get('height')?.value as number
    };
    this.crudService.saveNewSketch(sketch).subscribe(
      (sketch) => {
        this.dialogRef.close(sketch);
      },
      (error: HttpErrorResponse) => {
        this.toastSv.error(error.error.message);
      }
    );
  }

  private handleOnEdit(): void {
    const sketch: Sketch = {
      id: this.data.sketch?.id,
      imageURL: this.data.sketch?.imageURL,
      name: this.form.get('name')?.value as string,
      background: this.form.get('background')?.value as string,
      width: this.form.get('width')?.value as number,
      height: this.form.get('height')?.value as number
    };
    this.crudService.updateSketch(sketch).subscribe(
      (sketch) => {
        this.dialogRef.close(sketch);
      },
      (error: HttpErrorResponse) => {
        this.toastSv.error(error.error.message);
      }
    );
  }
}
