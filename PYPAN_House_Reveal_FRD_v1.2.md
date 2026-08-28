**PRESBYTERIAN CHURCH OF NIGERIA**

Presbyterian Young People's Association of Nigeria (PYPAN)

**FUNCTIONAL REQUIREMENTS DOCUMENT**

**PYPAN House Reveal Platform**

_Digital House Assignment & Reveal System for the PYPAN Inter-House Sports Day_

| **Event**                 | PYPAN Inter-House Sports Day                                            |
| ------------------------- | ----------------------------------------------------------------------- |
| **Venue**                 | Calypso Park                                                            |
| **Event Date**            | Saturday, 29 August 2026                                                |
| **Banner Print Deadline** | Friday, 21 August 2026 (afternoon, WAT) — hard deadline                 |
| **Document Version**      | v1.3                                                                    |
| **Document Date**         | 24 August 2026                                                          |
| **Status**                | Simplified MVP draft — aligned to objectives and ready for build review |
| **Prepared For**          | PYPAN Youth Group Planning Committee                                    |
| **Classification**        | Internal — contains personal contact details                            |

# **Table of Contents**

# **1\. Introduction**

## **1.1 Purpose**

This document sets out the functional and non-functional requirements for the PYPAN House Reveal Platform, a lightweight web application that allows participants at the PYPAN Inter-House Sports Day to discover which of four houses they have been assigned to by scanning a QR code on the event banner.

It is intended to be read by the development team building the platform, and by the PYPAN planning committee as the basis for approving scope before build commences.

## **1.2 Background**

The PYPAN Inter-House Sports Day divides participants into four houses, each named after a biblical figure and identified by a colour. Historically, house membership has been communicated by printed lists and word of mouth, which is slow to distribute, easy to lose, and offers no visibility of who has actually been informed.

The planning committee wishes to modernise this by printing a QR code on the event banner. A participant scans the code, searches for their own name, and is shown a full-screen reveal of their house colour together with the practical information they need for the day: their house name, the food item their house is bringing to the picnic, and the contact details of their house captain and vice captain.

## **1.3 Objectives**

- Allow any participant to determine their house within seconds, without an account, an app install, or assistance from an organiser.
- Distribute the house leadership contacts at the same moment the house is revealed, so no separate communication is needed.
- Maintain one authoritative roster with each participant's assigned house.
- Show administrators how many participants have viewed their reveal.

## **1.4 Scope**

### **1.4.1 In scope**

- A public, no-login participant web page reached by QR code (the Reveal).
- Type-ahead search of the participant roster by name.
- A themed full-screen house reveal per house colour, showing house name, food assignment and leadership contacts.
- A private administrative console (the Console) protected by a single shared login.
- A house setup screen where the administrator creates up to four houses and enters each house's namesake, food assignment and colour.
- A separate participant upload for each created house.
- A roster view and verification summary.
- Basic roster export and printable house lists.

### **1.4.2 Out of scope**

_The following are explicitly excluded from this release. They are recorded here so that they are understood as deferred decisions rather than omissions._

- Live scoring or a house scoreboard updated as events conclude.
- Event schedules, fixtures or team lists per sporting event.
- Photo galleries or media upload.
- Individual administrator accounts, roles or permissions beyond the single shared login.
- **Participant self-registration of any kind.**
- Attendance or check-in tracking on the day, as distinct from house verification.
- Any payment, ticketing or fundraising function.
- Native mobile applications for iOS or Android.
- Notifications by SMS, email or push.
- Balancing of houses by age, gender or any category other than headcount.

**Scope note.** A live house scoreboard is the most attractive of the deferred items and reuses the same house data, but it constitutes a second product with its own administrative workflow and its own failure modes on event day. It is recommended for a subsequent phase, once the reveal has been delivered and proven.

## **1.5 Definitions and abbreviations**

| **Term**         | **Meaning**                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| **PCN**          | Presbyterian Church of Nigeria                                                      |
| **PYPAN**        | Presbyterian Young People's Association of Nigeria                                  |
| **The Reveal**   | The public participant-facing web page reached by scanning the QR code              |
| **The Console**  | The private administrative area used by the planning committee                      |
| **Participant**  | A person on the roster who is assigned to a house                                   |
| **Roster**       | The complete list of participants held by the platform                              |
| **House**        | One of the four competing groups: Red, Green, Blue or Yellow                        |
| **Verified**     | State of a participant who has successfully viewed their house reveal at least once |
| **Reveal event** | A recorded instance of a participant viewing their house                            |
| **NDPA**         | Nigeria Data Protection Act 2023                                                    |

# **2\. Stakeholders**

| **Stakeholder**          | **Role**            | **Interest in the platform**                                                                |
| ------------------------ | ------------------- | ------------------------------------------------------------------------------------------- |
| Planning Committee       | Owner and approver  | Approves scope; owns the roster; accountable for the event running smoothly                 |
| Console Administrators   | Day-to-day operator | Creates houses, uploads each house roster, corrects participants, and monitors verification |
| Participants             | End user            | Needs to know their house, what food to bring, and who to contact                           |
| House Captains and Vices | House leadership    | Need their house membership known to them; their contacts are published on the reveal       |
| Development Team         | Implementer         | Builds, deploys and supports the platform                                                   |
| Print Vendor             | External dependency | Produces the banner; requires the final QR artwork by the print deadline                    |

