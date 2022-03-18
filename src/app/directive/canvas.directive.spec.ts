import { filter, take } from 'rxjs/operators';
import { DrawType, Line, Point, TextPoint } from './../model/canvas.model';
import { default_board_width, default_board_height, stroke_color, stroke_width, background } from './../constant/white-board.constant';
/* tslint:disable:no-unused-variable */

import { Component, DebugElement, ViewChild, AfterViewInit } from '@angular/core';
import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Shape } from '../model/canvas.model';
import { CanvasDirective } from './canvas.directive';
import { getElementByCss } from '../function-common/testing.common';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const imageURL = '/assets/svg/iconmonstr-shape-21.svg';

@Component({
  template: `
    <div>
      <canvas
      appCanvas
      [width]="boardWidth"
      [height]="boardHeight"
      [shapes]="shapes"
      [offSetLeft]="padding"
      [offSetTop]="padding"
      [strokeColor]="strokeColor"
      [strokeWidth]="strokeWidth"
      [canvasBackground]="canvasBackground"
      [drawType]="drawType"
      [isFilled]="isFilled"
      (finishedDrawing)="handleFinishedDraw($event)"
      ></canvas>
    </div>
  `
})
class TestCanvasComponent implements AfterViewInit {
  @ViewChild(CanvasDirective) canvas!: CanvasDirective;
  public boardWidth: number = default_board_width;
  public boardHeight: number = default_board_height;
  public shapes: Shape[] = [];
  public padding: number = 0;
  public strokeColor: string = stroke_color;
  public strokeWidth: number = stroke_width;
  public canvasBackground: string = background;
  public drawType: DrawType = DrawType.Sketch;
  public isFilled: boolean = false;

  public ngAfterViewInit(): void {
    this.canvas.renderDone$.pipe(
      filter(value => value),
      take(1)
    ).subscribe(
      () => {
        this.canvas.renderImageURL(imageURL, true);
      }
    );
  }

  public handleFinishedDraw(shape: Shape): void {
    this.shapes.push(shape);
  }

  public undo(): void {
    this.shapes.pop();
    this.canvas.renderImageURL(imageURL);
  }
}

