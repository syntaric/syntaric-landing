---
title: Dutch Generic Functions and openEHR - Building Blocks for National Health Data Exchange
slug: dutch-generic-functions-openehr
image: ../../blog/dutch-generic-functions-openehr/img.png
description: A technical look at how the Dutch Ministry of Health's Generic Functions program works alongside openEHR for national health data exchange.
excerpt: The Dutch Ministry of Health (VWS) is building reusable national infrastructure called Generic Functions, covering addressing, routing, consent, identification, authentication, and authorization. Here's how they work, and more importantly, where openEHR fits into the picture.
tag: Architecture
author: Gasper Andrejc
authorRole: Healthcare Interoperability Architect
authorAssumingRole: Syntaric Consultant
authorBio: Healthcare Interoperability Architect & Consultant at Syntaric. 10+ years building FHIR, openEHR, and IHE solutions across Europe and the US.
authorLinkedIn: https://www.linkedin.com/in/andrejcgasper/
date: 2026-04-22
breadcrumb: Dutch Generic Functions & openEHR
topics: [ FHIR, openEHR, Netherlands, mCSD, IHE, Architecture, Generic Functions, VWS ]
publish: true
---

## What are Generic Functions?

If you work in Dutch health IT, you have probably heard the term _generieke functies_ thrown around in the last year or
two. If you haven't, here is the short version: the Ministry of Health, Welfare and Sport (VWS) is building a set of
reusable national building blocks for health data exchange.

The idea is that instead of every use case (eOverdracht, PZP, BgZ, ..) solving the same infrastructure
problems from scratch, a shared foundation handles them once. Those shared capabilities are the Generic Functions, and
they cover things like addressing, routing, localization, consent, identification, authentication, and authorization.

The specification is published here:
https://minvws.github.io/generiekefuncties-docs/

## What They Cover

At a high level, the seven functions carve up the interoperability problem like this:

**Addressing and Routing** handle the _where_ and _what_. A national Care Services Directory (built on IHE mCSD) lets
any system discover care providers, their services, and their digital endpoints. Routing builds on top of that to
select the right destination for a referral or order.

**Localization** (the Nationale Verwijs Index) answers the question "which organizations hold data about this patient?".
It does this through a dedicated **Pseudonymisation** function, which is a national Pseudonymisation Register Service (PRS) that
converts the BSN into recipient-scoped pseudonyms using HKDF and OPRF blinding, so no single party ever sees the raw
identifier. Different recipients receive different pseudonyms from the same BSN, preventing cross-service correlation.
The PRS itself stores nothing and every response is a single-use JWE encrypted to
the recipient's public key. The NVI therefore never exposes the raw patient identity, and neither does any intermediate
hop in the chain.

**Consent** unifies three models: national preference registry (Mitz/OTV), decentralized local consent storage
(DHTV), and implicit consent.

**Identification, Authentication, and Authorization** form the security stack. Identification standardizes which
identifier applies to which entity (BSN for patients, URA for organizations, UZI/DEZI for practitioners). Authentication
is built on W3C Decentralized Identifiers and Verifiable Credentials. Authorization uses policy-based access control
with Rego as the mandatory policy language.

## Infrastructure vs a Data Model

Generic Functions do not care what format your clinical data lives in. They care about
_how_ systems find each other, _how_ consent is checked, _how_ identities are verified. The data model underneath is
your business.

An openEHR CDR participates in this ecosystem by exposing an API. The Generic Functions infrastructure sees that API,
registered in the Care Services Directory, operating under the shared consent and
authentication framework. What sits behind that endpoint, openEHR, a proprietary schema, or anything else, is
invisible to the infrastructure layer.

## openEHR Behind Generic Functions - How It Actually Works

The practical question is: what does an openEHR-based system need to do to participate?

**Addressing**: your system registers an openEHR endpoint in an Administration Directory with a URA identifier. The
national Update Client picks it up and consolidates it into the Query Directory. Any other system can then discover
you via mCSD queries. Your openEHR CDR is now visible to other participants via your AQL endpoint, Composition endpoint
or perhaps a FHIR endpoint if you're leveraging FHIRConnect for mapping between one and the other.

**Localization**: when your CDR holds data relevant to a patient, you register a localization record in the Nationale
Verwijs Index. Meaning you specify for which care context you're holding data of a specific patient and that's it.
openEHR, FHIR, XDS, .. makes no difference, but it is an integration point for you as an openEHR vendor to make - you need to
publish a localization record in the NVI.

**Consent**: before serving any data, your system needs to actively query Mitz to verify that the patient has given
consent for the requesting party. Meaning your openEHR stack needs to wire in a Mitz consent evaluation call as part of its
authorization flow.

I demonstrated this end-to-end in
the [eOverdracht hybrid architecture PoC](/posts/eoverdracht-hybrid-architecture-openehr-fhir):
EHRBase running as the openEHR CDR on the sending side, Firely Server handling the FHIR operational layer and mCSD
models, openFHIR doing the bidirectional mapping, and the mCSD/Routing generic functions handling discovery and
addressing. The receiving side was pure FHIR and it had no idea the sender was openEHR-backed.

## Why openEHR Vendors Should Pay Attention

The Generic Functions program is not specifically about FHIR. It is about national infrastructure that any health data
exchange use case in the Netherlands will eventually plug into, whether that exchange uses FHIR, XDS, openEHR APIs,
or something else entirely. Addressing, consent, localization, authentication: these problems need to be solved
regardless of what format the data travels in.

Right now, the implementation guides are heavily FHIR-oriented, which reflects where most active Dutch use cases
(eOverdracht, BgZ, PZP) currently live. But the underlying functions are format-agnostic, and the landscape is
broader than FHIR alone.

For openEHR vendors operating in the Netherlands, this is worth following. Not because anything is broken today, but
because the Generic Functions will increasingly become the assumed baseline for national health data exchange. Use
cases that currently feel distant will start requiring addressing registration, NVI localization records, and Mitz
consent integration. Getting familiar with what that means for an openEHR stack, and where the integration points
are, is a reasonable thing to do sooner rather than later.

---

If you are building on openEHR and want to understand how your system fits into the Generic Functions landscape, or if
you need a proof-of-concept for your specific use case, feel free to reach out at [syntaric.com](https://syntaric.com).