# **3\. Solution Overview**

## **3.1 Conceptual design**

The platform comprises two functionally distinct interfaces sharing a single data store:

- **The Reveal** — a public, unauthenticated, single-purpose interface optimised for a participant standing in front of a printed banner, on a mobile device, potentially on a weak network connection.
- **The Console** — a private, authenticated interface used by a small number of committee members to manage the roster. It prioritises correctness and clarity over visual polish.

The two are deliberately separated in design because their users, contexts and quality requirements differ sharply. The Reveal will be used once by every participant under time pressure in a public setting; the Console will be used repeatedly by two or three people at a desk.

## **3.2 Technology stack**

| **Layer**            | **Technology and rationale**                                                   |
| -------------------- | ------------------------------------------------------------------------------ |
| Frontend             | React, with one public Reveal page and one private Console page.               |
| Backend and database | Convex, used for the roster, house configuration and verification updates.     |
| Hosting              | A free-tier hosting platform selected before deployment.                       |
| Authentication       | One shared Console credential held server-side. No participant authentication. |
| QR generation        | Generated once during setup and supplied to the print vendor.                  |

## **3.3 Principal user journeys**

### **3.3.1 Participant on the roster**

- Scans the QR code on the banner using a phone camera.
- Arrives at a neutral landing page bearing the church and event identity, with a single call to action.
- Begins typing their name; a list of matching roster names appears after the third character.
- Taps their own name from the list.
- Sees a brief anticipation state, then a full-screen reveal in their house colour showing their name, house name and biblical namesake, food assignment, and captain and vice captain contacts.
- Optionally shares or screenshots the reveal.
- The platform records the participant as verified.

### **3.3.2 Participant checking again, or using a borrowed phone**

The platform retains no state on the device. Every visit begins at the landing page, and a participant who wishes to check again simply searches for their name once more and is shown the identical house.

This is a deliberate design decision rather than a limitation. Because nothing is tied to a device, any phone may be used by any participant. A participant who does not own a smartphone can borrow one from anybody present, search their own name and see their own house. Under no circumstances may a participant be shown a different house on a subsequent visit.

### **3.3.3 Administrator preparing the roster**

- Signs in to the Console with the shared credential.
- Creates and completes the four houses in the Console.
- Selects a configured house and uploads that house's participant list.
- Repeats the upload for each house.
- Reviews each upload preview and commits valid rows.
- Selects a captain and vice captain from each house's uploaded members.
- Corrects participant or house records when needed.
- Reviews the roster and verification summary.
- Exports the roster or prints the house lists if needed.
- Monitors verification progress during the event.

# **4\. Ho3se Configuration**

The four houses and their attributes are fixed for this event and are set out below. This data is held as configuration and is editable in the Console, but the number of houses is fixed at four.

## **4.1 House master data**

| **House**  | **Namesake** | **Food Assignment**                 | **Captain**                          | **Vice Captain**                   |
| ---------- | ------------ | ----------------------------------- | ------------------------------------ | ---------------------------------- |
| **RED**    | Daniel       | Protein                             | Ndifreke Jackson<br><br>08067138085  | Miracle Anyang<br><br>07040860366  |
| **GREEN**  | Gideon       | Finger Foods (Small Chops / Snacks) | Wunisod Efut<br><br>09037620962      | Theresa Ogbuagu<br><br>09137100230 |
| **BLUE**   | David        | Fried Rice                          | Gerald Ononokpono<br><br>08111112479 | Chidi Obuagu<br><br>08126282344    |
| **YELLOW** | Joseph       | Jollof Rice                         | Prince Akuma Uche<br><br>09135340909 | Olaedo Ikwegbu<br><br>08124650785  |

_Contact numbers are reproduced above exactly as supplied. They must be verified against the source artwork before the platform goes live, as a mistyped number published on a public page cannot be corrected on the printed banner._

## **4.2 Colour palette**

The palette below is sampled directly from the printed house cards so that the digital reveal matches the physical material exactly. These values are to be used without substitution.

| **House**  | **Primary** | **Tint** | **Text on primary**       | **Accessibility note**                                                                             |
| ---------- | ----------- | -------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| **RED**    | #B71C1C     | #FBE2E2  | White                     | Contrast 6.6:1 — passes at all sizes                                                               |
| **GREEN**  | #2E7D32     | #E2F3E3  | White                     | Contrast 5.1:1 — passes at all sizes                                                               |
| **BLUE**   | #1F5FA8     | #DCEAF9  | White                     | Contrast 6.5:1 — passes at all sizes                                                               |
| **YELLOW** | #B8860B     | #FCF3D6  | White for large text only | Contrast 3.3:1 — large display text only; body and small text must use a dark tone such as #4A3608 |

**Design note on Yellow House.** The supplied Yellow House artwork uses a dark gold rather than a bright yellow, which is fortunate: bright yellow cannot carry white text legibly, particularly on a phone screen outdoors in daylight. The sampled value of #B8860B carries white display text acceptably, but small text and body copy on that background must switch to a dark tone. This is the single most likely accessibility defect in the build and should be checked on a real device in sunlight.

# **5\. Functional Requirements — The Reveal**

Requirements are identified as FR-R-nn. Priority is stated as Must, Should or Could.

