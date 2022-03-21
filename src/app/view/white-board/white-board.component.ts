import { LoadingService } from './../../service/loading.service';
import { CrudService } from './../../service/crud.service';
import { Sketch } from './../../model/canvas.model';
import { stroke_color, stroke_width, background, default_board_width, default_board_height } from '../../constant/white-board.constant';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators'
import { DrawType, Shape } from '../../model/canvas.model';
import { CanvasDirective } from '../../directive/canvas.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

const padding: number = 6;

@Component({
  selector: 'app-white-board',
  templateUrl: './white-board.component.html',
  styleUrls: ['./white-board.component.scss']
})
export class WhiteBoardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasElement') public canvasRef!: ElementRef;
  @ViewChild(CanvasDirective) public appCanvas!: CanvasDirective;
  public padding: number = padding;
  public strokeColor: string = stroke_color;
  public strokeWidth: number = stroke_width;
  public canvasBackground: string = background;
  public boardWidth = default_board_width;
  public boardHeight = default_board_height;
  public paletteOn: boolean = true;
  public paletteForm: FormGroup;
  public drawType: DrawType = DrawType.Sketch;
  public isFilled: boolean = false;
  public shapes: Shape[] = [];
  public files: File[] = [];
  public isImageLoaded: boolean = false;
  public selectedImageIndex: number = -1;
  public sketch!: Sketch;

  private _destroying$: Subject<void> = new Subject();
  private sketchID: number = -1;
  private isSaved: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private crudService: CrudService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private toastSv: ToastrService,
    private loadingService: LoadingService
  ) {
    const routeId = this.route.snapshot.paramMap.get("id");
    if (routeId == null || !this.isNumber(routeId)) {
      this.router.navigate(['dashboard']);
    }
    else {
      this.sketchID = parseInt(routeId);
    }
    this.importSVGIcons();
    this.paletteForm = this.fb.group({
      boardWidth: [this.boardWidth, [Validators.min(0)]],
      boardHeight: [this.boardHeight, [Validators.min(0)]],
      color: [this.strokeColor],
      background: [this.canvasBackground],
      penSize: [this.strokeWidth]
    });
  }

  public ngOnInit(): void {
    this.paletteForm.valueChanges.pipe(
      takeUntil(this._destroying$),
    ).subscribe(
      (data) => {
        if (this.canvasBackground !== data.background) {
          this.canvasBackground = data.background;
          this.appCanvas.render(true, true);
        }
        if (
          this.boardWidth !== data.boardWidth
          || this.boardHeight !== data.boardHeight
        ) {
          this.boardWidth = (data.boardWidth < 0) ? 0 : data.boardWidth;
          this.boardHeight = (data.boardHeight < 0) ? 0 : data.boardHeight;
          this.appCanvas.render();
        }
        this.strokeColor = data.color;
        this.strokeWidth = data.penSize;
      }
    );
  }

  public ngAfterViewInit(): void {
    this.appCanvas.imageLoaded$.pipe(
      takeUntil(this._destroying$)
    ).subscribe(
      (data) => this.isImageLoaded = data
    );
    if (this.sketchID >= 0) {
      this.loadingService.loading$.next(true);
      this.crudService.getSketch(this.sketchID).subscribe(
        (sketch) => {
          this.loadingService.loading$.next(false);
          this.sketch = sketch;
          this.appCanvas.renderDone$.pipe(
            filter(state => state === true),
            take(1)
          ).subscribe(
            () => {
              this.paletteForm.patchValue({
                boardWidth: this.sketch.width,
                boardHeight: this.sketch.height,
                background: this.sketch.background
              });
              this.appCanvas.renderImageURL(this.sketch.imageURL as string);
            }
          );
        },
        (error: HttpErrorResponse) => {
          this.loadingService.loading$.next(false);
          this.toastSv.error(error.error.message);
        }
      );
    }
  }

  public ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.unsubscribe();
  }

  @HostListener('window:keydown', ['$event'])
  public onKeyDownEvent(event: KeyboardEvent): void {
    if (event.key === 'z' && event.ctrlKey) {
      event.preventDefault();
      this.undo();
    }
    else if (event.key === 's' && event.ctrlKey) {
      event.preventDefault();
      this.onSave();
    }
  }

  get isFilesUploaded(): boolean {
    return this.files.length > 0;
  }

  get saved(): boolean {
    return this.isSaved;
  }

  public onHome(): void {
    if (!this.isSaved) {
      this.onSave();
    }
    this.router.navigate(['/dashboard']);
  }

  public changeDrawType(type: DrawType, isFilled?: boolean): void {
    this.drawType = type;
    this.isFilled = (isFilled) ? isFilled : false;
  }

  public handleFilesUploaded(files: File[]): void {
    this.files.push(...files);
  }

  public handleFinishedDraw(shape: Shape): void {
    this.shapes.push(shape);
    this.isSaved = false;
  }

  public onSave(): void {
    const imageURL = this.appCanvas.getImageURL();
    this.loadingService.loading$.next(true);
    this.crudService.updateSketch({
      id: this.sketch.id,
      name: this.sketch.name,
      background: this.paletteForm.get('background')?.value as string,
      width: this.paletteForm.get('boardWidth')?.value as number,
      height: this.paletteForm.get('boardHeight')?.value as number,
      imageURL: imageURL
    }).subscribe(
      (sketch) => {
        this.loadingService.loading$.next(false);
        this.sketch = sketch;
        this.isSaved = true;
        this.toastSv.success(`Successfully saved sketch: ${this.sketch.name}`);
      },
      (error: HttpErrorResponse) => {
        this.loadingService.loading$.next(false);
        this.toastSv.error(error.error.message);
      }
    );
  }

  public undo(): void {
    this.shapes.pop();
    this.appCanvas.renderImageURL(this.sketch.imageURL as string, true);
  }

  public togglePalette(): void {
    this.paletteOn = !this.paletteOn;
  }

  public selectImage(index: number): void {
    this.selectedImageIndex = index;
    this.appCanvas.loadImage(this.files[index]);
  }

  public isImageHighlight(index: number): boolean {
    return this.selectedImageIndex === index;
  }

  public onChangeFileInput(event: any): void {
    const files = event.target.files as File[];
    this.handleFilesUploaded(files);
  }

  private importSVGIcons(): void {
    this.iconRegistry.addSvgIcon('triangle-shape', this.sanitizer.bypassSecurityTrustResourceUrl('assets/svg/iconmonstr-triangle-1.svg'));
    this.iconRegistry.addSvgIcon('triangle-shape-outline', this.sanitizer.bypassSecurityTrustResourceUrl('assets/svg/iconmonstr-triangle-2.svg'));
    this.iconRegistry.addSvgIcon('diamond-shape', this.sanitizer.bypassSecurityTrustResourceUrl('assets/svg/iconmonstr-shape-21.svg'));
    this.iconRegistry.addSvgIcon('diamond-shape-outline', this.sanitizer.bypassSecurityTrustResourceUrl('assets/svg/iconmonstr-shape-22.svg'));
  }

  private isNumber(value: string): boolean {
    return /^\d+$/.test(value);
  }
}
