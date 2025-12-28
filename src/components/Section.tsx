import type { Track, WhySection, WorkCategory } from "@/data/types";
import { motion } from "framer-motion";
import { ConceptItem, TrackItem, WorkItem } from "./Item";

interface WorkCategorySectionProps {
  category: WorkCategory;
}

export function WorkCategorySection({ category }: WorkCategorySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <h2 className="text-2xl text-foreground mb-6">{category.name}</h2>
      <div className="space-y-2">
        {category.works.map((work) => (
          <WorkItem key={work.title} work={work} />
        ))}
      </div>
    </motion.section>
  );
}

interface MusicSectionProps {
  tracks: Track[];
}

export function MusicSection({ tracks }: MusicSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <h2 className="text-2xl text-foreground mb-6">Music</h2>
      <div className="space-y-2">
        {tracks.map((track) => (
          <TrackItem key={track.title} track={track} />
        ))}
      </div>
    </motion.section>
  );
}

interface WhySectionComponentProps {
  section: WhySection;
}

export function WhySectionComponent({ section }: WhySectionComponentProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <h2 className="text-3xl text-foreground mb-4">{section.title}</h2>
      <p className="text-muted-foreground mb-8">{section.intro}</p>

      <div className="space-y-4">
        {section.concepts.map((concept) => (
          <ConceptItem key={concept.title} concept={concept} />
        ))}
      </div>

      <p className="text-muted-foreground mt-8 italic">{section.outro}</p>
    </motion.section>
  );
}
