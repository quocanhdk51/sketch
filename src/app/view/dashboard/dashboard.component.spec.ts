import { MaterialModule } from './../../shared/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AzureService } from './../../service/azure.service';
import { CrudService } from './../../service/crud.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

fdescribe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let crudServiceMock: CrudService;
  let azureServiceMock: AzureService;
  let toastSvMock: ToastrService;
  let dialogMock: MatDialog

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DashboardComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: CrudService,
          useValue: crudServiceMock
        },
        {
          provide: AzureService,
          useValue: azureServiceMock
        },
        {
          provide: ToastrService,
          useValue: toastSvMock
        },
        {
          provide: MatDialog,
          useValue: dialogMock
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
