import LegacyPage from "../components/LegacyPage";
import HomepageMotion from "../components/HomepageMotion";
import { getLegacyMetadata, getLegacyPageByRoute } from "../lib/legacy-pages";

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
