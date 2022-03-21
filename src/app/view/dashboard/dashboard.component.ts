import { AzureProfile } from './../../model/azure-profile.model';
import { AzureService } from './../../service/azure.service';
import { Subject, Observable } from 'rxjs';
import { SketchCreateEditDialogComponent } from './../../component/sketch-create-edit-dialog/sketch-create-edit-dialog.component';
import { Sketch } from './../../model/canvas.model';
import { CrudService } from './../../service/crud.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SketchCreateEditDialogData } from 'src/app/model/sketch-create-edit.model';
import { FormControl } from '@angular/forms';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
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
  public isLoadingItem: boolean = false;

  private _destroying$: Subject<void> = new Subject();
  private currentPage: number = 0;
  private isLastPage: boolean = true;
  private _body!: HTMLDivElement;
  private profile!: AzureProfile;
  private photo!: string;

  constructor(
    private crudService: CrudService,
    private azureService: AzureService,
    private toastSv: ToastrService,
    public dialog: MatDialog
  ) { }

  public ngOnInit(): void {
    this.searchControlChange$.pipe(
      takeUntil(this._destroying$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(
      (value: string) => {
        this.reloadData(value.trim());
      }
    );
    this.reloadDashBoard();
  }

  public ngAfterViewInit(): void {
    this.azureService.getProfileInfo().subscribe(
      (data) => this.profile = data,
      (error: HttpErrorResponse) => {
        this.toastSv.error(error.error.message);
      }
    );
    this.azureService.getPhoto().subscribe(
      (data) => this.photo = data
    );
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

  get searchControlChange$(): Observable<any> {
    return this.searchControl.valueChanges;
  }

  get userProfile(): AzureProfile {
    return this.profile;
  }

  get userPhoto(): string {
    return this.photo;
  }

  get noUserProfileAndPhoto(): boolean {
    return this.photo == null && this.profile == null;
  }

  get isOnlyProfileLoaded(): boolean {
    return this.photo == null && this.profile != null;
  }

  get isPhotoLoaded(): boolean {
    return this.photo != null;
  }

  public isBodyPlaceHolderDisplay(): boolean {
    return this.sketches.length === 0 && !this.isLoadingItem;
  }

  public getBodyPlaceHolderIcon(): string {
    return "(>_<)";
  }

  public getAvatarReplacementFromProfile(): string {
    return this.profile.givenName[0].toUpperCase() + this.profile.surname[0].toUpperCase();
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

  public onCardEventSuccess(): void {
    this.reloadDashBoard();
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
    this.isLoadingItem = true;
    this.currentPage = 0;
    this.crudService.searchForSketchByPaging(value, this.currentPage, page_size).subscribe(
      (data) => {
        this.isLastPage = data.last;
        this.sketches = [];
        this.sketches = data.content;
        this.sketches.sort((a, b) => (a.id as number) - (b.id as number));
        this.isLoadingItem = false;
      },
      (error: HttpErrorResponse) => {
        this.isLoadingItem = false;
        this.toastSv.error(error.error.message);
      }
    );
  }

  private loadNextPage(): void {
    if (!this.isLastPage) {
      this.isLoadingItem = true;
      this.currentPage += 1;
      this.crudService.searchForSketchByPaging(this.searchControl.value, this.currentPage, page_size).subscribe(
        (data) => {
          this.isLastPage = data.last;
          this.sketches.push(...data.content);
          this.sketches.sort((a, b) => (a.id as number) - (b.id as number));
          this.isLoadingItem = false;
        },
        (error: HttpErrorResponse) => {
          this.isLoadingItem = false;
          this.toastSv.error(error.error.message);
        }
      );
    }
  }
}
