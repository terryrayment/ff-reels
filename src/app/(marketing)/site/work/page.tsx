import type { Metadata } from "next";
import { ProjectCard } from "@/components/marketing/project-card";
import { RevealText } from "@/components/marketing/reveal-text";
import { getCanonicalWork } from "@/lib/marketing/canonical-source";
import { getDirectorPortfolioPlayId } from "@/lib/marketing/play-project-id";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Explore Friends & Family director work across commercials, case studies, films, production, post, animation, and VFX.",
  alternates: { canonical: "/site/work" },
};

function getWork() {
  const items = getCanonicalWork(null);
  return { items, totalCount: items.length };
}

export default function WorkPage() {
  const { items, totalCount } = getWork();

  return (
    <div className="ff-shell ff-page">
      <header className="ff-page-heading-row">
        <h1 className="ff-display-page">
          <RevealText text="Work" />
        </h1>
        <p className="ff-kicker">
          {totalCount} {totalCount === 1 ? "project" : "projects"}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="ff-empty-state">
          <p>No projects available yet.</p>
        </div>
      ) : (
        <div className="ff-grid-work">
          {items.map((p, index) => (
            <ProjectCard
              key={p.id}
              project={{
                ...p,
                playProjectId: getDirectorPortfolioPlayId(p),
              }}
              showYear
              imagePriority={index < 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}
