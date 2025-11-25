// TMDB API Types
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export interface TMDBResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface Genre {
  id: number
  name: string
}

export interface MovieDetails {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  runtime: number
  genres: Genre[]
  tagline: string
  status: string
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface VideosResponse {
  results: Video[]
}

// Watchlist item stored in user document
export interface WatchlistMovie {
  movieId: number
  title: string
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string
  voteAverage: number
  addedAt: string
}
