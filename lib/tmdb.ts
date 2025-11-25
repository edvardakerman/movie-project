import { Movie, TMDBResponse, MovieDetails, VideosResponse, Video } from "./types"

const API_KEY = process.env.TMDB_API_KEY
const BASE_URL = "https://api.themoviedb.org/3"

// Get popular movies
export async function getPopularMovies(page: number = 1): Promise<Movie[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch popular movies")
    }

    const data: TMDBResponse = await res.json()
    return data.results
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return []
  }
}

// Get popular movies with pagination info
export async function getPopularMoviesPaginated(page: number = 1): Promise<TMDBResponse> {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`,
      {
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch popular movies")
    }

    const data: TMDBResponse = await res.json()
    return data
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    }
  }
}

// Search movies
export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const res = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`,
      {
        cache: "no-store", // Don't cache search results
      }
    )

    if (!res.ok) {
      throw new Error("Failed to search movies")
    }

    const data: TMDBResponse = await res.json()
    return data.results
  } catch (error) {
    console.error("Error searching movies:", error)
    return []
  }
}

// Helper to get full poster URL
export function getPosterUrl(posterPath: string | null): string {
  if (!posterPath) {
    return "/posterFallback.jpeg"
  }
  return `https://image.tmdb.org/t/p/w342${posterPath}`
}

// Helper to get full backdrop URL
export function getBackdropUrl(backdropPath: string | null): string {
  if (!backdropPath) {
    return "/backDropFallback.jpg"
  }
  return `https://image.tmdb.org/t/p/w1280${backdropPath}`
}

// Get movie details by ID
export async function getMovieDetails(id: string): Promise<MovieDetails | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch movie details")
    }

    const data: MovieDetails = await res.json()
    return data
  } catch (error) {
    console.error("Error fetching movie details:", error)
    return null
  }
}

// Get movie trailer/videos
export async function getMovieTrailer(id: string): Promise<Video | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`,
      {
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch movie videos")
    }

    const data: VideosResponse = await res.json()
    
    // Find official trailer or first video
    const trailer = data.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube" && video.official
    ) || data.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    ) || data.results[0]

    return trailer || null
  } catch (error) {
    console.error("Error fetching movie trailer:", error)
    return null
  }
}

// Get recommended movies
export async function getRecommendedMovies(id: string): Promise<Movie[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`,
      {
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch recommended movies")
    }

    const data: TMDBResponse = await res.json()
    return data.results
  } catch (error) {
    console.error("Error fetching recommended movies:", error)
    return []
  }
}
