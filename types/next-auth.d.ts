import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    userType: string;
    status?: string | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      userType: string;
      status?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: string;
    status?: string | null;
  }
}
