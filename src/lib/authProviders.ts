export type OAuthProvider = 'google' | 'github';

export type OAuthProviderAvailability = Record<OAuthProvider, boolean>;

export const DEFAULT_OAUTH_PROVIDERS: OAuthProviderAvailability = {
  google: false,
  github: false,
};

