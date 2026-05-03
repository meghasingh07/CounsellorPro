import { signOutAction } from "@/app/(site)/dashboard/sign-out-action";
import { btnGhost } from "@/lib/ui/style";

export function SignOutForm() {
  return (
    <form action={signOutAction}>
      <button type="submit" className={btnGhost}>
        Sign out
      </button>
    </form>
  );
}