| **ID**      | **Requirement**             | **Description**                                                                                                                                                                                                                                                                                     | **Priority** |
| ----------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **FR-R-01** | Landing page                | On scanning the QR code, the participant is presented with a landing page identifying the Presbyterian Church of Nigeria, PYPAN, the Inter-House Sports Day and the venue, with a single clear call to action to find their house.                                                                  | Must         |
| **FR-R-02** | No authentication           | No account, login, password, email address or phone number is required of a participant at any point.                                                                                                                                                                                               | Must         |
| **FR-R-03** | Reveal concealment          | The landing page must not display the four house colours, names or any imagery that would pre-empt the reveal.                                                                                                                                                                                      | Must         |
| **FR-R-04** | Type-ahead search           | The participant enters characters of their name and the platform returns matching roster entries. Matching begins at the third character, is case-insensitive, ignores leading and trailing spaces, and matches on any part of the full name so that either forename or surname first will succeed. | Must         |
| **FR-R-05** | Result presentation         | Matching names are presented as a tappable list. No more than ten results are shown at once; where more match, the participant is prompted to type further characters.                                                                                                                              | Must         |
| **FR-R-06** | Selection by tap            | The participant selects their name by tapping it. Free-text submission of a name for exact matching is not permitted for roster participants, in order to eliminate misspelling and name-order failure.                                                                                             | Must         |
| **FR-R-07** | No match handling           | Where a search returns no match, the participant is told that their name is not on the roster and is directed to ask an organiser for assistance.                                                                                                                                                   | Must         |
| **FR-R-08** | Reveal transition           | After a participant selects a name, the platform displays the assigned house reveal. A brief transition is optional and must never delay the reveal.                                                                                                                                                | Could        |
| **FR-R-09** | House reveal content        | The reveal displays the participant's name, house name and colour, biblical namesake, food assignment, and captain and vice captain names and telephone numbers.                                                                                                                                    | Must         |
| **FR-R-10** | Reveal theming              | Each house reveal uses its configured house colour.                                                                                                                                                                                                                                                 | Must         |
| **FR-R-11** | Contact actions             | Captain and vice captain telephone numbers may be rendered as tap-to-call links. WhatsApp deep links are optional.                                                                                                                                                                                  | Could        |
| **FR-R-12** | Single-screen fit           | The main reveal content fits a typical mobile viewport without deliberate scrolling.                                                                                                                                                                                                                | Should       |
| **FR-R-13** | Share action                | The participant may use the device's normal screenshot or share function. A built-in share-card or copy-link feature is not required for MVP.                                                                                                                                                       | Could        |
| **FR-R-14** | Assignment stability        | Once assigned, a participant's house is immutable except by explicit administrator action. Repeat visits, repeat scans, repeat searches and use of any other device must all yield the same house.                                                                                                  | Must         |
| **FR-R-15** | No device state             | The platform retains no participant state on the device. Every visit begins at the landing page and requires a fresh search, allowing any phone to be shared or borrowed.                                                                                                                           | Must         |
| **FR-R-16** | Verification recording      | On first successful reveal, the participant is recorded as verified with a timestamp. Subsequent reveals increment a view count without altering the first-verified timestamp.                                                                                                                      | Must         |
| **FR-R-17** | Offline and error behaviour | Where the backend is unreachable, a plain, non-technical message is displayed advising the participant to retry or consult an organiser. Raw error output must never be shown.                                                                                                                      | Must         |
| **FR-R-18** | Shared device use           | Consecutive searches by different participants on the same phone must each return the correct house for the person searched. No residual state from a previous search may influence a subsequent one.                                                                                               | Must         |
| **FR-R-19** | Organisational identity     | The Presbyterian Church of Nigeria logo and the PYPAN logo are displayed on the landing page, and as a discreet mark on the reveal. Images must be optimised for weak connections.                                                                                                                  | Should       |

# **6\. Functional Requirements — The Console**

## **6.1 Access**

| **ID**      | **Requirement**           | **Description**                                                                                                                                               | **Priority** |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **FR-C-01** | Shared login              | The Console is protected by a single shared username and password held server-side. The credential is not present in client-side code or in the repository.   | Must         |
| **FR-C-02** | Session handling          | A session can be ended by explicit sign-out.                                                                                                                  | Must         |
| **FR-C-03** | Route protection          | No Console route, data query or mutation is reachable without a valid session. Protection is enforced on the server, not merely by hiding interface elements. | Must         |
| **FR-C-04** | No public discoverability | The Console is not linked from the Reveal and is not indexable by search engines.                                                                             | Should       |

## **6.2 Bulk upload**

| **ID**      | **Requirement**    | **Description**                                                                                                                                                              | **Priority** |
| ----------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **FR-C-05** | Upload by house    | After selecting a configured house, the administrator uploads that house's participant CSV or spreadsheet. Every valid name in the upload is assigned to the selected house. | Must         |
| **FR-C-06** | Upload preview     | The system validates the selected house's upload and shows accepted and rejected rows before anything is saved.                                                              | Must         |
| **FR-C-07** | Upload commit      | The administrator explicitly confirms the preview before accepted rows are added. Rejected rows are not added.                                                               | Must         |
| **FR-C-08** | Duplicate handling | Blank names and names already present in the roster are rejected with a clear row-level reason.                                                                              | Must         |

## **6.3 Participant management**

