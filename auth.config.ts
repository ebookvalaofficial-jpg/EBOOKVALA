import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as { id?: string; emailVerified?: Date | null; role?: string; isBanned?: boolean };
        token.id = u.id;
        token.emailVerified = u.emailVerified;
        token.role = u.role || 'USER';
        token.isBanned = Boolean(u.isBanned);
      }
      if (trigger === 'update' && session?.user) {
        token.name = session.user.name;
        token.role = (session.user as { role?: string }).role || token.role;
        token.isBanned = (session.user as { isBanned?: boolean }).isBanned ?? token.isBanned;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'USER';
        session.user.isBanned = Boolean(token.isBanned);
        (session.user as { emailVerified?: Date | null }).emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
  providers: [],
};
