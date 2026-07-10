import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakBearerInterceptor, KeycloakService } from 'keycloak-angular';
import { routes } from './app.routes';
import { initializeKeycloak } from './core/keycloak.init';
import { importProvidersFrom } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(KeycloakAngularModule),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true,
    },
  ],
};
