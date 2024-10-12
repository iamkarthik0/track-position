import SignUp from "@/components/forms/SignUp";
import React from "react";

import { redirect } from "next/navigation";
import { AuthGetCurrentUserServer } from "@/lib/amplify-utils";




const page = async () => {
  const currentUser = await AuthGetCurrentUserServer();
  if (currentUser) return redirect("/");

  return (
    <div>
      <SignUp />
    </div>
  );
};

export default page;
