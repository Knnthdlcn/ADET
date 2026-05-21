import { Redirect } from "expo-router";

import { useAuthStore } from "@features/auth";

export default function IndexRoute() {
  const isSignedIn = useAuthStore((state) => state.isSignedIn);

  return <Redirect href={isSignedIn ? "/home" : "/sign-in"} />;
}
