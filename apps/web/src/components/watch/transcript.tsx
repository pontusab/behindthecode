import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@btc/ui/components/accordion";
import { FileText } from "lucide-react";

export function Transcript({ text }: { text: string }) {
  if (!text) return null;
  return (
    <Accordion type="single" collapsible className="glass rounded-xl px-4">
      <AccordionItem value="transcript" className="border-none">
        <AccordionTrigger className="hover:no-underline">
          <span className="flex items-center gap-2 text-sm font-medium">
            <FileText className="size-4" /> Transcript
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <p className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {text}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
