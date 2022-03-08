import { Subject } from 'rxjs';
import { SketchCreateEditDialogComponent } from './../../component/sketch-create-edit-dialog/sketch-create-edit-dialog.component';
import { Sketch } from './../../model/canvas.model';
import { CrudService } from './../../service/crud.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SketchCreateEditDialogData } from 'src/app/model/sketch-create-edit.model';
import { FormControl } from '@angular/forms';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DeleteConfirmationComponent } from 'src/app/component/delete-confirmation/delete-confirmation.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { page_size } from 'src/app/constant/common.constant';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('body', {static: true}) bodyElementRef!: ElementRef;
  public sketches: Sketch[] = [];
  public searchControl: FormControl = new FormControl('');

  private _destroying$: Subject<void> = new Subject();
  private currentPage: number = 0;
  private isLastPage: boolean = false;
  private isFisrtPage: boolean = true;
  private _body!: HTMLDivElement;

  constructor(
    private router: Router,
    private crudService: CrudService,
    private toastSv: ToastrService,
    public dialog: MatDialog
  ) { }

  public ngOnInit(): void {
    this.reloadDashBoard();
    this.searchControl.valueChanges.pipe(
      takeUntil(this._destroying$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(
      (value: string) => {
        this.reloadData(value.trim());
      }
    );
  }

  public ngAfterViewInit(): void {
    this._body = this.bodyElementRef.nativeElement;
    this._body.onscroll = () => {
      if (this._body.offsetHeight + this._body.scrollTop >= this._body.scrollHeight) {
        this.loadNextPage();
      }
    };
  }

  public ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.unsubscribe();
  }

  public isBodyPlaceHolderDisplay(): boolean {
    return this.sketches.length === 0;
  }

  public getBodyPlaceHolderIcon(): string {
    return "(>_<)";
  }

  public onCreateSketch(): void {
    const data: SketchCreateEditDialogData = {
      isCreating: true
    };
    const dialogRef = this.dialog.open(
      SketchCreateEditDialogComponent,
      {
        data: data
      }
    );
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.reloadDashBoard();
        this.toastSv.success(`Sketch '${data.name}' is created successfully`);
      }
    });
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
        this.reloadDashBoard();
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
              this.reloadDashBoard();
            },
            (error: HttpErrorResponse) => {
              this.toastSv.error(error.error.message);
            }
          );
        }
      }
    );
  }

  public getImageSrc(sketch: Sketch): string {
    return (sketch.imageURL) ? sketch.imageURL : "";
  }

  public onCardClick(sketch: Sketch): void {
    this.router.navigate(['/whiteboard', {
      id: sketch.id as number
    }]);
  }

  private reloadDashBoard(): void {
    if (this.searchControl.value === '') {
      this.reloadData('');
    }
    else {
      this.searchControl.setValue('');
    }
  }

  private reloadData(value: string): void {
    this.currentPage = 0;
    this.crudService.searchForSketchByPaging(value, this.currentPage, page_size).subscribe(
      (data) => {
        this.isFisrtPage = data.first;
        this.isLastPage = data.last;
        this.sketches = data.content;
        this.sketches.sort((a, b) => (a.id as number) - (b.id as number));
      },
      (error: HttpErrorResponse) => {
        this.toastSv.error(error.error.message);
      }
    );
  }

  private loadNextPage(): void {
    if (!this.isLastPage) {
      this.currentPage += 1;
      this.crudService.searchForSketchByPaging(this.searchControl.value, this.currentPage, page_size).subscribe(
        (data) => {
          this.isFisrtPage = data.first;
          this.isLastPage = data.last;
          this.sketches.push(...data.content);
          this.sketches.sort((a, b) => (a.id as number) - (b.id as number));
        },
        (error: HttpErrorResponse) => {
          this.toastSv.error(error.error.message);
        }
      );
    }
  }
}
