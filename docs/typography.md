# Typography System — Imprint.co Parity

## Target Reference
**Site**: [imprint.co](https://imprint.co)  
**Goal**: Match the exact typeface, weights, and typographic rhythm used on imprint.co

## Font Identification Process

### Step 1: Inspect in Browser
1. Open [imprint.co](https://imprint.co) in Chrome Desktop
2. Right-click on the hero headline → Inspect
3. Navigate to: **Elements** → Select the `<h1>` → **Computed** tab → Scroll to **Rendered Fonts**
4. Record the top "Rendered font" family name and weight
5. Switch to **Network** tab → Filter for `woff` or `woff2`
6. Note the font file names and source (CDN vs self-hosted)

### Step 2: Document Findings
**Hero Headline (H1)**:
- Font Family: `[TO BE VERIFIED]`
- Font Weight: `[TO BE VERIFIED]`
- Letter Spacing: `[TO BE VERIFIED]`
- Line Height: `[TO BE VERIFIED]`

**Body Paragraph**:
- Font Family: `[TO BE VERIFIED]`
- Font Weight: `[TO BE VERIFIED]`
- Line Height: `[TO BE VERIFIED]`

**Font Source**:
- [ ] Google Fonts
- [ ] Adobe Fonts
- [ ] Self-hosted
- [ ] Commercial/Licensed (e.g., Graphik, GT America, Söhne, Suisse)

### Step 3: Implementation Decision
- **If public font (e.g., Inter)**: Use directly from Google Fonts or self-host
- **If commercial font**: Set family name in tokens, use Inter as fallback until license is obtained

---

## Current Implementation

### Primary Font Family
**Inter** (temporary placeholder until imprint.co font is verified)

**Rationale**: Inter is the most common choice for modern SaaS/fintech sites and closely matches imprint.co's aesthetic. It will serve as a visual match until the exact font is identified.

### Typography Tokens

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Font Weights** (matching imprint.co's rhythm):
- **Display/Headlines**: 600 (Semi-Bold) or 700 (Bold)
- **Body Text**: 400 (Regular) or 500 (Medium)
- **Small Text**: 400 (Regular)

**Typography Scale**:
- **H1 (Hero)**: `clamp(40px, 6vw, 68px)` — Weight: 600-700, Line-height: ~1.1, Letter-spacing: -0.02em to -0.03em
- **H2 (Section)**: `clamp(28px, 4vw, 42px)` — Weight: 600, Line-height: ~1.2
- **H3**: `clamp(20px, 2.8vw, 28px)` — Weight: 600, Line-height: ~1.3
- **Body Large**: `18px` — Weight: 400-500, Line-height: ~1.55
- **Body**: `16px` — Weight: 400-500, Line-height: ~1.55
- **Body Small**: `14px` — Weight: 400, Line-height: ~1.5

**Key Typographic Features** (matching imprint.co):
- **Headlines**: Tight letter-spacing (-0.02em to -0.03em), compact line-height (~1.1)
- **Body Text**: Generous line-height (~1.55), comfortable reading rhythm
- **Tabular Numerals**: Used in stats blocks for proper alignment
- **No Faux Bold/Italic**: Only use weights/styles provided by the font family

---

## Acceptance Checklist

After implementing the typography system:

1. **Font Family Verification**
   - [ ] Open our site in Chrome Desktop
   - [ ] Inspect hero H1 → **Computed** → **Rendered Fonts**
   - [ ] Verify the top "Rendered font" matches the font family recorded from imprint.co (or Inter until verified)
   - [ ] Inspect a body paragraph and verify the same

2. **Font Weight Verification**
   - [ ] Hero H1 uses the exact weight observed on imprint.co (typically 600 or 700)
   - [ ] Body paragraphs use the exact weight observed on imprint.co (typically 400 or 500)
   - [ ] No faux bold/italic is being applied

3. **Typography Rhythm**
   - [ ] Headlines have tight letter-spacing (-0.02em to -0.03em)
   - [ ] Headlines have compact line-height (~1.1)
   - [ ] Body text has generous line-height (~1.55)
   - [ ] Stats blocks use tabular numerals for alignment

4. **Fallback Stack**
   - [ ] System fonts in fallback stack preserve x-height and spacing
   - [ ] If using Inter as placeholder, verify it visually matches imprint.co until the actual font is identified

5. **Screenshot Documentation**
   - [ ] Take screenshot of Chrome DevTools → **Computed** → **Rendered Fonts** panel showing our site's font
   - [ ] Attach screenshot to this document below

---

## Screenshots

### Our Site — Rendered Fonts
*[Screenshot to be added after verification]*

**Hero H1**:
- Font Family: `[TO BE VERIFIED]`
- Font Weight: `[TO BE VERIFIED]`

**Body Paragraph**:
- Font Family: `[TO BE VERIFIED]`
- Font Weight: `[TO BE VERIFIED]`

---

## Next Steps

1. **Verify imprint.co font**: Follow Step 1 above and document findings
2. **Update CSS tokens**: Replace Inter with the verified font family
3. **Add font files**: If commercial font, obtain license and add files to `/fonts/` directory
4. **Update font-face declarations**: Add `@font-face` rules if self-hosting
5. **Re-verify**: Complete acceptance checklist and add screenshots

---

## Notes

- Inter is currently used as a placeholder because it's the most likely match for modern fintech/SaaS sites
- If imprint.co uses a commercial font (Graphik, GT America, Söhne, Suisse), we'll need to purchase a license
- The typography tokens are structured to make font swapping straightforward once the exact font is identified

