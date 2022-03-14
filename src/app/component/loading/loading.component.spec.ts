import { getElementByCss } from './../../function-common/testing.common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be in full screen', () => {
    const fullScreen = getElementByCss(fixture, '.full-screen');
    expect(fullScreen).toBeFalsy();
  });

  it('should be in full screen', () => {
    component.isFullScreen = true;
    fixture.detectChanges();
    const fullScreen = getElementByCss(fixture, '.full-screen');
    expect(fullScreen).toBeTruthy();
  });
});
