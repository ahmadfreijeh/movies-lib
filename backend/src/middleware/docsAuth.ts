import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

const DOCS_USERNAME = "admin";
const DOCS_PASSWORD = "admin";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function requireDocsAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Basic ")) {
    const [username, password] = Buffer.from(header.slice(6), "base64")
      .toString("utf8")
      .split(":");
    if (
      username &&
      password &&
      safeCompare(username, DOCS_USERNAME) &&
      safeCompare(password, DOCS_PASSWORD)
    ) {
      next();
      return;
    }
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="API Docs"');
  res.status(401).send("Authentication required");
}