| **ID**      | **Requirement**      | **Description**                                                                                               | **Priority** |
| ----------- | -------------------- | ------------------------------------------------------------------------------------------------------------- | ------------ |
| **FR-C-14** | Create participant   | An administrator can create a participant and select one of the configured houses.                            | Must         |
| **FR-C-15** | Edit participant     | An administrator may correct a participant's name or telephone number.                                        | Must         |
| **FR-C-16** | Reassign house       | An administrator may move a participant to a different configured house.                                      | Must         |
| **FR-C-17** | Delete participant   | An administrator may remove a participant, with a confirmation step.                                          | Must         |
| **FR-C-18** | Duplicate prevention | The platform prevents creation of a participant whose name matches an existing participant.                   | Must         |
| **FR-C-19** | Audit trail          | Every house, participant creation, edit, reassignment and deletion is recorded with the action and timestamp. | Should       |

## **6.4 Roster view and monitoring**

| **ID**      | **Requirement**      | **Description**                                                                                                         | **Priority** |
| ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------ |
| **FR-C-21** | Roster list          | All participants are listed showing name, house, verification state and first verification time.                        | Must         |
| **FR-C-22** | Filter and search    | The list can be filtered by house and verification state, and searched by name.                                         | Must         |
| **FR-C-23** | Verification summary | A summary shows the number and percentage of participants who have viewed their reveal, including a breakdown by house. | Must         |
| **FR-C-24** | Basic export         | The administrator can export the roster and generate a printable house list.                                            | Should       |

## **6.5 Output**

| **ID**      | **Requirement**             | **Description**                                                                                                                                                                                             | **Priority** |
| ----------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **FR-C-28** | Spreadsheet export          | The full roster is exportable to a spreadsheet including name, house, verification state, first verification time and origin.                                                                               | Must         |
| **FR-C-29** | Printable house list        | A print-optimised view lists participants grouped by house, suitable for display on a noticeboard as a contingency should the platform be unreachable on the day.                                           | Must         |
| **FR-C-30** | House configuration editing | House names, namesakes, food assignments and colours are editable in the Console without a code deployment.                                                                                                 | Must         |
| **FR-C-31** | Select house captain        | After participants exist in a house, the administrator can select exactly one captain from that house's participant list. The selected participant's name and telephone number are used on the reveal.      | Must         |
| **FR-C-32** | Select vice captain         | After participants exist in a house, the administrator can select exactly one vice captain from that house's participant list. The selected participant's name and telephone number are used on the reveal. | Must         |
| **FR-C-33** | Leadership validation       | Captain and vice captain selections are required before a house is marked ready. The same participant cannot hold both roles, and each selected participant must have a telephone number.                   | Must         |
| **FR-C-34** | Leadership update           | The administrator can change either selected leader at any time. The new selection applies to future reveals.                                                                                               | Must         |

# **7\. Business Rules**

## **7.1 House assignment**

| **ID**    | **Rule**                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------- |
| **BR-01** | A participant belongs to exactly one house at any time.                                                   |
| **BR-02** | There are exactly four houses: Red, Green, Blue and Yellow.                                               |
| **BR-03** | House membership supplied by the committee is recorded as supplied.                                       |
| **BR-04** | A participant's house does not change on repeat visits; it changes only by explicit administrator action. |

## **7.2 House-supplied lists**

The committee supplies participant names with their assigned houses. The platform records those assignments and does not rebalance them.

| **BR-08** | Each upload is made against a single named house, and every name in the file joins that house. |
| **BR-09** | The platform performs no distribution, balancing or reordering of uploaded names. The uploaded list is recorded as supplied. |
| **BR-10** | A name may appear on the roster once only. A name appearing on two houses' lists is rejected on the second upload and must be resolved by the committee with the two houses concerned. |
| **BR-11** | House size is determined by the lists supplied by the committee; the platform does not rebalance participants. |
| **BR-12** | The order in which the four house lists are uploaded has no effect on any participant's house. |

The administrator must first create and configure the four houses. Participant lists are then uploaded separately, one upload per house. The uploaded house assignment is authoritative; the platform does not rebalance the lists.

## **7.3 Names and identity**

- Names are stored as entered and compared case-insensitively after trimming and collapsing whitespace.
- Duplicate names are not allowed in the roster.

| **BR-13** | Each configured house has at most one captain and one vice captain, both selected from participants assigned to that house. |
| **BR-14** | Captain and vice captain must be different participants. |
| **BR-15** | A house is not ready for the event until both leadership roles are selected and each selected participant has a telephone number. |
| **BR-16** | If a selected leader is moved to another house or deleted, that leadership selection is cleared and the administrator must select a replacement from the current house members. |
| **BR-17** | Changing a leader changes the contact details shown on future reveals; it does not change historical verification records. |

## **7.5 Verification**

- A participant becomes verified when their reveal is successfully displayed.
- The first verification time is retained; later views may update the view count.
- Verification means only that the reveal was viewed. It is not attendance tracking.

# **8\. Data Model**

The following logical model is expressed in terms suited to Convex collections. Field types are indicative.

## **8.1 participants**

