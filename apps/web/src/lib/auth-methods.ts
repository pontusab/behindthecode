/** Which sign-in methods are enabled, derived from the environment. */
export const authMethods = {
  emailPassword: true,
  google: Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  ),
  github: Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
  ),
  magicLink: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
};

export type AuthMethods = typeof authMethods;
