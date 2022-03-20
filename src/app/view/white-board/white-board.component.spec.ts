import { MatMenuHarness } from '@angular/material/menu/testing';
import { DragAndDropDirective } from './../../directive/drag-and-drop.directive';
import { DrawType, Shape } from './../../model/canvas.model';
import { CanvasDirective } from './../../directive/canvas.directive';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './../../shared/material.module';
import { LoadingService } from './../../service/loading.service';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from './../../service/crud.service';
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, ParamMap, Router } from '@angular/router';

import { WhiteBoardComponent } from './white-board.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Sketch, TextPoint } from '../../model/canvas.model';
import { ChangeDetectionStrategy } from '@angular/core';
import { getElementByCss } from '../../function-common/testing.common';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { filter } from 'rxjs/operators';

class DrawTypeMenuSelector {
  private parent: string;

  constructor(parent: string) {
    this.parent = parent;
  }

  get parentSelector(): string {
    return `[data-testid="${this.parent}"]`;
  }

  get notFilled(): string {
    return `[data-testid="${this.parent}-notfilled"]`;
  }

  get filled(): string {
    return `[data-testid="${this.parent}-filled"]`;
  }
}

const createSpyObj = jasmine.createSpyObj;

fdescribe('WhiteBoardComponent', () => {
  let component: WhiteBoardComponent;
  let fixture: ComponentFixture<WhiteBoardComponent>;
  let routerMock: Router;
  let routeMock: ActivatedRoute;
  let crudServiceMock: CrudService;
  let toastSvMock: ToastrService;
  let loadingServiceMock: LoadingService;
  let loader: HarnessLoader;
  const file = new File([''], 'dummy.jpg', { type: 'image/png' });
  const sketchMock: Sketch = {
    id: 0,
    name: 'Name mock',
    imageURL: 'Image Url mock',
    background: '#ffffff',
    width: 0,
    height: 0
  };
  const errorMessage = 'Error Message Mock';
  const point = new TextPoint(0, 0);
  let font: string;
  let mockShape: Shape;

  const initMockInstance = (routeIdParams: string) => {
    routerMock = createSpyObj(
      'Router',
      [
        'navigate'
      ]
    );
    routeMock = {
      snapshot: {
        paramMap: {
          get: (key: string) => routeIdParams
        } as ParamMap
      } as ActivatedRouteSnapshot
    } as ActivatedRoute;
    crudServiceMock = createSpyObj(
      'CrudService',
      [
        'getSketch',
        'updateSketch'
      ]
    );
    toastSvMock = createSpyObj(
      'ToastrService',
      [
        'success',
        'error'
      ]
    );
    loadingServiceMock = {
      loading$: new BehaviorSubject<boolean>(false)
    } as LoadingService;
  };

  const initTestBed = async () => {
    await TestBed.configureTestingModule({
      declarations: [
        WhiteBoardComponent,
        CanvasDirective,
        DragAndDropDirective
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: ActivatedRoute,
          useValue: routeMock
        },
        {
          provide: CrudService,
          useValue: crudServiceMock
        },
        {
          provide: ToastrService,
          useValue: toastSvMock
        },
        {
          provide: LoadingService,
          useValue: loadingServiceMock
        }
      ]
    })
    .overrideComponent(WhiteBoardComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush }
    })
    .compileComponents();
  }

  describe('test invalid route id params', () => {
    beforeEach(async () => {
      initMockInstance("id");
      await initTestBed();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(WhiteBoardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should navigate back to dashboard', () => {
      expect(routerMock.navigate).toHaveBeenCalled();
    });
  });

  describe('test valid route id params', () => {
    const initEnv = () => {
      fixture = TestBed.createComponent(WhiteBoardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      font = component.strokeWidth + 'px serif';
      mockShape = {
        structure: point,
        color: component.strokeColor,
        width: component.strokeWidth,
        type: DrawType.Text,
        filled: component.isFilled,
        font: font
      };
    }

    describe('test error server', () => {
      beforeEach(async () => {
        initMockInstance("0");
        (crudServiceMock.getSketch as jasmine.Spy).and.returnValue(throwError({
          error: {
            message: errorMessage
          } as HttpErrorResponse
        }));
        (crudServiceMock.updateSketch as jasmine.Spy).and.returnValue(throwError({
          error: {
            message: errorMessage
          } as HttpErrorResponse
        }));
        await initTestBed();
      });

      beforeEach(() => {
        initEnv();
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should handle onHome', fakeAsync(
        () => {
          component.sketch = sketchMock;
          spyOn(component.appCanvas, 'getImageURL').and.returnValue('Image URL Mock');
          const homeBtn = getElementByCss(fixture, '[data-testid="homeBtn"]');
          expect(homeBtn).toBeTruthy();
          component.handleFinishedDraw(mockShape);
          tick();
          homeBtn.nativeElement.click();
          tick();
          fixture.detectChanges();
          expect(component.shapes.length).toBe(1);
          expect(loadingServiceMock.loading$.value).toBe(false);
          expect(toastSvMock.error).toHaveBeenCalledWith(errorMessage);
        }
      ));
    });

    describe('test normal server connection', () => {
      beforeEach(async () => {
        initMockInstance("0");
        (crudServiceMock.getSketch as jasmine.Spy).and.returnValue(of(sketchMock));
        (crudServiceMock.updateSketch as jasmine.Spy).and.returnValue(of(sketchMock));
        await initTestBed();
      });

      beforeEach(() => {
        initEnv();
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should handle onHome', fakeAsync(
        () => {
          spyOn(component.appCanvas, 'getImageURL').and.returnValue('Image URL Mock');
          const homeBtn = getElementByCss(fixture, '[data-testid="homeBtn"]');
          expect(homeBtn).toBeTruthy();
          component.handleFinishedDraw(mockShape);
          tick();
          homeBtn.nativeElement.click();
          tick();
          fixture.detectChanges();
          expect(component.shapes.length).toBe(1);
          expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
        }
      ));

      const getSelectorByType = (type: DrawType): string | DrawTypeMenuSelector => {
        switch (type) {
          case DrawType.Sketch: return '[data-testid="sketchBtn"]';
          case DrawType.Eraser: return '[data-testid="eraserBtn"]';
          case DrawType.Line: return '[data-testid="lineBtn"]';
          case DrawType.Image: return '[data-testid="imageBtn"]';
          case DrawType.Rectangle: return new DrawTypeMenuSelector('rectangleBtn');
          case DrawType.Circle: return new DrawTypeMenuSelector('circleBtn');
          case DrawType.Triangle: return new DrawTypeMenuSelector('triangleBtn');
          case DrawType.Diamond: return new DrawTypeMenuSelector('diamondBtn');
          case DrawType.Text: return new DrawTypeMenuSelector('textBtn');
          default: return '';
        }
      };

      const testHandleChangeType = async (type: DrawType, isFilled?: boolean): Promise<void> => {
        if (type === DrawType.Sketch
          || type === DrawType.Eraser
          || type === DrawType.Line
          || type === DrawType.Image
        ) {
          const btn = getElementByCss(
            fixture,
            getSelectorByType(type) as string
          );
          expect(btn).toBeTruthy();
          expect(btn.nativeElement.disabled).toBeFalse();
          btn.nativeElement.click();
          fixture.detectChanges();
          expect(component.drawType).toEqual(type);
          expect(component.isFilled).toBeFalse();
        }
        else {
          const selectors: DrawTypeMenuSelector = getSelectorByType(type) as DrawTypeMenuSelector;
          const menu = await loader.getHarness(MatMenuHarness.with({
            selector: selectors.parentSelector
          }));
          expect(menu).toBeTruthy();
          await menu.open();
          const [notFilled] = await menu.getItems({
            selector: selectors.notFilled
          });
          expect(notFilled).toBeTruthy();
          await notFilled.click();
          fixture.detectChanges();
          expect(component.drawType).toEqual(type);
          expect(component.isFilled).toBeFalse();
          await menu.open();
          const [filled] = await menu.getItems({
            selector: selectors.filled
          });
          expect(filled).toBeTruthy();
          await filled.click();
          fixture.detectChanges();
          expect(component.drawType).toEqual(type);
          expect(component.isFilled).toBeTrue();
        }
      };

      [
        DrawType.Sketch,
        DrawType.Eraser,
        DrawType.Line,
        DrawType.Rectangle,
        DrawType.Circle,
        DrawType.Triangle,
        DrawType.Diamond,
        DrawType.Text,
      ].forEach((type) => {
        it(`should handle changeDrawType: ${type.toString()}`, async () => {
          await testHandleChangeType(type);
        });
      });

      it('should handle loading image', (done) => {
        component.handleFilesUploaded([file]);
        fixture.detectChanges();
        component.selectImage(0);
        component.appCanvas.imageLoaded$.pipe(
          filter(val => val)
        ).subscribe(
          () => {
            fixture.detectChanges();
            testHandleChangeType(DrawType.Image);
            done();
          }
        );
      });

      it('should handle undo', () => {
        component.handleFinishedDraw(mockShape);
        fixture.detectChanges();
        expect(component.shapes.length).toBe(1);
        const undoBtn = getElementByCss(fixture, '[data-testid="undoBtn"]');
        expect(undoBtn).toBeTruthy();
        expect(undoBtn.nativeElement.disabled).toBeFalse();
        undoBtn.nativeElement.click();
        fixture.detectChanges();
        expect(component.shapes.length).toBe(0);
      });

      it('should hanlde togglePalette', () => {
        let palette = getElementByCss(fixture, '.palette-container');
        expect(palette).toBeTruthy();
        const togglePaletteBtn = getElementByCss(fixture, '[data-testid="togglePaletteBtn"]');
        expect(togglePaletteBtn).toBeTruthy();
        togglePaletteBtn.nativeElement.click();
        fixture.detectChanges();
        palette = getElementByCss(fixture, '.palette-container');
        expect(palette).toBeFalsy();
      });
    });
  });
});
