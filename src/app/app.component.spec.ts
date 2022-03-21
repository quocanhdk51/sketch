import { getElementByCss } from './function-common/testing.common';
import { LoadingService } from './service/loading.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { BehaviorSubject } from 'rxjs';
import { LoadingComponent } from './component/loading/loading.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let loadingServiceMock: LoadingService;

  beforeEach(async () => {
    loadingServiceMock = {
      loading$: new BehaviorSubject<boolean>(false)
    } as LoadingService;

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent,
        LoadingComponent
      ],
      providers: [
        {
          provide: LoadingService,
          useValue: loadingServiceMock
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'sketch'`, () => {
    expect(component.title).toEqual('sketch');
  });

  it('should load loading value', () => {
    expect(component.isLoading).toBeFalse();
    const loading =  getElementByCss(fixture, '[data-testid="loading"]');
    expect(loading).toBeFalsy();
  });
});
