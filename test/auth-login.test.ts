import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("login page redirects authenticated users away from the login form", () => {
  const source = read("src/app/(auth)/login/page.tsx");

  assert.match(source, /getServerSession\(authOptions\)/);
  assert.match(source, /redirect\("\/dashboard"\)/);
  assert.doesNotMatch(source, /"use client"/);
});

test("home page does not send authenticated users back through login", () => {
  const source = read("src/app/page.tsx");

  assert.match(source, /getServerSession\(authOptions\)/);
  assert.match(source, /redirect\("\/dashboard"\)/);
  assert.match(source, /redirect\("\/login"\)/);
});

test("login form keeps the logo but removes the redundant title and reels label", () => {
  const source = read("src/components/auth/login-form.tsx");

  assert.match(source, /src="\/logo\.svg"/);
  assert.doesNotMatch(source, /Friends &amp; Family/);
  assert.doesNotMatch(source, />\s*Reels\s*</);
});
