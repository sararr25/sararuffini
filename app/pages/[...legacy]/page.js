import { notFound } from "next/navigation";
import LegacyPage from "../../../components/LegacyPage";
import {
  getLegacyMetadata,
  getLegacyPageByRoute,
  getLegacyRoutes,
  getRouteFromSegments,
} from "../../../lib/legacy-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLegacyRoutes()
    .filter((entry) => entry.route.startsWith("/pages/"))
    .map((entry) => ({
      legacy: entry.route.replace(/^\/pages\//, "").split("/"),
    }));
}

export async function generateMetadata({ params }) {
  const { legacy } = await params;
  return getLegacyMetadata(getRouteFromSegments(legacy));
}

export default async function LegacyPagesRoute({ params }) {
  const { legacy } = await params;
  const page = getLegacyPageByRoute(getRouteFromSegments(legacy));

  if (!page) {
    notFound();
  }

  return <LegacyPage page={page} />;
}
