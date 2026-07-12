import { NextResponse } from "next/server";

const GITHUB_USERNAME = "RohanSi4";
const GRAPHQL_URL = "https://api.github.com/graphql";
const SERVER_CACHE_MS = 5 * 60_000;
const RESPONSE_CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=3600";

const QUERY = `
  query LatestCommit($login: String!) {
    user(login: $login) {
      repositories(first: 20, orderBy: { field: PUSHED_AT, direction: DESC }, isFork: false) {
        nodes {
          nameWithOwner
          defaultBranchRef {
            target {
              ... on Commit {
                message
                committedDate
                url
              }
            }
          }
        }
      }
    }
  }
`;

type CommitData = {
  repo: string;
  message: string;
  url: string;
  timestamp: string;
};

type Repo = {
  nameWithOwner: string;
  defaultBranchRef: {
    target: {
      message: string;
      committedDate: string;
      url: string;
    };
  } | null;
};

let cachedCommit: { value: CommitData; expiresAt: number } | null = null;
let pendingCommit: Promise<CommitData> | null = null;

async function fetchLatestCommit(): Promise<CommitData> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GitHub is not configured");

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_USERNAME } }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`GitHub request failed: ${res.status}`);

  const json = await res.json() as {
    data?: { user?: { repositories?: { nodes?: Array<Repo | null> } } };
    errors?: unknown[];
  };
  if (json.errors?.length) throw new Error("GitHub GraphQL returned errors");

  const repos = json.data?.user?.repositories?.nodes ?? [];
  const latest = repos
    .filter((repo): repo is Repo => Boolean(repo?.defaultBranchRef?.target))
    .sort(
      (a, b) =>
        new Date(b.defaultBranchRef!.target.committedDate).getTime() -
        new Date(a.defaultBranchRef!.target.committedDate).getTime(),
    )[0];
  if (!latest) throw new Error("No public commits found");

  const commit = latest.defaultBranchRef!.target;
  return {
    repo: latest.nameWithOwner,
    message: commit.message.split("\n")[0],
    url: commit.url,
    timestamp: commit.committedDate,
  };
}

async function getLatestCommit(): Promise<CommitData> {
  if (cachedCommit && cachedCommit.expiresAt > Date.now()) return cachedCommit.value;
  if (pendingCommit) return pendingCommit;

  pendingCommit = fetchLatestCommit()
    .then((value) => {
      cachedCommit = { value, expiresAt: Date.now() + SERVER_CACHE_MS };
      return value;
    })
    .catch((error) => {
      if (cachedCommit) return cachedCommit.value;
      throw error;
    })
    .finally(() => {
      pendingCommit = null;
    });
  return pendingCommit;
}

export async function GET() {
  try {
    return NextResponse.json(await getLatestCommit(), {
      headers: { "Cache-Control": RESPONSE_CACHE_CONTROL },
    });
  } catch {
    return NextResponse.json(
      { error: "github unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
