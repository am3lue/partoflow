import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDb } from "./api/_lib/db";

// API Handlers
import healthHandler from "./api/health";
import loginHandler from "./api/login";
import signupHandler from "./api/signup";
import facilitiesHandler from "./api/facilities";
import examinationsHandler from "./api/examinations";
import admissionsIndexHandler from "./api/admissions/index";
import admissionsActiveHandler from "./api/admissions/active";
import admissionsHistoryHandler from "./api/admissions/history";
import admissionsIndividualHandler from "./api/admissions/[id]";
import admissionsDeliverHandler from "./api/admissions/[id]/deliver";
import adminStatsHandler from "./api/admin/stats";
import adminUsersHandler from "./api/admin/users";

const app = express();
app.use(express.json());
const PORT = 3000;

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Map Express routes to Vercel-style handlers
const wrap = (handler: any) => async (req: any, res: any) => {
  try {
    // Merge route params into query for Vercel compatibility
    req.query = { ...req.query, ...req.params };
    await handler(req, res);
  } catch (err) {
    console.error("Handler Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// API Route Definitions
app.get("/api/health", wrap(healthHandler));
app.post("/api/login", wrap(loginHandler));
app.post("/api/signup", wrap(signupHandler));
app.get("/api/facilities", wrap(facilitiesHandler));
app.post("/api/examinations", wrap(examinationsHandler));

app.post("/api/admissions", wrap(admissionsIndexHandler));
app.get("/api/admissions/active", wrap(admissionsActiveHandler));
app.get("/api/admissions/history", wrap(admissionsHistoryHandler));
app.get("/api/admissions/:id", wrap(admissionsIndividualHandler));
app.post("/api/admissions/:id/deliver", wrap(admissionsDeliverHandler));

app.get("/api/admin/stats", wrap(adminStatsHandler));
app.post("/api/admin/users", wrap(adminUsersHandler));

// Catch-all for API to prevent HTML responses
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
});

async function startServer() {
  console.log("Initializing database...");
  await initDb();
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
