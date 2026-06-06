// app/p/[username]/page.tsx
import type { Metadata } from "next";
import PublicProfilePage from "./component/publicProfilePage";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params; // ← await here

  let displayName = username;
  let bio = `Connect with ${username} on Tapped Inn Network.`;

  try {
    const res = await fetch(`https://www.tappedinn.us/api/profiles/${username}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const profile = await res.json();
      if (profile?.displayName) displayName = profile.displayName;
      if (profile?.bio) bio = profile.bio;
    }
  } catch {
    // fallback to username
  }

  return {
    title: `${displayName} | Tapped Inn Network`,
    description: bio,
    openGraph: {
      title: `${displayName} | Tapped Inn Network`,
      description: bio,
      url: `https://www.tappedinn.us/p/${username}`,
      siteName: "Tapped Inn Network",
      images: [
        {
          url: "https://www.tappedinn.us/logo.jpg",
          width: 1200,
          height: 630,
          alt: "Tapped Inn Network",
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} | Tapped Inn Network`,
      description: bio,
      images: ["https://www.tappedinn.us/og-logo.png"],
    },
  };
}

export default async function Page({ params }: Props) {
  await params; // ← await here too, even though we don't use it directly
  return <PublicProfilePage />;
}