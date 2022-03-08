import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SketchCreateEditDialogComponent } from './sketch-create-edit-dialog.component';

describe('SketchCreateEditDialogComponent', () => {
  let component: SketchCreateEditDialogComponent;
  let fixture: ComponentFixture<SketchCreateEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SketchCreateEditDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SketchCreateEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
