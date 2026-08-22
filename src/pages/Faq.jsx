import SiteFooter from "../components/SiteFooter";
import { getPageSeo } from "../seo";

const seo = getPageSeo("faq");

export default function Faq() {
  return (
    <main className="alt-page">
      <article className="faq-page">
        <h1 className="faq-page__title">{seo.heading}</h1>
        <p className="faq-page__lede">
          Common questions about CUPI Cornell — Cornell Physical Intelligence —
          covering what Cornell CUPI builds, how its subteams work, and how to
          join or contact the team.
        </p>
        {seo.faqs.map((item) => (
          <section key={item.question}>
            <h2>{item.question}</h2>
            <p>{item.answer}</p>
          </section>
        ))}
        <p className="faq-page__links">
          <a href="/work/vq1-deterministic-policy/">Deterministic AI Grand Prix VQ1 Policy</a>
          {" · "}
          <a href="/work/racing-without-a-map/">Racing Without a Map</a>
        </p>
        <p className="faq-page__links">
          <a href="/work/">See CUPI projects</a>
          {" · "}
          <a href="/apply/">Apply to Cornell CUPI</a>
          {" · "}
          <a href="/about-cupi/">About CUPI Cornell</a>
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
