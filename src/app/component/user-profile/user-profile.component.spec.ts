import { AzureProfile } from './../../model/azure-profile.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MsalService } from '@azure/msal-angular';
import { MaterialModule } from 'src/app/shared/material.module';

import { UserProfileComponent } from './user-profile.component';
import { getElementByCss } from 'src/app/function-common/testing.common';
import { DebugElement } from '@angular/core';
import { of } from 'rxjs';
import { SignoutConfirmationComponent } from '../signout-confirmation/signout-confirmation.component';

const createSpyObj = jasmine.createSpyObj;

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let msalServiceMock: MsalService;
  let dialogMock: MatDialog;
  let profileContainer: DebugElement;
  let noUserProfileAndPhoto: DebugElement;
  let userProfile: DebugElement;
  let photo: DebugElement;
  const azureProfileMock: AzureProfile = {
    businessPhones: [],
    displayName: "Display Name Mock",
    givenName: "Given Name Mock",
    surname: "Surname Mock",
    jobTitle: null,
    mail: null,
    mobilePhone: null,
    officeLocation: null,
    preferredLanguage: null,
    userPrincipalName: "User Principal Name Mock",
    id: "ID Mock"
  };
  const photoMock = "Photo Mock";
  const dialogRefObj = {
    afterClosed: () => of(true)
  }

  const loadElement = () => {
    profileContainer = getElementByCss(fixture, '.profile-container');
    noUserProfileAndPhoto = getElementByCss(fixture, '[data-testid="no-user-profile-and-photo"]');
    userProfile = getElementByCss(fixture, '[data-testid="user-profile"]');
    photo = getElementByCss(fixture, '[data-testid="photo"]');
  }

  beforeEach(async () => {
    msalServiceMock = createSpyObj(
      'MsalService',
      [
        'logout'
      ]
    );
    dialogMock = createSpyObj(
      'MatDialog',
      [
        'open'
      ]
    );

    await TestBed.configureTestingModule({
      declarations: [
        UserProfileComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: MsalService,
          useValue: msalServiceMock
        },
        {
          provide: MatDialog,
          useValue: dialogMock
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    (dialogMock.open as jasmine.Spy).and.returnValue(dialogRefObj);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load no user profile and photo', () => {
    loadElement();
    expect(profileContainer).toBeFalsy();
    expect(noUserProfileAndPhoto).toBeTruthy();
    expect(userProfile).toBeFalsy();
    expect(photo).toBeFalsy();
  });

  it('should load user profile without photo', () => {
    component.profile = azureProfileMock;
    fixture.detectChanges();
    loadElement();
    expect(profileContainer).toBeTruthy();
    expect(noUserProfileAndPhoto).toBeFalsy();
    expect(userProfile).toBeTruthy();
    expect(photo).toBeFalsy();
  });

  it('should load photo without user profile', () => {
    component.photo = photoMock;
    fixture.detectChanges();
    loadElement();
    expect(profileContainer).toBeFalsy();
    expect(noUserProfileAndPhoto).toBeFalsy();
    expect(userProfile).toBeFalsy();
    expect(photo).toBeTruthy();
  });

  it('should load photo user profile and photo', () => {
    component.photo = photoMock;
    component.profile = azureProfileMock;
    fixture.detectChanges();
    loadElement();
    expect(profileContainer).toBeTruthy();
    expect(noUserProfileAndPhoto).toBeFalsy();
    expect(userProfile).toBeFalsy();
    expect(photo).toBeTruthy();
  });

  it('should handle signout', () => {
    const signoutBtn = getElementByCss(fixture, '[data-testid="signoutBtn"]');
    signoutBtn.nativeElement.click();
    expect(dialogMock.open).toHaveBeenCalledWith(SignoutConfirmationComponent);
    expect(msalServiceMock.logout).toHaveBeenCalled();
  });
});
