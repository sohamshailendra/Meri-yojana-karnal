# Data issues for the district team

Things found in the scheme data (`Karnal_Schemes_Master_v6_0_Sep2026.xlsx`, built 24-09-2026) while
improving the website. The site only shows what the master sheet says; these need a decision or a correction
in the sheet so the next export carries them. Items marked **fixed in the page** were corrected directly in
`public/index.html` with the user's approval, and must also be corrected in the sheet or the next export will
undo them.

## Corrections already made in the page

| Scheme | Field | Was | Now | Why |
|---|---|---|---|---|
| FOR-001 Paudhagiri | Beneficiary type, class | Individual, no class rule | Student, classes 6–12 | Eligibility text: "School children of class 6–12". It was shown as eligible to every adult, first in the list. |
| SEWA-007 Non-school-going disabled children | Max age | none | 18 | Text: "Children 0–18 years". Was shown to adults as "check". |
| HLTH-003 RBSK child screening | Max age | none | 18 | Text: "Children 0–18 years". Was shown to adults. |
| AH-003 Livestock insurance | Canonical documents | includes *death certificate* | removed | The certificate is the animal's; the combined checklist told farmers to bring a death certificate. |
| FOR-005 Farm forestry (clonal seedlings) | Canonical documents | includes *caste* and *disability* certificate | removed | Listed "as applicable" for subsidy slabs; the checklist demanded them of every farmer. |
| SEWA-006 Assistance to widowers & unmarried persons | Special situation | none | `widower` | Text: "Widower age ≥ 40 … Unmarried 45–60, never married". Without the marker every man aged 40–60 was shown it as "yes, unless". The page now asks for it on the situations screen. |

## Hindi text (decision taken: leave in English for now)

Only `name_hi` is in Hindi. `benefit`, `benefit_short`, `docs`, `how`, `elig_text`, `nodal` and `dept` are
English for 254 of 258 schemes. The page shows "विवरण अंग्रेज़ी में हैं" on every card in Hindi. When Hindi
columns are added to the sheet, the page will use them without code changes if they are exported as
`benefit_hi`, `benefit_short_hi`, `how_hi`, `docs_hi` (list) and `nodal_hi`.

## Schemes with no website link (16)

| Id | Scheme |
|---|---|
| RCS-001 | Providing free of cost Tricycles, wheel chairs, Hearing Aids, Aids/Appliances |
| WCD-009 | Mukhyamantri Doodh Uphar Yojana |
| HLTH-006 | Nirogi Haryana Yojana – free comprehensive health check-up for Antyodaya families |
| EDU-021 | e-Adhigam – free tablets with data to Govt-school students |
| SAI-006 | Haryana Agniveer Policy – reservation, age relaxation, interest-free loans |
| REV-002 | SVAMITVA / Lal Dora-free villages – property cards |
| COOP-002 | Ekmusht Niptan Yojana – one-time settlement of PACS crop loans |
| DC-006 | Swatantrata Senani Samman Pension (State) |
| DC-007 | Loktantra Senani (Emergency Satyagrahi 1975–77) Samman Pension |
| DC-008 | Matribhasha Satyagrahi (Hindi Aandolan-1957) Samman Pension |
| HLTH-010 | Devi Rupak Scheme |
| WCD-014 | State After Care Home for Girls (Nari Niketan) |
| WCD-015 | Widows and Destitute Women Homes (Mahila Ashram) |
| EDU-025 | Award for Punjabi as Second Language (Board Matric exam) |
| EDU-026 | Samagra Shiksha – Inclusive Education: kind benefits for CwSN |
| EDU-027 | Samagra Shiksha – Stipend for Girls with Disabilities |

For these the card can only say "contact the nodal officer". A Saral/Antyodaya service-id link would do.

## Verification status (82 schemes not marked verified)

| `verif_raw` value | Schemes |
|---|---|
| NOT verified – entered from general knowledge | 18 |
| Partly verified (secondary source / sources) | 20 |
| Referred to department – area/institutional scheme | 11 |
| CONFLICT – online source differs | 4 |
| Policy status verified 24-09-2026; amount / rates not confirmed or not published | 14 |
| Searched – only outdated rates found online | 4 |
| Other partial notes | 11 |

The 18 "entered from general knowledge" and 4 "CONFLICT" rows deserve a departmental check before the
site is publicised. The page shows all 82 with a dashed "Confirm details with department" stamp.

## Names too long for a phone screen

46 English names exceed 90 characters; 13 exceed 120 (RD-001, DWO-001, DWO-004, HED-010, HLWB-002,
HLWB-005 at 213, HLWB-009, HLWB-013, HLWB-020, RD-006, ULB-005, HFA-001, SAI-002). The page now shows
the part before the first " – " or " (" as the title and the rest as a subtitle, but a short official name
column (`name_short`, `name_short_hi`) would be better.

## `benefit_short` is not short

125 schemes have a `benefit_short` over 160 characters; it is usually the first sentence of `benefit` cut
with "…". A hand-written one-line benefit ("₹3,000 per month pension", "Free treatment up to ₹5 lakh") would
make the card readable at a glance. Until then the page shows the first sentence only.

## Schemes with no canonical documents (37)

RD-001, AGR-004, AGR-007, BOCW-001, BOCW-004 to BOCW-010, BOCW-016, HLWB-007, HLWB-015, HLWB-017, FOR-001,
FOR-003, FOR-006, EDU-002, EDU-004, EDU-006, EDU-007, RD-007, SEWA-014, RD-012, ULB-005, HFA-001, WCD-009,
HLTH-007, TCP-001, HLTH-008, HLTH-009, SCI-003, WCD-013, WCD-014, WCD-015, AH-008. Their `docs_text` names
documents but they were not mapped to the canonical list, so they add nothing to the checklist.

## Schemes that match everyone

FOR-003 (sapling supply), FOR-006 (Van Mitra), RD-007 (VANGY), RD-012 (HRDA), HLTH-007 (Muft Ilaj) and
REV-002 (SVAMITVA) have no eligibility rule the questionnaire can test. They are correct as recorded, but the
page now lists them last under "For everyone in Karnal" instead of at the top of every person's results.

## Broad legal-aid entry

DLSA-002 (free legal aid) lists women, children, SC/ST, victims, persons with disability, industrial
workers and an income cap in one row. It lands in "check" for nearly everyone, which is acceptable, but
separate rows per entitlement category would let the site say "you qualify" outright.
