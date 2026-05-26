// FAQ content for the "Shadow AI in audit workflows" article (B001). Single
// source for both the visible FAQ accordion (page.tsx) and the FAQPage JSON-LD,
// so the structured data always matches the on-page text — required by Google,
// and strong for answer-engine citation (GEO). Created 2026-05-25.

export type Faq = { q: string; a: string };

export const shadowAiFaqs: Faq[] = [
  {
    q: "What is Shadow AI in audit workflows?",
    a: "Shadow AI refers to the informal use of AI tools by auditors without formal approval from the firm. In audit, this may include using tools such as ChatGPT, Claude, Copilot, or Gemini to support drafting, summarising, reviewing text, or exploring data.",
  },
  {
    q: "How are auditors using AI tools unofficially?",
    a: "Auditors may use AI tools to summarise client information, improve audit documentation, prepare first drafts, explain technical topics, or support repetitive tasks that take time during an engagement.",
  },
  {
    q: "What are the risks of using AI in auditing?",
    a: "The main risks include client confidentiality, data security, inaccurate outputs, lack of audit trail, unclear review responsibility, and potential compliance concerns if AI is used outside approved firm workflows.",
  },
  {
    q: "How can firms safely integrate AI into audits?",
    a: "Audit firms can start by understanding how AI is already being used, creating clear guidance, defining what data can and cannot be entered into AI tools, training staff, and introducing secure, reviewable AI workflows.",
  },
  {
    q: "Why is client confidentiality important in AI use?",
    a: "Audit work often includes sensitive financial and commercial information. Firms need to make sure client data is protected, handled securely, and not entered into tools that have not been approved or reviewed.",
  },
];
