import { AZURE_AUTH_CONFIG } from './../core/auth-azure-configs';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { AzureService } from './azure.service';
import { AzureProfile } from '../model/azure-profile.model';
import { HttpErrorResponse } from '@angular/common/http';

describe('AzureService', () => {
  let service: AzureService;
  let httpTestingController: HttpTestingController;
  const resourceUrl = AZURE_AUTH_CONFIG.ProtectedResourceMap;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AzureService
      ]
    });
    service = TestBed.inject(AzureService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getProfileInfo', () => {
    const response: AzureProfile = {
      businessPhones: [],
      displayName: 'Display name mock',
      givenName: 'Given name mock',
      surname: 'Surname mock',
      jobTitle: null,
      mail: null,
      mobilePhone: null,
      officeLocation: null,
      preferredLanguage: null,
      userPrincipalName: 'User principal name mock',
      id: 'Id mock'
    };
    let result: AzureProfile | undefined;
    service.getProfileInfo().subscribe(
      (val) => result = val
    );
    const req = httpTestingController.expectOne(resourceUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should getProfileInfo error', () => {
    const status = 500;
    const statusText = 'Internal Server Error';
    const errorEvent = new ErrorEvent('API error');

    let actualError: HttpErrorResponse | undefined;
    service.getProfileInfo().subscribe(
      () => {
        fail('next handler must not be called');
      },
      (err) => {
        actualError = err;
      },
      () => {
        fail('complete handler must not be called');
      }
    );

    httpTestingController.expectOne(resourceUrl).error(errorEvent, { status, statusText });
    if (!actualError) {
      throw new Error('Error needs to be defined');
    }
    expect(actualError.error).toBe(errorEvent);
    expect(actualError.status).toBe(status);
    expect(actualError.statusText).toBe(statusText);
  });

  it('should getPhoto', () => {
    const response: string = 'Mock response';
    let result: string | undefined;
    service.getPhoto().subscribe(
      (val) => result = val
    );
    const req = httpTestingController.expectOne(resourceUrl + '/photo/$value');
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should getPhoto error', () => {
    const status = 500;
    const statusText = 'Internal Server Error';
    const errorEvent = new ErrorEvent('API error');

    let actualError: HttpErrorResponse | undefined;
    service.getPhoto().subscribe(
      () => {
        fail('next handler must not be called');
      },
      (err) => {
        actualError = err;
      },
      () => {
        fail('complete handler must not be called');
      }
    );

    httpTestingController.expectOne(resourceUrl + '/photo/$value').error(errorEvent, { status, statusText });
    if (!actualError) {
      throw new Error('Error needs to be defined');
    }
    expect(actualError.error).toBe(errorEvent);
    expect(actualError.status).toBe(status);
    expect(actualError.statusText).toBe(statusText);
  });
});
