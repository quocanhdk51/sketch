import { environment } from './../../environments/environment';

export const AZURE_AUTH_CONFIG = {
  Authority: environment.config.azureUrl + environment.config.tenantId,
  ClientId: environment.config.clientId,
  ProtectedResourceMap: 'https://graph.microsoft.com/v1.0/me',
  PostLogoutRedirectUri: origin,
  RedirectUri: window.location.origin,
  UserScope: 'user.read'
};
