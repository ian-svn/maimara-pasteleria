import { findUserByEmail, verifyPassword } from "../src/lib/users";

async function main() {
  const u = await findUserByEmail("admin@gmail.com");
  console.log("user:", u?._id, u?.role, "hasHash:", Boolean(u?.passwordHash));
  const ok = u ? await verifyPassword("admin", u.passwordHash) : false;
  console.log("password 'admin' matches:", ok);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
