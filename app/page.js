import LegacyPage from "../components/LegacyPage";
import HomepageMotion from "../components/HomepageMotion";
import { getLegacyMetadata, getLegacyPageByRoute } from "../lib/legacy-pages";
import "../styles/homepage-tailwind.css";
import "../styles/homepage.css";

export function generateMetadata() {
  return getLegacyMetadata("/");
}

export default function HomePage() {
  return (
    <>
      <LegacyPage page={getLegacyPageByRoute("/")} />
      <HomepageMotion />
    </>
  );
}
