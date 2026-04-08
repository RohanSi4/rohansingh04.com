import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted">
        <span>rohan singh</span>
        <nav aria-label="footer links" className="flex flex-wrap gap-4">
          <a
            href="mailto:rohan.singh04@outlook.com"
            className="hover:text-fg transition-colors"
          >
            email
          </a>
          <a
            href="https://linkedin.com/in/rohansingh4"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg transition-colors"
          >
            linkedin
          </a>
          <a
            href="https://github.com/RohanSi4"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg transition-colors"
          >
            github
          </a>
          <Link href="/resume" className="hover:text-fg transition-colors">
            resume
          </Link>
        </nav>
      </div>
    </footer>
  );
}
