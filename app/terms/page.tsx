// Terms of Service page for Fi371 — production-ready legal copy.
// Note: AI-drafted to industry standards; legal review recommended before launch.

import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Fi371",
  description:
    "The terms governing your use of the Fi371 website. Acceptable use, intellectual property, disclaimers, and governing law.",
};

const sectionH = "font-display text-[30px] leading-tight tracking-tight mb-4";
const para = "text-[17px] text-muted-foreground leading-relaxed mb-4";
const bullet = "text-[17px] text-muted-foreground leading-relaxed list-disc pl-6 space-y-2 mb-4";
const link = "text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors";

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      effectiveDate="7 May 2026"
      intro={
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Fi371 website at fi371.com. By using the site, you agree to these Terms. If you do not agree, please do not use the site.
        </p>
      }
    >
      <section>
        <h2 className={sectionH}>1. About us</h2>
        <p className={para}>
          The website is operated by Fi371 (&ldquo;Fi371&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). You can contact us at{" "}
          <a href="mailto:anastasiades.chr@gmail.com" className={link}>anastasiades.chr@gmail.com</a>.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>2. Acceptance of these terms</h2>
        <p className={para}>
          By visiting the site, submitting a demo request, or otherwise interacting with us through the site, you confirm that you accept these Terms and agree to comply with them. If you are using the site on behalf of an organisation, you confirm that you have authority to bind that organisation, and &ldquo;you&rdquo; in these Terms refers to both you and that organisation.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>3. Eligibility</h2>
        <p className={para}>
          You must be at least 16 years old to use the site. The site and our product are intended for professional and business users; they are not directed to children.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>4. The service</h2>
        <p className={para}>
          The site provides information about Fi371 and lets you request a product demo. The site is informational only and does not, by itself, give you access to our paid product. Use of the paid product is governed by a separate agreement that you will enter into when you become a customer.
        </p>
        <p className={para}>
          We may modify, suspend, or discontinue any part of the site at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the site.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>5. Acceptable use</h2>
        <p className={para}>
          When using the site, you agree not to:
        </p>
        <ul className={bullet}>
          <li>Use the site for any unlawful purpose or in breach of any applicable law or regulation.</li>
          <li>Interfere with, damage, or disrupt the site, our infrastructure, or the experience of other users.</li>
          <li>Attempt to gain unauthorised access to any part of the site, related systems, or accounts.</li>
          <li>Reverse engineer, decompile, or disassemble any part of the site, except to the extent expressly permitted by law.</li>
          <li>Scrape, crawl, harvest, or otherwise extract data from the site by automated means without our prior written permission.</li>
          <li>Submit false, misleading, infringing, or unlawful content through any form on the site, or impersonate any person or entity.</li>
          <li>Use the site to send unsolicited marketing or other communications (spam).</li>
        </ul>
      </section>

      <section>
        <h2 className={sectionH}>6. Intellectual property</h2>
        <p className={para}>
          The site and all content, features, and functionality on it (including text, graphics, logos, icons, images, software, and the &ldquo;Fi371&rdquo; name and brand) are owned by Fi371 or our licensors and are protected by copyright, trademark, and other intellectual property laws.
        </p>
        <p className={para}>
          We grant you a limited, non-exclusive, non-transferable, revocable licence to access and view the site for your personal or internal business use. All other rights are reserved. You must not copy, modify, distribute, sell, lease, or create derivative works of the site or its content without our prior written permission.
        </p>
        <p className={para}>
          If you submit any content to us through the site (for example, in a free-text field on a form), you grant us a non-exclusive, worldwide, royalty-free licence to use, store, and process that content as necessary to operate the site and respond to your enquiry, in line with our Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>7. Third-party links and services</h2>
        <p className={para}>
          The site may contain links to websites or services operated by third parties. We do not control those websites and are not responsible for their content, practices, or privacy policies. Following a link is at your own risk; please review the third party&apos;s terms and policies.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>8. No professional advice</h2>
        <p className={para}>
          Information on the site is provided for general information only and does not constitute professional advice (audit, accounting, tax, legal, regulatory, or otherwise). Do not rely on it as a substitute for advice from a qualified professional. We make no representation that information on the site is suitable for any specific purpose or jurisdiction.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>9. Disclaimers</h2>
        <p className={para}>
          To the fullest extent permitted by law, the site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, whether express or implied, including any implied warranties of merchantability, fitness for a particular purpose, accuracy, or non-infringement.
        </p>
        <p className={para}>
          We do not warrant that the site will be uninterrupted, error-free, secure, or free of viruses or other harmful components. Your use of the site is at your own risk.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>10. Limitation of liability</h2>
        <p className={para}>
          To the fullest extent permitted by law, Fi371, its directors, employees, and agents will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or any loss of profits, revenue, data, or goodwill, arising out of or in connection with your use of the site, even if we have been advised of the possibility of such damages.
        </p>
        <p className={para}>
          Our total aggregate liability to you for all claims arising out of or in connection with the site is limited to the greater of (a) the amount you have paid us in the 12 months before the event giving rise to the claim (which, for the marketing site, is typically zero), or (b) £100.
        </p>
        <p className={para}>
          Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law, including liability for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation, and any rights you may have as a consumer that cannot be waived under applicable law.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>11. Indemnification</h2>
        <p className={para}>
          You agree to indemnify and hold harmless Fi371 and its directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or related to (a) your breach of these Terms, (b) your misuse of the site, or (c) your violation of any law or the rights of any third party.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>12. Termination</h2>
        <p className={para}>
          We may suspend or terminate your access to the site at any time, with or without notice, if we reasonably believe you have breached these Terms or for any other lawful reason. Sections that by their nature should survive termination (including intellectual property, disclaimers, limitation of liability, indemnification, and governing law) will survive.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>13. Changes to these terms</h2>
        <p className={para}>
          We may update these Terms from time to time. The &ldquo;Effective&rdquo; date at the top of this page shows when they were last updated. Material changes will be communicated through the site or by email where reasonably practical. Continued use of the site after changes take effect means you accept the updated Terms.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>14. Governing law and jurisdiction</h2>
        <p className={para}>
          These Terms and any dispute or claim arising out of or in connection with them or the site (including non-contractual disputes or claims) are governed by the laws of England and Wales. The courts of England and Wales have non-exclusive jurisdiction to settle any such dispute or claim, except that consumers may bring proceedings in their country of residence where required by mandatory local law.
        </p>
      </section>

      <section>
        <h2 className={sectionH}>15. General</h2>
        <ul className={bullet}>
          <li><strong className="text-foreground">Severability.</strong> If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will continue in full force and effect.</li>
          <li><strong className="text-foreground">Entire agreement.</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Fi371 regarding the site and supersede any prior understandings on that subject.</li>
          <li><strong className="text-foreground">No waiver.</strong> Our failure to enforce any provision of these Terms will not be a waiver of that provision.</li>
          <li><strong className="text-foreground">Assignment.</strong> You may not assign these Terms without our prior written consent. We may assign them as part of a merger, acquisition, or sale of assets.</li>
        </ul>
      </section>

      <section>
        <h2 className={sectionH}>16. Contact</h2>
        <p className={para}>
          Questions about these Terms? Email us at{" "}
          <a href="mailto:anastasiades.chr@gmail.com" className={link}>anastasiades.chr@gmail.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}
