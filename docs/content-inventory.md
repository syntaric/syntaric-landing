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
| B1 | "10+ Years of experience" | (none) | dropped | Round "10+" is a tell; no exact figure supplied (§3, "Years, project count") |
| B2 | "20+ Major projects delivered" | (none) | dropped | No exact figure supplied (§3, "Years, project count") |
| B3 | "openEHR SEC Expert Member" | Proof line | moved | Expanded: openEHR Specifications Editorial Committee Experts Panel, since 2026 |
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
| P8 | Unio screenshot `images/unio-img.png` with alt text | (none since 1.5: the Unio figure takes its place) | replaced | Owner confirmed at the 1.5 review (2026-11-04); files deleted |
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

> Member of the openEHR Specifications Editorial Committee Experts Panel
> since 2026. We drafted the openEHR Federation specification with RSO
> Zuid-Limburg. The openEHR SEC approved version 1.0.0 in October 2026, and
> our gateway Unio implements it.

*Sources: blog posts "Joining the openEHR SEC Experts Panel" (2026-05-13),
"Federating openEHR CDRs" (2026-09-28) and "openEHR Federation Spec 1.0 is
Approved, and Unio is Out" (2026-10-19). The SEC role is the Experts Panel,
not the committee itself. Chosen by the owner on 2026-11-04.*

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

> IHE certified professional. Member of the openEHR Specifications Editorial
> Committee Experts Panel since 2026. Work in TODO-OWNER: countries.

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
| (none: all supplied on 2026-11-04) | | |

### Drafted for commit 0.6 (owner to verify)

On 2026-11-04 the owner asked the implementer to fill these in and to edit
the content later. Nothing below names a client result that is not already
published by Syntaric. Lines marked **invented** have no source and must be
checked before relying on them.

| Fact | As built on the page | Source |
|---|---|---|
| Case study 1 | RSO Zuid-Limburg: one query across a region's openEHR repositories; spec drafted with RSO Zuid-Limburg and the SEC, reference implementation, Unio; SEC approved 1.0.0 in October 2026 | Blog posts of 2026-09-28 and 2026-10-19 |
| Case study 2 | HL7 Converge & Collaborate, Dublin: the "Let's Build" session, FHIR facade on an openEHR repository with Firely Server and openFHIR | Blog post of 2026-05-13 |
| Case study 3 | eOverdracht proof of concept in a hybrid openEHR and FHIR architecture, with Dutch Generic Functions building blocks | Blog post of 2026-01-13 |
| Client list | Today's names, grouped; no per-entry lines; no "as partner" flags; Petrol Pay dropped (not healthcare); acronyms expanded only for VWS, NJII and RSO Zuid-Limburg | Today's page (marquee, track record, collaborators) |
| Countries | The Netherlands, the United Kingdom, Iceland, Slovenia and the United States | Where today's listed clients are based; Syntaric's own address |
| Years, project count | Dropped | |
| Licences | openFHIR: Apache 2.0, with a commercial Enterprise version. Unio: commercial | `openFHIR/openfhir` LICENSE and README; unio.syntaric.com offers "commercial information" |
| Evidence, openFHIR | The bridge in the Dublin "Let's Build" session and in the IPS webinar | Blog posts of 2026-05-13 and 2026-04-15 |
| Evidence, Unio | Implements the Federation Tier with AQL specification 1.0.0 | Blog post of 2026-10-19 |
| Reply time | "We reply within two working days." | **invented** |
| LinkedIn | The personal profile, labelled "Gasper Andrejc, lead architect"; in JSON-LD it moves from the company's `sameAs` to the founder's | #2 condition, option 2; the label wording is **invented** |
| Not expanded | LPRES, CumuluZ, "Oncology Institute" (shown as today) | Owner to supply full names or descriptions |

## 4. Plain-language copy (commit 2.0, approved by the owner 2026-11-04)

Plan: `docs/designs/plain-language-pass.md` (decisions P1-P5). Rules: the
first screen makes sense to someone who has never heard of FHIR or openEHR;
each block's first sentence says who it is for or what changes for them;
standard names, systems and profile lists follow in later sentences. No
fact from §1-§3 is removed; rows that change place are marked "moved
later". Applied in commits 2.1 (hero) and 2.5 (the rest).

