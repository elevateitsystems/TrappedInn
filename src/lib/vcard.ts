export function downloadVCard(profile: any) {
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:${profile.displayName};;;;
FN:${profile.displayName}
${profile.bio ? `NOTE:${profile.bio}` : ""}
${profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : ""}
${profile.email ? `EMAIL;TYPE=WORK:${profile.email}` : ""}
${profile.website ? `URL:${profile.website}` : ""}
END:VCARD`;

  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.username || "profile"}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
