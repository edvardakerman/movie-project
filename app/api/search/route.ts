import { NextRequest, NextResponse } from "next/server"
import { searchMovies } from "@/lib/tmdb"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ results: [], error: "Query required" }, { status: 400 })
  }

  try {
    const results = await searchMovies(query)
    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 })
  }
}
