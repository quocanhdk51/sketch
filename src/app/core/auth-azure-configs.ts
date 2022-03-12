import { environment } from './../../environments/environment';

export const AZURE_AUTH_CONFIG = {
  Authority: environment.config.azureUrl + environment.config.tenantId,
  ClientId: environment.config.clientId,
  ProtectedResourceMap: 'https://graph.microsoft.com/v1.0/me',
  PostLogoutRedirectUri: origin + '/sketch/',
  RedirectUri: window.location.origin  + '/sketch/',
  UserScope: 'user.read',
  AppIDUrl: environment.config.appIdUrl
};
