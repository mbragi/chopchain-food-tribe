import { cn } from "@/lib/utils"
import { AnimeLoader } from "@/components/ui/AnimeLoader";

function Skeleton({ className, anime = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { anime?: boolean }) {
  if (anime) {
    return <AnimeLoader size={32} />;
  }
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton }
