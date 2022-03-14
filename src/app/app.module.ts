import { environment } from './../environments/environment';
import { ImgFileReaderDirective } from './directive/img-file-reader.directive';
import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WhiteBoardComponent } from './view/white-board/white-board.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasDirective } from './directive/canvas.directive';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragAndDropDirective } from './directive/drag-and-drop.directive';
import { DashboardComponent } from './view/dashboard/dashboard.component';
import { SketchCreateEditDialogComponent } from './component/sketch-create-edit-dialog/sketch-create-edit-dialog.component';
import { DeleteConfirmationComponent } from './component/delete-confirmation/delete-confirmation.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MsalGuard, MsalInterceptor, MsalModule, MsalRedirectComponent } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { AZURE_AUTH_CONFIG } from './core/auth-azure-configs';
import { UserProfileComponent } from './component/user-profile/user-profile.component';
import { CardComponent } from './component/card/card.component';
import { SignoutConfirmationComponent } from './component/signout-confirmation/signout-confirmation.component';
import { LoadingComponent } from './component/loading/loading.component';
import { MaterialModule } from './shared/material.module';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

@NgModule({
  declarations: [
    AppComponent,
    WhiteBoardComponent,
    CanvasDirective,
    DragAndDropDirective,
    ImgFileReaderDirective,
    DashboardComponent,
    SketchCreateEditDialogComponent,
    DeleteConfirmationComponent,
    UserProfileComponent,
    CardComponent,
    SignoutConfirmationComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    MsalModule.forRoot(
      new PublicClientApplication({
        auth: {
          clientId: AZURE_AUTH_CONFIG.ClientId,
          authority: AZURE_AUTH_CONFIG.Authority,
          redirectUri: AZURE_AUTH_CONFIG.RedirectUri,
          postLogoutRedirectUri: AZURE_AUTH_CONFIG.PostLogoutRedirectUri
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: isIE
        }
      }),
      {
        interactionType: InteractionType.Redirect,
        authRequest: {
          scopes: [AZURE_AUTH_CONFIG.UserScope]
        }
      },
      {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          [AZURE_AUTH_CONFIG.ProtectedResourceMap, [AZURE_AUTH_CONFIG.UserScope]],
          [environment.config.appURL, [AZURE_AUTH_CONFIG.AppIDUrl]]
        ])
      }
    )
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalGuard
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule {
  /**
   * Allows for retrieving singletons using `AppModule.injector.get(Service)`
   * This is good to prevent injecting the service as constructor parameter.
   */
  static injector: Injector;
  constructor(injector: Injector, toastSv: ToastrService) {
    AppModule.injector = injector;
    toastSv.toastrConfig.positionClass = "toast-top-right";
    toastSv.toastrConfig.closeButton = true;
    toastSv.toastrConfig.preventDuplicates = true;
  }
}
