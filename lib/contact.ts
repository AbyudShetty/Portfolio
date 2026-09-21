/**
 * contact — how to reach the person behind the field, in one place.
 *
 * The landing, the rail's console and anything else that offers a way out to
 * a person all read from here, so an address can never be right in one place
 * and stale in another.
 */

export const CONTACT = {
  name: "Abyud Somashekara Shetty",
  email: "abyudssetty2019@gmail.com",
  /** Printed form, and the dialable one. */
  phone: "+91 63620 92838",
  phoneHref: "tel:+916362092838",
  /** Served from public/; the general résumé, not tailored to a role. */
  resume: "/abyud-shetty-resume.pdf",
  github: "https://github.com/AbyudShetty",
  linkedin: "https://www.linkedin.com/in/abyud-somashekara-shetty-9051182ab/",
} as const;

export interface ProfileLink {
  label: string;
  href: string;
  /** Opens in a new tab: everything that leaves the page. */
  external?: boolean;
}

/** The short row under the name on the landing. */
export const PROFILE_LINKS: ProfileLink[] = [
  { label: "GitHub", href: CONTACT.github, external: true },
  { label: "LinkedIn", href: CONTACT.linkedin, external: true },
  { label: "Email", href: `mailto:${CONTACT.email}` },
  { label: "Résumé", href: CONTACT.resume, external: true },
];

/** Every way to reach him, as the console lists them. */
export const CONTACT_LINES: { label: string; value: string; href: string; external?: boolean }[] = [
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { label: "Phone", value: CONTACT.phone, href: CONTACT.phoneHref },
  { label: "Résumé", value: "PDF · one page", href: CONTACT.resume, external: true },
  { label: "GitHub", value: "github.com/AbyudShetty", href: CONTACT.github, external: true },
  {
    label: "LinkedIn",
    value: "in/abyud-somashekara-shetty",
    href: CONTACT.linkedin,
    external: true,
  },
];
