// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  config: {
    appURL: '/sketch-api/',
    azureUrl: 'https://login.microsoftonline.com/',
    clientId: '12b65564-3f8d-45aa-8989-d0ba296d0186',
    tenantId: 'e850b2f8-7df2-4859-a864-565be726e8a4',
    appIdUrl: 'api://12b65564-3f8d-45aa-8989-d0ba296d0186/Files.read'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
