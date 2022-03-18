import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { getElementByCss } from '../function-common/testing.common';
import { ImgFileReaderDirective } from './img-file-reader.directive';

@Component({
  template: `<img [appImgFileReader]="file" [placeHolder]="placeHolder">`
})
class TestImgFileReaderComponent {
  public file: File = new File([''], 'demo.png', { type: 'image/png' });
  public placeHolder: string = 'placeHolderMock';
}

const path = 'http://localhost:9876/';

describe('Directive: ImgFileReader', () => {
  let component: TestImgFileReaderComponent;
  let fixture: ComponentFixture<TestImgFileReaderComponent>;
  let imgEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestImgFileReaderComponent,
        ImgFileReaderDirective
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestImgFileReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    imgEl = getElementByCss(fixture, 'img');
  });

  it('should load image from file input', (done) => {
    expect(imgEl.nativeElement.src).toBe(path + component.placeHolder);
    fixture.detectChanges();
    setTimeout(
      () => {
        fixture.detectChanges();
        expect(imgEl.nativeElement.src).toBe('data:image/png;base64,');
        done();
      },
    );
  });
});
