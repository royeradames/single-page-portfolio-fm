import { ContactForm } from "./contact-form";
import { siteName, siteUrl } from "./site";
import { SocialLinks } from "./social-links";

const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl };

const skills = [
  { name: "HTML", years: 4 },
  { name: "CSS", years: 4 },
  { name: "JavaScript", years: 4 },
  { name: "Accessibility", years: 4 },
  { name: "React", years: 3 },
  { name: "Sass", years: 3 },
] as const;

const projects = [
  { number: 1, title: "Design portfolio", tags: ["HTML", "CSS"] },
  { number: 2, title: "E-learning landing page", tags: ["HTML", "CSS"] },
  { number: 3, title: "Todo web app", tags: ["HTML", "CSS", "JavaScript"] },
  { number: 4, title: "Entertainment web app", tags: ["HTML", "CSS", "JavaScript"] },
  { number: 5, title: "Memory game", tags: ["HTML", "CSS", "JavaScript"] },
  { number: 6, title: "Art gallery showcase", tags: ["HTML", "CSS", "JavaScript"] },
] as const;

// The supplied images are already exported at 2x for each frame, so they are served as-is.
/* eslint-disable @next/next/no-img-element */
function ProfilePhoto() {
  return (
    <picture className="hero-photo">
      <source media="(min-width: 75rem)" srcSet="/images/image-profile-desktop.webp" width={445} height={720} />
      <source media="(min-width: 48rem)" srcSet="/images/image-profile-tablet.webp" width={323} height={600} />
      <img
        src="/images/image-profile-mobile.webp"
        alt="Adam Keyes, smiling, in a grey T-shirt"
        width={174}
        height={383}
        fetchPriority="high"
      />
    </picture>
  );
}

function ProjectImage({ number, title }: { number: number; title: string }) {
  return (
    <img
      className="project-image"
      src={`/images/thumbnail-project-${number}-small.webp`}
      srcSet={`/images/thumbnail-project-${number}-small.webp 686w, /images/thumbnail-project-${number}-large.webp 1080w`}
      sizes="(min-width: 75rem) 540px, (min-width: 48rem) calc((100vw - 5.5rem) / 2), calc(100vw - 2rem)"
      alt={`${title} project preview`}
      width={343}
      height={253}
      loading="lazy"
    />
  );
}

function Rings({ className }: { className: string }) {
  return <span className={`rings ${className}`} aria-hidden="true" />;
}
/* eslint-enable @next/next/no-img-element */

export default function Home() {
  return (
    <div className="page">
      <script
        type="application/ld+json"
        // Static JSON from constants; "<" is escaped so the payload cannot close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="site-header container">
        <p className="logo">{siteName}</p>
        <SocialLinks label="Social profiles" />
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="container">
            <ProfilePhoto />
            <Rings className="hero-rings" />
            <span className="circle hero-circle" aria-hidden="true" />
            <div className="hero-copy">
              <h1 id="hero-title">
                Nice to<br className="break-tablet" /> meet you!<br className="break-greeting" /> I’m{" "}
                <span className="hero-name">Adam Keyes</span>.
              </h1>
              <p className="hero-intro">
                Based in the UK, I’m a front-end developer passionate about building accessible web apps that users love.
              </p>
              <a className="text-button" href="#contact">Contact me</a>
            </div>
          </div>
        </section>

        <section className="skills container" aria-labelledby="skills-title">
          <h2 className="sr-only" id="skills-title">Skills</h2>
          <Rings className="skills-rings" />
          <ul className="skill-list">
            {skills.map((skill) => (
              <li key={skill.name}>
                <h3>{skill.name}</h3>
                <p>{skill.years} Years Experience</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="projects container" aria-labelledby="projects-title">
          <div className="section-header">
            <h2 className="section-title" id="projects-title">Projects</h2>
            <a className="text-button" href="#contact">Contact me</a>
          </div>
          <ul className="project-list">
            {projects.map((project) => (
              <li key={project.number}>
                <article className="project" aria-labelledby={`project-${project.number}-title`}>
                  <ProjectImage number={project.number} title={project.title} />
                  <h3 id={`project-${project.number}-title`}>{project.title}</h3>
                  <ul className="project-tags" aria-label="Built with">
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                  <div className="project-links">
                    {/* The accessible names start with the visible text and add the project. */}
                    <a
                      className="text-button"
                      href={`/images/thumbnail-project-${project.number}-large.webp`}
                      aria-label={`View project: ${project.title}`}
                    >
                      View project
                    </a>
                    <a
                      className="text-button"
                      href={`https://github.com/search?q=${encodeURIComponent(`${project.title} frontend mentor`)}&type=repositories`}
                      aria-label={`View code: ${project.title} (GitHub search)`}
                    >
                      View code
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <div className="contact-band">
          <section className="contact container" id="contact" aria-labelledby="contact-title">
            <Rings className="contact-rings" />
            <div className="contact-intro">
              <h2 className="section-title" id="contact-title">Contact</h2>
              <p>
                I would love to hear about your project and how I could help. Please fill in the form, and I’ll get back to you as soon as possible.
              </p>
              <p className="demo-note" id="contact-demo-note">
                <strong>Demo form:</strong> nothing you enter is sent or stored.
              </p>
            </div>
            <ContactForm />
          </section>
        </div>
      </main>

      <footer className="contact-band-footer">
        <div className="site-footer container">
          <p className="logo">{siteName}</p>
          <SocialLinks label="Social profiles, footer" />
        </div>
      </footer>
    </div>
  );
}
