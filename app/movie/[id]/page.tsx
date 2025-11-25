import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getMovieDetails, getMovieTrailer, getRecommendedMovies, getBackdropUrl } from "@/lib/tmdb"
import { isInWatchlist } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import MovieCard from "@/components/MovieCard"
import WatchlistButton from "@/components/WatchlistButton"

interface MoviePageProps {
  params: Promise<{ id: string }>
}

export default async function MoviePage({ params }: MoviePageProps) {
  const session = await auth()

  // If not logged in, redirect to sign in page
  if (!session) {
    redirect("/auth/signin")
  }

  const { id } = await params
  
  // Fetch movie data in parallel
  const [movie, trailer, recommended, inWatchlist] = await Promise.all([
    getMovieDetails(id),
    getMovieTrailer(id),
    getRecommendedMovies(id),
    isInWatchlist(session.user?.email || "", parseInt(id)),
  ])

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Movie Not Found</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path)
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "N/A"
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"

  return (
    <div className="min-h-screen bg-gray-950 overscroll-none">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="px-3 py-2.5 flex items-center justify-between max-w-2xl mx-auto">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-white">🎬 Movies</h1>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="pb-6">
        {/* Backdrop Image */}
        <div className="relative w-full aspect-video bg-gray-800">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
            unoptimized={!movie.backdrop_path}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="px-3 max-w-2xl mx-auto -mt-16 relative z-10">
          {/* Title & Rating */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h1 className="text-2xl font-bold text-white leading-tight flex-1">
                {movie.title}
              </h1>
              <WatchlistButton
                movie={{
                  movieId: movie.id,
                  title: movie.title,
                  posterPath: movie.poster_path,
                  backdropPath: movie.backdrop_path,
                  releaseDate: movie.release_date,
                  voteAverage: movie.vote_average,
                }}
                initialInWatchlist={inWatchlist}
              />
            </div>
            {movie.tagline && (
              <p className="text-gray-400 text-sm italic mb-2">"{movie.tagline}"</p>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                ⭐ {rating}
              </span>
              <span>•</span>
              <span>{year}</span>
              <span>•</span>
              <span>{runtime}</span>
            </div>
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white mb-2">Overview</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {movie.overview || "No overview available."}
            </p>
          </div>

          {/* Trailer */}
          {trailer && (
            <div className="mb-6">
              <h2 className="text-base font-semibold text-white mb-2">Trailer</h2>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Recommended Movies */}
          {recommended.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-white mb-3">
                Recommended Movies
              </h2>
              <div className="flex overflow-x-auto gap-2 pb-3 snap-x snap-mandatory scrollbar-hide">
                {recommended.slice(0, 10).map((movie) => (
                  <div key={movie.id} className="snap-start">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
