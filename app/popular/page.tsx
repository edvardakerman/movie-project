import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPopularMoviesPaginated } from "@/lib/tmdb"
import Link from "next/link"
import PopularMoviesClient from "./PopularMoviesClient"

interface PopularPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PopularPage({ searchParams }: PopularPageProps) {
  const session = await auth()

  // If not logged in, redirect to sign in page
  if (!session) {
    redirect("/auth/signin")
  }

  const params = await searchParams
  const currentPage = parseInt(params.page || "1")

  // Fetch popular movies for current page
  const data = await getPopularMoviesPaginated(currentPage)

  return (
    <div className="min-h-screen bg-gray-950 overscroll-none">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="px-3 py-2.5 flex items-center justify-between max-w-2xl mx-auto">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-white">🔥 Popular Movies</h1>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="px-3 py-4 max-w-2xl mx-auto">
        <PopularMoviesClient
          initialMovies={data.results}
          initialPage={currentPage}
          totalPages={data.total_pages}
        />
      </main>
    </div>
  )
}
