"use client"

import { useState } from "react"
import { Movie, WatchlistMovie } from "@/lib/types"
import MovieCard from "@/components/MovieCard"
import MovieSearch from "@/components/MovieSearch"
import Link from "next/link"

interface DashboardClientProps {
  session: any
  popularMovies: Movie[]
  watchlist: WatchlistMovie[]
}

export default function DashboardClient({
  session,
  popularMovies,
  watchlist: initialWatchlist,
}: DashboardClientProps) {
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>(initialWatchlist)

  const handleSearch = async (query: string) => {
    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      // Limit to 6 results
      setSearchResults((data.results || []).slice(0, 6))
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 overscroll-none">
      {/* Header - Mobile optimized */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="px-3 py-2.5 flex items-center justify-between max-w-2xl mx-auto">
          <h1 className="text-lg font-bold text-white">🎬 Movies</h1>
          <div className="flex items-center gap-2">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-7 h-7 rounded-full border-2 border-gray-700"
              />
            )}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile first */}
      <main className="px-3 py-4 max-w-2xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-1">
            Welcome, {session.user?.name?.split(" ")[0]}!
          </h2>
          <p className="text-gray-400 text-sm">
            Discover your favorite movies
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-white mb-2">
            Search Movies
          </h3>
          <MovieSearch
            onSearch={handleSearch}
            results={searchResults}
            isLoading={isSearching}
          />

          {/* Search Results */}
          {hasSearched && (
            <div className="mt-4">
              {isSearching ? (
                <div className="flex justify-center py-6">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">
                    Results ({searchResults.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2 justify-items-center">
                    {searchResults.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-6 text-sm">
                  No movies found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Watchlist Section */}
        {watchlist.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white">
                📌 My Watchlist
              </h3>
              <Link href="/watchlist" className="text-xs text-blue-400 hover:text-blue-300">
                See All ({watchlist.length})
              </Link>
            </div>

            <div className="flex overflow-x-auto gap-2 pb-3 snap-x snap-mandatory scrollbar-hide">
              {watchlist.map((movie) => (
                <div key={movie.movieId} className="snap-start">
                  <MovieCard 
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Movies Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">
              🔥 Popular Now
            </h3>
            <Link href="/popular" className="text-xs text-blue-400 hover:text-blue-300">
              See All
            </Link>
          </div>

          {popularMovies.length > 0 ? (
            <div className="flex overflow-x-auto gap-2 pb-3 snap-x snap-mandatory scrollbar-hide">
              {popularMovies.map((movie) => (
                <div key={movie.id} className="snap-start">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400 text-sm">Unable to load movies</p>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="text-purple-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              GitHub SSO
            </h3>
            <p className="text-xs text-gray-600">
              Secure authentication
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Cosmos DB
            </h3>
            <p className="text-xs text-gray-600">
              Azure NoSQL database
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 sm:col-span-2 lg:col-span-1">
            <div className="text-green-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              TMDB API
            </h3>
            <p className="text-xs text-gray-600">
              Movie database integration
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
