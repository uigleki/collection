/** Downloads a file whole, failing on any non-2xx response. */
export async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "perfect-collection/1.0 (personal, non-commercial)",
    },
  });
  if (!res.ok) throw new Error(`download ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}
