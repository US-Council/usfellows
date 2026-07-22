import { execFileSync } from "node:child_process";
import { access, copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const apiBase = "https://api.hardmagic.com";
const outputDir = resolve("public/assets/photos/pages");
const force = process.argv.includes("--force");
const only = process.argv.find((argument) => argument.startsWith("--only="))?.split("=")[1]?.split(",");

const common = [
  "Elegant formal American editorial photography for a distinguished national civic fellowship society.",
  "Candid documentary realism, composed and intellectually serious, natural available light, restrained navy charcoal warm wood limestone and muted ochre palette, realistic skin texture and hands, 35mm environmental portraiture, nuanced tonal range.",
  "Every person wears timeless plain open-collar shirts, knitwear, simple tailoring, or unbranded practical clothing with completely blank fabric surfaces and bare necklines.",
  "Architecture, papers, maps, equipment, screens, and work materials are blank and unmarked.",
  "The frame is pure photography, never a poster, advertisement, interface, or graphic design. Leave calm low-detail space suitable for an editorial headline overlay."
].join(" ");

const negativePrompt = [
  "text, words, letters, alphabet, numbers, typography, headline, caption, label, logo, brand, emblem, seal, badge, flag, watermark, signature, readable sign, signage, name tag, ID card, branded clothing, uniform, lanyard, lapel pin",
  "poster, brochure, magazine cover, website mockup, user interface, infographic, diagram labels, collage, border, picture frame, split screen, staged corporate stock photo, handshake pose, looking at camera, exaggerated smile",
  "deformed hands, extra fingers, missing fingers, fused fingers, duplicate person, cloned face, malformed face, asymmetrical eyes, waxy skin, plastic skin, oversaturated color, harsh HDR, illustration, painting, CGI, 3D render"
].join(", ");

const photos = [
  { slug: "index", seed: 51001, prompt: "Six accomplished people across science, education, engineering, civic practice, and humanitarian service collaborate around a broad table in a restored national-library reading room. Balanced women and men, multigenerational and ethnically diverse, absorbed in maps and research. Subjects favor the right half; shadowed architecture creates generous calm space on the left." },
  { slug: "mission", seed: 53002, prompt: "Exactly two civic leaders—a Black woman in her forties and an older Asian American man—walk in focused conversation beneath an open-air limestone colonnade at morning. Both have completely empty hands and plain unadorned clothing. The colonnade is empty and bare: only stone columns, shadow, and sky, with no furniture, objects, doors, plaques, or other people. Purposeful movement and quiet negative space fill the left side." },
  { slug: "fellowships", seed: 53003, prompt: "Exactly two people—a senior Latina mentor and a younger Black male Fellow—walk side by side through an empty glass-and-stone university cloister, listening carefully to one another. Completely empty hands, bare necklines, blank unadorned clothing, no accessories. Only architecture, soft greenery, and daylight surround them; no furniture, objects, displays, doors, or other people." },
  { slug: "society", seed: 51004, prompt: "Ten accomplished adults spanning their twenties through sixties gather in an intimate evening salon lined with books and warm lamps. Equal women and men of varied backgrounds listen to one another in a circle, candid gestures, civic fellowship and enduring belonging rather than a conference." },
  { slug: "host-institutions", seed: 51005, prompt: "A university center director, a nonprofit program leader, and a visiting technical fellow review an unmarked project model in a sunlit institutional meeting room. A Latina woman leads the discussion with an Asian woman and Black man, authentic stewardship and mutual respect." },
  { slug: "missions", seed: 53006, prompt: "A multidisciplinary field team of exactly four people—two women and two men, Black, Asian, Latino, and white—stands in focused conversation on an open elevated overlook above a broad river landscape. Completely empty hands and plain unadorned field clothing. Only stone parapet, sky, water, and distant terrain appear; no buildings nearby, furniture, objects, rail signs, equipment, or other people. Dramatic morning depth and shared mission." },
  { slug: "fellows", seed: 51007, prompt: "Environmental portrait of a poised Black woman systems engineer in her late thirties beside a refined public-infrastructure model, two colleagues softly out of focus behind her. She is caught mid-thought and looks toward the work rather than the camera; calm blank wall and window light." },
  { slug: "journal", seed: 53008, prompt: "A thoughtful Asian American scholar walks alone through a monumental bare stone archive corridor, pausing in a shaft of window light with empty hands. Plain charcoal clothing, quiet intellectual concentration. Only repeating stone arches, shadow, and an unadorned wooden floor appear; no shelves, books, frames, furniture, objects, doors, or other people. Generous calm negative space." },
  { slug: "apply", seed: 54009, prompt: "A composed mid-career Latina candidate walks alone along a pale coastal headland path toward clear morning light. Completely empty hands, plain unadorned navy clothing, quiet readiness in her expression. Only native grass, stone, distant water, and expansive sky appear; no buildings, roads, signs, markers, benches, fences, vehicles, bags, objects, or other people." },
  { slug: "our-mission", seed: 51010, prompt: "Three civic practitioners shape a public-service plan around a simple unmarked city model in a historic library alcove. A young Black woman facilitates with an older white man and middle-aged Asian woman listening carefully; disciplined purpose, warm restrained atmosphere." },
  { slug: "vision", seed: 52011, prompt: "At sunrise, four urban planners and educators—two women and two men, Black, Asian, Latino, and white, spanning their thirties through sixties—stand on a civic rooftop terrace overlooking an American city and river, quietly considering the long horizon. Refined plain coats, hopeful but unsentimental mood, wide sky and soft architectural negative space." },
  { slug: "why-us-fellows", seed: 53012, prompt: "Exactly four civic practitioners—a Black woman, Latina woman, Asian man, and older white woman—walk together along a clean concrete flood barrier above a wetland at dawn, speaking with serious shared purpose. Completely empty hands and plain unadorned clothing. Only barrier, water, grasses, and expansive sky appear; no equipment, buildings, signs, rail markings, bags, or other people." },
  { slug: "us-fellows-standard", seed: 51013, prompt: "A distinguished older Black jurist mentors a young Asian American researcher in a paneled reading room, both studying a single blank document with measured attention. The image conveys achievement joined to obligation, dignity without ceremony, sculptural window light." },
  { slug: "governance-stewardship", seed: 53014, prompt: "Exactly six civic stewards—three women and three men, Black, Asian, Latino, and white, spanning their thirties through seventies—stand in a loose conversational circle in an empty limestone council antechamber. Completely empty hands, attentive listening, plain formal clothing. Only tall windows, bare stone walls, and sunlight appear; no tables, chairs, doors, frames, objects, fixtures, or other people." },
  { slug: "fellowship-programs", seed: 54015, prompt: "Exactly six practitioners—three women and three men of Black, Asian, Latino, and white backgrounds, spanning their twenties through sixties—cross an open high-desert stone terrace in three conversational pairs. Completely empty hands, blank unadorned clothing, no one faces camera. Only low monolithic limestone walls without openings, pale paving, distant mountains, and sky appear; no buildings, doors, signs, displays, furniture, objects, bags, or other people." },
  { slug: "career-advancement", seed: 53016, prompt: "Exactly two people—a young Black woman and a senior Latino male mentor—walk beneath the elegant structural ribs of an empty modern bridge at golden hour, speaking as professional equals. Completely empty hands, bare necklines, blank unadorned clothing. Only clean steel geometry, concrete, river, and sky appear; no signs, markings, vehicles, equipment, bags, or other people." },
  { slug: "international-graduate-fellows", seed: 53017, prompt: "Exactly three international graduate researchers—a Black woman from West Africa, an Asian woman from South Asia, and a Latino man—walk in thoughtful conversation through an empty cloistered university courtyard. Completely empty hands, plain navy and charcoal clothing, bare necklines. Only stone arches, lawn, and diffuse daylight appear; no signs, doors, furniture, objects, bags, bicycles, or other people." },
  { slug: "national-capacity-fellows", seed: 51018, prompt: "A Black woman infrastructure specialist and two male colleagues inspect the interior geometry of a water-control facility, comparing an unmarked schematic to physical equipment. Serious national capacity work, tailored practical clothing, strong navy shadows and warm metal." },
  { slug: "mission-fellowships", seed: 53019, prompt: "Exactly three people—a Black woman, Latina woman, and Asian man—walk together along an empty coastal wetland boardwalk at dawn, conferring with focused purpose. Completely empty hands, bare necklines, plain unadorned field clothing with empty pockets. Only blank timber walkway, grasses, water, and broad sky appear; no signs, rail labels, equipment, bags, accessories, or other people." },
  { slug: "fellowship-society", seed: 53020, prompt: "Exactly five people—three women and two men, Black, Asian, Latino, and white, spanning their twenties through sixties—stand in a gracious conversational circle in an empty candle-warm stone gallery at dusk. Completely empty hands, plain elegant clothing, attentive expressions. Only bare limestone walls, arches, floor, and soft lamps appear; no tables, chairs, doors, frames, books, displays, objects, or other people." },
  { slug: "cohorts-chapters", seed: 54021, prompt: "Exactly eight adults—four women and four men of Black, Asian, Latino, and white backgrounds, visibly spanning their twenties through sixties—walk in small conversational groupings along a broad tree-lined park avenue beside an open meadow. Completely empty hands and plain unadorned clothing. Only mature trees, grass, pale path, and sky appear; no buildings, signs, markers, benches, lamps, vehicles, bags, objects, or other people. Regional connection." },
  { slug: "convenings-honors", seed: 53022, prompt: "An elegant evening gathering in an open-air limestone sculpture courtyard where a balanced multiethnic audience spanning their twenties through seventies stands and offers quiet applause to an unseen honoree. Refined dark attire without accessories. Only bare stone walls, columns, paving, and warm architectural light appear; no seating, stage, doors, plaques, artwork, displays, objects, bags, or other people. Dignity and recognition without spectacle." },
  { slug: "code-of-service", seed: 53023, prompt: "Exactly two people—a senior Black woman advisor and younger Asian male practitioner—sit at equal height on a long bare stone bench in an empty cloister, pausing over a difficult decision in quiet conversation. Completely empty hands, plain unadorned clothing, measured expressions. Only stone wall, repeating arches, floor, and side light appear; no furniture beyond the bench, doors, objects, books, frames, fixtures, or other people. Ethical seriousness and service over ego." },
  { slug: "fellowship-oath", seed: 53024, prompt: "Exactly eight newly appointed Fellows—four women and four men, Black, Asian, Latino, and white, spanning their twenties through sixties—stand facing inward in quiet commitment beneath an open-air circular limestone colonnade at dawn. Completely empty hands, bare necklines, plain unadorned clothing. Only columns, blank stone floor, sky, and daylight appear; no walls with postings, doors, furniture, fixtures, objects, pins, or other people. Solemn collective responsibility." },
  { slug: "become-a-host", seed: 51025, prompt: "A nonprofit director and university supervisor prepare a welcoming project workspace for an arriving fellow, arranging a physical model, blank notebook, and research tools on a clean table. Two women of different generations, purposeful hospitality, formal but human." },
  { slug: "who-can-host", seed: 53026, prompt: "Exactly four institutional representatives—two women and two men of Black, Asian, Latino, and white backgrounds—stand in an open conversational square beneath an empty modern stone portico. Completely empty hands, plain refined clothing, equal presence. Only pale columns, paving, a distant green lawn, and sky appear; no doors, windows, signs, plaques, furniture, objects, bags, pins, or other people. Cohesive institutional partnership." },
  { slug: "host-standards", seed: 54027, prompt: "Exactly two people—a Black woman host supervisor and younger Asian male visiting Fellow—walk side by side along the vast exterior crest of a clean concrete water-control structure at dawn. Completely empty hands, plain unadorned clothing, respectful eye-level exchange. Only blank concrete geometry, unmarked steel rail, water, and sky appear; no buildings, control panels, signs, labels, doors, tools, vehicles, bags, or other people." },
  { slug: "appointment-model", seed: 54028, prompt: "Exactly three diverse colleagues ascend at measured intervals across four broad shallow limestone terraces cut into a grassy hillside, photographed from a high oblique angle to express a clear progression. Completely empty hands and plain unadorned clothing. Only four blank stone levels, clipped grass, directional shadow, and sky appear; no buildings, doors, signs, markers, furniture, objects, bags, or other people." },
  { slug: "submit-opportunity", seed: 55029, prompt: "Wide environmental portrait with generous sky above: a mission-driven middle-aged Asian American woman, fully visible from head to knees with clear space around her head, walks alone across a narrow unmarked pale-stone footbridge over a still reflecting pool in a minimalist garden. Completely empty hands and plain unadorned navy clothing. Only water, stone, reeds, clipped trees, and daylight appear; no buildings, railings, signs, plaques, furniture, devices, objects, bags, or other people." },
  { slug: "humanity-dignity", seed: 53030, prompt: "Exactly two people—a Black woman community advocate in her forties and an older white man—sit at equal height on a simple built-in bench beneath a shaded residential porch, listening closely in unhurried conversation. Completely empty hands and plain unadorned clothing. Only blank painted siding, bare timber posts, floorboards, soft garden greenery, and daylight appear; no doors, windows, signs, furniture beyond the bench, objects, bags, or other people. Dignity and trust." },
  { slug: "science-discovery", seed: 54031, prompt: "Exactly three scientists—two women and one man of Black, Asian, and Latino backgrounds—stand in absorbed conversation on a dark remote plateau beneath a luminous predawn sky dense with stars. Completely empty hands, plain navy and charcoal clothing, bare necklines. Only smooth volcanic ground, distant mountains, stars, and first blue light appear; no observatory, buildings, telescopes, equipment, lights, vehicles, signs, markers, bags, or other people. Awe joined to rigorous discovery." },
  { slug: "planetary-stewardship", seed: 52032, prompt: "Exactly three people—a Black woman ecologist, Latina scientist, and Asian American male conservationist—restore a coastal wetland at sunrise. All wear plain earth-tone shirts and trousers with empty pockets and bare necklines. One glass sampling vial and native grasses are the only objects. No lab coats, phones, devices, tools with labels, paper, maps, pens, bags, accessories, or other people. Broad living landscape and quiet optimism." },
  { slug: "civic-life-public-trust", seed: 54033, prompt: "Exactly six residents—three women and three men of Black, Asian, Latino, and white backgrounds, spanning their twenties through seventies—stand in a democratic circle on a simple round stone clearing within a public garden while a young woman facilitates thoughtful conversation. Completely empty hands and plain unadorned clothing. Only blank paving, low meadow planting, mature trees, and sky appear; no buildings, podium, signs, plaques, furniture, objects, bags, or other people. Transparent civic deliberation." },
  { slug: "national-capacity-resilience", seed: 51034, prompt: "A Black woman civil engineer, Latino emergency planner, and white male systems specialist inspect a flood-control pumping station, comparing an abstract unmarked diagram with massive equipment. Serious resilient public systems, industrial geometry, dramatic natural side light." },
  { slug: "become-a-fellow", seed: 53035, prompt: "A promising South Asian public-interest professional in his early thirties walks alone along a broad formal garden path toward distant luminous civic architecture at dawn. Completely empty hands, plain unadorned navy clothing, self-possessed expression. Only clipped hedges, mature trees, pale gravel, sky, and distant blank stone forms appear; no signs, plaques, benches, lamps, vehicles, bags, objects, or other people. Ready for service." },
  { slug: "eligibility", seed: 53036, prompt: "Exactly five accomplished people—a Black woman, Latino man, Asian woman, white woman, and older Black man—stand in a loose conversational formation across an empty sunlit museum courtyard. Completely empty hands, varied but plain unadorned professional clothing, equal presence without hierarchy. Only pale plaster, limestone floor, tall arches, sky, and one quiet tree appear; no doors, displays, plaques, furniture, objects, bags, or other people. Excellence from many fields." },
  { slug: "selection-criteria", seed: 53037, prompt: "Exactly three discerning evaluators—a Black male scholar, Latina executive, and older Asian woman—walk slowly in thoughtful conversation through an empty circular limestone chamber crossed by three shafts of natural light. Completely empty hands, plain unadorned formal clothing, attentive expressions. Only curved bare wall, stone floor, shadow, and light appear; no doors, signs, plaques, furniture, objects, bags, or other people. Merit joined to judgment." },
  { slug: "fellow-benefits", seed: 53038, prompt: "Exactly two Fellows from different generations—a Black woman in her thirties and an older Asian woman—walk in thoughtful conversation through a secluded classical garden arcade. Completely empty hands, plain unadorned clothing. Only repeating pale columns, bare paving, deep greenery, and soft daylight appear; no building entrances, doors, windows, signs, plaques, furniture, displays, objects, bags, or other people. Belonging, mentorship, and opportunity." },
  { slug: "nominate-a-fellow", seed: 53039, prompt: "A senior Black woman quietly observes a younger Latino man leading exactly three diverse adults in thoughtful conversation across an empty terraced civic plaza. Everyone has completely empty hands and plain unadorned clothing; the observer's expression conveys candid recognition of talent and character. Only pale stone steps, blank walls, one tree, and daylight appear; no signs, doors, furniture, objects, bags, awards, or other people." },
  { slug: "essays-research-notes", seed: 53040, prompt: "A thoughtful woman essayist in her fifties sits alone on a deep built-in window ledge in an otherwise empty quiet plaster room, looking into a shaded garden while developing an idea. Completely empty hands, plain charcoal clothing. Only textured blank wall, simple window opening without hardware, stone floor, garden light, and shadow appear; no shelves, books, furniture, objects, frames, doors, or other people. Intellectual solitude." },
  { slug: "field-reports", seed: 52041, prompt: "Exactly two field researchers—a Black woman and Latino man—work beside a restored urban stream. One holds a clear unmarked water sample vial while the other examines stream vegetation with empty hands. Plain practical clothing, no notebooks, paper, maps, phones, devices, pens, bags, labels, or other people. Direct experience translated into useful knowledge." },
  { slug: "fellow-stories", seed: 54042, prompt: "Environmental portrait of an older Latina educator walking through a mature orchard at golden hour, looking toward exactly three diverse adult learners walking softly farther along the grass path. Everyone has completely empty hands and plain unadorned clothing. Only fruit trees, grass, distant meadow, and warm sunlight appear; no pergola, buildings, signs, labels, tools, furniture, bags, objects, or other people. Lived service and earned confidence." },
  { slug: "institutional-briefings", seed: 54043, prompt: "Exactly four leaders—two women and two men of Black, Asian, Latino, and white backgrounds—walk in a compact group along a high natural river bluff at morning. A woman expert speaks while the others listen closely. Completely empty hands and plain unadorned formal clothing. Only smooth stone, native grasses, broad river, distant city silhouette, and sky appear; no buildings nearby, walls, railings, signs, markers, furniture, objects, bags, or other people. Responsible decisions." },
  { slug: "impact-reports", seed: 53044, prompt: "Exactly three evaluators—a Black woman, Asian man, and Latina woman—walk slowly through a completed public rain garden at morning, studying the restored landscape and speaking with careful accountability. Completely empty hands, plain unadorned clothing. Only curving stone path, native planting, clean water channel, trees, and sky appear; no signs, labels, benches, equipment, bags, buildings, or other people." },
  { slug: "terms-of-service", seed: 53045, prompt: "Minimal formal still life: one small unmarked brass balance scale centered on a completely bare dark walnut pedestal while a single mature hand enters the frame to level the beam. Behind it is only a softly lit blank deep-navy plaster wall. No books, paper, folios, pens, maps, lamps, furniture beyond the pedestal, engravings, symbols, objects, or visible face. Sober institutional clarity and generous negative space." },
  { slug: "privacy-policy", seed: 53046, prompt: "A Black woman carefully locks one monumental freestanding matte-black cabinet with a plain mechanical key in an otherwise empty dim architectural gallery. The cabinet is a single completely blank rectangular plane. Only smooth charcoal plaster wall, bare stone floor, soft side light, the cabinet, woman, and key appear; no other cabinets, office, desk, furniture, frames, doors, paper, devices, fixtures, objects, or other people. Privacy, care, and controlled access." },
  { slug: "doorways", seed: 53047, prompt: "Exactly four people—two women and two men of Black, Asian, Latino, and white backgrounds, spanning their twenties through sixties—approach four separate monumental freestanding stone arch frames aligned beside a quiet reflecting pool in an open landscape. The arches contain only sky and warm light, with no rooms behind them. Completely empty hands, plain unadorned clothing. No buildings, doors, signs, plaques, furniture, objects, bags, or other people. Formal entrances into service." },
  { slug: "journey", seed: 53048, prompt: "Exactly four people—two women and two men of Black, Asian, Latino, and white backgrounds—walk at different distances along a long pale-stone path between high sculptural walls toward morning light. Completely empty hands, plain timeless clothing. Only blank stone walls, gravel, sky, and directional shadow appear; no buildings, doors, windows, signs, plaques, furniture, objects, bags, or other people. Fellowship as progression and responsibility." },
  { slug: "partners", seed: 54049, prompt: "Exactly six leaders—three women and three men of Black, Asian, Latino, and white backgrounds—walk together in a close conversational formation along a quiet olive grove path at late afternoon. Completely empty hands, plain unadorned formal clothing, visible cooperation without handshakes. Only silver-green trees, pale earth path, low grass, distant hills, and sky appear; no buildings, signs, markers, furniture, vehicles, objects, bags, or other people." },
  { slug: "pathways", seed: 53050, prompt: "High oblique environmental photograph of exactly four people—a senior Black woman mentor and three prospective Fellows, an Asian woman, Latino man, and white man—paused in thoughtful conversation where three pale gravel garden paths branch through a sculptural botanical landscape. Completely empty hands and plain unadorned clothing. Only paths, clipped grasses, mature trees, and sky appear; no signs, labels, benches, lamps, buildings, bags, objects, or other people. Purposeful choice." }
];

// Delivery crops remove peripheral set dressing that can distract from overlaid copy.
// Every crop remains 16:9 and is resized back to the standard 1920 × 1080 asset size.
const finalCrops = {
  mission: "1600x900+0+50",
  fellowships: "1504x846+0+100",
  missions: "1600x900+100+0",
  journal: "1504x846+0+100",
  "why-us-fellows": "1440x810+240+0",
  "fellowship-programs": "1440x810+240+0",
  "mission-fellowships": "1280x720+320+0",
  "fellowship-society": "1440x810+150+100",
  "cohorts-chapters": "1440x810+240+0",
  "code-of-service": "1280x720+320+0",
  "fellowship-oath": "1280x720+320+0",
  "who-can-host": "1408x792+0+100",
  "host-standards": "1200x675+0+150",
  "appointment-model": "1440x810+0+0",
  "submit-opportunity": "1200x675+650+0",
  "humanity-dignity": "1424x801+250+0",
  "civic-life-public-trust": "1600x900+0+0",
  "become-a-fellow": "1200x675+720+40",
  eligibility: "1440x810+300+100",
  "selection-criteria": "1440x810+0+100",
  "fellow-benefits": "1328x747+450+100",
  "nominate-a-fellow": "1440x810+240+0",
  "essays-research-notes": "1200x675+700+0",
  "impact-reports": "1296x729+200+0",
  "terms-of-service": "1056x594+800+100",
  "privacy-policy": "1200x675+350+100",
  journey: "1440x810+300+100",
  pathways: "1440x810+240+0"
};

async function applyDeliveryCrop(photo, destination, tempDir) {
  const crop = finalCrops[photo.slug];
  if (!crop) return;
  const cropped = join(tempDir, `${photo.slug}-delivery.avif`);
  execFileSync("magick", [
    destination,
    "-crop", crop,
    "+repage",
    "-resize", "1920x1080!",
    "-strip",
    "-quality", "68",
    cropped
  ]);
  await copyFile(cropped, destination);
  await rm(cropped, { force: true });
}

function accessToken() {
  return execFileSync("hm", ["token", "--quiet"], { encoding: "utf8" }).trim();
}

async function api(path, token, init = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      const response = await fetch(`${apiBase}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...init.headers
        }
      });
      if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 8) await new Promise((resolvePromise) => setTimeout(resolvePromise, 2000 * attempt));
    }
  }
  throw lastError;
}

async function generate(photo, token, tempDir) {
  const destination = join(outputDir, `${photo.slug}.avif`);
  if (!force) {
    try {
      await access(destination);
      console.log(`skip ${photo.slug}`);
      return;
    } catch {}
  }

  let result;
  for (let generationAttempt = 1; generationAttempt <= 5; generationAttempt += 1) {
    const submitted = await api("/v1/images/generations", token, {
      method: "POST",
      body: JSON.stringify({
        model: "z_image_turbo",
        prompt: `${common} ${photo.prompt}`,
        negative_prompt: negativePrompt,
        size: "1024x1024",
        n: 1,
        seed: photo.seed
      })
    });
    console.log(`queued ${photo.slug} ${submitted.id}`);

    result = submitted;
    const pollStarted = Date.now();
    while (result.status !== "completed" && result.status !== "failed") {
      if (Date.now() - pollStarted > 180_000) {
        result = { status: "failed", error: "generation timed out after 180 seconds" };
        break;
      }
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 3000));
      result = await api(`/v1/images/generations/${submitted.id}`, token);
    }
    if (result.status === "completed") break;
    if (generationAttempt < 5) {
      console.warn(`retry ${photo.slug}: ${result.error ?? "generation failed"}`);
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 5000 * generationAttempt));
    }
  }
  if (result?.status !== "completed") throw new Error(`${photo.slug}: ${result?.error ?? "generation failed"}`);

  const encoded = result.data?.[0]?.b64_json;
  if (!encoded) throw new Error(`${photo.slug}: response contained no image`);
  const source = join(tempDir, `${photo.slug}.png`);
  await writeFile(source, Buffer.from(encoded, "base64"));
  execFileSync("magick", [
    source,
    "-gravity", "center",
    "-crop", "1024x576+0+0",
    "+repage",
    "-resize", "1920x1080",
    "-strip",
    "-quality", "68",
    destination
  ]);
  await applyDeliveryCrop(photo, destination, tempDir);
  if (photo.slug === "index") {
    execFileSync("magick", [
      destination,
      "-resize", "1200x630^",
      "-gravity", "center",
      "-extent", "1200x630",
      "-strip",
      "-quality", "88",
      resolve("public/assets/photos/home-hero-og.jpg")
    ]);
  }
  console.log(`saved ${photo.slug}`);
}

await mkdir(outputDir, { recursive: true });
const token = accessToken();
const tempDir = await mkdtemp(join(tmpdir(), "usfellows-page-photos-"));

try {
  const queue = only ? photos.filter((photo) => only.includes(photo.slug)) : [...photos];
  if (only && queue.length !== only.length) {
    const missing = only.filter((slug) => !photos.some((photo) => photo.slug === slug));
    throw new Error(`Unknown photo slug(s): ${missing.join(", ")}`);
  }
  // HardMagic's shared image workers can reject concurrent generations at peak load.
  // A single local worker keeps this 50-image commission deterministic and resumable.
  const workers = Array.from({ length: 1 }, async () => {
    while (queue.length) await generate(queue.shift(), token, tempDir);
  });
  await Promise.all(workers);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
