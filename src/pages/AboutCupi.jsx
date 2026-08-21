import SiteFooter from "../components/SiteFooter";
import { getPageSeo } from "../seo";

const seo = getPageSeo("aboutCupi");

export default function AboutCupi() {
  return (
    <main className="alt-page">
      <article className="about-cupi">
        <h1 className="about-cupi__title">{seo.heading}</h1>
        <p className="about-cupi__lede">
          CUPI Cornell, also called Cornell CUPI, is Cornell Physical Intelligence
          (CUPI): a Cornell University student robotics organization in Ithaca, New
          York. Cornell lists the group as the Cornell Physical Intelligence Club.
        </p>
        <p>
          The team builds physical systems that can reason and interact with their
          environments — robotic manipulation, autonomous perception, and navigation —
          so software intelligence and hardware are designed together. Physical
          intelligence, the field behind this work, is often called embodied AI:
          building robot systems that act in the physical world.
        </p>
        <section className="about-cupi__faq" aria-labelledby="about-cupi-faq">
          <h2 id="about-cupi-faq">CUPI Cornell FAQ</h2>
          {seo.faqs.map((item) => (
            <section key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}
        </section>
        <p className="about-cupi__links">
          <a href="/work/">See CUPI projects</a>
          {" · "}
          <a href="/apply/">Apply to Cornell CUPI</a>
          {" · "}
          <a href="/members/">Meet the team</a>
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
