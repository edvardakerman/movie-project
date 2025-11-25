import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPopularMovies } from "@/lib/tmdb"
import { getWatchlist } from "@/lib/db"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
  const session = await auth()

  // If not logged in, redirect to sign in page
  if (!session) {
    redirect("/auth/signin")
  }

  // Fetch popular movies and watchlist server-side
  const [popularMovies, watchlist] = await Promise.all([
    getPopularMovies(),
    getWatchlist(session.user?.email || ""),
  ])

  return (
    <DashboardClient
      session={session}
      popularMovies={popularMovies}
      watchlist={watchlist}
    />
  )
}
