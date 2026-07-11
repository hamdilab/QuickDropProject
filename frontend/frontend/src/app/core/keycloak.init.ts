import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'JobBoardKeycloack',
        clientId: 'frontend-client',
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
      },
      enableBearerInterceptor: true,
      bearerExcludedUrls: ['/assets'],
    });
}

