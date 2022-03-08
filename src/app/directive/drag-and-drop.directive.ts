import { Directive, HostBinding, HostListener, Input, Output, EventEmitter, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { FileType } from '../model/drag-and-drop.model';

@Directive({
  selector: '[appDragAndDrop]'
})
export class DragAndDropDirective {
  @Output() public handleUploadedFiles: EventEmitter<File[]> = new EventEmitter();
  @Input() public fileType: FileType = FileType.Any;
  @Input() public isHoverEffectOn: boolean = true;

  constructor() {}

  @HostBinding('class.fileover')
  public fileOver: boolean = false;

  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.handleFileOverEffect();
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.unhandleFileOverEffect();
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.unhandleFileOverEffect();
    const files = event.dataTransfer?.files;
    const result: File[] = [];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (!files[i].type.match(this.getType())) {
          continue;
        }
        result.push(files[i]);
      }
      this.handleUploadedFiles.emit(result);
    }
  }

  private getType(): RegExp {
    switch(this.fileType) {
      case FileType.Image: return /image.*/;
      default: return /.*/;
    }
  }

  private handleFileOverEffect(): void {
    this.fileOver = true;
  }

  private unhandleFileOverEffect(): void {
    this.fileOver = false;
  }
}