| **Field**           | **Type**   | **Description**                                                                 |
| ------------------- | ---------- | ------------------------------------------------------------------------------- |
| **\_id**            | id         | System identifier                                                               |
| **fullName**        | string     | Name as entered and as displayed                                                |
| **searchName**      | string     | Normalised lower-case form used for matching and duplicate detection            |
| **phone**           | string?    | Participant telephone number; required when selected as captain or vice captain |
| **houseId**         | id         | Reference to the assigned house                                                 |
| **origin**          | enum       | uploaded                                                                        |
| **verified**        | boolean    | Whether the reveal has been viewed                                              |
| **firstVerifiedAt** | timestamp? | Set once on first reveal                                                        |
| **lastViewedAt**    | timestamp? | Updated on each reveal                                                          |
| **viewCount**       | number     | Count of reveals                                                                |
| **createdAt**       | timestamp  | Record creation time                                                            |
| **updatedAt**       | timestamp  | Last modification time                                                          |

## **8.2 houses**

| **Field**                | **Type** | **Description**                                      |
| ------------------------ | -------- | ---------------------------------------------------- |
| **\_id**                 | id       | System identifier                                    |
| **colour**               | enum     | red \| green \| blue \| yellow                       |
| **displayName**          | string   | For example, Red House                               |
| **namesake**             | string   | Biblical namesake, for example Daniel                |
| **foodAssignment**       | string   | Picnic food item the house is to bring               |
| **captainParticipantId** | id?      | Selected captain from this house's participants      |
| **viceParticipantId**    | id?      | Selected vice captain from this house's participants |
| **primaryHex**           | string   | Primary colour, per section 4.2                      |
| **tintHex**              | string   | Tint colour, per section 4.2                         |
| **sortOrder**            | number   | Canonical order: 1 Red, 2 Green, 3 Blue, 4 Yellow    |

## **8.3 settings**

| **Field**     | **Type** | **Description**         |
| ------------- | -------- | ----------------------- |
| **eventName** | string   | Displayed on the Reveal |
| **venue**     | string   | Displayed on the Reveal |
| **eventDate** | string   | Displayed on the Reveal |

## **8.4 auditLog**

| **Field**         | **Type**  | **Description**                                                           |
| ----------------- | --------- | ------------------------------------------------------------------------- |
| **action**        | enum      | create \| edit \| reassign \| delete \| bulk_upload \| reset_verification |
| **participantId** | id?       | Affected participant, where applicable                                    |
| **previousValue** | string?   | Value before the change                                                   |
| **newValue**      | string?   | Value after the change                                                    |
| **detail**        | string?   | Free text, for example upload summary counts                              |
| **at**            | timestamp | Time of the action                                                        |

**Note on the audit log.** With a single shared login the audit log cannot attribute an action to an individual administrator. It records what changed and when, which is sufficient to reconstruct events and to answer a participant who disputes a reassignment, but it is not an accountability record. This is an accepted consequence of the shared-credential decision.

# **9\. Interface Specification**

## **9.1 Design principles**

- Mobile first. The Reveal is designed for a phone held vertically and is only incidentally usable on a desktop.
- Light payload. The Reveal must load quickly on a congested mobile network. Large images, heavy fonts and unnecessary libraries are to be avoided.
- One decision per screen. The participant is never presented with more than one thing to do.
- The reveal is the product. Everything before it exists only to get the participant there.
- Legibility outdoors. Colour and type choices must survive direct sunlight on a mid-range phone screen.

## **9.2 Screen: Landing**

| **Element**    | **Specification**                                                                       |
| -------------- | --------------------------------------------------------------------------------------- |
| Identity       | Presbyterian Church of Nigeria and PYPAN logos, with the names stated plainly alongside |
| Event title    | PYPAN Inter-House Sports Day                                                            |
| Detail line    | Calypso Park · Saturday, 29 August 2026                                                 |
| Call to action | A single prominent control, for example Find My House                                   |
| Palette        | Neutral. No house colour appears on this screen                                         |
| Prohibited     | House names, house colours, the four-colour bar, or any hint of the assignment          |

## **9.3 Screen: Name search**

| **Element** | **Specification**                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| Input       | Single text field, autofocused, with an instructional placeholder such as Start typing your name                           |
| Keyboard    | Standard text keyboard with autocorrect and autocapitalisation suppressed, to avoid the keyboard altering a name mid-entry |
| Threshold   | Results appear from the third character onward                                                                             |
| Results     | Tappable rows showing the full name, capped at ten, with a prompt to refine where more match                               |
| Empty state | A message confirming that no roster match was found and directing the participant to ask an organiser for assistance       |
| Latency     | Search should feel immediate; where a round trip is required, a subtle indicator is shown without blocking further typing  |

## **9.4 Screen: Reveal**

| **Element**      | **Specification**                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background       | Full-bleed house primary colour per section 4.2                                                                                                                         |
| Participant name | Displayed prominently, confirming the correct person has been selected                                                                                                  |
| House identity   | House name and biblical namesake, as the dominant element                                                                                                               |
| Food assignment  | Clearly labelled, for example Bring to the picnic: Jollof Rice                                                                                                          |
| Leadership       | Captain and vice captain are resolved from the house's selected participant records and displayed with their current names and telephone numbers as tap-to-call actions |
| Event footer     | Venue and date in a subdued treatment, with the church and PYPAN logos as a small discreet mark                                                                         |
| Share            | Device screenshot or normal device sharing; no built-in share card required                                                                                             |
| Layout           | Fits a standard mobile viewport without scrolling; composes well as a screenshot                                                                                        |
| Text colour      | White on Red, Green and Blue. On Yellow, white for large display text only and a dark tone for all smaller text                                                         |

