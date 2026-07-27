import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations/auth';
import { authConfig } from '../auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id-placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-placeholder',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          throw new Error('Invalid email or password format.');
        }

        const { email, password } = validated.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            image: true,
            role: true,
            isBanned: true,
            emailVerified: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        if (user.isBanned) {
          throw new Error('Your account has been suspended by an administrator.');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role || 'USER',
          isBanned: user.isBanned,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || 'USER';
        token.isBanned = Boolean((user as { isBanned?: boolean }).isBanned);
      } else if (trigger === 'update' && token.id) {
        // Only query database when explicit session update is triggered
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isBanned: true, name: true, image: true },
        });
        if (dbUser) {
          token.role = dbUser.role || 'USER';
          token.isBanned = dbUser.isBanned;
        }
      }
      return authConfig.callbacks!.jwt!({ token, user, trigger, session });
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'fallback-secret-for-dev-ebookvala',
});
