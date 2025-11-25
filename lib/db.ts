import { CosmosClient } from "@azure/cosmos"
import { WatchlistMovie } from "./types"

const databaseName = process.env.COSMOS_DB_DATABASE_NAME || "moviedb"
const containerName = process.env.COSMOS_DB_CONTAINER_NAME || "users"

let client: CosmosClient | null = null
let database: any
let container: any

function getClient() {
  if (!client) {
    const endpoint = process.env.COSMOS_DB_CONNECTION_STRING
    if (!endpoint) {
      throw new Error("COSMOS_DB_CONNECTION_STRING is not defined")
    }
    client = new CosmosClient(endpoint)
  }
  return client
}

async function initializeDatabase() {
  if (!database) {
    const cosmosClient = getClient()
    const { database: db } = await cosmosClient.databases.createIfNotExists({
      id: databaseName,
    })
    database = db

    const { container: cont } = await database.containers.createIfNotExists({
      id: containerName,
      partitionKey: { paths: ["/email"] },
    })
    container = cont
  }
  return { database, container }
}

export interface User {
  id?: string
  email: string
  name: string
  image: string
  githubId: string
  createdAt?: string
  watchlist?: WatchlistMovie[]
}

export async function createUser(user: User) {
  try {
    const { container } = await initializeDatabase()
    
    const newUser = {
      ...user,
      id: user.email, // Use email as id for simplicity
      createdAt: new Date().toISOString(),
      watchlist: [], // Initialize empty watchlist
    }
    
    const { resource } = await container.items.create(newUser)
    return resource
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const { container } = await initializeDatabase()
    
    const { resource } = await container.item(email, email).read()
    return resource
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    console.error("Error getting user:", error)
    throw error
  }
}

export async function getAllUsers() {
  try {
    const { container } = await initializeDatabase()
    
    const { resources } = await container.items
      .query("SELECT * FROM c")
      .fetchAll()
    
    return resources
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

// Watchlist functions
export async function addToWatchlist(email: string, movie: WatchlistMovie) {
  try {
    const { container } = await initializeDatabase()
    
    // Get current user
    const user = await getUserByEmail(email)
    if (!user) {
      throw new Error("User not found")
    }
    
    // Initialize watchlist if it doesn't exist
    const watchlist = user.watchlist || []
    
    // Check if movie already exists
    const exists = watchlist.some((item: WatchlistMovie) => item.movieId === movie.movieId)
    if (exists) {
      return { success: false, message: "Movie already in watchlist" }
    }
    
    // Add movie with timestamp
    const movieWithTimestamp = {
      ...movie,
      addedAt: new Date().toISOString(),
    }
    
    watchlist.push(movieWithTimestamp)
    
    // Update user document
    const updatedUser = {
      ...user,
      watchlist,
    }
    
    const { resource } = await container.item(email, email).replace(updatedUser)
    return { success: true, watchlist: resource.watchlist }
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    throw error
  }
}

export async function removeFromWatchlist(email: string, movieId: number) {
  try {
    const { container } = await initializeDatabase()
    
    // Get current user
    const user = await getUserByEmail(email)
    if (!user) {
      throw new Error("User not found")
    }
    
    // Filter out the movie
    const watchlist = (user.watchlist || []).filter(
      (item: WatchlistMovie) => item.movieId !== movieId
    )
    
    // Update user document
    const updatedUser = {
      ...user,
      watchlist,
    }
    
    const { resource } = await container.item(email, email).replace(updatedUser)
    return { success: true, watchlist: resource.watchlist }
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    throw error
  }
}

export async function getWatchlist(email: string): Promise<WatchlistMovie[]> {
  try {
    const user = await getUserByEmail(email)
    if (!user) {
      return []
    }
    
    // Return watchlist sorted by most recently added
    return (user.watchlist || []).sort(
      (a: WatchlistMovie, b: WatchlistMovie) => 
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    )
  } catch (error) {
    console.error("Error getting watchlist:", error)
    return []
  }
}

export async function isInWatchlist(email: string, movieId: number): Promise<boolean> {
  try {
    const watchlist = await getWatchlist(email)
    return watchlist.some((item) => item.movieId === movieId)
  } catch (error) {
    console.error("Error checking watchlist:", error)
    return false
  }
}
