# AniStream - Anime Streaming Website

## Overview
A full-featured anime streaming website built with Express + React (Vite), using the `@consumet/extensions` HiAnime provider for real anime data including search, details, and streaming sources.

## Architecture
- **Backend**: Express.js with `@consumet/extensions` (ANIME.Hianime) for scraping anime data
- **Frontend**: React + Vite with wouter routing, TanStack Query for data fetching
- **Styling**: TailwindCSS with dark anime theme (always dark mode)
- **Video Player**: Custom HLS.js-based video player with quality selection

## Project Structure
```
client/src/
  App.tsx              - Main app with routing
  pages/
    home.tsx           - Home page with Trending, Popular, Recently Updated sections
    search.tsx         - Search page with query param support
    anime-details.tsx  - Anime details with episode list
    watch.tsx          - Watch page with video player, episode navigation
  components/
    Navbar.tsx         - Top navigation with search
    AnimeCard.tsx      - Anime grid card component
    EpisodeCard.tsx    - Episode number button component
    VideoPlayer.tsx    - HLS video player with custom controls
    LoadingSkeleton.tsx - Loading skeleton components
server/
  routes.ts            - API routes proxying @consumet/extensions
```

## API Routes
- `GET /api/anime/trending` - Top airing anime
- `GET /api/anime/popular` - Most popular anime
- `GET /api/anime/recent` - Recently updated anime
- `GET /api/anime/search/:query` - Search anime
- `GET /api/anime/search/:query/:page` - Search with pagination
- `GET /api/anime/info/:id` - Anime details with episodes
- `GET /api/anime/watch/:episodeId` - Episode streaming sources

## Key Features
- Real anime data from HiAnime via @consumet/extensions
- HLS video streaming with quality selection
- Continue watching progress saved in localStorage
- Responsive dark anime theme
- Search with pagination
- Episode navigation (prev/next)

## Recent Changes
- 2026-02-06: Added complete Watchlist (Favorites) system with localStorage persistence, watchlist page, heart toggle on anime details, navbar link
- 2026-02-06: Initial build - complete anime streaming site
