import { getElementByCss } from './../../function-common/testing.common';
import { SketchCreateEditDialogData } from '../../model/sketch-create-edit.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoadingService } from './../../service/loading.service';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from './../../service/crud.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/shared/material.module';

import { SketchCreateEditDialogComponent } from './sketch-create-edit-dialog.component';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Sketch } from 'src/app/model/canvas.model';
import { HttpErrorResponse } from '@angular/common/http';

const createSpyObj = jasmine.createSpyObj;

describe('SketchCreateEditDialogComponent', () => {
  let component: SketchCreateEditDialogComponent;
  let fixture: ComponentFixture<SketchCreateEditDialogComponent>;
  let crudServiceMock: CrudService;
  let toastSvMock: ToastrService;
  let loadingServiceMock: LoadingService;
  let dialogRefMock: MatDialogRef<SketchCreateEditDialogComponent>;

  const loadConfig = async (data: any) => {
    await TestBed.configureTestingModule({
      declarations: [
        SketchCreateEditDialogComponent
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
          useValue: crudServiceMock
        },
        FormBuilder,
        {
          provide: ToastrService,
          useValue: toastSvMock
        },
        {
          provide: LoadingService,
          useValue: loadingServiceMock
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefMock
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        },
      ]
    })
    .compileComponents();
  };

  const loadComponent = () => {
    fixture = TestBed.createComponent(SketchCreateEditDialogComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
  };

  const commonTest = (isCreating: boolean) => {
    const sketchInputMock: Sketch = {
      name: "Sketch Name Mock",
      background: "#000000",
      width: 1920,
      height: 1080
    };

    const sketchResultMock: Sketch = {
      id: 0,
      imageURL: "Image URL Mock",
      name: "Sketch Name Mock",
      background: "#000000",
      width: 1920,
      height: 1080
    }

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should validate form initially', () => {
      if (isCreating) {
        expect(component.form.valid).toBeFalsy();
      }
      else {
        expect(component.form.valid).toBeTruthy();
      }
    });

    it('should field required', () => {
      let errors = {};
      let name = component.form.controls['name'];
      name.setValue('');
      errors = name.errors || {};
      expect((errors as ValidationErrors)['required']).toBeTruthy();
    });

    if (isCreating) {
      it('should be valid when form filled', () => {
        expect(component.form.valid).toBeFalsy();
        component.form.controls['name'].setValue('Name Test');
        expect(component.form.valid).toBeTruthy();
      });
    }

    it('should cancel form', () => {
      const cancelBtn = getElementByCss(fixture, '[data-testid="cancelBtn"]');
      cancelBtn.nativeElement.click();
      expect(dialogRefMock.close).toHaveBeenCalled();
    });

    it('should submit', fakeAsync(() => {
      (crudServiceMock.saveNewSketch as jasmine.Spy).and.returnValue(of(sketchResultMock));
      (crudServiceMock.updateSketch as jasmine.Spy).and.returnValue(of(sketchResultMock));
      spyOn(loadingServiceMock.loading$, 'next').and.callThrough;
      component.form.controls['name'].setValue(sketchInputMock.name);
      component.form.controls['background'].setValue(sketchInputMock.background);
      component.form.controls['width'].setValue(sketchInputMock.width);
      component.form.controls['height'].setValue(sketchInputMock.height);
      expect(component.form.valid).toBeTruthy();
      const submitBtn = getElementByCss(fixture, '[data-testid="submitBtn"]');
      submitBtn.nativeElement.click();

      expect(loadingServiceMock.loading$.next).toHaveBeenCalledWith(true);
      tick();
      fixture.detectChanges();
      if (isCreating) {
        expect(loadingServiceMock.loading$.next).toHaveBeenCalledWith(false);
        expect(dialogRefMock.close).toHaveBeenCalledWith(sketchResultMock);
      }
      else {
        expect(loadingServiceMock.loading$.next).toHaveBeenCalledWith(false);
        expect(dialogRefMock.close).toHaveBeenCalledWith(sketchResultMock);
      }
    }));

    it('should submit unsuccessfully', fakeAsync(() => {
      const errorMessage = "Error Message Mock";
      (crudServiceMock.saveNewSketch as jasmine.Spy).and.returnValue(throwError({
        error: {
          message: errorMessage
        }
      } as HttpErrorResponse));
      (crudServiceMock.updateSketch as jasmine.Spy).and.returnValue(throwError({
        error: {
          message: errorMessage
        }
      } as HttpErrorResponse));
      spyOn(loadingServiceMock.loading$, 'next').and.callThrough;
      component.form.controls['name'].setValue(sketchInputMock.name);
      component.form.controls['background'].setValue(sketchInputMock.background);
      component.form.controls['width'].setValue(sketchInputMock.width);
      component.form.controls['height'].setValue(sketchInputMock.height);
      expect(component.form.valid).toBeTruthy();
      const submitBtn = getElementByCss(fixture, '[data-testid="submitBtn"]');
      submitBtn.nativeElement.click();

      expect(loadingServiceMock.loading$.next).toHaveBeenCalledWith(true);
      tick();
      fixture.detectChanges();
      if (isCreating) {
        expect(loadingServiceMock.loading$.next).toHaveBeenCalledWith(false);
        expect(toastSvMock.error).toHaveBeenCalledWith(errorMessage);
      }
      else {
        expect(loadingServiceMock.loading$.next).toHaveBeenCalledWith(false);
        expect(toastSvMock.error).toHaveBeenCalledWith(errorMessage);
      }
    }));
  }

  beforeEach(() => {
    crudServiceMock = createSpyObj(
      'CrudService',
      [
        'saveNewSketch',
        'updateSketch'
      ]
    );
    toastSvMock = createSpyObj(
      'ToastrService',
      [
        'error'
      ]
    );
    loadingServiceMock = {
      loading$: new BehaviorSubject<boolean>(false)
    } as LoadingService;
    dialogRefMock = createSpyObj(
      'MatDialogRef',
      [
        'close'
      ]
    );
  });

  describe('On Create Sketch', () => {
    beforeEach(async () => {
      const data: SketchCreateEditDialogData = {
        isCreating: true
      }
      await loadConfig(data);
    });

    beforeEach(() => {
      loadComponent();
    });

    commonTest(true);
  });

  describe('On Edit Sketch', () => {
    beforeEach(async () => {
      const sketchMock: Sketch = {
        id: 0,
        name: 'Name Mock',
        imageURL: 'Image URL Mock',
        background: 'Background Mock',
        width: 0,
        height: 0
      }
      const data: SketchCreateEditDialogData = {
        isCreating: false,
        sketch: sketchMock
      }
      await loadConfig(data);
    });

    beforeEach(() => {
      loadComponent();
    });

    commonTest(false);
  });
});
