import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'sketch';
  public isIframe = false;

  constructor() { }

  public ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
  }
}
