"use client"
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/PktvRdIG6LW
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button"
import { handleSignOut } from "@/lib/actions/amplifyAuth"
import { useRouter } from "next/navigation"

export default function SignOut() {
const router = useRouter();

const userSignOut = async()=>{
await handleSignOut()
router.push("/sign-in")

}

  return (
    <Button onClick={userSignOut} className="rounded-md border border-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 hover:text-primary-foreground">
      Sign Out
    </Button>
  )
}