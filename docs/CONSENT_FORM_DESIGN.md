# Consent form — design

**Status:** Implemented (see `docs/PLAYER_REGISTRATION.md`, migration `20260323000000_player_consents.sql`).

---

## Implementation summary

- **Table:** `player_consents` (versioned; unique per `player_id` + `consent_version`).
- **UI:** `/dashboard/consent` + inline form on pending approval when profile + consent still needed.
- **Gate:** `ConsentRedirect` sends approved users to `/dashboard/consent` until current version is signed.
- **PDF:** `GET /api/players/[id]/consent-pdf` — access: admin, coach, linked parent, player (self).
- **Copy:** `lib/consent-copy.ts` (`CONSENT_VERSION`).

---

## Original design notes

---

## 1. Who should see it & who signs?

| Role | Interaction |
|------|-------------|
| **Player (minor)** | Reads the form; **does not** sign alone if policy is parent/guardian consent for U18. Can tick acknowledgment (“I understand”) alongside parent where you want both. |
| **Parent / guardian** | **Primary signer** for minors: reads, agrees, types full name + relationship, submits. This matches most youth-sports practice. |
| **Player (adult / independent)** | **Signer** for themselves (same flow as parent but relationship = “Self”). |
| **Coach / admin** | **View-only**: see whether consent is on file, **when** it was signed, **version**; **download PDF** for files/audits. They do **not** sign the participant consent (unless you add a separate “staff acknowledgment” later). |

**Recommended gate in your app:**  
After account + player profile, **before** the player is treated as “fully enrolled” or **before** coach approval: require **at least one** valid consent on file for that `player` record (signed by parent OR self as applicable).

---

## 2. Where to save it?

**Recommended: dedicated table** (audit-friendly, versioned).

```text
consent_records (or player_consents)
├── id (uuid, PK)
├── player_id (uuid, FK → players, unique per active consent OR allow history rows)
├── consent_version (text, e.g. "2026-03-v1")
├── signed_at (timestamptz)
├── signer_user_id (uuid, FK → auth.users — who was logged in)
├── signer_printed_name (text)
├── signer_relationship (text: 'self' | 'parent_guardian' | 'other')
├── accepted_terms (boolean) — must be true
├── optional: ip, user_agent (if you want audit metadata)
```

- **Full legal text** for each version: keep in repo as `docs/consent-versions/2026-03-v1.md` (or JSON) and reference by `consent_version`. Do not duplicate huge blobs in DB unless required.

- **Optional:** store a **snapshot** of the exact text hash (`sha256`) at sign time for disputes.

**Simpler alternative (not ideal long-term):** columns on `players`: `consent_signed_at`, `consent_version`, `consent_signer_name`. Faster to ship; weaker audit trail.

---

## 3. PDF downloadable?

**Yes, for records.**

- **Generate PDF** server-side (same stack as player reports: `@react-pdf/renderer` or similar) containing:
  - Academy name, logo optional  
  - Player name, DOB/age if you have it  
  - Full consent text for the version signed  
  - Signer printed name, relationship, date/time  
  - Version id  

- **Who can download:**  
  - **Admin / coach** (always, for that player)  
  - **Linked parent** (for their child)  
  - **Player** (for own record, if old enough / policy allows)  

- **Route pattern (aligned with your app):**  
  `GET /api/players/[id]/consent-pdf` with the same **access checks** as your player report PDF (reuse `lib/player-report-access` patterns).

---

## 4. Draft consent text (simple — not legal advice)

*Have a local lawyer review before production use.*

---

### ANSA Basketball Academy — Participation & consent

**Participant name:** _________________________  

**Version:** 2026-03-v1  

By signing below, I confirm that I have read and agree to the following:

1. **Activities**  
   I consent to the participant taking part in basketball training, games, and related activities organised by ANSA Basketball Academy (“ANSA”).

2. **Nature of sport**  
   I understand that basketball involves physical exertion and contact and carries a risk of injury. I accept these risks on behalf of the participant (or as the participant, if signing for myself).

3. **Health**  
   I confirm that the participant is in adequate health to participate unless I have informed ANSA in writing of relevant medical conditions or restrictions.

4. **Emergency**  
   If the participant requires urgent medical care and I cannot be reached immediately, I authorise ANSA staff to seek emergency medical treatment as deemed necessary.

5. **Photos & video**  
   I consent to ANSA capturing and using photos or video of the participant in academy-related materials (e.g. website, social media, reports) unless I notify ANSA in writing that I do not consent.

6. **Data**  
   I understand that ANSA will process personal and contact information for registration, coaching, safety, and communication in line with its privacy practices.

7. **Rules & conduct**  
   The participant will follow ANSA and venue rules and treat coaches, staff, and other players with respect.

**Signer (type full name):** _________________________  

**Relationship to participant:** ☐ Self ☐ Parent / guardian ☐ Other: _________  

**Date:** _________________________  

---

*(For the digital product, “typing full name + checkbox + Submit” replaces handwritten lines; PDF fills in names and timestamps automatically.)*

---

## 5. Suggested implementation steps (for your approval)

1. **Legal review** — Send draft to your coach/client counsel; freeze **version string** (e.g. `2026-03-v1`).  
2. **Migration** — Create `player_consents` (or chosen schema) + RLS: insert by parent/player linked to that player; select by admin/coach/parent/player per same rules as player data.  
3. **UI** — New route e.g. `/dashboard/consent` or onboarding step: show text, checkbox, printed name, relationship, Submit.  
4. **Gate** — If `players` has no row in `player_consents` for current version (or any signed record, per your rule), redirect to consent or show banner blocking key actions until complete.  
5. **PDF API** — `GET /api/players/[id]/consent-pdf` + reuse access helper; optional button on parent/child profile and admin player profile.  
6. **Coach approval** — Optionally require consent before flipping `approval_status` to approved (product rule).  
7. **Docs** — Link from README; note version changes when text updates.

---

## 6. Out of scope for v1 (optional later)

- E-signature provider (DocuSign)  
- Separate waivers for travel / tournaments  
- Email copy of PDF automatically  

---

**When you approve**, implementation order will typically be: **migration → RLS → consent page → gate → PDF route → UI polish.**
