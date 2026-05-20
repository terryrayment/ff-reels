export const WEST_COAST_BRAND_PROJECT = {
  owner: "terryrayment",
  number: 3,
  title: "WEST COAST - BRAND",
  url: "https://github.com/users/terryrayment/projects/3",
};

export function getGitHubProjectToken() {
  return (
    process.env.GITHUB_PROJECT_TOKEN ||
    process.env.GH_PROJECT_TOKEN ||
    process.env.GITHUB_TOKEN ||
    ""
  );
}
