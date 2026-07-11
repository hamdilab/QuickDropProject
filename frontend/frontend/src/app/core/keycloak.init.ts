import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(
  keycloak: KeycloakService,
): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8081',
        realm: 'quickdrop', // ✅ NOUVEAU REALM
        clientId: 'quickdrop-app', // ✅ NOUVEAU CLIENT
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: undefined, // 🔥 DÉSACTIVE LE CHECK IFRAME QUI PLANTE
        flow: 'standard',
        pkceMethod: 'S256',
        checkLoginIframe: false, // ✅ AJOUTÉ POUR ÉVITER L'ERREUR
      },
      enableBearerInterceptor: true,
      bearerExcludedUrls: ['/assets', '/public'],
    });
}
