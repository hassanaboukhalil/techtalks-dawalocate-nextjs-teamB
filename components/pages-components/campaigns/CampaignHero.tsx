import { Heart } from "lucide-react";

interface CampaignHeroProps {
  title?: string;
  subtitle?: string;
  showBadge?: boolean;
  variant?: "public" | "pharmacy";
}

export default function CampaignHero({
  title = "Active Medicine Campaigns",
  subtitle = "Support local charities in their mission to provide essential medicines to those in need across Lebanon",
  showBadge = true,
  variant = "public",
}: CampaignHeroProps) {
  const titleWords = title.split(" ");
  const lastWord = titleWords.pop();
  const titleStart = titleWords.join(" ");

  const containerClasses =
    variant === "public"
      ? "mb-12 text-center animate-slide-up"
      : "mb-8 text-center";

  const headingClasses =
    variant === "public"
      ? "text-4xl md:text-5xl font-bold text-gray-900 mb-4"
      : "text-3xl md:text-4xl font-bold text-gray-900 mb-3";

  return (
    <div className={containerClasses}>
      {showBadge && (
        <div className="inline-flex items-center justify-center bg-primary/10 rounded-full px-4 py-2 mb-4">
          <Heart className="h-5 w-5 text-primary mr-2" />
          <span className="text-sm font-semibold text-primary">
            Make a Difference
          </span>
        </div>
      )}
      <h1 className={headingClasses}>
        {titleStart} <span className="text-primary">{lastWord}</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}
