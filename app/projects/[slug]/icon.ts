const iconBySlug: Record<string, string> = {
  "marathon-prep-bot": `
    <rect width="64" height="64" rx="16" fill="#173c2b"/>
    <path d="M24 58 29 10h6l5 48Z" fill="#fafaf9" opacity=".95"/>
    <path d="M31 50h3l-1-8h-2Zm0-15h2l-.6-6h-.8Z" fill="#f27655"/>
    <path d="M16 17h32" stroke="#f27655" stroke-width="5" stroke-linecap="round"/>
  `,
  "movie-recommender": `
    <rect width="64" height="64" rx="16" fill="#17243a"/>
    <rect x="12" y="16" width="40" height="32" rx="6" fill="#fafaf9"/>
    <path d="m29 25 13 7-13 7Z" fill="#f27655"/>
    <g fill="#17243a"><circle cx="17" cy="21" r="2"/><circle cx="17" cy="43" r="2"/><circle cx="47" cy="21" r="2"/><circle cx="47" cy="43" r="2"/></g>
  `,
  "spotify-recommender": `
    <rect width="64" height="64" rx="18" fill="#c7ff5e"/>
    <g fill="#11130c">
      <rect x="17" y="27" width="4" height="10" rx="2" transform="rotate(-8 19 32)"/>
      <rect x="24" y="22" width="4" height="20" rx="2" transform="rotate(-8 26 32)"/>
      <rect x="31" y="17" width="4" height="30" rx="2" transform="rotate(-8 33 32)"/>
      <rect x="38" y="21" width="4" height="22" rx="2" transform="rotate(-8 40 32)"/>
      <rect x="45" y="26" width="4" height="12" rx="2" transform="rotate(-8 47 32)"/>
    </g>
  `,
  "parking-shark": `
    <rect width="64" height="64" rx="16" fill="#173158"/>
    <path d="M17 50V14h18c10 0 16 6 16 15 0 10-7 15-17 15h-7v6Zm10-16h8c4 0 6-2 6-5s-2-5-6-5h-8Z" fill="#fff"/>
    <path d="m40 34 12 10-16-2Z" fill="#ed8124"/>
  `,
  "personal-site": `
    <rect width="64" height="64" rx="16" fill="#fafaf9"/>
    <circle cx="32" cy="25" r="11" fill="#173c2b"/>
    <path d="M13 55c2-12 9-18 19-18s17 6 19 18Z" fill="#4f7c5a"/>
    <circle cx="48" cy="16" r="6" fill="#f27655"/>
  `,
  "health-tracker-ios": `
    <rect width="64" height="64" rx="16" fill="#24243a"/>
    <path d="M32 50S15 40 15 27c0-7 5-12 12-12 3 0 6 2 8 5 2-3 5-5 8-5 7 0 12 5 12 12 0 13-23 23-23 23Z" fill="#f2b7c6"/>
    <path d="M18 32h9l4-8 5 16 4-8h7" fill="none" stroke="#24243a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  `,
};

const fallbackIcon = `
  <rect width="64" height="64" rx="16" fill="#173c2b"/>
  <circle cx="32" cy="32" r="14" fill="#f27655"/>
`;

export const size = { width: 64, height: 64 };
export const contentType = "image/svg+xml";

export default async function Icon({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const body = iconBySlug[slug] ?? fallbackIcon;

  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`,
    { headers: { "Content-Type": contentType } },
  );
}
