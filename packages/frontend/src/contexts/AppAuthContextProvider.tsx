import React from "react";
import { useAuth } from "react-oidc-context";
import { AppAuthContext, AppAuthContextValue } from "./AppAuthContext";
import { MeDto } from "@ct-service-survey/shared";

export const AppAuthContextProvider: React.FunctionComponent<React.PropsWithChildren> = (
  props: React.PropsWithChildren,
) => {
  const { children } = props;
  const oidc = useAuth();
  const [me, setMe] = React.useState<MeDto | null>(null);
  const [meLoading, setMeLoading] = React.useState(false);

  const token = oidc.user?.access_token ?? null;

  React.useEffect(() => {
    if (!oidc.isAuthenticated || !token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMe(null);
      return;
    }
    setMeLoading(true);
    //fetchMe(token)
    //  .then(setMe)
    //  .catch(() => setMe(null))
    //  .finally(() => setMeLoading(false));
  }, [oidc.isAuthenticated, token]);

  const value: AppAuthContextValue = {
    isAuthenticated: oidc.isAuthenticated,
    isLoading: oidc.isLoading || meLoading,
    isAdmin: me?.isAdmin ?? false,
    groups: me?.groups ?? [],
    displayName: me?.displayName ?? oidc.user?.profile.name ?? '',
    userId: me?.userId ?? '',
    token,
    login: () => oidc.signinRedirect(),
    logout: () => oidc.signoutRedirect(),
  };

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
};