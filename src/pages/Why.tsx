import { BackLink } from "@/components/BackLink";
import { Divider } from "@/components/Divider";
import { Footer } from "@/components/Footer";
import { WhySection } from "@/components/Section";
import { whyData } from "@/data/why";
import { motion } from "framer-motion";

export function Why() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto px-6 py-12"
    >
      <BackLink />

      <p className="text-center text-text-muted italic my-12">
        {whyData.epigraph}
      </p>

      <section className="mb-16">
        <h1 className="text-4xl text-text mb-8">The Fundamental Question</h1>
        {whyData.opening.map((para, i) => (
          <p
            key={i}
            className="text-text-secondary mb-4"
            dangerouslySetInnerHTML={{ __html: para }}
          />
        ))}
      </section>

      <Divider symbol="start" />

      {whyData.sections.map((section) => (
        <WhySection key={section.title} section={section} />
      ))}

      <Divider symbol="end" />

      <section className="mb-16">
        <h2 className="text-3xl text-text mb-8">The Final Recognition</h2>
        {whyData.closing.map((para, i) => (
          <p
            key={i}
            className="text-text-secondary mb-4"
            dangerouslySetInnerHTML={{ __html: para }}
          />
        ))}
      </section>

      <BackLink />

      <Footer />
    </motion.main>
  );
}
