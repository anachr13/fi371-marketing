// Privacy Policy page for Fi371 — production-ready legal copy.
// Note: AI-drafted to industry standards; legal review recommended before launch.

import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Fi371",
  description:
    "How Fi371 collects, uses, stores, and protects your personal information. Your rights under GDPR and CCPA.",
};

const sectionH = "font-display text-[30px] leading-tight tracking-tight mb-4";
const subH = "text-[19px] font-semibold mt-6 mb-2";
const para = "text-[17px] text-muted-foreground leading-relaxed mb-4";
const bullet = "text-[17px] text-muted-foreground leading-relaxed list-disc pl-6 space-y-2 mb-4";
const link = "text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors";

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate="7 May 2026"
      intro={
        <p>
          This Privacy Policy explains how Fi371 (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, shares, and protects your personal information when you visit our website at fi371.com or interact with us. We are committed to handling your data lawfully, transparently, and only as described here.
        </p>
      }
    >
      <section>
        <h2 className={sectionH}>1. Who we are</h2>
        <p className={para}>
          Fi371 is the data controller for personal data collected through our marketing website. If you have any questions about this policy or wish to exercise your rights, you can reach us at{" "}
          <a href="mailto:anastasiades.chr@gmail.com" className={link}>anastasiades.chr@gmail.com</a>.
        </p>
        <p className={para}>
          Given our size, we are not required to appoint a Data Protection Officer. The email above is the single point of contact for all privacy enquiries.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>2. Information we collect</h2>
        <h3 className={subH}>Information you give us</h3>
        <p className={para}>
          When you book a demo or otherwise contact us, we collect the information you provide on the form, which typically includes your full name, work email address, firm or company name, and firm size. You may also include additional details in a free-text field.
        </p>
        <h3 className={subH}>Information collected automatically</h3>
        <p className={para}>
          When you visit our website, we automatically collect limited technical information, including your IP address, browser type and version, device type and operating system, the pages you view, the date and time of your visit, and the referring URL. We use this for security, fraud prevention, and aggregate analytics.
        </p>
        <h3 className={subH}>Cookies and similar technologies</h3>
        <p className={para}>
          We use a small number of cookies and similar technologies. See section 5 for details and your choices.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>3. How we use your information</h2>
        <ul className={bullet}>
          <li><strong className="text-foreground">To respond to demo and contact requests</strong> — to schedule, confirm, and follow up on demos you have requested.</li>
          <li><strong className="text-foreground">To communicate with you</strong> — to send you operational messages relating to your enquiry, and (only with your consent) marketing updates that you can unsubscribe from at any time.</li>
          <li><strong className="text-foreground">To improve our website and product</strong> — to understand how visitors use our marketing site and to improve content, performance, and user experience.</li>
          <li><strong className="text-foreground">To keep our service secure</strong> — to detect and prevent abuse, fraud, and unauthorised access.</li>
          <li><strong className="text-foreground">To comply with legal obligations</strong> — to meet record-keeping, tax, and other legal requirements that apply to us.</li>
        </ul>
      </section>

      <section>
        <h2 className={sectionH}>4. Legal basis for processing (UK and EEA users)</h2>
        <p className={para}>
          Where the UK GDPR or EU GDPR applies to our processing of your personal data, we rely on the following lawful bases:
        </p>
        <ul className={bullet}>
          <li><strong className="text-foreground">Contract (Article 6(1)(b))</strong> — to take steps at your request before entering a contract, such as responding to a demo enquiry.</li>
          <li><strong className="text-foreground">Legitimate interests (Article 6(1)(f))</strong> — to operate, secure, and improve our website and analytics, where our interests are not overridden by your rights.</li>
          <li><strong className="text-foreground">Consent (Article 6(1)(a))</strong> — for non-essential cookies and marketing email, where we ask for your permission and you can withdraw it at any time.</li>
          <li><strong className="text-foreground">Legal obligation (Article 6(1)(c))</strong> — where we must process data to comply with a law that applies to us.</li>
        </ul>
      </section>

      <section>
        <h2 className={sectionH}>5. Cookies and similar technologies</h2>
        <p className={para}>
          We use two categories of cookies:
        </p>
        <ul className={bullet}>
          <li><strong className="text-foreground">Strictly necessary cookies</strong> — required for the site to function (for example, to remember your session or load-balancing preferences). These cannot be turned off.</li>
          <li><strong className="text-foreground">Analytics cookies</strong> — help us understand how visitors use the site so we can improve it. These are only set with your consent where consent is required by law.</li>
        </ul>
        <p className={para}>
          You can control cookies through your browser settings: most browsers let you block or delete cookies. Blocking strictly necessary cookies may break parts of the site.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>6. Sharing your information</h2>
        <p className={para}>
          We do not sell your personal data. We share it only in these limited circumstances:
        </p>
        <ul className={bullet}>
          <li><strong className="text-foreground">Service providers</strong> — trusted third parties that help us run our website and respond to enquiries (for example, our hosting, email delivery, and analytics providers). They process data only on our instructions and under written contracts.</li>
          <li><strong className="text-foreground">Legal compliance</strong> — where we are required to disclose information to comply with a law, court order, or other legal obligation.</li>
          <li><strong className="text-foreground">Business transfers</strong> — if Fi371 is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will give you notice and a chance to make choices about your data where required by law.</li>
          <li><strong className="text-foreground">With your consent</strong> — where you have explicitly asked or agreed to share information with a specific third party.</li>
        </ul>
      </section>

      <section>
        <h2 className={sectionH}>7. International data transfers</h2>
        <p className={para}>
          Some of our service providers operate outside the UK and the European Economic Area (EEA). Where we transfer personal data outside these regions, we put in place appropriate safeguards, such as the European Commission&apos;s Standard Contractual Clauses (SCCs) and the UK International Data Transfer Addendum, to ensure your data receives an equivalent level of protection.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>8. How long we keep your information</h2>
        <p className={para}>
          We retain personal data only for as long as needed for the purposes described in this policy, or as required by law:
        </p>
        <ul className={bullet}>
          <li>Demo and contact requests are typically retained for up to 24 months from your last interaction with us, after which they are deleted or anonymised, unless you become a customer or we have a legal reason to keep them longer.</li>
          <li>Aggregated analytics data, which does not identify you, may be retained indefinitely.</li>
        </ul>
      </section>

      <section>
        <h2 className={sectionH}>9. Your rights (UK and EEA users)</h2>
        <p className={para}>
          If the UK GDPR or EU GDPR applies to you, you have the following rights in relation to your personal data:
        </p>
        <ul className={bullet}>
          <li>The right to access the personal data we hold about you.</li>
          <li>The right to rectification of inaccurate or incomplete data.</li>
          <li>The right to erasure (the &ldquo;right to be forgotten&rdquo;) in certain circumstances.</li>
          <li>The right to restrict processing in certain circumstances.</li>
          <li>The right to data portability — to receive your data in a structured, commonly used, machine-readable format.</li>
          <li>The right to object to processing based on our legitimate interests, including direct marketing.</li>
          <li>The right to withdraw consent at any time, where we rely on consent.</li>
          <li>The right to lodge a complaint with a supervisory authority — in the UK, the Information Commissioner&apos;s Office (<a href="https://ico.org.uk" className={link}>ico.org.uk</a>); in the EEA, your local Data Protection Authority.</li>
        </ul>
        <p className={para}>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:anastasiades.chr@gmail.com" className={link}>anastasiades.chr@gmail.com</a>. We will respond within one month.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>10. Your rights (California users)</h2>
        <p className={para}>
          If you are a California resident, the California Consumer Privacy Act (CCPA), as amended by the CPRA, gives you additional rights, including:
        </p>
        <ul className={bullet}>
          <li>The right to know what personal information we collect, use, share, and (where applicable) sell.</li>
          <li>The right to delete personal information we have collected from you.</li>
          <li>The right to correct inaccurate personal information.</li>
          <li>The right to opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information. We do not sell personal information, and we do not share it for cross-context behavioural advertising.</li>
          <li>The right not to be discriminated against for exercising your privacy rights.</li>
        </ul>
        <p className={para}>
          To exercise these rights, email us at{" "}
          <a href="mailto:anastasiades.chr@gmail.com" className={link}>anastasiades.chr@gmail.com</a>.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>11. How we keep your information secure</h2>
        <p className={para}>
          We use appropriate technical and organisational measures to protect personal data, including encryption of data in transit (HTTPS), access controls, secure hosting, and regular review of our practices. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security, but we work to protect your information using industry-standard practices.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>12. Children&apos;s privacy</h2>
        <p className={para}>
          Our website and product are intended for business users and are not directed to children under 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us and we will delete it.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>13. Changes to this policy</h2>
        <p className={para}>
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. The &ldquo;Effective&rdquo; date at the top of this page shows when it was last updated. For material changes, we will take reasonable steps to notify you in advance.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>14. Contact us</h2>
        <p className={para}>
          If you have any questions, concerns, or complaints about this policy or how we handle your data, please contact us at{" "}
          <a href="mailto:anastasiades.chr@gmail.com" className={link}>anastasiades.chr@gmail.com</a>. A postal address is available on request.
        </p>
      </section>
    </LegalPage>
  );
}
