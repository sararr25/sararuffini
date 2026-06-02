import LegacyPage from "../components/LegacyPage";
import { getLegacyMetadata, getLegacyPageByRoute } from "../lib/legacy-pages";

export function generateMetadata() {
  return getLegacyMetadata("/");
}

export default function HomePage() {
  return <LegacyPage page={getLegacyPageByRoute("/")} />;
}
