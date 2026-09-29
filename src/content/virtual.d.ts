declare module "virtual:collection" {
  import type { Collection } from "@/content/collection.ts";

  const collection: Collection;
  export default collection;
}

declare module "virtual:why" {
  import type { Why } from "@/content/parse.ts";

  const why: Why;
  export default why;
}
