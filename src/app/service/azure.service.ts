import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AzureProfile } from '../model/azure-profile.model';
import { AZURE_AUTH_CONFIG } from '../core/auth-azure-configs';

@Injectable({
  providedIn: 'root'
})
export class AzureService {

  constructor(
    private http: HttpClient
  ) { }

  public getProfileInfo(): Observable<AzureProfile> {
    return this.http.get<AzureProfile>(AZURE_AUTH_CONFIG.ProtectedResourceMap);
  }

  public getPhoto(): Observable<any> {
    return this.http.get<any>(AZURE_AUTH_CONFIG.ProtectedResourceMap + '/photo/$value');
  }
}
