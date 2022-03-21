import { SketchCreateEditDialogComponent } from './../../component/sketch-create-edit-dialog/sketch-create-edit-dialog.component';
import { SketchCreateEditDialogData } from './../../model/sketch-create-edit.model';
import { getElementByCss } from './../../function-common/testing.common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './../../shared/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AzureService } from './../../service/azure.service';
import { CrudService } from './../../service/crud.service';
import { ComponentFixture, TestBed, fakeAsync, tick, async, flush } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Page } from '../../model/paging.model';
import { Sketch } from '../../model/canvas.model';
import { of, throwError } from 'rxjs';
import { AzureProfile } from 'src/app/model/azure-profile.model';
import { ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

const createSpyObj = jasmine.createSpyObj;

fdescribe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let crudServiceMock: CrudService;
  let azureServiceMock: AzureService;
  let toastSvMock: ToastrService;
  let dialogMock: MatDialog;
  let dialogRefObj = {
    afterClosed: () => of(true),
  }
  const sketchMock: Sketch = {
    id: 0,
    name: 'Name mock',
    imageURL: 'Image Url mock',
    background: 'Background mock',
    width: 0,
    height: 0
  };
  const sketchMockSecond: Sketch = {
    ...sketchMock,
    id: 1
  };
  const pageSketchMock: Page<Sketch> = {
    content: [sketchMock, sketchMockSecond],
    empty: false,
    first: true,
    last: true,
    number: 1,
    numberOfElements: 1,
    pageable: {
      offset: 0,
      pageNumber: 0,
      pageSize: 20,
      paged: true,
      sort: {
        empty: false,
        sorted: true,
        unsorted: false
      },
      unpaged: false
    },
    size: 20,
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    totalElements: 1,
    totalPages: 1
  };
  const azureProfileMock: AzureProfile = {
    businessPhones: [],
    displayName: 'Display name mock',
    givenName: 'Given name mock',
    surname: 'Surname mock',
    jobTitle: null,
    mail: null,
    mobilePhone: null,
    officeLocation: null,
    preferredLanguage: null,
    userPrincipalName: 'User principal name mock',
    id: 'Id mock'
  };
  const azurePhotoMock: string = 'Image URL Mock';
  const errorMessage = 'Error Message Mock';

  const initSpyObject = () => {
    crudServiceMock = createSpyObj(
      'CrudService',
      [
        'searchForSketchByPaging'
      ]
    );
    azureServiceMock = createSpyObj(
      'AzureService',
      [
        'getProfileInfo',
        'getPhoto'
      ]
    );
    toastSvMock = createSpyObj(
      'ToastrService',
      [
        'success',
        'error'
      ]
    );
    dialogMock = createSpyObj(
      'MatDialog',
      [
        'open'
      ]
    );
  };

  const initTestBed = async (
    crudService: CrudService,
    azureService: AzureService,
    toastSv: ToastrService,
    dialog: MatDialog
  ) => {
    await TestBed.configureTestingModule({
      declarations: [
        DashboardComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        {
          provide: CrudService,
          useValue: crudService
        },
        {
          provide: AzureService,
          useValue: azureService
        },
        {
          provide: ToastrService,
          useValue: toastSv
        },
        {
          provide: MatDialog,
          useValue: dialog
        }
      ]
    })
    .overrideComponent(DashboardComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush }
    })
    .compileComponents();
  };

  describe('test handling http system error', () => {
    beforeEach(async () => {
      initSpyObject();
      (crudServiceMock.searchForSketchByPaging as jasmine.Spy).and.returnValue(throwError({
        error: {
          message: errorMessage
        } as HttpErrorResponse
      }));
      (azureServiceMock.getProfileInfo as jasmine.Spy).and.returnValue(throwError({
        error: {
          message: errorMessage
        } as HttpErrorResponse
      }));
      (azureServiceMock.getPhoto as jasmine.Spy).and.returnValue(throwError({
        error: {
          message: errorMessage
        } as HttpErrorResponse
      }));
      await initTestBed(
        crudServiceMock,
        azureServiceMock,
        toastSvMock,
        dialogMock
      );
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should handle error for azure service', fakeAsync(
      () => {
        tick();
        fixture.detectChanges();
        expect(toastSvMock.error).toHaveBeenCalled();
      }
    ));

    it('should handle scroll event on body div', () => {
      const body = getElementByCss(fixture, '[data-testid="body"]');
      expect(body).toBeTruthy();
      body.nativeElement.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(toastSvMock.error).toHaveBeenCalled();
    });
  });

  describe('test handling normal http system connection', () => {
    describe('last page true', () => {
      beforeEach(async () => {
        initSpyObject();
        (dialogMock.open as jasmine.Spy).and.returnValue(dialogRefObj);
        (crudServiceMock.searchForSketchByPaging as jasmine.Spy).and.returnValue(of(pageSketchMock));
        (azureServiceMock.getProfileInfo as jasmine.Spy).and.returnValue(of(azureProfileMock));
        (azureServiceMock.getPhoto as jasmine.Spy).and.returnValue(of(azurePhotoMock));
        await initTestBed(
          crudServiceMock,
          azureServiceMock,
          toastSvMock,
          dialogMock
        );
      });

      beforeEach(() => {
        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should get profile', () => {
        expect(component.userProfile).toEqual(azureProfileMock);
      });

      it('should get photo', () => {
        expect(component.userPhoto).toEqual(azurePhotoMock);
      });

      it('should get noUserProfileAndPhoto', () => {
        expect(component.noUserProfileAndPhoto).toEqual(false);
      });

      it('should get isOnlyProfileLoaded', () => {
        expect(component.isOnlyProfileLoaded).toEqual(false);
      });

      it('should get isPhotoLoaded', () => {
        expect(component.isPhotoLoaded).toEqual(true);
      });

      it('should get isBodyPlaceHolderDisplay', () => {
        expect(component.isBodyPlaceHolderDisplay()).toEqual(false);
      });

      it('should get getBodyPlaceHolderIcon', () => {
        expect(component.getBodyPlaceHolderIcon()).toEqual('(>_<)');
      });

      it('should get getAvatarReplacementFromProfile', () => {
        expect(component.getAvatarReplacementFromProfile()).toEqual('GS');
      });

      it('should handle onCardEventSucces', fakeAsync(
        () => {
          component.onCardEventSuccess();
          tick();
          fixture.detectChanges();
          expect(component.sketches.length > 0).toBeTrue();
        }
      ));

      it('should handle onCreateSketch', () => {
        const data: SketchCreateEditDialogData = {
          isCreating: true
        };
        const createBtn = getElementByCss(fixture, '[data-testid="create-btn"]');
        createBtn.nativeElement.click();
        expect(dialogMock.open).toHaveBeenCalledWith(
          SketchCreateEditDialogComponent,
          {
            data: data
          }
        );
        expect(toastSvMock.success).toHaveBeenCalled();
      });

      it('should handle search', () => {
        component.searchControl.setValue('Search Input Mock');
        fixture.whenStable().then(
          () => {
            fixture.detectChanges();
            expect(component.sketches.length > 0).toBeTrue();
          }
        );
      });

      it('should reload data when the search containing value', () => {
        component.searchControl.setValue('Search Input Mock');
        component.onCardEventSuccess();
        fixture.whenStable().then(
          () => {
            fixture.detectChanges();
            expect(component.searchControl.value).toEqual('');
            expect(component.sketches.length > 0).toBeTrue();
          }
        );
      });
    });

    describe('last page false', () => {
      beforeEach(async () => {
        const falsePageSketchMock: Page<Sketch> = {
          ...pageSketchMock,
          last: false
        };
        initSpyObject();
        (dialogMock.open as jasmine.Spy).and.returnValue(dialogRefObj);
        (crudServiceMock.searchForSketchByPaging as jasmine.Spy).and.returnValue(of(falsePageSketchMock));
        (azureServiceMock.getProfileInfo as jasmine.Spy).and.returnValue(of(azureProfileMock));
        (azureServiceMock.getPhoto as jasmine.Spy).and.returnValue(of(azurePhotoMock));
        await initTestBed(
          crudServiceMock,
          azureServiceMock,
          toastSvMock,
          dialogMock
        );
      });

      beforeEach(() => {
        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should handle scroll event on body div', () => {
        const body = getElementByCss(fixture, '[data-testid="body"]');
        expect(body).toBeTruthy();
        body.nativeElement.dispatchEvent(new Event('scroll'));
        fixture.detectChanges();
        expect(component.sketches.length).toBe(4);
      });
    });
  });
});
