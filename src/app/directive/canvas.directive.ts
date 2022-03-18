import { getFileDataURL } from './../function-common/function.common';
import { stroke_color, stroke_width, background } from './../constant/white-board.constant';
import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2, AfterViewChecked } from '@angular/core';
import { DrawType, Line, Point, Shape, TextPoint } from '../model/canvas.model';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { delayWhen, switchMap, take } from 'rxjs/operators'

@Directive({
  selector: '[appCanvas]'
})
export class CanvasDirective implements AfterViewInit, AfterViewChecked {
  @Output() finishedDrawing: EventEmitter<Shape> = new EventEmitter();
  @Input() shapes: Shape[] = [];
  @Input() strokeColor: string = stroke_color;
  @Input() strokeWidth: number = stroke_width;
  @Input() canvasBackground: string = background;
  @Input() offSetLeft: number = 0;
  @Input() offSetTop: number = 0;
  @Input() drawType: DrawType = DrawType.Sketch;
  @Input() isFilled: boolean = false;
  public imageLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public renderDone$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private finalDrawCanvas: HTMLCanvasElement | null = null;
  private finalDrawContext: CanvasRenderingContext2D | null = null;
  private backgroundDrawCanvas: HTMLCanvasElement | null = null;
  private backgroundDrawContext: CanvasRenderingContext2D | null = null;
  private textInput: HTMLInputElement | null = null;
  private isDrawing: boolean = false;
  private line!: Line;
  private lines: Line[] = [];
  private image: HTMLImageElement | null = null;
  private _afterViewChecked$: Subject<void> = new Subject();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.canvas = this.el.nativeElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  public ngAfterViewChecked(): void {
    this._afterViewChecked$.next();
  }

  public ngAfterViewInit(): void {
    this.setCanvasStyle();
    this.render();
  }

  get imageRef(): HTMLImageElement | null {
    return this.image;
  }

  @HostListener('touchstart', ['$event'])
  public onTouchStart(event: TouchEvent): void {
    if (this.drawType === DrawType.Text) {
      return;
    }
    this.start(event);
  }

  @HostListener('touchmove', ['$event'])
  public onTouchMove(event: TouchEvent): void {
    if (this.drawType === DrawType.Text) {
      return;
    }
    this.draw(event);
  }