## **9.5 Console layout**

- Dashboard: verification summary and recent activity.
- Participants: searchable roster with house, telephone number and verification state, plus simple create/edit/delete actions.
- Upload: one participant file per configured house, with validation preview and commit.
- Houses: house setup plus captain and vice-captain selectors populated only with that house's members.
- A selected member without a telephone number is flagged and cannot be saved as captain or vice captain.
- Export: spreadsheet download and printable house list.

- `captainParticipantId` and `viceParticipantId` must reference members whose `houseId` matches the house.
- The reveal resolves the selected participant records at display time, so corrected names and telephone numbers appear automatically.
- A house with a missing or invalid leader selection is marked incomplete in the Console and cannot be published as ready.

| **Element**     | **Specification**                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Name input      | Full name, single field                                                                                 |
| House           | One of the four houses selected by the administrator                                                    |
| Duplicate check | On save, the name is checked against the whole roster and creation is prevented where it already exists |

The Console requires no visual distinction or branding. Clarity, dense information display and unambiguous confirmation of destructive actions are the only requirements.

# **10\. Non-Functional Requirements**

| **ID**     | **Area**             | **Requirement**                                                                                           |
| ---------- | -------------------- | --------------------------------------------------------------------------------------------------------- |
| **NFR-01** | Load performance     | The Reveal landing page should become usable within three seconds on a normal mobile connection.          |
| **NFR-02** | Capacity             | The platform supports the expected roster and event-day traffic, up to 200 participants.                  |
| **NFR-03** | Device support       | Current Chrome and Safari on Android and iOS.                                                             |
| **NFR-04** | URL permanence       | The QR URL must remain unchanged and resolve correctly for the event.                                     |
| **NFR-05** | Accessibility        | Text is readable, house identity is not communicated by colour alone, and controls are usable on a phone. |
| **NFR-06** | Cost                 | The platform operates within the selected hosting and backend free tiers.                                 |
| **NFR-07** | Graceful degradation | Failure of sharing or other optional features must not prevent a participant from seeing their house.     |

# **11\. Security, Privacy and Data Protection**

## **11.1 Data held**

The platform holds participant full names, house assignments, participant telephone numbers where supplied, verification timestamps, and references to each house's selected captain and vice captain. It collects no addresses, no dates of birth and no email addresses.

## **11.2 Considerations**

| **ID**     | **Area**               | **Requirement or consideration**                                                                                                                                                                                                                                                                             |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SEC-01** | Minimisation           | Only the full name is collected from participants. No additional attribute is to be added without a demonstrated functional need.                                                                                                                                                                            |
| **SEC-02** | Minors                 | PYPAN membership includes persons under eighteen. Under the Nigeria Data Protection Act 2023 this warrants a cautious posture: minimal collection, no public exposure beyond what the search function requires, and deletion after the event.                                                                |
| **SEC-03** | Roster exposure        | Type-ahead search necessarily makes roster names discoverable by anyone who scans the code. This is an accepted consequence of eliminating name-entry failure. It is mitigated by requiring three characters before results are returned, by capping results at ten, and by holding no data beyond the name. |
| **SEC-04** | Published contacts     | The telephone numbers of the selected captains and vice captains are published on a page reachable by anyone who scans the banner. The administrator must obtain the leaders' approval before selection and publication.                                                                                     |
| **SEC-05** | Basic abuse protection | The public search endpoint should have basic rate limiting or equivalent protection. This is a safeguard, not a separate product feature.                                                                                                                                                                    |
| **SEC-06** | Credential handling    | The shared Console credential must be held server-side and must not appear in the repository or client bundle.                                                                                                                                                                                               |
| **SEC-07** | Transport              | All traffic over HTTPS.                                                                                                                                                                                                                                                                                      |
| **SEC-08** | Retention and disposal | The administrator manually deletes participant and verification data after the event.                                                                                                                                                                                                                        |
| **SEC-09** | Leadership approval    | Church leadership have been made aware that names of young members, some of them minors, will be searchable on a publicly reachable page, and have endorsed it.                                                                                                                                              |

**Recommendation.** Items SEC-04, SEC-08 and SEC-09 are decisions for the planning committee rather than the development team, and each takes a single conversation to settle. They are best resolved before print, because the banner is what makes the page publicly reachable.

# **12\. Delivery Plan**

## **12.1 The critical path is the URL, not the application**

The QR code encodes a URL and nothing more. The application behind that URL can be built and replaced freely; the URL itself becomes permanent the moment the banner is printed on vinyl. The consequence is that the print deadline of 21 August does not require a finished application — it requires only a final, tested URL.

This decoupling converts an impossible two-day build into a comfortable eight-day build, and it is the single most important scheduling insight in this document.

## **12.2 Schedule**

