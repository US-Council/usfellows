#!/usr/bin/env python3
"""Generate images by calling local z_image_turbo API with negative_prompt support.

Usage:
  python3 generate-batch-v2.py [--batch-file /tmp/batch-300-prompts-v2.json]
                              [--out-dir /tmp/output-pngs-v2]
                              [--seed-offset 2000]
                              [--no-wait]

Reads a JSON array of prompt objects from --batch-file.
Each object: { "prompt": "...", "params": { "size": "...", "steps": 8, "negative_prompt": "..." } }
POSTs to localhost:8000/v1/images/generations.
"""

import json, os, sys, base64, time, argparse, urllib.request, urllib.error

def main():
    parser = argparse.ArgumentParser(description="Batch generate images via z_image_turbo")
    parser.add_argument("--batch-file", default="/tmp/batch-300-prompts-v2.json",
                        help="Path to JSON prompts file")
    parser.add_argument("--out-dir", default="/tmp/output-pngs-v2",
                        help="Output directory for PNGs")
    parser.add_argument("--seed-offset", type=int, default=2000,
                        help="Seed offset (seed = offset + index)")
    parser.add_argument("--no-wait", action="store_true",
                        help="Skip delay between requests")
    args = parser.parse_args()

    BATCH_FILE = args.batch_file
    OUT_DIR = args.out_dir
    os.makedirs(OUT_DIR, exist_ok=True)

    with open(BATCH_FILE) as f:
        prompts = json.load(f)

    print(f"Loaded {len(prompts)} prompts from {BATCH_FILE}", flush=True)
    print(f"Output dir: {OUT_DIR}", flush=True)
    print(f"Seed offset: {args.seed_offset}", flush=True)

    for i, item in enumerate(prompts):
        prompt = item["prompt"]
        params = item.get("params", {})
        size = params.get("size", "1024x1024")
        negative_prompt = params.get("negative_prompt", "")
        seed = args.seed_offset + i

        payload = {
            "model": "z_image_turbo",
            "prompt": prompt,
            "n": 1,
            "size": size,
            "seed": seed,
        }

        # Include negative_prompt if provided
        if negative_prompt:
            payload["negative_prompt"] = negative_prompt

        try:
            req = urllib.request.Request(
                "http://localhost:8000/v1/images/generations",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=180) as resp:
                result = json.loads(resp.read().decode("utf-8"))

            img_data = result["data"][0]["b64_json"]
            img_bytes = base64.b64decode(img_data)

            out_path = os.path.join(OUT_DIR, f"image_{i:04d}.png")
            with open(out_path, "wb") as f:
                f.write(img_bytes)

            sz_mb = len(img_bytes) / (1024 * 1024)
            print(f"[{i+1}/{len(prompts)}] {size} ({sz_mb:.1f}MB) - saved {out_path}", flush=True)
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:300]
            print(f"[{i+1}/{len(prompts)}] HTTP {e.code}: {body}", flush=True)
        except urllib.error.URLError as e:
            print(f"[{i+1}/{len(prompts)}] URL error: {e.reason}", flush=True)
        except Exception as e:
            print(f"[{i+1}/{len(prompts)}] FAILED: {e}", flush=True)

        if not args.no_wait:
            time.sleep(0.5)

    print(f"\nDone! Generated images in {OUT_DIR}", flush=True)

if __name__ == "__main__":
    main()
