import { approveOrganization } from './src/app/superadmin/organizations/actions';

async function run() {
  console.log("Triggering approveOrganization...");
  const result = await approveOrganization("bab8029e-374a-4003-b68a-d23388e55482");
  console.log("Result:", result);
}

run().catch(console.error);
