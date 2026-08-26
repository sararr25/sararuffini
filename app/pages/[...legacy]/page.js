import { notFound } from "next/navigation";
import LegacyPage from "../../../components/LegacyPage";
import "../../../styles/legacy-tailwind.css";
import "../../../styles/projects.css";
import "../../../styles/about.css";
import "../../../styles/contact.css";
import "../../../styles/socialmedia-portfolio.css";
import "../../../styles/graphics.css";
import "../../../styles/shooting-cocktails.css";
import "../../../styles/video-v1.css";
import "../../../styles/video-v2.css";
import "../../../styles/app-v1.css";
import "../../../styles/app-v2.css";
import "../../../styles/shared-project-pager.css";
import "../../../styles/homepage.css";
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