| **Date**  | **Phase** | **Activity**                                                                                                                             | **Owner**     |
| --------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 19–20 Aug | Setup     | When the domain is ready, record the final URL and hosting owner, deploy the page, generate the QR code and test it on several devices.  | Development   |
| 20 Aug    | Approval  | Confirm the administrator-created house configuration and contact numbers against the source material.                                   | Committee     |
| 21 Aug    | Print     | Release banner artwork with the final QR to the print vendor. Hard deadline, afternoon.                                                  | Committee     |
| 21–23 Aug | Build     | Data model, house creation and configuration, Console authentication, participant management.                                            | Development   |
| 23–25 Aug | Build     | Per-house uploads, search, reveal, verification summary, export and printable list.                                                      | Development   |
| 25–26 Aug | Build     | Reveal polish and final house configuration checks.                                                                                      | Development   |
| 26–27 Aug | Test      | Core test pass and device testing on real phones.                                                                                        | Development   |
| 27 Aug    | Data      | Create and configure the four houses, then upload each house's participant list. Resolve duplicates and verify house details.            | Administrator |
| 28 Aug    | Readiness | Final verification. Print the noticeboard house lists as contingency. Brief the committee and the officers whose contacts are published. | Committee     |
| 29 Aug    | Event     | Monitor the Console and watch verification progress.                                                                                     | Committee     |

## **12.3 Setup sequence for 19–20 August**

**This sequence must complete before the banner goes to print and admits no shortcuts.**

- Decide and register the URL. A dedicated domain or a subdomain of an existing church domain is preferred, because it survives any change of hosting provider. A free hosting subdomain is acceptable but ties the banner permanently to that provider.
- Deploy any page at that URL, even a holding page, so that the destination resolves.
- Generate the QR code at sufficient size and error correction for a printed banner viewed at a distance.
- Test the printed-size QR by scanning with at least four devices, including an older Android handset, the native iPhone camera, the WhatsApp scanner and Google Lens.
- Print the URL in human-readable form beneath the QR code, as a fallback for devices that will not scan.
- Only then release the artwork to the printer.

## **12.4 Contingency**

| **Risk**                                 | **Mitigation**                                                                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform unreachable on event day        | Printed house lists per FR-C-29, displayed on a noticeboard. Prepared in advance regardless of confidence.                                                                            |
| QR code will not scan on some devices    | Human-readable URL printed beneath the QR.                                                                                                                                            |
| A participant is missing from the roster | The administrator checks the source list, corrects the participant record or adds the participant to the appropriate house through the Console before the participant searches again. |
| Houses have different sizes after upload | Uploaded house assignments are authoritative; the platform does not rebalance them.                                                                                                   |

# **13\. Test Scenarios**

The following constitute the minimum acceptance pass before the platform is declared ready.

| **ID**     | **Area**      | **Scenario**                                                                  | **Expected result**                                                                                |
| ---------- | ------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **TS-01**  | Search        | Participant types three characters of their forename                          | Matching names appear; the participant's own name is among them                                    |
| **TS-02**  | Search        | Participant types their surname first, where the roster holds forename first  | The name is still matched, since matching is on any part of the full name                          |
| **TS-03**  | Search        | Participant types a name with inconsistent capitalisation and trailing spaces | The name is matched; case and whitespace do not affect the result                                  |
| **TS-04**  | Search        | A search term matches more than ten roster entries                            | Ten results are shown with a prompt to type further characters                                     |
| **TS-05**  | Reveal        | Participant selects their name                                                | Anticipation state of no more than three seconds, then the correct house reveal                    |
| **TS-06**  | Reveal        | Each of the four houses is revealed in turn                                   | Each matches its palette per section 4.2; text is legible in every case                            |
| **TS-07**  | Reveal        | Yellow House reveal is viewed on a phone outdoors in daylight                 | All text is legible; small text is dark rather than white                                          |
| **TS-08**  | Reveal        | Reveal is viewed on a small phone screen                                      | Content fits without scrolling and captures cleanly as one screenshot                              |
| **TS-09**  | Reveal        | Food assignment and selected leadership are checked in all four houses        | Each reveal shows the configured food and the currently selected captain and vice captain details  |
| **TS-10**  | Reveal        | Captain telephone number is tapped                                            | The dialler opens with the selected participant's current telephone number                         |
| **TS-11**  | Stability     | Participant closes the page and scans again                                   | The landing page is shown afresh; on searching again the same house is returned                    |
| **TS-12**  | Stability     | Participant searches for themselves on a phone belonging to somebody else     | The same house is shown; no state from the phone owner interferes                                  |
| **TS-13**  | Stability     | Participant reveals, then reveals again several times                         | The house is unchanged; the view count increments; the first verification time is unchanged        |
| **TS-13a** | Shared device | Three different participants search in succession on one phone                | Each is shown their own correct house; no residual state from the previous search affects the next |
| **TS-14**  | Search        | A name not on the roster is searched                                          | No match is reported and the participant is directed to ask an organiser                           |
| **TS-18**  | Upload        | A valid list is uploaded for a configured house and confirmed                 | Names are saved to that house                                                                      |
| **TS-19**  | Upload        | A list is uploaded before its house is configured                             | Upload is blocked with a clear instruction to configure the house first                            |
| **TS-20**  | Upload        | A file contains blank or duplicate names                                      | Invalid rows are rejected with clear reasons                                                       |
| **TS-21**  | Console       | A participant is created, edited, reassigned and deleted                      | Each action works and duplicate names are prevented                                                |
| **TS-22**  | Console       | Participants verify while the Console is open                                 | The verification count and percentage are correct                                                  |
| **TS-24**  | QR            | The printed QR is scanned on supported phones                                 | The QR resolves to the correct URL                                                                 |
| **TS-25**  | Leadership    | Administrator selects a captain and vice captain from a house's members       | Both roles save and the reveal shows the selected members' current names and telephone numbers     |
| **TS-26**  | Leadership    | Administrator tries to select a participant from another house                | The participant is not available for selection and the change is rejected                          |
| **TS-27**  | Leadership    | Administrator selects the same member for both roles                          | Save is blocked with a clear message                                                               |
| **TS-28**  | Leadership    | Administrator selects a member without a telephone number                     | Save is blocked until the participant's telephone number is added                                  |
| **TS-29**  | Leadership    | A selected leader is reassigned or deleted                                    | The role is cleared and the house is marked incomplete until a replacement is selected             |
| **TS-30**  | Leadership    | A selected leader's name or telephone number is edited                        | The next reveal displays the updated details                                                       |

