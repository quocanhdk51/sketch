import { AzureProfile } from './../../model/azure-profile.model';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignoutConfirmationComponent } from '../signout-confirmation/signout-confirmation.component';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  @Input() public profile!: AzureProfile;
  @Input() public photo!: string;

  constructor(
    private msalService: MsalService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  get noUserProfileAndPhoto(): boolean {
    return this.photo == null && this.profile == null;
  }

  get isOnlyProfileLoaded(): boolean {
    return this.photo == null && this.profile != null;
  }

  get isPhotoLoaded(): boolean {
    return this.photo != null;
  }

  public getAvatarReplacementFromProfile(): string {
    return this.profile.givenName[0].toUpperCase() + this.profile.surname[0].toUpperCase();
  }

  public onSignout(): void {
    const dialogRef = this.dialog.open(SignoutConfirmationComponent);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.msalService.logout();
        }
      }
    );
  }
}
