import { NextResponse } from "next/server";

const GITHUB_USERNAME = "RohanSi4";
const GRAPHQL_URL = "https://api.github.com/graphql";

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

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "no token" }, { status: 500 });
  }

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_USERNAME } }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "github error" }, { status: 502 });
    }

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

    const json = await res.json() as {
      data: { user: { repositories: { nodes: Repo[] } } };
    };

    const repos = json.data.user.repositories.nodes;
    const latest = repos
      .filter((r) => r.defaultBranchRef?.target)
      .sort(
        (a, b) =>
          new Date(b.defaultBranchRef!.target.committedDate).getTime() -
          new Date(a.defaultBranchRef!.target.committedDate).getTime()
      )[0];

    if (!latest) {
      return NextResponse.json({ error: "no commits" }, { status: 404 });
    }

    const commit = latest.defaultBranchRef!.target;

    return NextResponse.json({
      repo: latest.nameWithOwner,
      message: commit.message.split("\n")[0],
      url: commit.url,
      timestamp: commit.committedDate,
    });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
