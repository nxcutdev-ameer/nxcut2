export interface LoginResponseSuccessBO {
  success: true;
  user: UserBO;
  session: SessionBO;
}
export type LoginResponseBO = LoginResponseSuccessBO | LoginResponseFailedBO;
export interface LoginResponseFailedBO {
  success: false;
  error: string;
}
export interface UserBO {
  id: string;
  aud: string;
  role?: string | undefined;
  email?: string | undefined;
  email_confirmed_at: string | null;
  phone: string;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: AppMetadataBO;
  user_metadata: UserMetadataBO;
  identities: IdentityBO[];
  created_at: string;
  updated_at: string | undefined;
  is_anonymous: boolean | undefined;
}

export interface AppMetadataBO {
  provider: string;
  providers: string[];
}

export interface UserMetadataBO {
  email_verified: boolean;
  is_admin: boolean;
  location_id?: string;
  locations: string[];
}

export interface IdentityBO {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: IdentityDataBO;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface IdentityDataBO {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

export interface SessionBO {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number | undefined;
  refresh_token: string;
  user: UserBO;
  weak_password?: string | null;
}
export interface SupabaseSessionBO {
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user: UserBO;
  weak_password: any | null;
}

export interface LocationBO {
  id: string;
  name: string;
  photosUrl: string[];
  created_at: string;
  updated_at: string;
}
