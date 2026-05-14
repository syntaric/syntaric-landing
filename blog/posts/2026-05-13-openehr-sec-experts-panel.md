---
title: Joining the openEHR SEC Experts Panel
slug: openehr-sec-experts-panel
image: ../../blog/openehr-sec-experts-panel/cover.jpeg
description: Syntaric joins the openEHR Specifications Editorial Committee Experts Panel — a reflection on our journey with openEHR, what the SEC is, and what this means.
excerpt: We've joined the openEHR Specifications Editorial Committee (SEC) Experts Panel. A moment to reflect on what that means, how we got here, and why openEHR continues to be at the center of everything we build.
tag: News
author: Gasper Andrejc
authorRole: openEHR SEC Experts Panel Member
authorBio: Healthcare Interoperability Architect & Consultant at Syntaric. 10+ years building FHIR, openEHR, and IHE solutions across Europe and the US.
authorLinkedIn: https://www.linkedin.com/in/andrejcgasper/
date: 2026-05-13
breadcrumb: openEHR SEC Experts Panel
topics: [ openEHR, SEC, Architecture ]
publish: true
---

## The News

We've joined the openEHR **Specifications Editorial Committee (SEC) Experts Panel**. This is a big one for us, and
it felt right to write about it; not just to mark the moment, but to explain what the SEC is, what the panel does,
and how we got here.

## What is the SEC

The Specifications Editorial Committee is the governing body behind the openEHR specification program. It is
responsible for managing how openEHR specifications evolve: what changes go in, how they are reviewed, who has a say,
and what the process looks like. Think of it as the technical stewardship of the standard itself: archetypes,
reference model, query language, REST API, all of it.

The **SEC Experts Panel** is a group that sits alongside the main committee, providing specialized expertise to support
the SEC's work. Panel members provide direction to the evolution of the openEHR specifications and related technical
resources. It is not a ceremonial role, but a seat at the table in conversations about where the standard goes
next.

## Our Journey with openEHR

When I first encountered openEHR, I was deep in FHIR and HL7 v2 work and largely skeptical of anything that asked me
to rethink how clinical data should be persisted. The healthcare standards world is full of silver bullets that turn out
to be something else entirely. openEHR could have been another one of those.

But the more time I spent with it, the more it became clear that it was solving a genuinely different problem,
not how to exchange data, but how to store it in a way that doesn't become a liability the moment requirements change.
The two-level modeling approach, where a stable reference model is separated from flexible, clinician-authored
archetypes, means the data model and the implementation are not the same thing. You can evolve one without breaking
the other. That is a rarer property in healthcare IT than it should be.

The first real project where I encountered openEHR  was a hard lesson in the gap between the theory and the
tooling. The community was smaller then, the implementations were fewer, and the path from "this archetype exists in
CKM" to "this data is in a running CDR serving a real use case" was longer than it should have been. I learned a lot
about what the standard does well and where it needs real-world grounding. That was about 10 years ago.

But over the years, the projects accumulated. Countries and university hospitals started piloting openEHR and even though
it presents a big shift in thinking and a long while to see tangible results and proof it is "the right path", key stakeholder still
stuck with it. What consistently stood out was not that openEHR was perfect (no standard is) but that it composed well with other
things: FHIR for exchange, openEHR for persistence, FHIRConnect as the bridge, SNOMED, OMOP, ..

## Why This Matters

Joining the SEC Experts Panel is meaningful to us for a specific reason: it is a connection between the implementation
work we have been doing and the specification work that governs the standard.

The openEHR spec is not an abstract artifact. Everything has
implications for real systems built by real teams trying to solve real problems. The closer the specification process
stays to that ground truth, the more useful the standard becomes in practice. The SEC Experts Panel is one of the
channels through which that feedback flows, from implementers who have run the standard against actual use cases, back
into the conversations that shape what the standard becomes.

We are glad to now be part of the body that helps shape what those standards look like.

