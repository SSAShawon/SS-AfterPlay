import { AdminHeader } from "@/components/admin/admin-header";
import { GameForm } from "@/components/admin/game-form";

export default function NewGamePage() {
  return (
    <>
      <AdminHeader
        kicker="Content / Games"
        title="New archive entry"
        description="Create the game first, then add chapters, characters, moments and craft reviews from its edit screen."
      />
      <GameForm />
    </>
  );
}
