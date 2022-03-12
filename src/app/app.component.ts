import { takeUntil } from 'rxjs/operators';
import { LoadingService } from './service/loading.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public title = 'sketch';
  public isIframe: boolean = false;
  public isLoading: boolean = false;

  private _destroying$: Subject<void> = new Subject<void>();

  constructor(
    private loadingService: LoadingService
  ) { }

  public ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
    this.loadingService.loading$.pipe(
      takeUntil(this._destroying$)
    ).subscribe(
      (value) => this.isLoading = value
    );
  }

  public ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.unsubscribe();
  }
}
