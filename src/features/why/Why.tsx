import { data, meta } from "@/data/why";
import { renderEmphasis } from "@/shared/lib/markdown";
import { BackButton } from "@/shared/ui/BackButton";
import { Footer } from "@/shared/ui/Footer";
import { motion } from "framer-motion";
import { ConceptCard } from "./components/ConceptCard";
import { SectionTitle } from "./components/SectionTitle";

export function Why() {
  return (
    <main className="min-h-screen">
      <title>{meta.title}</title>
      <BackButton variant="top" />

      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Opening subtitle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-xl text-muted-foreground italic">
            {meta.description}
          </p>
        </motion.div>

        {/* Opening paragraphs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4,
              },
            },
          }}
          className="space-y-8 mb-16"
        >
          {data.opening.map((paragraph, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut",
                  },
                },
              }}
              className="text-lg leading-relaxed"
            >
              {renderEmphasis(paragraph)}
            </motion.div>
          ))}
        </motion.div>

        {/* Sections */}
        {data.sections.map((section) => (
          <section key={section.title} className="mb-20">
            <SectionTitle title={section.title} intro={section.intro} />

            <div className="space-y-8">
              {section.concepts.map((concept, i) => (
                <ConceptCard key={concept.title} concept={concept} index={i} />
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground italic mt-12 text-center"
            >
              {section.outro}
            </motion.p>
          </section>
        ))}

        {/* Closing paragraphs */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="space-y-6 mt-20"
        >
          {data.closing.map((paragraph, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut",
                  },
                },
              }}
              className="text-lg leading-relaxed"
            >
              {renderEmphasis(paragraph)}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <BackButton variant="bottom" />
      <Footer />
    </main>
  );
}
