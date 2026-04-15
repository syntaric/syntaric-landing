---
title: IPS on openEHR — Webinar Recording
slug: ips-on-openehr-webinar
image: ../../blog/ips-on-openehr-webinar/cover.jpeg
description: Recording of the openFHIR webinar on implementing the International Patient Summary using a hybrid openEHR and FHIR architecture powered by FHIRConnect.
excerpt: Can openEHR and FHIR truly work together without proprietary glue? This webinar walks through the International Patient Summary use case end to end — from the gap between the two standards to a live demo of openFHIR generating an IPS from an openEHR CDR.
tag: Webinar
author: Gasper Andrejc
authorRole: Healthcare Interoperability Architect
authorBio: Healthcare Interoperability Architect & Consultant at Syntaric. 10+ years building FHIR, openEHR, and IHE solutions across Europe and the US.
authorLinkedIn: https://www.linkedin.com/in/andrejcgasper/
date: 2026-04-15
breadcrumb: IPS on openEHR Webinar
topics: [ FHIR, openEHR, IPS, FHIRConnect, openFHIR, EHDS ]
publish: true
---

This webinar was hosted by [Yellowbrink](https://www.yellowbrink.com/) — a big thank you to the organizers for the
opportunity and a platform.

## Webinar Recording

<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1183048650?h=317159c3bc" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>

## Slides

<div id="pdf-slider" style="background:#f7f8fc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:1.5rem 0;">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:#fff;border-bottom:1px solid #e2e8f0;gap:12px;flex-wrap:wrap;">
    <div style="display:flex;align-items:center;gap:8px;">
      <button id="pdf-prev" onclick="pdfChangePage(-1)" style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer;font-size:0.875rem;color:#4a5568;">&#8592; Prev</button>
      <button id="pdf-next" onclick="pdfChangePage(1)" style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer;font-size:0.875rem;color:#4a5568;">Next &#8594;</button>
    </div>
    <span id="pdf-page-info" style="font-size:0.875rem;color:#718096;">Loading…</span>
    <a href="../ips-on-openehr-webinar/openFHIR_IPS_Webinar_april26.pdf" download style="font-size:0.875rem;font-weight:500;color:#0052cc;text-decoration:none;">&#8595; Download PDF</a>
  </div>
  <div style="text-align:center;padding:16px;background:#f7f8fc;">
    <canvas id="pdf-canvas" style="max-width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);"></canvas>
  </div>
</div>

<script>
(function() {
  var pdfUrl = '../ips-on-openehr-webinar/openFHIR_IPS_Webinar_april26.pdf';
  var pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null;

  function loadScript(src, cb) {
    var s = document.createElement('script'); s.src = src; s.onload = cb; document.head.appendChild(s);
  }

  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
      var canvas = document.getElementById('pdf-canvas');
      var container = canvas.parentElement;
      var scale = Math.min((container.clientWidth - 32) / page.getViewport({scale:1}).width, 2);
      var vp = page.getViewport({scale: scale});
      canvas.height = vp.height;
      canvas.width = vp.width;
      page.render({canvasContext: canvas.getContext('2d'), viewport: vp}).promise.then(function() {
        pageRendering = false;
        if (pageNumPending !== null) { renderPage(pageNumPending); pageNumPending = null; }
      });
      document.getElementById('pdf-page-info').textContent = 'Slide ' + num + ' of ' + pdfDoc.numPages;
      document.getElementById('pdf-prev').disabled = num <= 1;
      document.getElementById('pdf-next').disabled = num >= pdfDoc.numPages;
    });
  }

  window.pdfChangePage = function(delta) {
    var n = pageNum + delta;
    if (n < 1 || n > pdfDoc.numPages) return;
    pageNum = n;
    if (pageRendering) { pageNumPending = n; } else { renderPage(n); }
  };

  loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', function() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    pdfjsLib.getDocument(pdfUrl).promise.then(function(doc) {
      pdfDoc = doc;
      renderPage(pageNum);
    });
  });
})();
</script>

## What the Webinar Covers

The International Patient Summary (IPS) is a FHIR Implementation Guide defining how a minimal, speciality-agnostic set
of clinical information should be exchanged across borders and care settings. It is one of the cornerstones of EHDS and
is gaining adoption across Europe and beyond.

At the same time, **openEHR** is increasingly used as a data-for-life persistence layer — use-case agnostic, semantically
rich, and governed by clinicians. This webinar tries to address how do you get IPS compliance out of an openEHR CDR
without resorting to a proprietary integration engine?

### The gap between FHIR and openEHR

FHIR was designed for exchange. openEHR was designed for persistence. Both are right for their purpose, but the
combination of the two today is typically solved with vendor-specific mappings and expensive ETL pipelines: a
proprietary piece stuck between two open standards. The webinar unpacks why this happens, why it is a problem at
regional scale, and what an ideal architecture actually looks like.

### FHIRConnect — the missing bridge

[FHIRConnect](https://sevkohler.github.io/FHIRconnect-spec/) is a specification for expressing bidirectional mappings between openEHR and FHIR. Key pillars of the specification are:

- **Part of the openEHR ecosystem** — the goal is for mappings to live in CKM alongside archetypes, going through the
  same clinical governance process.
- **Vendor agnostic** — any engine can implement the spec; [openFHIR](https://open-fhir.com) is the open-source reference implementation.
- **Bidirectional** — one mapping handles both openEHR → FHIR and FHIR → openEHR, including FHIR Search to AQL
  translation.
- **Community driven** — the idea is that a public library with mappings is established so the community can leverage existing work done for other use cases and projects
- **Modular** — mappings are composed per archetype and per FHIR data type, enabling reuse across domains.
- **Extensible** — mappings can be extended the same way archetypes can, so for example a national IPS profile only needs to
  describe the delta on top of the base mapping.

### How mappings are written

The webinar walks through the actual mapping workflow and key challenges of a mapping process.

### Live IPS demo

The session closes with a live demonstration of openFHIR generating a valid IPS FHIR Bundle directly from an openEHR
CDR, without any proprietary integration layer or duplicate FHIR store. The query flow (FHIR Search → AQL → Composition →
FHIR) and the create flow (FHIR Bundle → openEHR Composition) are both shown end to end.

## Key takeaway

With FHIRConnect and openFHIR you get a fully vendor-neutral architecture based on open standards alone. The openEHR
CDR remains your data-for-life foundation; the FHIR layer remains your innovation and exchange surface; and FHIRConnect
bridges the two in a scalable, community-governed, and reusable way.

---

Want to try it yourself? The open-source engine and sandbox are available at [open-fhir.com](https://open-fhir.com).
For a proof of concept tailored to your use case, feel free to [reach out](https://syntaric.com).
