import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */


export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      // ...
      callbackUrls: [
        "http://localhost:3000/",
        "https://mywebsite.com/",
      ],
      logoutUrls: [
        "http://localhost:3000/sign-in",
        "https://mywebsite.com/logout",
      ],
    },
  },
});
