import { getElementByCss } from './../../function-common/testing.common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/shared/material.module';
import { DeleteConfirmationComponent } from './delete-confirmation.component';

const createSpyObj = jasmine.createSpyObj;

describe('DeleteConfirmationComponent', () => {
  let component: DeleteConfirmationComponent;
  let fixture: ComponentFixture<DeleteConfirmationComponent>;
  let matDialogRefMock: MatDialogRef<DeleteConfirmationComponent>;

  beforeEach(async () => {
    matDialogRefMock = createSpyObj(
      'MatDialogRef',
      [
        'close'
      ]
    );

    await TestBed.configureTestingModule({
      declarations: [
        DeleteConfirmationComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: matDialogRefMock
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog', () => {
    const closeBtn = getElementByCss(fixture, '[data-testid="closeBtn"]');
    closeBtn.nativeElement.click();
    expect(matDialogRefMock.close).toHaveBeenCalled();
  });

  it('should confirm delete', () => {
    const deleteBtn = getElementByCss(fixture, '[data-testid="deleteBtn"]');
    deleteBtn.nativeElement.click();
    expect(matDialogRefMock.close).toHaveBeenCalledWith(true);
  })
});
