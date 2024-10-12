// src/services/authService.ts
import { signIn, signOut, signUp, confirmSignUp } from "aws-amplify/auth";

export interface SignUpParams {
  username: string;
  password: string;
  email: string;
}

export const handleSignIn = async (username: string, password: string) => {
  try {
    const { nextStep } = await signIn({ username, password });

    return { nextStep };
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const handleSignUp = async ({
  username,
  password,
  email,
}: SignUpParams) => {
  console.log(username, password, email);
  try {
    const { isSignUpComplete, nextStep } = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });
    console.log(isSignUpComplete, nextStep);
    return { isSignUpComplete, nextStep };
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const handleConfirmSignUp = async (
  username: string,
  confirmationCode: string
) => {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username,
      confirmationCode,
    });
    return isSignUpComplete;
  } catch (error) {
    console.error("Error confirming sign up:", error);
    throw error;
  }
};

export const handleSignOut = async () => {
  try {
    await signOut({ global: true });
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
