import { Skeleton } from "@/components/ui/skeleton";

/** Full-bleed 16:9 placeholder for the landing-page banner sliders. */
export default function BannerSkeleton() {
  return (
    <div aria-hidden="true" className="relative w-screen left-1/2 -ml-[50vw] overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
    </div>
  );
}
