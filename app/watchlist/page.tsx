import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getWatchlist } from "@/lib/db"
import Link from "next/link"
import MovieCard from "@/components/MovieCard"

export default async function WatchlistPage() {
  const session = await auth()

  // If not logged in, redirect to sign in page
  if (!session) {
    redirect("/auth/signin")
  }

  // Fetch user's watchlist
  const watchlist = await getWatchlist(session.user?.email || "")

  return (
    <div className="min-h-screen bg-gray-950 overscroll-none">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="px-3 py-2.5 flex items-center justify-between max-w-2xl mx-auto">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-white">📌 My Watchlist</h1>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="px-3 py-4 max-w-2xl mx-auto">
        {watchlist.length > 0 ? (
          <>
            <div className="mb-3 text-sm text-gray-400">
              {watchlist.length} {watchlist.length === 1 ? "movie" : "movies"}
            </div>

            <div className="grid grid-cols-3 gap-2 justify-items-center">
              {watchlist.map((movie) => (
                <MovieCard
                  key={movie.movieId}
                  movie={{
                    id: movie.movieId,
                    title: movie.title,
                    poster_path: movie.posterPath,
                    backdrop_path: movie.backdropPath,
                    release_date: movie.releaseDate,
                    vote_average: movie.voteAverage,
                    overview: "",
                    genre_ids: [],
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Start adding movies to keep track of what you want to watch
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Browse Movies
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
