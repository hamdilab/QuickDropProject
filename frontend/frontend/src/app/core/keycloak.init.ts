import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(
  keycloak: KeycloakService,
): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8081',
        realm: 'JobBoardKeycloack',
        clientId: 'frontend-client',
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: undefined, // 🔥 DÉSACTIVE LE CHECK IFRAME QUI PLANTE
        flow: 'standard',
        pkceMethod: 'S256',
      },
      enableBearerInterceptor: true,
      bearerExcludedUrls: ['/assets', '/public'],
    });
}
