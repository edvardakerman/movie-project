import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { createUser, getUserByEmail } from "./lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false
      }

      try {
        // Check if user exists, if not create them
        const existingUser = await getUserByEmail(user.email)
        
        if (!existingUser) {
          await createUser({
            email: user.email,
            name: user.name || "",
            image: user.image || "",
            githubId: account?.providerAccountId || "",
          })
        }
        
        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    },
    async session({ session, token }) {
      // Add user id to session if needed
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})