### 4.1 Head

| Item | Today | Draft |
|---|---|---|
| `<title>` | "Syntaric \| Healthcare interoperability consultancy" | unchanged |
| Meta, OG and Twitter description | "Syntaric designs, reviews and builds data integration for hospitals, national health programmes and health IT vendors, using FHIR, openEHR and IHE." | "Syntaric helps hospitals, regions and national health programmes share patient information between their systems, using open standards such as FHIR, openEHR and IHE." |

### 4.2 Hero

| Item | Today | Draft |
|---|---|---|
| H1 | "Boutique healthcare interoperability consultancy" | unchanged (decision #2; passed the 5-second test). If run 3 names "interoperability" as an unknown word, the fallback is "Healthcare data consultancy" with the who-for line unchanged |
| Who-for line | "A small team that designs, reviews and builds data integration for hospitals, national health programmes and health IT vendors. We also make two products, openFHIR and Unio." | "We help hospitals, regions and national health programmes share patient information between their systems, using open standards. We also make two products, openFHIR and Unio." |
| Buttons | "Contact", "openFHIR and Unio" | unchanged |
| Caption | "The same allergy record, as sent over FHIR and as stored in openEHR." | "One allergy record, kept the same as it moves from the hospital to the GP." |
| Field label, upper strand | `AllergyIntolerance.code` | "Penicillin allergy, recorded at the hospital" |
| Field label, lower strand | `/data[at0001]/items[at0002]` | "The same allergy, in the GP's record" |
| Field label, small line | `openEHR-EHR-EVALUATION.adverse_reaction_risk.v2` | "Shared between their systems, nothing retyped" |

### 4.3 Proof line

> We sit on the expert panel that reviews new openEHR standards. With RSO
> Zuid-Limburg, a Dutch regional care network, we wrote the standard for
> joining up a region's patient records. It was approved in October 2026,
> and our product Unio is built on it.

Today: "Member of the openEHR Specifications Editorial Committee Experts
Panel since 2026. We drafted the openEHR Federation specification with RSO
Zuid-Limburg. The openEHR SEC approved version 1.0.0 in October 2026, and
our gateway Unio implements it." The full committee name and the version
move later (credentials line, Unio block).

### 4.4 What you can hire us for (`#services`)

The For / Format / Length / You receive table goes. Each item: heading;
**when** it fits; **what you get**; a last line with the technical detail;
a quiet line with the format and length.

**Architecture review**
When: You have an integration plan, on paper or already running, and want
an independent second opinion before you commit more to it.
You get: A written report on what works, what is missing and what to fix
first, and one follow-up session to go through it.
Detail: Checked against FHIR, IHE and openEHR.
Format: Fixed scope · 1-2 weeks

**Project consulting**
When: Your team is connecting systems, for example to Epic, Cerner
Millennium or ChipSoft HiX, and wants experienced people working alongside
it.
You get: Design and hands-on help inside your team, the architecture
written down, and regular check-ins.
Detail: FHIR, openEHR and IHE projects.
Format: Time and materials · weeks to months

**Strategic advisory**
When: You want an experienced person to call on whenever decisions about
health data come up. Think of it as a part-time, or fractional, Chief
Interoperability Officer.
You get: A direct line for questions, a monthly planning session, quick
answers when something is urgent, and a review of your architecture every
quarter.
Format: Retainer · ongoing

**Training and workshops**
When: Your people are new to the health data standards, or need to go
deeper.
You get: A session of half a day to two days, remote or on site, built
around your team's own work.
Detail: FHIR basics or advanced implementation, openEHR archetypes and
templates, IHE profiles in practice, or a curriculum built for your team.
Format: Fixed scope · half a day to 2 days

**Software development**
When: You need it built, not only designed.
You get: Working software that connects your systems: translation between
standards, links to hospital systems such as Epic, Cerner and HiX, and the
standard ways of exchanging documents and finding patients.
Detail: FHIR layers and APIs, openEHR-FHIR transformation, IHE profiles
(XDS, XDW, ATNA, QEDm, PIX, PDQ, PIXm and PDQm). Built in Java (Jakarta EE,
Spring), .NET or Go.
Format: Time and materials or fixed scope

Formats line (`id="engagements"`): "Ways to work with us: a fixed scope,
time and materials, or a retainer."

### 4.5 Selected work (`#expertise`)

**Case 1** (label "RSO Zuid-Limburg · 2026")
Title: "One view of a patient across a region's care providers"
> In Zuid-Limburg every care provider keeps its own patient records, on
> purpose. An application that needed a patient's full history had to ask
> each of them separately.
>
> With RSO Zuid-Limburg and the openEHR standards committee we wrote a
> specification for federating openEHR repositories, so they answer as
> one. We built an open reference implementation and our product Unio on
> it. **The specification was approved in October 2026.**

**Case 2** (label "HL7 Converge & Collaborate, Dublin · 2026")
Title: "Two health data standards working together, built live in a workshop"
> We ran the hands-on "Let's Build" session. In one afternoon, participants
> connected a patient record system to an international exchange
> standard: stored records came out as an international patient summary,
> and incoming data was stored in the record.
>
> The setup: an openEHR repository, Firely Server and openFHIR, returning a
> FHIR International Patient Summary.

"One afternoon" confirmed by the owner (2026-11-04).

**Case 3** (label "Proof of concept · 2026")
Title: "Nursing handover between care organisations, on open standards"
> When a patient moves from a hospital to a nursing home or home care, the
> nurses' handover has to go with them. In the Netherlands that handover
> follows a national standard, eOverdracht.
>
> We built a working proof of concept of eOverdracht on a hybrid openEHR
> and FHIR architecture, using the routing and care-services building
> blocks of the Dutch Generic Functions programme.

**Credentials line**
> We have worked with hospitals and health programmes in the Netherlands,
> the United Kingdom, Iceland, Slovenia and the United States. IHE
> certified professional; member of the openEHR Specifications Editorial
> Committee Experts Panel since 2026.

Client list: unchanged.

### 4.6 Products (`#products`)

Heading: "Two products from our consulting work" (unchanged).
Lead: "We are a consultancy first. Two products came out of our project
work." (Licences move to each product's last line.)

**openFHIR** (logo beside the heading)
> openFHIR translates patient records between the way one system stores
> them and the way another expects to receive them, in both directions.
>
> It maps between openEHR and FHIR and implements FHIR Connect, an open
> specification for describing these mappings, which we co-created. It was
> the bridge between openEHR and FHIR in the "Let's Build" session at HL7
> Converge & Collaborate, Dublin 2026, and in our International Patient
> Summary webinar.
>
> Open source (Apache 2.0), with a commercial Enterprise version.
> open-fhir.com

**Unio** (logo beside the heading)
> Unio lets an application see a patient's records from every care
> provider in a region as if they were in one place, while each record
> stays where it was created.
>
> It makes several openEHR repositories answer as one, and implements the
> openEHR Federation Tier with AQL specification, version 1.0.0, approved
> by the openEHR SEC in October 2026.
>
> Commercial. unio.syntaric.com

Unio screenshot alt: "Unio console: the gateway and the care providers it
connects, each coloured by whether it answers."

If the gate in 2.4 keeps the figures, their plain labels and captions:

| Figure | Labels | Caption |
|---|---|---|
| openFHIR | Rows "What the allergy is", "Is it still active?", "Has it been confirmed?", "How serious is it?"; heads "As one system sends it", "As the patient record stores it" | "One allergy record, field by field, as one system sends it and as the patient record stores it." |
| Unio | "Find this patient's allergies"; "Hospital A, 3 records"; "Hospital B, 2 records"; "GP practice, not answering"; "5 records, marked incomplete" | "One question reaches three care providers. One does not answer, so the result is marked incomplete." |

### 4.7 Recent writing and talks (`#writing`)

Unchanged: the three newest posts, with their own titles and excerpts. The
posts are for technical readers, and the jargon check exempts this list.
Owner option: show three plainer posts instead of the newest.

### 4.8 Contact (`#contact`)

Heading unchanged. Lead:
> Write to us about a project that needs systems to share data, a plan you
> want a second opinion on, or openFHIR and Unio. We reply within two
> working days.
