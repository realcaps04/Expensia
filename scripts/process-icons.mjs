import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const BG = "#FAFAF8";

async function removeBlackBackground(inputPath, outputPath, threshold = 35) {
  const img = sharp(inputPath);
  const { width, height } = await img.metadata();
  const { data } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
}

async function createMaskableIcon(inputPath, outputPath, size = 512) {
  const logoSize = Math.round(size * 0.62);
  const logo = await sharp(inputPath).resize(logoSize, logoSize, { fit: "contain" }).png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(outputPath);
}

const logoIn = path.join(publicDir, "logo.png");
const logoOut = path.join(publicDir, "logo.png");
const logoTmp = path.join(publicDir, "logo.tmp.png");
const faviconOut = path.join(publicDir, "favicon.png");
const maskableOut = path.join(publicDir, "icon-maskable.png");

await removeBlackBackground(logoIn, logoTmp);
await writeFile(logoOut, await readFile(logoTmp));
await removeBlackBackground(logoIn, faviconOut);
await createMaskableIcon(logoOut, maskableOut);

console.log("Updated logo.png, favicon.png, and icon-maskable.png");
