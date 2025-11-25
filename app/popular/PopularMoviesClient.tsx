"use client"

import { useState } from "react"
import { Movie } from "@/lib/types"
import MovieCard from "@/components/MovieCard"
import { useRouter } from "next/navigation"

interface PopularMoviesClientProps {
  initialMovies: Movie[]
  initialPage: number
  totalPages: number
}

export default function PopularMoviesClient({
  initialMovies,
  initialPage,
  totalPages,
}: PopularMoviesClientProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const loadMore = async () => {
    if (currentPage >= totalPages) return

    setIsLoading(true)
    const nextPage = currentPage + 1

    try {
      const response = await fetch(`/api/popular?page=${nextPage}`)
      if (!response.ok) throw new Error("Failed to fetch movies")

      const data = await response.json()
      setMovies((prev) => [...prev, ...data.results])
      setCurrentPage(nextPage)
      
      // Update URL without reload
      router.push(`/popular?page=${nextPage}`, { scroll: false })
    } catch (error) {
      console.error("Error loading more movies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-3 text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </div>

      <div className="grid grid-cols-3 gap-2 justify-items-center mb-6">
        {movies.map((movie, index) => (
          <MovieCard key={`${movie.id}-${index}`} movie={movie} />
        ))}
      </div>

      {currentPage < totalPages && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {currentPage >= totalPages && movies.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          You've reached the end
        </div>
      )}
    </div>
  )
}
