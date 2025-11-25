import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getPopularMoviesPaginated } from "@/lib/tmdb"

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    
    const data = await getPopularMoviesPaginated(page)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}
