# TMDB API Documentation - Watchlist App

This document describes all The Movie Database (TMDB) API endpoints and use cases implemented in the watchlist application.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [API Endpoints Used](#api-endpoints-used)
4. [Data Models](#data-models)
5. [Use Cases by Feature](#use-cases-by-feature)
6. [Image Configuration](#image-configuration)
7. [Implementation Examples](#implementation-examples)

---

## Overview

**Base API URL:** `https://api.themoviedb.org/3/`
**Documentation:** https://developer.themoviedb.org/docs

The app uses TMDB API v3 to fetch movie data including:
- Popular movies
- Trending movies
- Top-rated movies
- Upcoming movies
- Now playing movies
- Movie details
- Movie recommendations
- Movie trailers/videos
- Search functionality

---

## Environment Variables

### Required Environment Variables:

```env
# API Access
TMDB_API_KEY="your_api_key_here"                    # Server-side API key
NEXT_PUBLIC_TMDB_API_KEY="your_api_key_here"        # Client-side API key

# Base URLs
TMDB_API_URL="https://api.themoviedb.org/3/movie/"  # Server-side base URL
NEXT_PUBLIC_TMDB_API_URL="https://api.themoviedb.org/3/movie/"  # Client-side base URL

# Image URLs
NEXT_PUBLIC_TMDB_POSTER_BASE_URL="https://image.tmdb.org/t/p/w500"     # Poster images
TMDB_BACKDROP_BASE_URL="https://image.tmdb.org/t/p/original"           # Backdrop images
```

### Image Size Options:
- Posters: `w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`
- Backdrops: `w300`, `w780`, `w1280`, `original`

---

## API Endpoints Used

### 1. **Get Popular Movies**
```
GET /movie/popular
```
**Parameters:**
- `api_key` (required): Your API key
- `language`: en-US
- `page`: 1
- `include_adult`: true

**Used in:** Home page to display popular movies

---

### 2. **Get Trending Movies**
```
GET /movie/trending
```
**Parameters:**
- `api_key` (required)
- `language`: en-US
- `page`: 1
- `include_adult`: true

**Used in:** Explore page, Hero section

---

### 3. **Get Top Rated Movies**
```
GET /movie/top_rated
```
**Parameters:**
- `api_key` (required)
- `language`: en-US
- `page`: 1
- `include_adult`: true

**Used in:** Explore page

---

### 4. **Get Upcoming Movies**
```
GET /movie/upcoming
```
**Parameters:**
- `api_key` (required)
- `language`: en-US
- `page`: 1
- `include_adult`: true

**Used in:** Explore page

---

### 5. **Get Now Playing Movies**
```
GET /movie/now_playing
```
**Parameters:**
- `api_key` (required)
- `language`: en-US
- `page`: 1
- `include_adult`: true

**Used in:** Explore page

---

### 6. **Get Movie Details**
```
GET /movie/{movie_id}
```
**Parameters:**
- `api_key` (required)
- `movie_id`: The movie's TMDB ID
- `include_video`: true

**Response includes:**
- Movie title, overview, tagline
- Release date, runtime
- Vote average, vote count
- Genres (array of genre objects)
- Poster path, backdrop path
- Production companies, countries
- Revenue, budget
- Original language

**Used in:** Individual movie detail pages (`/movie/[movieID]`)

---

### 7. **Get Movie Recommendations**
```
GET /movie/{movie_id}/recommendations
```
**Parameters:**
- `api_key` (required)
- `movie_id`: The movie's TMDB ID
- `include_adult`: true

**Returns:** Array of recommended movies based on the current movie

**Used in:** Movie detail pages to show similar/recommended content

---

### 8. **Get Movie Videos**
```
GET /movie/{movie_id}/videos
```
**Parameters:**
- `api_key` (required)
- `movie_id`: The movie's TMDB ID

**Response includes:**
- Array of videos (trailers, teasers, clips)
- Each video has: key, site (YouTube), type, name

**Used in:** Movie detail pages to display trailers

---

### 9. **Search Movies**
```
GET /search/movie
```
**Parameters:**
- `api_key` (required)
- `query`: Search term (URL encoded)

**Example:**
```
https://api.themoviedb.org/3/search/movie?query=inception&api_key=YOUR_KEY
```

**Used in:** Search functionality (`/search?query=...`)

---

### 10. **Category/List Endpoints**
Dynamic category exploration using:
```
GET /movie/{category}
```
Where `{category}` can be:
- `popular`
- `top_rated`
- `upcoming`
- `now_playing`

**Parameters:**
- `api_key` (required)
- `language`: en-US
- `page`: 1-5 (paginated)
- `include_adult`: true

**Used in:** Dynamic category pages (`/explore/[category]`)

---

## Data Models

### Movie Interface (TypeScript)

```typescript
interface Movie {
  backdrop_path: string;        // Path to backdrop image
  genre_ids: number[];          // Array of genre IDs
  id: number;                   // Unique TMDB movie ID
  original_language: string;    // ISO language code
  overview: string;             // Movie description/plot
  poster_path: string;          // Path to poster image
  release_date: string;         // Format: "YYYY-MM-DD"
  title: string;                // Movie title
  vote_average: number;         // Rating (0-10)
  genres: Genre[];              // Full genre objects (from detail endpoint)
  runtime: number;              // Duration in minutes
}
```

### Genre Interface

```typescript
interface Genre {
  id: number;
  name: string;
}
```

### Video Interface

```typescript
interface Video {
  key: string;           // YouTube video ID
  site: string;          // Usually "YouTube"
  type: string;          // "Trailer", "Teaser", "Clip", etc.
  name: string;          // Video title
  official: boolean;     // Official video flag
}
```

---

## Use Cases by Feature

### 🏠 Home Page
**Endpoints:**
- `GET /movie/popular` - Display popular movies carousel
- `GET /movie/trending` - Hero section featured movie

**Implementation:**
```typescript
const res = await fetch(
  `${process.env.TMDB_API_URL}popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1&include_adult=true`,
  { next: { revalidate: 3600 } }
);
```

---

### 🔍 Search Feature
**Endpoint:**
- `GET /search/movie?query={searchTerm}`

**Use case:**
- User types in search box
- Client-side fetch with minimum 3 characters
- Display results in grid layout

**Implementation:**
```typescript
const response = await fetch(
  `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
);
```

---

### 🎬 Movie Detail Page
**Endpoints used:**
1. `GET /movie/{id}` - Main movie details
2. `GET /movie/{id}/recommendations` - Recommended movies
3. `GET /movie/{id}/videos` - Trailers and videos

**Features provided:**
- Movie title, overview, tagline
- Backdrop image
- Genres, runtime, release date
- Trailer player (YouTube embed)
- Recommended movies carousel
- Add to watchlist/watched buttons

**Implementation:**
```typescript
// Get main movie details
const movie = await fetch(
  `${process.env.TMDB_API_URL}${id}?api_key=${process.env.TMDB_API_KEY}&include_video=true`
);

// Get recommendations
const recommendations = await fetch(
  `${process.env.TMDB_API_URL}${id}/recommendations?api_key=${process.env.TMDB_API_KEY}&include_adult=true`
);

// Get trailer
const videos = await fetch(
  `${process.env.TMDB_API_URL}${id}/videos?api_key=${process.env.TMDB_API_KEY}`
);
```

---

### 📚 Explore Page
**Endpoints:**
- `GET /movie/trending` - Trending section
- `GET /movie/top_rated` - Top rated section
- `GET /movie/upcoming` - Upcoming section
- `GET /movie/now_playing` - Now playing section

**Features:**
- Multiple carousels for different categories
- Links to detailed category pages
- Horizontal scroll showcase

---

### 🗂️ Category Pages (Dynamic)
**Endpoint:**
- `GET /movie/{category}?page={pageNumber}`

**Supported categories:**
- `popular`
- `top_rated`
- `upcoming`
- `now_playing`

**Features:**
- Pagination (pages 1-5)
- Load more functionality
- Grid display of movies
- Client-side state management

**Implementation:**
```typescript
fetch(
  `${process.env.NEXT_PUBLIC_TMDB_API_URL}${category}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=${page}&include_adult=true`
)
```

---

## Image Configuration

### Poster Images
**Base URL:** `https://image.tmdb.org/t/p/w500`
**Usage:** Movie posters in grids and lists
**Full path:** `{POSTER_BASE_URL}{poster_path}`

**Example:**
```typescript
<img src={`${process.env.NEXT_PUBLIC_TMDB_POSTER_BASE_URL}${movie.poster_path}`} />
```

### Backdrop Images
**Base URL:** `https://image.tmdb.org/t/p/original`
**Usage:** Hero sections, movie detail backgrounds
**Full path:** `{BACKDROP_BASE_URL}{backdrop_path}`

**Example:**
```typescript
<img src={`${process.env.TMDB_BACKDROP_BASE_URL}${movie.backdrop_path}`} />
```

### Image Fallbacks
The app includes fallback images for missing posters:
- `/posterFallback.jpeg` - When poster_path is null
- `/backDropFallback.jpg` - When backdrop_path is null

---

## Implementation Examples

### Server-Side Fetch (Next.js Server Components)

```typescript
// app/(home)/page.tsx
async function getData(endpoint: string) {
  try {
    const res = await fetch(
      `${process.env.TMDB_API_URL}${endpoint}?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1&include_adult=true`,
      {
        next: {
          revalidate: 3600, // Cache for 1 hour
        },
      }
    );

    if (!res.ok) {
      return { data: null, error: `Failed to fetch ${endpoint} data` };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: `Failed to fetch ${endpoint} data` };
  }
}
```

### Client-Side Fetch (React Components)

```typescript
// app/search/page.tsx
const fetchMovies = async (searchQuery: string) => {
  setIsLoading(true);
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    setMovies(data.results);
  } catch (error) {
    setHasError(true);
  } finally {
    setIsLoading(false);
  }
};
```

### Pagination Implementation

```typescript
// app/explore/[category]/page.tsx
const fetchData = (page: number) => {
  fetch(
    `${process.env.NEXT_PUBLIC_TMDB_API_URL}${category}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=${page}&include_adult=true`
  )
    .then(response => response.json())
    .then(result => {
      if (page === 1) {
        setMovies(result.results);
      } else {
        setMovies(prevMovies => [...prevMovies, ...result.results]);
      }
    });
};
```

---

## API Response Examples

### Movie List Response
```json
{
  "page": 1,
  "results": [
    {
      "adult": false,
      "backdrop_path": "/path.jpg",
      "genre_ids": [28, 12, 878],
      "id": 550,
      "original_language": "en",
      "overview": "Movie description...",
      "poster_path": "/path.jpg",
      "release_date": "1999-10-15",
      "title": "Fight Club",
      "vote_average": 8.4,
      "vote_count": 26280
    }
  ],
  "total_pages": 500,
  "total_results": 10000
}
```

### Movie Detail Response
```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "A ticking-time-bomb insomniac...",
  "backdrop_path": "/path.jpg",
  "poster_path": "/path.jpg",
  "genres": [
    { "id": 18, "name": "Drama" }
  ],
  "runtime": 139,
  "release_date": "1999-10-15",
  "vote_average": 8.4,
  "tagline": "Mischief. Mayhem. Soap.",
  "budget": 63000000,
  "revenue": 100853753
}
```

### Videos Response
```json
{
  "id": 550,
  "results": [
    {
      "key": "BdJKm16Co6M",
      "site": "YouTube",
      "type": "Trailer",
      "official": true,
      "name": "Official Trailer"
    }
  ]
}
```

---

## Features to Implement in New App

Based on this documentation, your new app should include:

### ✅ Core Features
1. **Home page** with popular/trending movies
2. **Search functionality** with real-time results
3. **Movie detail pages** with full information
4. **Category browsing** (popular, top rated, upcoming, now playing)
5. **Pagination** for category pages
6. **Trailer/video player** integration
7. **Movie recommendations** on detail pages

### ✅ Technical Requirements
1. Server-side rendering for SEO (Next.js SSR/SSG)
2. Client-side state management for dynamic content
3. Image optimization with fallbacks
4. Error handling for API failures
5. Loading states for async operations
6. Caching strategy (revalidate: 3600 for static content)

### ✅ UI Components Needed
1. Movie grid/showcase component
2. Horizontal scrolling carousel
3. Search bar with debouncing
4. Filter/category selector
5. Movie card component
6. Video player component
7. Loading skeletons
8. Error boundary components

### ✅ Data Management
1. Type-safe API responses (TypeScript interfaces)
2. Image URL construction helpers
3. Genre mapping/filtering
4. Pagination state management
5. Search query state management

---

## Notes & Best Practices

1. **API Key Security:**
   - Use server-side keys for sensitive operations
   - Use `NEXT_PUBLIC_` prefix only for client-side usage

2. **Caching:**
   - Cache static data (movie lists) for 1 hour
   - Revalidate on-demand for user-specific actions

3. **Error Handling:**
   - Always wrap fetch calls in try-catch
   - Provide fallback UI for failed requests
   - Handle empty results gracefully

4. **Image Optimization:**
   - Use appropriate image sizes (w500 for posters)
   - Always provide fallback images
   - Consider lazy loading for better performance

5. **Rate Limiting:**
   - TMDB free tier: 40 requests per 10 seconds
   - Implement caching to reduce API calls
   - Use server-side rendering when possible

---

## Getting Started with TMDB API

1. **Sign up:** https://www.themoviedb.org/signup
2. **Get API key:** https://www.themoviedb.org/settings/api
3. **Read docs:** https://developer.themoviedb.org/docs
4. **Test endpoints:** Use Postman or browser dev tools

---

This documentation covers all TMDB API usage in the watchlist application. Use it as a reference for building your new app with similar functionality.