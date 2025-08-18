import NextAuthModule from "next-auth";
import CredentialsProviderModule from "next-auth/providers/credentials";
import GoogleProviderModule from "next-auth/providers/google";
import prisma from '@/lib/prisma';
import bcrypt from "bcrypt";

const NextAuth = NextAuthModule.default || NextAuthModule;
const CredentialsProvider = CredentialsProviderModule.default || CredentialsProviderModule;
const GoogleProvider = GoogleProviderModule.default || GoogleProviderModule;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Attempting login for email:", credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log("User found:", user ? "Yes" : "No");
          if (user) {
            console.log("User ID:", user.id, "User name:", user.name);
          }

          if (user && (await bcrypt.compare(credentials.password, user.password))) {
            // Email verification is optional for login - don't block users
            // if (user.password && !user.emailVerified) {
            //   console.log("Login blocked - email not verified for user:", user.email);
            //   return null;
            // }
            try {
              await prisma.activityLog.create({
                data: {
                  userId: user.id,
                  type: 'login',
                  detail: 'Manual login successful',
                  status: 'completed',
                },
              });
            } catch (e) { /* ignore logging errors */ }
            console.log("Credentials login successful for user:", user.email);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          }
          
          console.log("Password comparison result:", user ? "Password incorrect" : "User not found");
          
          try {
            const failedUser = user ? user.id : null;
            await prisma.activityLog.create({
              data: {
                userId: failedUser,
                type: 'login',
                detail: 'Manual login failed for email: ' + credentials.email,
                status: 'error',
              },
            });
          } catch (e) { /* ignore logging errors */ }
          console.log("Credentials login failed for email:", credentials.email);
          return null;
        } catch (error) {
          try {
            await prisma.activityLog.create({
              data: {
                userId: null,
                type: 'login',
                detail: 'Manual login error for email: ' + credentials.email + ' - ' + error.message,
                status: 'error',
              },
            });
          } catch (e) { /* ignore logging errors */ }
          console.error("Credentials authorize error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered:", { user: user?.email, account: account?.provider });
      
      if (account.provider === "google") {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          console.log("Creating new user for Google login:", user.email);
          try {
            existingUser = await prisma.user.create({
              data: {
                name: user.name || "",
                email: user.email,
                password: "",
                emailVerified: true, // Google accounts are already verified
              },
            });
          } catch (err) {
            try {
              await prisma.activityLog.create({
                data: {
                  userId: null,
                  type: 'login',
                  detail: 'Google login user creation failed for email: ' + user.email + ' - ' + err.message,
                  status: 'error',
                },
              });
            } catch (e) { /* ignore logging errors */ }
            return false;
          }
        }
        try {
          await prisma.activityLog.create({
            data: {
              userId: existingUser.id,
              type: 'login',
              detail: 'Google login successful',
              status: 'completed',
            },
          });
        } catch (err) {
          try {
            await prisma.activityLog.create({
              data: {
                userId: existingUser ? existingUser.id : null,
                type: 'login',
                detail: 'Failed to create activity log for Google login: ' + (err.message || err),
                status: 'error',
              },
            });
          } catch (e) { /* ignore logging errors */ }
          console.error('Failed to create activity log for Google login:', err);
        }
      }
      return true;
    },

    async session({ session, token }) {
      console.log("Session callback - token:", token?.email, "session:", session?.user?.email);
      if (!session.user) session.user = {};
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },

    async jwt({ token, user }) {
      console.log("JWT callback - user:", user?.email, "token:", token?.email);
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      token.id = token.id || null;
      token.email = token.email || null;
      return token;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth",
  },

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);