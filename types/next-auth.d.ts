import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    emailVerified?: Date | null;
    role?: string;
    isBanned?: boolean;
  }

  interface Session {
    user: {
      id: string;
      emailVerified?: Date | null;
      role?: string;
      isBanned?: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    emailVerified?: Date | null;
    role?: string;
    isBanned?: boolean;
  }
}
