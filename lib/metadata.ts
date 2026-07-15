import type { Metadata } from "next";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: `/${string}`;
}

export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Rohan Singh: projects, running, and more",
};

export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataOptions): Metadata {
  const socialTitle = `${title} | Rohan Singh`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: "Rohan Singh",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage],
    },
  };
}
