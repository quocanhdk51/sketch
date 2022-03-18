import { FileType } from './../model/drag-and-drop.model';
import { fakeAsync, tick } from '@angular/core/testing';
/* tslint:disable:no-unused-variable */

import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { getElementByCss } from '../function-common/testing.common';
import { DragAndDropDirective } from './drag-and-drop.directive';

@Component({
  template: `<div appDragAndDrop [fileType]="type" (handleUploadedFiles)="handleFileDrop($event)"></div>`
})
class TestDragAndDropComponent {
  public files: File[] = [];
  public type: FileType = FileType.Any

  constructor() {}

  public handleFileDrop(files: File[]): void {
    this.files = files;
  }
}

describe('Directive: DragAndDrop', () => {
  let component: TestDragAndDropComponent;
  let fixture: ComponentFixture<TestDragAndDropComponent>;
  let divEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestDragAndDropComponent,
        DragAndDropDirective
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestDragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    divEl = getElementByCss(fixture, 'div');
  });

  it('should create an instance', () => {
    const directive = new DragAndDropDirective();
    expect(directive).toBeTruthy();
  });

  it('should get div', () => {
    expect(divEl).toBeTruthy();
  });

  it('should handle dragover', () => {
    divEl.nativeElement.dispatchEvent(new DragEvent('dragover', {}));
    fixture.detectChanges();
    expect(divEl.nativeElement.classList.contains('fileover')).toBeTrue();
  });

  it('should handle dragleave', () => {
    divEl.nativeElement.dispatchEvent(new DragEvent('dragover', {}));
    fixture.detectChanges();
    divEl.nativeElement.dispatchEvent(new DragEvent('dragleave', {}));
    fixture.detectChanges();
    expect(divEl.nativeElement.classList.contains('fileover')).toBeFalse();
  });

  it('should handle drop', () => {
    divEl.nativeElement.dispatchEvent(new DragEvent('dragover', {}));
    fixture.detectChanges();
    const file = new File([''], 'dummy.jpg');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    divEl.nativeElement.dispatchEvent(new DragEvent('drop', {
      dataTransfer: dataTransfer
    }));
    fixture.detectChanges();
    expect(divEl.nativeElement.classList.contains('fileover')).toBeFalse();
    expect(component.files.length).toBe(1);
  });

  it('should handle drop fail uploading image files', () => {
    component.type = FileType.Image;
    fixture.detectChanges();
    divEl.nativeElement.dispatchEvent(new DragEvent('dragover', {}));
    fixture.detectChanges();
    const file = new File([''], 'dummy.jpg');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    divEl.nativeElement.dispatchEvent(new DragEvent('drop', {
      dataTransfer: dataTransfer
    }));
    fixture.detectChanges();
    expect(divEl.nativeElement.classList.contains('fileover')).toBeFalse();
    expect(component.files.length).toBe(0);
  });

  it('should handle drop uploading image files', () => {
    component.type = FileType.Image;
    fixture.detectChanges();
    divEl.nativeElement.dispatchEvent(new DragEvent('dragover', {}));
    fixture.detectChanges();
    const file = new File([''], 'dummy.jpg', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    divEl.nativeElement.dispatchEvent(new DragEvent('drop', {
      dataTransfer: dataTransfer
    }));
    fixture.detectChanges();
    expect(divEl.nativeElement.classList.contains('fileover')).toBeFalse();
    expect(component.files.length).toBe(1);
  });
});
