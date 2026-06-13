async function main() {
  const jszipMod = await import("jszip");
  const JSZip = jszipMod.default || jszipMod;
  console.log("JSZip loadAsync:", typeof JSZip.loadAsync);
  try {
    const zip = new JSZip();
    console.log("new JSZip().loadAsync:", typeof zip.loadAsync);
  } catch (e) {
    console.error("new JSZip failed:", e);
  }

  const mammothMod = await import("mammoth");
  const mammoth = mammothMod.default || mammothMod;
  console.log("mammoth extractRawText:", typeof mammoth.extractRawText);
}
main().catch(console.error);
