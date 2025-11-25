import { auth } from "@/auth"
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - Get user's watchlist
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const watchlist = await getWatchlist(session.user.email)
    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 })
  }
}

// POST - Add movie to watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { movieId, title, posterPath, backdropPath, releaseDate, voteAverage } = body
    
    if (!movieId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    const result = await addToWatchlist(session.user.email, {
      movieId,
      title,
      posterPath: posterPath || null,
      backdropPath: backdropPath || null,
      releaseDate: releaseDate || "",
      voteAverage: voteAverage || 0,
      addedAt: new Date().toISOString(),
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 })
  }
}

// DELETE - Remove movie from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get("movieId")
    
    if (!movieId) {
      return NextResponse.json({ error: "Missing movieId" }, { status: 400 })
    }
    
    const result = await removeFromWatchlist(session.user.email, parseInt(movieId))
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 })
  }
}
