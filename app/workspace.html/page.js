import LegacyPage from "../../components/LegacyPage";
import { getLegacyMetadata, getLegacyPageByRoute } from "../../lib/legacy-pages";

export function generateMetadata() {
  return getLegacyMetadata("/workspace.html");
}

export default function WorkspacePage() {
  return <LegacyPage page={getLegacyPageByRoute("/workspace.html")} />;
}
