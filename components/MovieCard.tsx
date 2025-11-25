"use client"

import { Movie } from "@/lib/types"
import { getPosterUrl } from "@/lib/tmdb"
import Image from "next/image"
import Link from "next/link"

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path)
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"

  return (
    <Link href={`/movie/${movie.id}`} className="flex-shrink-0 w-[110px] cursor-pointer transition-transform hover:scale-105 block">
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800 shadow-lg">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="110px"
          unoptimized={!movie.poster_path}
        />
        {/* Rating badge */}
        <div className="absolute top-1 right-1 bg-black/90 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          ⭐ {rating}
        </div>
      </div>
      <div className="mt-1.5">
        <h3 className="text-xs font-semibold text-gray-100 line-clamp-2 leading-tight">
          {movie.title}
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">{year}</p>
      </div>
    </Link>
  )
}
