import SignUp from "@/components/forms/SignUp";
import React, { Suspense } from "react";

const page = async () => {
  return (
    <Suspense fallback={<div>...loading</div>}>
      <SignUp />
    </Suspense>
  );
};

export default page;
