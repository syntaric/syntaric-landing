# Home page content inventory and draft copy

Status: **draft for owner review** (redesign item 24, decision E3).
Not published: `docs/` is excluded by `_config.yml`.

This file does three jobs:

1.  **Inventory.** Every content item on today's `index.html` (commit
    `08812ed`), and where it goes in the new page, or why it is dropped.
    Goal 4 is checked against this table: every row not marked *dropped*
    must be findable on the new page.
2.  **Draft copy.** The new page, section by section, in the plain voice:
    the ban list in brief 2.8 (no "seamless", "end-to-end", "leverage",
    "mission-critical", "from X to Y", rhetorical triplets, em-dashes as
    rhythm), modelled on the lines brief 4.6 names (the Epic, Cerner and
    HiX line, "fractional Chief Interoperability Officer", the Unio copy,
    the engagement duration tags).
3.  **Open facts.** The draft states no fact that is not on the site today.
    Every new fact is a literal `TODO-OWNER: …` marker. `npm run check`
    fails while any marker reaches a published page.

How to review: edit this file directly. Change any draft line, replace each
`TODO-OWNER` with the fact (or delete the line), and mark the inventory
rows you disagree with. Commit 0.5a (the peer-test mockups) needs the facts
in the first table of [Open facts](#open-facts); commit 0.6 needs the rest.

---

## 1. Inventory

Status: **kept** (same fact, maybe new wording), **merged** (combined with
another item), **moved**, **rewritten**, **replaced**, **dropped**.

### Head and structured data

| # | Today | New place | Status | Note |
|---|---|---|---|---|
| H1 | `<title>` "Syntaric \| Healthcare Interoperability Consulting" | `<title>` | rewritten | From the #2 positioning; see §2.1 |
| H2 | Meta and OG description "…architectures that scale — from regional networks to national infrastructure." | Meta and OG description | rewritten | "that scale", "from X to Y" (brief 2.8) |
| H3 | Organization JSON-LD: name, logo, address, email, telephone, founder | Organization JSON-LD | kept | `@id` unchanged |
| H4 | Organization `sameAs`: personal LinkedIn profile | Organization `sameAs` | kept, conditional | #2: must be a company page, or the profile labelled as the lead architect's |
| H5 | (none) | `SoftwareApplication` for openFHIR and Unio | new | Item 25 |

### Hero

| # | Today | New place | Status | Note |
|---|---|---|---|---|
| A1 | Pill label "Healthcare Interoperability Consulting" | H1 | merged | Pill labels are a tell (brief 2.8); the words move into the H1 |
| A2 | H1 "Connecting healthcare systems through *open standards*" | H1 | replaced | Vague (brief 4.2); coloured phrase is a tell. New H1 from #2 |
| A3 | Intro: hospitals, national health programs, health IT vendors; FHIR, openEHR, IHE | Who-for line | rewritten | #2 wording |
| A4 | Button "Collaborate" → `#engagements` | Button "Contact" → `#contact` | replaced | One primary job, hire Syntaric (#2, brief 5.1) |
| A5 | Button "Explore our products" → `#products` | Text link "openFHIR and Unio" → `#products` | rewritten | Visibly secondary (brief 4.4) |
| A6 | "Trusted by teams at" marquee: 16 names, duplicated for the loop | Selected work, client list (D3) | moved | Marquee is a tell and low-contrast (brief 5.2); one client list (brief 5.4) |

### Stats strip

| # | Today | New place | Status | Note |
|---|---|---|---|---|
| B1 | "10+ Years of experience" | Proof line or Selected work | rewritten | Round "10+" is a tell; exact figure needed (#16) |
| B2 | "20+ Major projects delivered" | Proof line or Selected work | rewritten | Exact figure needed (#16) |
| B3 | "openEHR SEC Expert Member" | Proof line (C1) | moved | Expanded: openEHR Specification Editorial Committee; membership date needed (#16) |
| B4 | "IHE Certified Professional" | Selected work, credentials line (D4) | moved | |
| B5 | "EU & US International reach" | Selected work, credentials line (D4) | rewritten | Name the countries (#16) |

### Services (`#services`) and engagements (`#engagements`)

Brief 5.5: the 6 services and 5 engagements describe the same work twice.
They merge into one list, "What you can hire us for" (§2.4).

| # | Today | New place | Status | Note |
|---|---|---|---|---|
| C1 | Section tag "What we do", heading "End-to-end interoperability services", sub "From architecture design to implementation and training — …" | Section heading "What you can hire us for" | replaced | "End-to-end", "from X to Y" |
| C2 | Service: FHIR Consulting (R4/R5 architectures and APIs; "leverage the full power…") | Hire item 2, Project consulting | merged | "leverage" dropped |
| C3 | Service: openEHR Integration (co-existence of openEHR and FHIR through FHIR Connect) | Hire item 2; FHIR Connect expanded in Products | merged | FHIR Connect explained on first use (brief 4.8) |
| C4 | Service: Enterprise Architecture ("scalable, interoperable … built for the long term") | Hire item 1, Architecture review | merged | Triplet-style claim dropped |
| C5 | Service: System Integration: Epic, Cerner Millennium, ChipSoft HiX | Hire item 2 (named systems kept) | merged | Model line (brief 4.6) |
| C6 | Service: IHE Compliance: XDS, MPI, XDW, ATNA, QEDm, SMART on FHIR | Hire item 2 and 5, IHE profile list | rewritten | SMART on FHIR is not an IHE profile; MPI becomes the owner's PIX/PDQ list (brief 4.7, #16) |
| C7 | Service: Training & Education | Hire item 4, Training and workshops | merged | |
| C8 | Section tag "Engagements", heading "Ways to work with us", sub "…from a focused review to a long-term partnership." | Formats sub-list `id="engagements"` | rewritten | "from X to Y" |
| C9 | 01 Architecture Review: fixed scope, 1–2 weeks; report, standards check, 1 Q&A | Hire item 1 | kept | Numbering dropped (tier tell) |
| C10 | 02 Project Consulting: time and materials, weeks to months | Hire item 2 | kept | |
| C11 | 03 Strategic Advisory: retainer, ongoing; "fractional Chief Interoperability Officer"; "Most popular" badge | Hire item 3 | kept | Badge dropped (brief 2.8); model line kept |
| C12 | 04 Training & Workshops: fixed scope, half-day to 2 days; remote or on-site | Hire item 4 | kept | |
| C13 | 05 Software Development: time and materials, ongoing or fixed; Java / Jakarta EE / Spring, .NET, Go | Hire item 5 | kept | IHE list corrected as C6 |
| C14 | Note "Get in touch to discuss what fits best." (mailto) | Contact section | merged | |

### Track record (`#expertise`)

| # | Today | New place | Status | Note |
|---|---|---|---|---|
| D1 | Tag "Track record", heading "Experience across leading healthcare organizations", sub "Over a decade of delivering mission-critical…" | Heading "Selected work" | replaced | "mission-critical"; nav label and heading now match (brief 5.8) |
| D2 | (none) | 2-3 case studies | new | Owner input #8 |
| D3 | Six check-mark groups: university hospitals, national programmes, NHS trusts, regional network, specialised clinics, vendor integrations | Client list `id="collaborators"`, grouped hospitals / national programmes / vendors | merged | One list with the marquee (A6) and collaborators (E2-E10); brief 5.4 |
| D4 | (none) | Credentials line: IHE certified, openEHR SEC, countries | new | Carries B3-B5 |
| D5 | "Standards-Based Architecture" label and `images/architecture.svg` | Mapping excerpt (4 FHIR → openEHR path pairs) with caption | replaced | Generic boxes, off-palette, SMIL dots (brief 2.10) |

### Products (`#products`, `#openfhir`, `#unio`)

| # | Today | New place | Status | Note |
|---|---|---|---|---|
| P1 | `#products` wrapper with no heading | Products section with an `<h2>` | rewritten | Brief 5.6 |
| P2 | (none) | One sentence: a consultancy that also builds two products, with licences | new | Brief 4.4; licences are owner input #10 |
| P3 | openFHIR tag "Our Product", heading "openFHIR: Bridging openEHR and FHIR" | openFHIR block heading | rewritten | |
| P4 | openFHIR description "…seamless bidirectional interoperability…"; "co-creators of the FHIR Connect specification and founders of openFHIR" | Outcome sentence; FHIR Connect line | rewritten | "seamless" dropped; claims kept |
| P5 | openFHIR feature list (5 bullets: bidirectional mapping, REST and queues, Docker, Atlas, FHIR Connect) | open-fhir.com | dropped | Feature lists stay on the product site (brief 5.6) |
| P6 | `images/openfhir-img.png` | (none) | dropped | Base64 noise, trademark tiles (item 25) |
| P7 | "Explore openFHIR" → open-fhir.com | Link out | kept | |
| P8 | Unio screenshot `images/unio-img.png` with alt text | Unio block, in a navy-tint frame | kept | Re-encoded in 0.7 |
| P9 | Unio tag, heading "One patient record across all your openEHR repositories", description | Outcome sentence | rewritten | Kept close: it is a model line (brief 4.6) |
| P10 | Unio feature list (5 bullets) | unio.syntaric.com | dropped | Brief 5.6 |
| P11 | "Explore Unio" → unio.syntaric.com | Link out | kept | |

### Collaborators (`#collaborators`)

| # | Today | New place | Status | Note |
|---|---|---|---|---|
| E1 | Tag "Collaborations", heading "Companies we've worked with", sub | (none: the client list in Selected work carries `id="collaborators"`) | merged | |
| E2 | Firely, logo, description, link | Client list, vendors | merged | Description is the company's own marketing: dropped (brief 5.4); logo dropped (E4) |
| E3 | Open Line | Client list, vendors | merged | `http://` logo hotlink gone |
| E4 | Open Line Vitaly (previously Parsek) | Client list, vendors | merged | |
| E5 | Tactuum | Client list, vendors | merged | |
| E6 | Stichting NUTS | Client list, national programmes | merged | Owner to confirm the group |
| E7 | VWS, Dutch Ministry of Health, link to `wvs.nl` | Client list, national programmes | merged | The list has no links, so the wrong `wvs.nl` link goes away |
| E8 | Petrol Pay | (none) | **dropped, owner to confirm** | Not healthcare (brief 5.4); inclusion rules are owner input #11 |
| E9 | Medblocks | Client list, vendors | merged | |
| E10 | HTEC | Client list, vendors | merged | |

### Contact (`#contact`)

| # | Today | New place | Status | Note |
|---|---|---|---|---|
| F1 | Tag "Get in touch", heading "Let's build better healthcare IT together" | Contact heading | rewritten | Brief 4.6 |
| F2 | "Whether you're starting… or want to explore openFHIR — we'd love to hear from you." | Contact sentence naming openFHIR and Unio | rewritten | Brief 5.1: Unio was missing |
| F3 | Button "Send us an email" (mailto) | Email row | merged | The email link is the first row |
| F4 | Email info@syntaric.com | Contact | kept | |
| F5 | Phone +386 41 551 431 | Contact | kept | |
| F6 | LinkedIn: personal profile, "Gasper Andrejc" | Contact | kept, conditional | #2 condition, as H4 |
| F7 | Location: Parižlje 117, 3314 Braslovče, Slovenia | Contact | kept | |
| F8 | (none) | Reply-time sentence | new | Owner input #16 |

### Elsewhere

| # | Today | New place | Status | Note |
|---|---|---|---|---|
| G1 | (none) | Recent writing and talks `id="writing"`: 3 newest posts, generated | new | Brief 5.3 |
| G2 | Blog index label "Insights & Research", heading "Thoughts on healthcare interoperability", description (`build.js`) | Blog index heading and description | rewritten | Commit 0.5, §2.8 |
| G3 | (none) | End-of-post block (`partials/post-contact.html`) | new | Commit 0.5, §2.9 |

---

## 2. Draft copy

Section order is decisions #8-#11. Lines in *italics* are notes, not copy.

### 2.1 Head

*   **Title:** Syntaric | Healthcare interoperability consultancy
*   **Description (meta and Open Graph):** Syntaric designs, reviews and
    builds data integration for hospitals, national health programmes and
    health IT vendors, using FHIR, openEHR and IHE.

### 2.2 Hero

*Settled under #2; listed for completeness.*

*   **H1:** Boutique healthcare interoperability consultancy
*   **Who-for line:** A small team that designs, reviews and builds data
    integration for hospitals, national health programmes and health IT
    vendors. We also make two products, openFHIR and Unio.
*   **Primary button:** Contact
*   **Secondary link:** openFHIR and Unio

### 2.3 Proof line

*One concrete proof and one named outcome, within the first two phone
screens (brief 5.2). Draft structure; the facts are yours.*

> Member of the openEHR Specification Editorial Committee since 2026.
> TODO-OWNER: one named outcome, e.g. "[client] [result] after [what Syntaric did]".

### 2.4 What you can hire us for (`#services`)

*Item names (owner input #9): the working titles below, confirmed by the
owner on 2026-11-04.*

**Heading:** What you can hire us for

1.  **Architecture review**
    *   *For:* teams with an integration architecture in place or on paper.
    *   *Format:* fixed scope.
    *   *Length:* 1–2 weeks.
    *   *You receive:* a written report of findings, gaps and prioritised
        recommendations, a check against FHIR, IHE and openEHR, and one
        follow-up question session.
2.  **Project consulting**
    *   *For:* a team running a FHIR, openEHR or IHE integration project,
        including integrations with Epic, Cerner Millennium and ChipSoft
        HiX.
    *   *Format:* time and materials; we work inside your team.
    *   *Length:* weeks to months.
    *   *You receive:* design and implementation support, architecture
        documentation and regular check-ins with your team.
3.  **Strategic advisory**
    *   *For:* organisations that want an interoperability expert on call.
    *   *Format:* retainer. Think of it as a fractional Chief
        Interoperability Officer.
    *   *Length:* ongoing.
    *   *You receive:* an async support channel, a monthly strategy and
        roadmap session, priority answers to urgent questions and a
        quarterly architecture review.
4.  **Training and workshops**
    *   *For:* health IT teams, new to the standards or experienced.
    *   *Format:* fixed scope, remote or on site.
    *   *Length:* half a day to 2 days.
    *   *You receive:* FHIR fundamentals or advanced implementation,
        openEHR archetypes and templates, IHE profiles in practice, or a
        curriculum built for your team.
5.  **Software development**
    *   *For:* when you need it built, not only designed.
    *   *Format:* time and materials or fixed scope.
    *   *Length:* ongoing or fixed.
    *   *You receive:* FHIR layers and APIs, openEHR–FHIR transformation,
        IHE profile implementations (XDS, XDW, ATNA, QEDm, PIX, PDQ,
        PIXm and PDQm), connectors to Epic,
        Cerner and HiX. Built in Java (Jakarta EE, Spring), .NET or Go.

**Engagement formats** (`id="engagements"`): fixed scope · time and
materials · retainer.

### 2.5 Selected work (`#expertise`)

**Heading:** Selected work

**Case studies** (owner input #8; 2-3, cleared for public use):

> TODO-OWNER: case study 1. Client, problem, what Syntaric did, result.
>
> TODO-OWNER: case study 2.
>
> TODO-OWNER: case study 3 (optional).

**Credentials line:**

> IHE certified professional. Member of the openEHR Specification Editorial
> Committee since 2026. Work in TODO-OWNER: countries.

*Today's "10+ years" and "20+ projects" become exact figures if you want
them shown: TODO-OWNER: years, number of projects, or drop.*

**Clients** (`id="collaborators"`). *Inclusion rules, naming permission,
one line per entry and "as partner" flags are owner input #11. Grouping
below is from today's three lists; each line needs what Syntaric did.*

*   **Hospitals:** Maastricht UMC+, UMC Utrecht, Landspítali, Maastro
    Clinic, TODO-OWNER: "Oncology Institute" (full name), EPUT, West
    Suffolk Hospital, LPRES.
*   **National and regional programmes:** VWS (Dutch Ministry of Health),
    VECOZO, NJII, RSO Zuid-Limburg, Stichting NUTS.
*   **Vendors:** Firely, Open Line, Open Line Vitaly, Tactuum, Medblocks,
    HTEC, freshehr, SRC Infonet, CumuluZ, Enovation, InterSystems, Tiani,
    Philips.
*   TODO-OWNER: for each name, one line on what Syntaric did, permission to
    name it, and whether it is a client or a partner.

*Expand the Dutch acronyms for a non-Dutch reader (brief 5.4):*
TODO-OWNER: one-line description for VECOZO, NJII, RSO Zuid-Limburg,
LPRES, CumuluZ.

**Mapping excerpt** (until commit 1.5):

| FHIR (AllergyIntolerance) | openEHR (adverse reaction risk) |
|---|---|
| *4 pairs from `eps.adverse_reaction_risk.v2.yml:21-42`, expanded* | |

> Caption: The same allergy record, as sent over FHIR and as stored in
> openEHR.

### 2.6 Products (`#products`)

**Heading:** Two products from our consulting work

> Syntaric is a consultancy. We also build two products, openFHIR and Unio.
> TODO-OWNER: licence of openFHIR. TODO-OWNER: licence of Unio.

**openFHIR** (`#openfhir`)

> openFHIR maps data between openEHR and FHIR in both directions, so an
> openEHR repository can exchange data with FHIR systems. It implements
> FHIR Connect, an open specification for describing openEHR–FHIR
> mappings, which we co-created.
>
> Evidence: TODO-OWNER: one line (where it runs, or who uses it).
>
> Link: open-fhir.com

**Unio** (`#unio`)

> Unio makes several openEHR repositories answer as one. An application
> queries one openEHR endpoint and gets a patient's records from every
> member repository, while each record stays where it was created.
>
> Evidence: TODO-OWNER: one line.
>
> Link: unio.syntaric.com
>
> Screenshot alt text (kept): Unio operator console topology view: the
> gateway, the organisations it federates and the openEHR repository
> behind each, coloured by reachability.

### 2.7 Recent writing and talks (`#writing`)

**Heading:** Recent writing and talks

*The 3 newest posts, generated by the build (title, date, one line, cover).*

> Link below the list: All posts

### 2.8 Contact (`#contact`)

**Heading:** Talk to us about your project

> Write to us about an integration project, an architecture you want
> reviewed, or openFHIR and Unio. TODO-OWNER: reply time, e.g. "We reply
> within N working days."

*   Email: info@syntaric.com
*   Phone: +386 41 551 431
*   LinkedIn: TODO-OWNER: company page URL, or confirm the label "Gasper
    Andrejc, lead architect" for the personal profile (#2 condition).
*   Location: Parižlje 117, 3314 Braslovče, Slovenia

### 2.9 Blog pages (commit 0.5)

*   **Blog index heading:** Blog
*   **Blog index description:** Articles from our FHIR, openEHR and IHE
    projects, and notes from the events we take part in.
*   **End-of-post block** (`partials/post-contact.html`):
    > Syntaric is a small healthcare interoperability consultancy for
    > hospitals, national health programmes and health IT vendors. If you
    > are working on something similar, write to us.
    >
    > Links: Contact (`/#contact`) · Syntaric home (`/`)

---

## 3. Open facts

### Needed for commit 0.5a (peer-test mockups)

| Fact | Where | Decision |
|---|---|---|
| One named outcome (client, result, what Syntaric did) | Proof line | #8 |

### Needed for commit 0.6

| Fact | Where | Decision |
|---|---|---|
| 2-3 case studies cleared for public use | Selected work | #8 |
| Client list: inclusion rules, naming permission, one line each, partner flags; Petrol Pay in or out; full name of "Oncology Institute" | Selected work | #11 |
| One-line descriptions of VECOZO, NJII, RSO Zuid-Limburg, LPRES, CumuluZ | Selected work | brief 5.4 |
| Countries; exact years and project count, or drop them | Credentials line | #16 |
| Licence of openFHIR and of Unio | Products | #10 |
| One evidence line each for openFHIR and Unio | Products | #10 |
| Reply time | Contact | #16 |
| Company LinkedIn URL, or approval to label the personal profile | Contact, JSON-LD | #2 |
