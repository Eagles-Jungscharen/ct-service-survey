import { MeDto } from "@ct-service-survey/shared";
import React from "react";
import { useAuth } from "react-oidc-context";

import { AppAuthContext, AppAuthContextValue } from "./AppAuthContext";
import { meApi } from "../services/api";

export const AppAuthContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props: React.PropsWithChildren) => {
  const { children } = props;
  const oidc = useAuth();
  const [me, setMe] = React.useState<MeDto | null>(null);
  const [meLoading, setMeLoading] = React.useState(false);
  const [prvIsAuthenticated, setPrvIsAuthenticated] = React.useState(false);

  const token = React.useMemo(() => oidc.user?.access_token ?? null, [oidc.user?.access_token]);

  if (prvIsAuthenticated !== oidc.isAuthenticated) {
    setPrvIsAuthenticated(oidc.isAuthenticated);
    if (!oidc.isAuthenticated || !token) {
      setMe(null);
      return;
    }
    setMeLoading(true);
    console.log("Fetching user info with token:", token);
    void meApi.getMe(token)
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setMeLoading(false));
  }

  const value: AppAuthContextValue = {
    isAuthenticated: oidc.isAuthenticated,
    isLoading: oidc.isLoading || meLoading,
    isAdmin: me?.isAdmin ?? false,
    groups: me?.groups ?? [],
    displayName: me?.displayName ?? oidc.user?.profile.name ?? '',
    userId: me?.userId ?? '',
    token,
    login: () => void oidc.signinRedirect(),
    logout: () => void oidc.signoutRedirect(),
  };

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
};