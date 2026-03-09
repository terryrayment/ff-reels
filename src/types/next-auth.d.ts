import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      directorId?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