# **14\. Assumptions, Dependencies and Open Items**

## **14.1 Assumptions**

| **ID**    | **Assumption**                                                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **AS-01** | The roster will not exceed two hundred participants.                                                                                         |
| **AS-02** | The administrator creates and configures the four houses before uploading participants.                                                      |
| **AS-03** | Each house participant list is supplied separately and uploaded after its house has been created.                                            |
| **AS-04** | No rule governs the placement of siblings, as sibling relationships cannot be verified without collecting further personal data.             |
| **AS-05** | A single shared administrative credential is acceptable, and administrators are trusted equally.                                             |
| **AS-06** | A participant without a smartphone can borrow one from another person present.                                                               |
| **AS-07** | Free-tier hosting and backend capacity are sufficient for the expected load.                                                                 |
| **AS-08** | The committee accepts that roster names are discoverable through the search function by anyone who scans the code.                           |
| **AS-09** | Names are expected to be unique enough for name search; duplicate submissions are blocked rather than revealing another participant's house. |
| **AS-10** | Participant and verification data is deleted manually by the administrator after the event.                                                  |

## **14.2 Dependencies**

| **ID**    | **Dependency**                                                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DP-01** | The final URL and hosting owner will be recorded once the domain name is ready. The URL must resolve before the banner is released to print.               |
| **DP-02** | All four house lists must be supplied by house leadership in time for loading. Each list is uploaded only after its house has been created and configured. |
| **DP-03** | The print vendor's turnaround must accommodate release of artwork.                                                                                         |
| **DP-04** | Church leadership endorsement per SEC-09. Obtained.                                                                                                        |
| **DP-05** | The Presbyterian Church of Nigeria and PYPAN logo files are required in a web-suitable format before the Reveal is finalised.                              |

## **14.3 Open items**

| **ID**    | **Item**                                                                                                                                               | **Decision owner**        | **Required by** |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | --------------- |
| **OI-01** | Final URL and hosting owner will be recorded when the domain name is ready.                                                                            | Committee and Development | Before print    |
| **OI-02** | House setup and participant upload flow are resolved: the administrator creates the houses first, then uploads participants separately for each house. | Resolved                  | Resolved        |
| **OI-03** | Participant and verification data will be deleted manually by the administrator after the event.                                                       | Administrator             | After event     |

# **15\. Approval**

Approval of this document confirms that the scope described is understood and accepted, that the items excluded in section 1.4.2 are accepted as deferred, and that the decisions recorded in section 14 are correct.

| **Role**                               | **Name** | **Date** | **Signature** |
| -------------------------------------- | -------- | -------- | ------------- |
| Prepared by                            |          |          |               |
| Reviewed by — Development              |          |          |               |
| Approved by — PYPAN Planning Committee |          |          |               |
| Noted by — Church Leadership           |          |          |               |

**Document version history**

| **Version** | **Date**    | **Author**        | **Summary of change**                                                                                                                              |
| ----------- | ----------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0        | 19 Aug 2026 | Business Analysis | Initial draft issued for committee review                                                                                                          |
| **v1.3**    | 24 Aug 2026 | Business Analysis | Simplified MVP aligned to the stated objectives; removed balancing workflows, rotation logic, advanced sharing and non-essential acceptance tests. |
| **v1.2**    | 19 Aug 2026 | Business Analysis | Previous draft.                                                                                                                                    |
| **v1.3**    | 24 Aug 2026 | Business Analysis | Simplified MVP aligned to the stated objectives; removed balancing workflows, rotation logic, advanced sharing and non-essential acceptance tests. |
| **v1.2**    | 19 Aug 2026 | Business Analysis | Previous draft.                                                                                                                                    |
| **v1.2**    | 19 Aug 2026 | Business Analysis | Previous draft.                                                                                                                                    |
| ----------- | ----------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0        | 19 Aug 2026 | Business Analysis | Initial draft issued for committee review                                                                                                          |
| **v1.3**    | 24 Aug 2026 | Business Analysis | Simplified MVP aligned to the stated objectives; removed balancing workflows, rotation logic, advanced sharing and non-essential acceptance tests. |
| **v1.2**    | 19 Aug 2026 | Business Analysis | Previous draft.                                                                                                                                    |
| **v1.3**    | 24 Aug 2026 | Business Analysis | Simplified MVP aligned to the stated objectives; removed balancing workflows, rotation logic, advanced sharing and non-essential acceptance tests. |
| **v1.2**    | 19 Aug 2026 | Business Analysis | Previous draft.                                                                                                                                    |
| **v1.2**    | 19 Aug 2026 | Business Analysis | Previous draft.                                                                                                                                    |
