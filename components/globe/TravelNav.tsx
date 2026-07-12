import Link from "next/link";

type TravelView = "globe" | "states" | "list";

const views: Array<{ id: TravelView; href: string; label: string }> = [
  { id: "globe", href: "/globe", label: "world map" },
  { id: "states", href: "/states", label: "US states" },
  { id: "list", href: "/travel-list", label: "place list" },
];

export default function TravelNav({ current }: { current: TravelView }) {
  return (
    <nav aria-label="Travel views" className="mt-7 flex flex-wrap gap-2">
      {views.map((view) => {
        const active = view.id === current;
        return (
          <Link
            key={view.id}
            href={view.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${
              active
                ? "border-fg bg-fg font-medium text-bg"
                : "border-border text-muted hover:border-accent hover:text-fg"
            }`}
          >
            {view.label}
          </Link>
        );
      })}
    </nav>
  );
}