fdescribe('Directive: Canvas', () => {
  let component: TestCanvasComponent;
  let fixture: ComponentFixture<TestCanvasComponent>;
  let canvasEl: DebugElement;

  const file = new File([''], 'dummy.jpg', { type: 'image/png' });
  const start = {
    x: 3,
    y: 4
  };
  const end = {
    x: 6,
    y: 8
  };
  const getX = (x: number) => x - component.canvas.offSetLeft - canvasEl.nativeElement.offsetLeft;
  const getY = (y: number) => y - component.canvas.offSetTop - canvasEl.nativeElement.offsetTop;

  const prepareShapes = (): Shape[] => {
    // Text
    const font = component.strokeWidth + 'px serif';
    const point = new TextPoint(getX(start.x), getY(start.y));
    point.text = 'Value mock';
    const one = new Line();
    // Sketch and Eraser
    one.start = new Point(getX(start.x), getY(start.y));
    one.end = new Point(getX(start.x + 1), getY(start.y + 1));
    const two = new Line();
    two.start = one.end;
    two.end = new Point(getX(end.x), getY(end.y));
    // Shape
    const line = new Line();
    line.start = new Point(getX(start.x), getY(start.y));
    line.end = new Point(getX(end.x), getY(end.y));
    // Generating
    const shapes: Shape[] = [
      {
        structure: point,
        color: component.strokeColor,
        width: component.strokeWidth,
        type: DrawType.Text,
        filled: component.isFilled,
        font: font
      },
      {
        structure: [one, two],
        color: component.strokeColor,
        width: component.strokeWidth,
        type: DrawType.Sketch
      },
      {
        structure: [one, two],
        width: component.strokeWidth,
        type: DrawType.Eraser
      }
    ];
    [
      DrawType.Line,
      DrawType.Rectangle,
      DrawType.Circle,
      DrawType.Triangle,
      DrawType.Diamond,
      DrawType.Image
    ].forEach(item => {
      shapes.push({
        structure: line,
        color: component.strokeColor,
        width: component.strokeWidth,
        type: item,
        filled: component.isFilled,
        imageUrl: (item === DrawType.Image) ? 'data:image/png;base64,' : undefined
      })
    });
    return shapes;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestCanvasComponent,
        CanvasDirective
      ],
      imports: [
        NoopAnimationsModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    canvasEl = getElementByCss(fixture, 'canvas');
  });

  it('should set canvas style', () => {
    expect(canvasEl.nativeElement.style.zIndex).toBe('0');
    expect(canvasEl.nativeElement.style.position).toBe('relative');
  });

  it('should render all canvases', (done) => {
    component.canvas.renderDone$.pipe(
      filter((value) => value)
    ).subscribe(
      () => {
        fixture.detectChanges();
        const canvases = fixture.debugElement.queryAll(By.css('canvas'));
        expect(canvases.length).toBe(3);
        done();
      }
    );
  });

  it('shoud rerender all canvases', fakeAsync(() => {
    component.shapes = prepareShapes();
    fixture.detectChanges();
    component.canvas.render();
    tick();
    fixture.detectChanges();
    const canvases = fixture.debugElement.queryAll(By.css('canvas'));
    expect(canvases.length).toBe(3);
  }));

  it('should handle undo', fakeAsync(() => {
    component.shapes = prepareShapes();
    fixture.detectChanges();
    component.canvas.render();
    tick();
    fixture.detectChanges();
    component.undo();
    fixture.detectChanges();
    expect(component.shapes.length).toBe(8);
  }));

  it('should set attribute for final draw canvas', (done) => {
    component.canvas.renderDone$.pipe(
      filter((value) => value)
    ).subscribe(
      () => {
        fixture.detectChanges();
        const finalCanvasEl = getElementByCss(fixture, '.final-canvas');
        expect(finalCanvasEl.nativeElement.style.zIndex).toBe(`${parseInt(canvasEl.nativeElement.style.zIndex) - 1}`);
        expect(finalCanvasEl.nativeElement.style.position).toBe('absolute');
        expect(finalCanvasEl.nativeElement.style.left).toBe(`${canvasEl.nativeElement.offsetLeft}px`);
        expect(finalCanvasEl.nativeElement.style.top).toBe(`${canvasEl.nativeElement.offsetTop}px`);
        done();
      }
    );
  });

  it('should set attribute for background draw canvas', (done) => {
    component.canvas.renderDone$.pipe(
      filter((value) => value)
    ).subscribe(
      () => {
        fixture.detectChanges();
        const backgroundCanvasEl = getElementByCss(fixture, '.background-canvas');
        expect(backgroundCanvasEl.nativeElement.style.zIndex).toBe(`${parseInt(canvasEl.nativeElement.style.zIndex) - 2}`);
        expect(backgroundCanvasEl.nativeElement.style.position).toBe('absolute');
        expect(backgroundCanvasEl.nativeElement.style.left).toBe(`${canvasEl.nativeElement.offsetLeft}px`);
        expect(backgroundCanvasEl.nativeElement.style.top).toBe(`${canvasEl.nativeElement.offsetTop}px`);
        done();
      }
    );
  });

  it('should render with eco', fakeAsync(() => {
    component.canvas.render(true);
    tick();
    fixture.detectChanges();
    const backgroundCanvasEl = getElementByCss(fixture, '.background-canvas');
    expect(backgroundCanvasEl.nativeElement.getContext('2d').fillStyle).toBe(component.canvasBackground);
  }));

  it('should render with eco and background', fakeAsync(() => {
    component.canvas.render(true, true);
    tick();
    fixture.detectChanges();
    const backgroundCanvasEl = getElementByCss(fixture, '.background-canvas');
    expect(backgroundCanvasEl.nativeElement.getContext('2d').fillStyle).toBe(component.canvasBackground);
  }));

  it('should load image', (done) => {
    component.canvas.loadImage(file);
    component.canvas.imageLoaded$.pipe(
      filter(value => value)
    ).subscribe(
      () => {
        expect(component.canvas.imageRef).toBeTruthy();
        done();
      }
    );
  });

  it('should get image url', () => {
    expect(component.canvas.getImageURL()).toBeTruthy();
  });

  describe('test draw', () => {
    const simulateDrawingWithMouseDown = () => {
      canvasEl.nativeElement.dispatchEvent(new MouseEvent('mousedown', { clientX: start.x, clientY: start.y }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new MouseEvent('mousemove', { clientX: start.x + 1, clientY: start.y + 1 }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new MouseEvent('mousemove', { clientX: end.x, clientY: end.y }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new MouseEvent('mouseup', { clientX: end.x, clientY: end.y }));
      fixture.detectChanges();
    };

    const simulateDrawingWithMouseOut = () => {
      canvasEl.nativeElement.dispatchEvent(new MouseEvent('mousedown', { clientX: start.x, clientY: start.y }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new MouseEvent('mousemove', { clientX: start.x + 1, clientY: start.y + 1 }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new MouseEvent('mousemove', { clientX: end.x, clientY: end.y }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new MouseEvent('mouseout', { clientX: end.x, clientY: end.y }));
      fixture.detectChanges();
    };

    const simulateDrawingWithTargetTouch = () => {
      canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchstart', { targetTouches: [similateTouch(start.x, start.y)], changedTouches: [] }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchmove', { targetTouches: [similateTouch(start.x + 1, start.y + 1)], changedTouches: [] }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchmove', { targetTouches: [similateTouch(end.x, end.y)], changedTouches: [] }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchend', { targetTouches: [similateTouch(end.x, end.y)], changedTouches: [] }));
      fixture.detectChanges();
    };

    const simulateDrawingWithChangedTouch = () => {
      canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchstart', { changedTouches: [similateTouch(start.x, start.y)], targetTouches: [] }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchmove', { changedTouches: [similateTouch(start.x + 1, start.y + 1)], targetTouches: [] }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchmove', { changedTouches: [similateTouch(end.x, end.y)], targetTouches: [] }));
      fixture.detectChanges();
      canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchend', { changedTouches: [similateTouch(end.x, end.y)], targetTouches: [] }));
      fixture.detectChanges();
    };

    const similateTouch = (pageX: number, pageY: number) => {
      return new Touch({
        pageX: pageX,
        pageY: pageY,
        identifier: 0,
        target: new EventTarget()
      });
    }

    describe('test DrawType: Text', () => {
      beforeEach(() => {
        component.drawType = DrawType.Text;
        fixture.detectChanges();
      });

      afterEach(() => {
        component.shapes = [];
        fixture.detectChanges();
      });

      it('should not trigger input', () => {
        canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchstart', {}));
        fixture.detectChanges();
        expect(getElementByCss(fixture, 'input')).toBeFalsy();
        canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchmove', {}));
        fixture.detectChanges();
        expect(getElementByCss(fixture, 'input')).toBeFalsy();
        canvasEl.nativeElement.dispatchEvent(new TouchEvent('touchend', {}));
        fixture.detectChanges();
        expect(getElementByCss(fixture, 'input')).toBeFalsy();
        canvasEl.nativeElement.dispatchEvent(new MouseEvent('mousemove', {}));
        fixture.detectChanges();
        expect(getElementByCss(fixture, 'input')).toBeFalsy();
        canvasEl.nativeElement.dispatchEvent(new MouseEvent('mouseup', {}));
        fixture.detectChanges();
        expect(getElementByCss(fixture, 'input')).toBeFalsy();
        canvasEl.nativeElement.dispatchEvent(new MouseEvent('mouseout', {}));
        fixture.detectChanges();
        expect(getElementByCss(fixture, 'input')).toBeFalsy();
      });

      it('should trigger input and handle text input', () => {
        canvasEl.nativeElement.dispatchEvent(new MouseEvent('mousedown', { clientX: start.x, clientY: start.y }));
        fixture.detectChanges();
        const inputRef = getElementByCss(fixture, 'input');
        expect(inputRef).toBeTruthy();
        expect(inputRef.nativeElement.style.position).toBe('absolute');
        expect(inputRef.nativeElement.style.left).toBe(`${getX(start.x)}px`);
        expect(inputRef.nativeElement.style.top).toBe(`${getY(start.y)}px`);
        inputRef.nativeElement.value = 'Test Input';
        inputRef.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: "Enter" }));
        fixture.detectChanges();
        expect(component.shapes.length).toBe(1);
        const font = component.strokeWidth + 'px serif';
        const point = new TextPoint(getX(start.x), getY(start.y));
        point.text = inputRef.nativeElement.value;
        expect(component.shapes[0]).toEqual({
          structure: point,
          color: component.strokeColor,
          width: component.strokeWidth,
          type: DrawType.Text,
          filled: component.isFilled,
          font: font
        });
      });

      it('should exit input', () => {
        canvasEl.nativeElement.dispatchEvent(new MouseEvent('mousedown', { clientX: start.x, clientY: start.y }));
        fixture.detectChanges();
        let inputRef = getElementByCss(fixture, 'input');
        expect(inputRef).toBeTruthy();
        expect(inputRef.nativeElement.style.position).toBe('absolute');
        expect(inputRef.nativeElement.style.left).toBe(`${getX(start.x)}px`);
        expect(inputRef.nativeElement.style.top).toBe(`${getY(start.y)}px`);
        inputRef.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: "Escape" }));
        fixture.detectChanges();
        inputRef = getElementByCss(fixture, 'input');
        expect(inputRef).toBeFalsy();
      });
    });

    const testDrawing = (type: DrawType) => {

      const getTypeTitle = (type: DrawType): string => {
        switch(type) {
          case DrawType.Sketch: return 'Sketch';
          case DrawType.Eraser: return 'Eraser';
          case DrawType.Line: return 'Line';
          case DrawType.Rectangle: return 'Rectangle';
          case DrawType.Circle: return 'Circle';
          case DrawType.Triangle: return 'Triangle';
          case DrawType.Diamond: return 'Diamond';
          case DrawType.Image: return 'Image';
          default: return '';
        }
      };

      describe(`test DrawType: ${getTypeTitle(type)}`, () => {
        beforeEach(() => {
          component.drawType = type;
          if (type === DrawType.Image) {
            component.canvas.loadImage(file);
          }
          fixture.detectChanges();
        });

        afterEach(() => {
          component.shapes = [];
          fixture.detectChanges();
        });

        const test = (type: DrawType) => {
          expect(component.shapes.length).toBe(1);
          if (type === DrawType.Sketch || type === DrawType.Eraser) {
            const one = new Line();
            one.start = new Point(getX(start.x), getY(start.y));
            one.end = new Point(getX(start.x + 1), getY(start.y + 1));
            const two = new Line();
            two.start = one.end;
            two.end = new Point(getX(end.x), getY(end.y));
            if (type === DrawType.Sketch) {
              expect(component.shapes[0]).toEqual(
                {
                  structure: [one, two],
                  color: component.strokeColor,
                  width: component.strokeWidth,
                  type: DrawType.Sketch
                }
              );
            }
            else {
              expect(component.shapes[0]).toEqual(
                {
                  structure: [one, two],
                  width: component.strokeWidth,
                  type: DrawType.Eraser
                }
              );
            }
          }
          else {
            const line = new Line();
            line.start = new Point(getX(start.x), getY(start.y));
            line.end = new Point(getX(end.x), getY(end.y));
            expect(component.shapes[0]).toEqual(
              {
                structure: line,
                color: component.strokeColor,
                width: component.strokeWidth,
                type: type,
                filled: component.isFilled,
                imageUrl: (type === DrawType.Image) ? 'data:image/png;base64,' : undefined
              }
            );
          }
        };

        if (type === DrawType.Image) {
          it('should handle draw with mouse (end with mouse up)', (done) => {
            component.canvas.imageLoaded$.pipe(
              filter(val => val)
            ).subscribe(
              () => {
                simulateDrawingWithMouseDown();
                test(type);
                done();
              }
            );
          });

          it('should handle draw with mouse (end with mouse out)', (done) => {
            component.canvas.imageLoaded$.pipe(
              filter(val => val)
            ).subscribe(
              () => {
                simulateDrawingWithMouseOut();
                test(type);
                done();
              }
            );
          });

          it('should handle draw with touch (end with target touch)', (done) => {
            component.canvas.imageLoaded$.pipe(
              filter(val => val)
            ).subscribe(
              () => {
                simulateDrawingWithTargetTouch();
                test(type);
                done();
              }
            );
          });

          it('should handle draw with touch (end with changed touch)', (done) => {
            component.canvas.imageLoaded$.pipe(
              filter(val => val)
            ).subscribe(
              () => {
                simulateDrawingWithChangedTouch();
                test(type);
                done();
              }
            );
          });
        }
        else {
          it('should handle draw with mouse (end with mouse up)', () => {
            simulateDrawingWithMouseDown();
            test(type);
          });

          it('should handle draw with mouse (end with mouse out)', () => {
            simulateDrawingWithMouseOut();
            test(type);
          });

          it('should handle draw with touch (end with target touch)', () => {
            simulateDrawingWithTargetTouch();
            test(type);
          });

          it('should handle draw with touch (end with changed touch)', () => {
            simulateDrawingWithChangedTouch();
            test(type);
          });
        }
      });
    };

    [
      DrawType.Sketch,
      DrawType.Eraser,
      DrawType.Line,
      DrawType.Rectangle,
      DrawType.Circle,
      DrawType.Triangle,
      DrawType.Diamond,
      DrawType.Image
    ].forEach(item => {
      testDrawing(item);
    });

    describe('test abnormal case', () => {
      beforeEach(() => {
        component.drawType = DrawType.Sketch;
        fixture.detectChanges();
      });

      afterEach(() => {
        component.shapes = [];
        fixture.detectChanges();
      });

      it('should not handle invalid type', () => {
        component.drawType = 10;
        fixture.detectChanges();
        simulateDrawingWithMouseDown();
        expect(component.shapes.length).toBe(0);
      })
    });
  });
});
