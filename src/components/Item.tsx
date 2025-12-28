import { useExpand } from "@/context";
import type { Concept, ReviewPoint, Track, Work } from "@/data/types";
import { parseEmphasis } from "@/utils/parseEmphasis";
import { AnimatePresence, motion } from "framer-motion";
import { type KeyboardEvent, type ReactNode, useState } from "react";

function ReviewContent({ point }: { point: ReviewPoint }) {
  return (
    <>
      <span className="text-foreground font-medium">{point.label}:</span>{" "}
      <span className="text-muted-foreground">{parseEmphasis(point.text)}</span>
    </>
  );
}

interface BaseItemProps {
  title: string;
  subtitle: string;
  color: string;
  showSubtitleWhenExpanded?: boolean;
  children?: ReactNode;
}

function BaseItem({
  title,
  subtitle,
  color,
  showSubtitleWhenExpanded = true,
  children,
}: BaseItemProps) {
  const { expanded } = useExpand();
  const [localExpanded, setLocalExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isExpanded = expanded || localExpanded;

  const showSubtitle = showSubtitleWhenExpanded
    ? hovered || isExpanded
    : hovered && !isExpanded;

  const toggle = () => {
    if (!expanded) {
      setLocalExpanded((e) => !e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <motion.div
      className="relative pl-4 py-3"
      style={{
        borderLeftWidth: "2px",
        borderLeftColor: hovered || isExpanded ? color : `${color}4D`,
        boxShadow: hovered || isExpanded ? `0 0 20px ${color}40` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
    >
      <h3 className="text-xl text-foreground">{title}</h3>

      <AnimatePresence>
        {showSubtitle && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-muted-foreground mt-1"
          >
            {subtitle}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function WorkItem({ work }: { work: Work }) {
  const hasContent = work.review.length > 0;

  return (
    <BaseItem title={work.title} subtitle={work.subtitle} color={work.color}>
      {hasContent && (
        <>
          {work.review.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ReviewContent point={point} />
            </motion.div>
          ))}

          {work.flaws && work.flaws.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-muted-foreground text-sm mb-2">Shortcomings:</p>
              {work.flaws.map((flaw, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ReviewContent point={flaw} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </BaseItem>
  );
}

export function TrackItem({ track }: { track: Track }) {
  return (
    <BaseItem
      title={track.title}
      subtitle={track.subtitle}
      color={track.color}
    />
  );
}

export function ConceptItem({ concept }: { concept: Concept }) {
  const hasContent = concept.explanation.length > 0;

  return (
    <BaseItem
      title={concept.title}
      subtitle={concept.subtitle}
      color={concept.color}
      showSubtitleWhenExpanded={false}
    >
      {hasContent &&
        concept.explanation.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {typeof item === "string" ? (
              <span className="text-muted-foreground">{parseEmphasis(item)}</span>
            ) : (
              <ReviewContent point={item} />
            )}
          </motion.div>
        ))}
    </BaseItem>
  );
}
