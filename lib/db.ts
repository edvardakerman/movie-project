import { CosmosClient } from "@azure/cosmos"

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
}

export async function createUser(user: User) {
  try {
    const { container } = await initializeDatabase()
    
    const newUser = {
      ...user,
      id: user.email, // Use email as id for simplicity
      createdAt: new Date().toISOString(),
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
