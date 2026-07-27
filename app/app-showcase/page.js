import AppShowcase from "../../components/AppShowcase";

export const metadata = {
  metadataBase: new URL("https://www.sararuffini.com"),
  title: "Playtribe App Showcase — Sara Ruffini",
  description: "A case study of Playtribe, a social sports app for finding or creating local events, meeting people and building trust through community.",
  openGraph: {
    title: "Playtribe App Showcase — Sara Ruffini",
    description: "A case study of Playtribe, a social sports app for finding or creating local events, meeting people and building trust through community.",
    images: ["/assets/media/app-showcase/playtribe/explore.webp"],
  },
};

export default function AppShowcasePage() {
  return <AppShowcase />;
}
