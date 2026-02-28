import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface LegalSection {
  title: string;
  content: string;
}

interface LegalContentProps {
  sections: LegalSection[];
  lastUpdated: string;
}

function renderContent(content: string) {
  return content
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-bold text-gray-900 mt-4 mb-1">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*\s*:?\s*(.*)/);
        if (match) {
          return (
            <li key={i} className="text-gray-500 mb-2 ml-4 list-disc">
              <strong className="text-gray-900">{match[1]}</strong>
              {match[2] ? ` : ${match[2]}` : ""}
            </li>
          );
        }
      }
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="text-gray-500 mb-2 ml-4 list-disc">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="text-gray-500 leading-relaxed">
          {line}
        </p>
      );
    });
}

export function LegalContent({ sections, lastUpdated }: LegalContentProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-gray-400 text-sm mb-12 text-center">{lastUpdated}</p>
        </ScrollReveal>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <ScrollReveal key={index} delay={index * 50}>
              <div className="border-b border-gray-200 pb-12 last:border-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#BEF221]/20 flex items-center justify-center text-[#BEF221] text-sm font-black">
                    {index + 1}
                  </span>
                  {section.title}
                </h2>
                <div className="space-y-1">
                  {renderContent(section.content)}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
