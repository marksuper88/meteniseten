"use client";

import Link from "next/link";

type EmptyPageProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyPage({
  title,
  description = "Deze pagina is nog in ontwikkeling.",
  actionLabel,
  actionHref,
}: EmptyPageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        
        <h1 className="text-2xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="text-slate-600">
          {description}
        </p>

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-400 transition"
          >
            {actionLabel}
          </Link>
        )}

      </div>
    </div>
  );
}