  @HostListener('touchend', ['$event'])
  public onTouchEnd(event: TouchEvent): void {
    if (this.drawType === DrawType.Text) {
      return;
    }
    this.stop(event);
  }

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    if (this.drawType === DrawType.Text) {
      const point = new TextPoint(this.getX(event), this.getY(event));
      this.removeInput();
      this.renderInput(point);
      return;
    }
    this.start(event);
  }

  @HostListener('mousemove', ['$event'])
  public onMouseMove(event: MouseEvent): void {
    if (this.drawType === DrawType.Text) {
      return;
    }
    this.draw(event);
  }

  @HostListener('mouseup', ['$event'])
  public onMouseUp(event: TouchEvent): void {
    if (this.drawType === DrawType.Text) {
      return;
    }
    this.stop(event);
  }

  @HostListener('mouseout', ['$event'])
  public onMouseOut(event: TouchEvent): void {
    if (this.drawType === DrawType.Text) {
      return;
    }
    this.stop(event);
  }

  public renderImageURL(imageURL: string, renderShape?: boolean): void {
    const renderSketch$ = new Observable(
      (sub) => {
        const image = new Image;
        image.onload = () => {
          if (renderShape) {
            this.clearFinal();
            this.finalContext.drawImage(image, 0, 0);
            this.drawLoadedShapes();
          }
          else {
            this.finalContext.drawImage(image, 0, 0);
          }
        };
        image.src = imageURL;
        sub.next();
        sub.complete();
      }
    );
    this.afterViewCheckedHandle(of(0), renderSketch$).subscribe();
  }

  public getImageURL(): string {
    return this.finalCanvas.toDataURL();
  }

  public render(eco?: boolean, background?: boolean): void {
    if (eco) {
      const eco$ = new Observable(
        (sub) => {
          this.setBackground();
          if (!background) {
            this.clearFinal();
            this.drawLoadedShapes();
          }
          sub.next();
          sub.complete();
        }
      );
      this.afterViewCheckedHandle(of(0), eco$).subscribe();
      return;
    }
    const removeDraw$ = new Observable(
      (sub) => {
        this.renderDone$.next(false);
        this.removeInput();
        this.removeBackgroundDraw();
        this.removeFinalDraw();
        sub.next();
        sub.complete();
      }
    );
    const reload$ = new Observable(
      (sub) => {
        this.createBackgroundDraw();
        this.createFinalDraw();
        this.setBackground();
        this.drawLoadedShapes();
        sub.next();
        sub.complete();
      }
    );
    const observable = this.afterViewCheckedHandle(
      removeDraw$,
      reload$
    );
    observable.subscribe(() => {
      this.renderDone$.next(true);
    });
  }

  public loadImage(file: File): void {
    getFileDataURL(file).subscribe(
      (url) => {
        this.image = new Image;
        this.image.src = url;
        this.imageLoaded$.next(true);
      }
    );
  }

  private afterViewCheckedHandle(pre: Observable<any>, post: Observable<any>): Observable<any> {
    return pre.pipe(
      delayWhen(() => this._afterViewChecked$),
      take(1),
      switchMap(() => post)
    );
  }

  private get finalCanvas(): HTMLCanvasElement {
    return this.finalDrawCanvas as HTMLCanvasElement;
  }

  private get finalContext(): CanvasRenderingContext2D {
    return this.finalDrawContext as CanvasRenderingContext2D;
  }

  private get backgroundCanvas(): HTMLCanvasElement {
    return this.backgroundDrawCanvas as HTMLCanvasElement;
  }

  private get backgroundContext(): CanvasRenderingContext2D {
    return this.backgroundDrawContext as CanvasRenderingContext2D;
  }

  private get input(): HTMLInputElement {
    return this.textInput as HTMLInputElement;
  }

  private setCanvasStyle(): void {
    this.renderer.setStyle(
      this.canvas,
      'z-index',
      (this.canvas.style.zIndex === '')
      ? '0'
      : this.canvas.style.zIndex
    );
    this.renderer.setStyle(
      this.canvas,
      'position',
      (this.canvas.style.position === '')
      ? 'relative'
      : this.canvas.style.position
    );
  }

  private createFinalDraw(): void {
    this.finalDrawCanvas = this.renderer.createElement('canvas');
    this.renderer.appendChild(
      this.renderer.parentNode(this.canvas),
      this.finalCanvas
    );
    this.finalCanvas.width = this.canvas.width;
    this.finalCanvas.height = this.canvas.height;
    this.renderer.addClass(this.finalCanvas, 'final-canvas');
    this.renderer.setStyle(this.finalCanvas, 'z-index', `${parseInt(this.canvas.style.zIndex) - 1}`);
    this.renderer.setStyle(this.finalCanvas, 'position', 'absolute');
    this.renderer.setStyle(this.finalCanvas, 'left', `${this.canvas.offsetLeft}px`);
    this.renderer.setStyle(this.finalCanvas, 'top', `${this.canvas.offsetTop}px`);
    this.finalDrawContext = this.finalCanvas.getContext('2d');
  }

  private removeFinalDraw(): void {
    if (this.finalDrawCanvas) {
      this.renderer.removeChild(this.renderer.parentNode(this.canvas), this.finalCanvas);
      this.finalDrawCanvas = null;
      this.finalDrawContext = null;
    }
  }

  private createBackgroundDraw(): void {
    this.backgroundDrawCanvas = this.renderer.createElement('canvas');
    this.renderer.appendChild(
      this.renderer.parentNode(this.canvas),
      this.backgroundCanvas
    );
    this.backgroundCanvas.width = this.canvas.width;
    this.backgroundCanvas.height = this.canvas.height;
    this.renderer.addClass(this.backgroundCanvas, 'background-canvas');
    this.renderer.setStyle(this.backgroundCanvas, 'z-index', `${parseInt(this.canvas.style.zIndex) - 2}`);
    this.renderer.setStyle(this.backgroundCanvas, 'position', 'absolute');
    this.renderer.setStyle(this.backgroundCanvas, 'left', `${this.canvas.offsetLeft}px`);
    this.renderer.setStyle(this.backgroundCanvas, 'top', `${this.canvas.offsetTop}px`);
    this.backgroundDrawContext = this.backgroundCanvas.getContext('2d');
  }

  private removeBackgroundDraw(): void {
    if (this.backgroundDrawCanvas) {
      this.renderer.removeChild(this.renderer.parentNode(this.canvas), this.backgroundCanvas);
      this.backgroundDrawCanvas = null;
      this.backgroundDrawContext = null;
    }
  }

  //Draw Text Handler
  private renderInput(point: TextPoint): void {
    this.textInput = this.renderer.createElement('input');
    this.renderer.appendChild(this.renderer.parentNode(this.canvas), this.textInput);
    this.input.onkeydown = (event) => this.handleInputKeyDown(event, point);
    this.input.style.position = 'absolute';
    this.input.style.left = `${point.x}px`;
    this.input.style.top = `${point.y}px`;
    this.input.focus();
  }

  private handleInputKeyDown(event: KeyboardEvent, point: TextPoint): void {
    if (event.key === "Enter") {
      if (this.input.value.trim() !== "") {
        point.text = this.input.value;
        const font = this.strokeWidth + 'px serif';
        point.drawText(this.finalContext, font, this.strokeColor, this.isFilled);
        this.finishedDrawing.emit(
          {
            structure: point,
            color: this.strokeColor,
            width: this.strokeWidth,
            type: DrawType.Text,
            filled: this.isFilled,
            font: font
          }
        );
      }
      this.removeInput();
    }
    else if (event.key === "Escape") {
      this.removeInput();
    }
  }

  private removeInput(): void {
    if (this.textInput) {
      this.renderer.removeChild(this.renderer.parentNode(this.canvas), this.textInput);
      this.textInput = null;
    }
  }

  //Draw Shape Handler
  private start(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    this.line = new Line();
    this.line.start = new Point(this.getX(event), this.getY(event));
    event.preventDefault();
  }

  private draw(event: MouseEvent | TouchEvent): void {
    if (this.isDrawing) {
      switch(this.drawType) {
        case DrawType.Sketch: {
          this.handleDrawSketch(event);
          break;
        }
        case DrawType.Eraser: {
          this.handleDrawEraser(event);
          break;
        }
        default: {
          this.handleDrawShape(event, this.drawType);
          break;
        }
      }
    }
    event.preventDefault();
  }

  private stop(event: MouseEvent | TouchEvent): void {
    if (this.isDrawing) {
      switch(this.drawType) {
        case DrawType.Sketch: {
          this.handleStopSketch();
          break;
        }
        case DrawType.Eraser: {
          this.handleStopEraser();
          break;
        }
        default: {
          this.handleStopShape(event, this.drawType);
          break;
        }
      }
      this.isDrawing = false;
    }
    event.preventDefault();
  }

  private getX(event: MouseEvent | TouchEvent): number {
    return (event instanceof MouseEvent)
      ? (event as MouseEvent).clientX - this.offSetLeft - this.canvas.offsetLeft
      : ((event as TouchEvent).targetTouches.length > 0)
      ? (event as TouchEvent).targetTouches[0].pageX - this.offSetLeft - this.canvas.offsetLeft
      : (event as TouchEvent).changedTouches[0].pageX - this.offSetLeft - this.canvas.offsetLeft;
  }

  private getY(event: MouseEvent | TouchEvent): number {
    return (event instanceof MouseEvent)
    ? (event as MouseEvent).clientY - this.offSetTop - this.canvas.offsetTop
    : ((event as TouchEvent).targetTouches.length > 0)
    ? (event as TouchEvent).targetTouches[0].pageY - this.offSetTop - this.canvas.offsetTop
    : (event as TouchEvent).changedTouches[0].pageY - this.offSetTop - this.canvas.offsetTop;
  }

  private setBackground(): void {
    this.backgroundContext.fillStyle = this.canvasBackground;
    this.backgroundContext.fillRect(0, 0, this.finalCanvas.width, this.finalCanvas.height);
  }

  private handleDrawSketch(event: MouseEvent | TouchEvent): void {
    this.line.end = new Point(this.getX(event), this.getY(event));
    this.line.drawLine(
      this.context,
      this.strokeColor,
      this.strokeWidth,
      "round",
      "round"
    );
    const coor = new Line();
    coor.start = this.line.start;
    coor.end = this.line.end;
    this.lines.push(coor);
    this.line.start = this.line.end;
  }

  private handleStopSketch(): void {
    this.clearOverlay();
    this.lines.forEach(line => {
      line.drawLine(
        this.finalContext,
        this.strokeColor,
        this.strokeWidth,
        "round",
        "round"
      );
    });
    this.finishedDrawing.emit({
      structure: this.lines,
      color: this.strokeColor,
      width: this.strokeWidth,
      type: DrawType.Sketch
    });
    this.lines = [];
  }

  private handleDrawEraser(event: MouseEvent | TouchEvent): void {
    this.line.end = new Point(this.getX(event), this.getY(event));
    this.line.drawLine(
      this.context,
      this.canvasBackground,
      this.strokeWidth,
      "round",
      "round"
    );
    const coor = new Line();
    coor.start = this.line.start;
    coor.end = this.line.end;
    this.lines.push(coor);
    this.line.start = this.line.end;
  }

  private handleStopEraser(): void {
    this.clearOverlay();
    this.finalContext.globalCompositeOperation = 'destination-out'
    this.lines.forEach(line => {
      line.drawLine(
        this.finalContext,
        this.canvasBackground,
        this.strokeWidth,
        "round",
        "round"
      );
    });
    this.finalContext.globalCompositeOperation = 'source-over'
    this.finishedDrawing.emit({
      structure: this.lines,
      width: this.strokeWidth,
      type: DrawType.Eraser
    });
    this.lines = [];
  }

  private handleDrawShape(event: MouseEvent | TouchEvent, type: DrawType): void {
    this.clearOverlay();
    this.line.end = new Point(this.getX(event), this.getY(event));
    switch(type) {
      case DrawType.Line: {
        this.line.drawLine(
          this.context,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round"
        );
        break;
      }
      case DrawType.Rectangle: {
        this.line.drawRectangle(
          this.context,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round",
          this.isFilled
        );
        break;
      }
      case DrawType.Circle: {
        this.line.drawCircle(
          this.context,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round",
          this.isFilled
        );
        break;
      }
      case DrawType.Triangle: {
        this.line.drawBalancedTriangle(
          this.context,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round",
          this.isFilled
        );
        break;
      }
      case DrawType.Diamond: {
        this.line.drawDiamond(
          this.context,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round",
          this.isFilled
        );
        break;
      }
      case DrawType.Image: {
        this.line.drawImage(
          this.context,
          this.image as HTMLImageElement
        );
        break;
      }
    }
  }

  private handleStopShape(event: MouseEvent | TouchEvent, type: DrawType): void {
    this.clearOverlay();
    if (
      this.getX(event) === this.line.start.x
      && this.getY(event) === this.line.start.y
    ) {
      return;
    }
    switch(type) {
      case DrawType.Line: {
        this.line.drawLine(
          this.finalContext,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round"
        );
        break;
      }
      case DrawType.Rectangle: {
        this.line.drawRectangle(
          this.finalContext,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round",
          this.isFilled
        );
        break;
      }
      case DrawType.Circle: {
        this.line.drawCircle(
          this.finalContext,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round",
          this.isFilled
        );
        break;
      }
      case DrawType.Triangle: {
        this.line.drawBalancedTriangle(
          this.finalContext,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round",
          this.isFilled
        );
        break;
      }
      case DrawType.Diamond: {
        this.line.drawDiamond(
          this.finalContext,
          this.strokeColor,
          this.strokeWidth,
          "round",
          "round",
          this.isFilled
        );
        break;
      }
      case DrawType.Image: {
        this.line.drawImage(
          this.finalContext,
          this.image as HTMLImageElement
        );
        break;
      }
      default: return;
    }
    this.finishedDrawing.emit({
      structure: this.line,
      color: this.strokeColor,
      width: this.strokeWidth,
      type: type,
      filled: this.isFilled,
      imageUrl: this.image?.src
    });
  }

  private clearOverlay(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private clearFinal(): void {
    this.finalContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawLoadedShapes(): void {
    this.shapes.forEach(
      (shape) => {
        switch(shape.type) {
          case DrawType.Sketch: {
            (shape.structure as Line[]).forEach(
              (line) => {
                line.drawLine(
                  this.finalContext,
                  (shape.color) ? shape.color : 'black',
                  shape.width,
                  "round",
                  "round"
                );
              }
            );
            break;
          }
          case DrawType.Eraser: {
            (shape.structure as Line[]).forEach(
              (line) => {
                line.drawLine(
                  this.finalContext,
                  this.canvasBackground,
                  shape.width,
                  "round",
                  "round"
                );
              }
            );
            break;
          }
          case DrawType.Line: {
            (shape.structure as Line).drawLine(
              this.finalContext,
              (shape.color) ? shape.color : 'black',
              shape.width,
              "round",
              "round"
            );
            break;
          }
          case DrawType.Rectangle: {
            (shape.structure as Line).drawRectangle(
              this.finalContext,
              (shape.color) ? shape.color : 'black',
              shape.width,
              "round",
              "round",
              (shape.filled) ? true : false
            );
            break;
          }
          case DrawType.Circle: {
            (shape.structure as Line).drawCircle(
              this.finalContext,
              (shape.color) ? shape.color : 'black',
              shape.width,
              "round",
              "round",
              (shape.filled) ? true : false
            );
            break;
          }
          case DrawType.Triangle: {
            (shape.structure as Line).drawBalancedTriangle(
              this.finalContext,
              (shape.color) ? shape.color : 'black',
              shape.width,
              "round",
              "round",
              (shape.filled) ? true : false
            );
            break;
          }
          case DrawType.Diamond: {
            (shape.structure as Line).drawDiamond(
              this.finalContext,
              (shape.color) ? shape.color : 'black',
              shape.width,
              "round",
              "round",
              (shape.filled) ? true : false
            );
            break;
          }
          case DrawType.Text: {
            const font = this.strokeWidth + 'px serif';
            console.log(shape);
            (shape.structure as TextPoint).drawText(
              this.finalContext,
              (shape.font) ? shape.font : font,
              (shape.color) ? shape.color : 'black',
              (shape.filled) ? true : false
            );
            break;
          }
          case DrawType.Image: {
            const image = new Image;
            image.src = (shape.imageUrl) ? shape.imageUrl : '';
            (shape.structure as Line).drawImage(
              this.finalContext,
              image
            );
            break;
          }
        }
      }
    );
  }
}
