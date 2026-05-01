export interface VCardData {
  displayName: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  username: string;
  avatarUrl?: string | null;
}

export function generateVCard(data: VCardData): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.displayName}`,
    `N:${data.displayName};;;;`,
  ];

  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.website) lines.push(`URL:${data.website}`);

  const profileUrl = `${window.location.origin}/p/${data.username}`;
  lines.push(`URL;TYPE=PROFILE:${profileUrl}`);
  lines.push(`NOTE:Find me on Tapped Inn Network at ${profileUrl}`);
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

export function downloadVCard(data: VCardData): void {
  const vcf = generateVCard(data);
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.displayName.replace(/\s+/g, "-")}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}
