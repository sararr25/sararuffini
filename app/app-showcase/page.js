import AppShowcase from "../../components/AppShowcase";
import "../../styles/app-tailwind.css";
import "../../styles/app-showcase-next.css";

export const metadata = {
  metadataBase: new URL("https://www.sararuffini.com"),
  title: "Playtribe Case Study — Sara Ruffini",
  description: "A product design and development case study exploring the idea, visual system and Flutter implementation behind Playtribe.",
  openGraph: {
    title: "Playtribe Case Study — Sara Ruffini",
    description: "A product design and development case study exploring the idea, visual system and Flutter implementation behind Playtribe.",
    images: ["/assets/media/app-showcase/playtribe/explore.webp"],
  },
};

export default function AppShowcasePage() {
  return <AppShowcase />;
}
