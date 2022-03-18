import { Directive, Input, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { getFileDataURL } from '../function-common/function.common';

@Directive({
  selector: '[appImgFileReader]'
})
export class ImgFileReaderDirective implements OnInit, AfterViewInit {
  @Input() appImgFileReader: File | null = null;
  @Input() placeHolder = "";

  private image!: HTMLImageElement;
  private imageURL: string | null = null;

  constructor(
    private el: ElementRef,
  ) {
    this.image = this.el.nativeElement;
  }

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.loadFileIntoImage();
  }

  private load(): void {
    this.image.src = (this.imageURL) ? this.imageURL : this.placeHolder;
  }

  private loadFileIntoImage(): void {
    if (this.appImgFileReader) {
      getFileDataURL(this.appImgFileReader).subscribe(
        (url) => {
          this.imageURL = url;
          this.load();
        }
      );
    }
  }
}
