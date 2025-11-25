"use client"

import { useState } from "react"
import { WatchlistMovie } from "@/lib/types"

interface WatchlistButtonProps {
  movie: Omit<WatchlistMovie, "addedAt">
  initialInWatchlist: boolean
}

export default function WatchlistButton({ movie, initialInWatchlist }: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      if (inWatchlist) {
        // Remove from watchlist
        const response = await fetch(`/api/watchlist?movieId=${movie.movieId}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to remove from watchlist")

        setInWatchlist(false)
      } else {
        // Add to watchlist
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movieId: movie.movieId,
            title: movie.title,
            posterPath: movie.posterPath,
            backdropPath: movie.backdropPath,
            releaseDate: movie.releaseDate,
            voteAverage: movie.voteAverage,
          }),
        })

        if (!response.ok) throw new Error("Failed to add to watchlist")

        setInWatchlist(true)
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error)
      // Optionally show error to user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex-shrink-0 p-2 rounded-full transition-colors ${
        inWatchlist
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      } disabled:opacity-50`}
      aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg
          className="w-5 h-5"
          fill={inWatchlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      )}
    </button>
  )
}
