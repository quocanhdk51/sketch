import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { getElementByCss } from '../../function-common/testing.common';
import { MaterialModule } from '../../shared/material.module';

import { SignoutConfirmationComponent } from './signout-confirmation.component';

const createSpyObj = jasmine.createSpyObj;

describe('SignoutConfirmationComponent', () => {
  let component: SignoutConfirmationComponent;
  let fixture: ComponentFixture<SignoutConfirmationComponent>;
  let matDialogRefMock: MatDialogRef<SignoutConfirmationComponent>;

  beforeEach(async () => {
    matDialogRefMock = createSpyObj(
      'MatDialogRef',
      [
        'close'
      ]
    );

    await TestBed.configureTestingModule({
      declarations: [
        SignoutConfirmationComponent
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
    fixture = TestBed.createComponent(SignoutConfirmationComponent);
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

  it('should confirm dialog', () => {
    const confirmBtn = getElementByCss(fixture, '[data-testid="confirmBtn"]');
    confirmBtn.nativeElement.click();
    expect(matDialogRefMock.close).toHaveBeenCalledWith(true);
  });
});
