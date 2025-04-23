// app/(dashboard)/chores/page.jsx
import ChoresPage from "@/components/chores/ChoresPage";
import {
  getChoresByUserId,
  findRoleByUserId,
  updateActiveChoresStatus,
} from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();

  const chores = (await getChoresByUserId(userId)) || [];
  const userRole = await findRoleByUserId(userId);
  const activeChores = chores.filter(chore => chore.status === 'Active');
  // console.log("atciveChores: ", activeChores);

  await updateActiveChoresStatus(activeChores, userId);

  return (
    <>
      <ChoresPage chores={chores} role={userRole} />
    </>
  );
}
