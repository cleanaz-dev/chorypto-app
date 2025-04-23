import OrganizationPage from "@/components/organization/OrganizationPage";
import { getOrganizationDataByUserId } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();
  const organizationData = await getOrganizationDataByUserId(userId);
  console.log("organizationData:", organizationData);

  return <OrganizationPage data={organizationData} />;
}
