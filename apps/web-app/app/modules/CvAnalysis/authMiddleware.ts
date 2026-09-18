import { redirect } from "react-router";
import { authClient } from "../Auth/auth.client";

/** Shared client middleware: redirects anonymous visitors to the login page. */
export const requireSession = async (): Promise<void> => {
  const session = await authClient.getSession();

  if (!session.data) {
    throw redirect("/auth");
  }
};
