import type { Express } from "express";
import { createServer, type Server } from "http";
import { ANIME } from "@consumet/extensions";

const hianime = new ANIME.Hianime();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/anime/trending", async (_req, res) => {
    try {
      const results = await hianime.fetchTopAiring();
      res.json(results);
    } catch (error: any) {
      console.error("Trending error:", error.message);
      res.status(500).json({ error: "Failed to fetch trending anime", results: [] });
    }
  });

  app.get("/api/anime/popular", async (_req, res) => {
    try {
      const results = await hianime.fetchMostPopular();
      res.json(results);
    } catch (error: any) {
      console.error("Popular error:", error.message);
      res.status(500).json({ error: "Failed to fetch popular anime", results: [] });
    }
  });

  app.get("/api/anime/recent", async (_req, res) => {
    try {
      const results = await hianime.fetchRecentlyUpdated();
      res.json(results);
    } catch (error: any) {
      console.error("Recent error:", error.message);
      res.status(500).json({ error: "Failed to fetch recent anime", results: [] });
    }
  });

  app.get("/api/anime/search/:query/:page", async (req, res) => {
    try {
      const { query, page } = req.params;
      const pageNum = parseInt(page) || 1;
      const results = await hianime.search(decodeURIComponent(query), pageNum);
      res.json(results);
    } catch (error: any) {
      console.error("Search error:", error.message);
      res.status(500).json({ error: "Search failed", results: [], currentPage: 1, hasNextPage: false });
    }
  });

  app.get("/api/anime/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const results = await hianime.search(decodeURIComponent(query), 1);
      res.json(results);
    } catch (error: any) {
      console.error("Search error:", error.message);
      res.status(500).json({ error: "Search failed", results: [], currentPage: 1, hasNextPage: false });
    }
  });

  app.get("/api/anime/info/:id", async (req, res) => {
    try {
      const id = decodeURIComponent(req.params.id);
      const info = await hianime.fetchAnimeInfo(id);
      res.json(info);
    } catch (error: any) {
      console.error("Info error:", error.message);
      res.status(500).json({ error: "Failed to fetch anime info" });
    }
  });

  app.get("/api/anime/watch/:episodeId", async (req, res) => {
    try {
      const episodeId = decodeURIComponent(req.params.episodeId);
      const sources = await hianime.fetchEpisodeSources(episodeId);
      res.json(sources);
    } catch (error: any) {
      console.error("Watch error:", error.message);
      res.status(500).json({ error: "Failed to fetch episode sources", sources: [] });
    }
  });

  return httpServer;
}
