# Digital Closet

An AI-assisted personal wardrobe and styling platform focused on getting more from clothing you already own. **Status:** concept development, Wave 1 prototype.

- [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md): product vision and development blueprint, v1.0 (October 2026)
- [`schema/garment.schema.json`](schema/garment.schema.json): the inventory record (JSON Schema)
- [`schema/inventory.seed.json`](schema/inventory.seed.json): the first inventory record, OUT-001
- [`prototype/index.html`](prototype/index.html): a clickable Digital Rack prototype

## Private cloud storage — now available

Your **Midnight** Supabase project now has separate closet tables and a private photo bucket. In the updated app, open **Storage & sync** and sign in or create an app-user account. The project connection settings are prefilled. Inventory and photos remain private to that signed-in account; sign in from the same updated hosted page on each device.

See [`storage/README.md`](storage/README.md) for setup, deployment, migration, verification, and limitations. Existing browser/Claude inventory is not copied automatically, and the live Claude artifact has not been updated.

## Prototype

Open `prototype/index.html` in a browser for local-only use. For cloud storage, serve the prototype folder from a stable HTTPS origin (localhost works for testing), or build the single-file distribution described in the storage guide.

- **Standalone:** data stays in that browser's local storage. Use **Export inventory JSON** to keep a copy.
- **Published as a claude.ai artifact:** the same file saves the inventory and outfits to the artifact's private database, which only the owner and editors can read. It syncs across devices and stores photos as artifact assets.

What it covers from Wave 1:

| Wave 1 feature | Prototype |
|---|---|
| Digital inventory | Guided front/label upload, review and confirmation, batch queue, duplicate warnings, edit and remove. IDs follow the `OUT-001` pattern. |
| Interactive Digital Rack | Hanging rail, drawers, accessory storage, footwear, and an illuminated fragrance shelf |
| Owner verification | Each brand, model, color, and material value is marked observed, estimated, verified, or unverified |
| Search and filtering | Text search, zone filter, and an available-only filter |
| Manual outfit creation and saving | Outfit slots that reference item IDs and never copy item data |
| Basic outfit recommendations | Rule-based and **Closet Only**: it picks from available owned items by formality and season. It is not AI yet. |
| Wave 2 preview | Laundry and availability status, wear logging, cost per wear, and wardrobe insights |

Not built yet: standalone user accounts, photo-based AI identification, automatic scheduled backups, and the Date Night, Events, and Family modes. The stack and AI provider are still open decisions (Blueprint section 18).

## Data rules carried from the blueprint

- **Recognition is not identification.** A brand or model is only `verified` with evidence such as a label, receipt, documentation, or the owner's confirmation. Owner confirmation is recorded as evidence. It is not authentication.
- **Valuations stay separate.** Original MSRP, purchase price, replacement cost, and resale value are separate fields. A comparable retail range is stored on its own, is marked provisional, and is never shown as an item's price.
- **Cost per wear uses the actual purchase price only.**
- **Outfits reference inventory records.** They never duplicate them.

## Guided closet upload

**+ Add item** opens a phone-friendly three-step flow, retaining the walnut, brass, and dark rack design:

1. **Photos:** choose a front and label photo, or use the separate camera controls on a supported phone. Use clear light and a readable label. Photos are optional. JPEG/PNG are the safest choices; unsupported formats show an error. Images are resized to a 1200-pixel longest edge and re-encoded as JPEG; retain originals separately if you need archival quality.
2. **Details:** classify the garment and enter its name, brand/model only when known, color, material, size, condition, availability, seasons, and formality. Purchase price in USD, acquisition description, and notes are optional. Each descriptive attribute retains its confidence and evidence. Existing valuations and other record fields survive editing.
3. **Review & save:** inspect photos and details, check the owner confirmation, then save. Owner confirmation is not independent authentication. Errors keep the unsaved item open for retry; a failed browser write does not add an apparently saved item to the rack.

No AI identification provider is connected. No AI suggestions or brand guesses are generated. Classification is manual, and unknown brands should stay blank. Connecting a provider requires a separate service and explicit evidence/confidence handling; never place a provider secret in this HTML.

For a batch, start an empty new item and choose up to 20 **front photos**, one per physical item. The flow queues them and asks you to add the matching label/details and confirm each item. Saved items remain saved if you cancel the rest. The unsaved queue and current upload are temporary, not recoverable drafts. Similar names, matching category/brand/color, or identical stored photo data raise an advisory duplicate warning. This is a heuristic, not visual matching; identical-looking physical items can still be saved separately. Existing items can be edited or removed from their detail panel. Removal asks for confirmation; export first if you may want to undo it.

### Storage and backups

- The existing `dc.items` browser storage key and private `items`/`outfits` collections are retained. The seed is used only when standalone browser inventory has never been saved. Private storage is never seeded or cleared by this flow. No real private inventory is committed to Git.
- Standalone saves use **localStorage**, scoped to that browser/profile/origin. This has a small, browser-dependent quota; embedded photos consume it quickly. Private browsing, clearing site data, moving the HTML file, or using another device can make the inventory unavailable. Prefer serving the HTML from a stable origin for continued use. Browser storage is not an encrypted account or a scalable photo library. Do not rely on it as your only copy.
- When the existing Claude `window.claude.use` adapter is available, records use its database and photos use its assets service. This integration is retained, not independently verified against the live private artifact. Actual sync, access rules, capacity, and asset URLs depend on that host. A private storage initialization failure stops loading rather than silently opening a separate local closet. Claude multi-editor simultaneous creation is not transaction-safe: coordinate upload sessions to avoid sequential ID collisions. The optional Supabase mode uses a separate cloud adapter and different ID generation.
- **Export inventory JSON** creates a portable array of item records and embeds photo data, including fetching private asset photos. If a photo cannot be read, export stops with an error rather than silently producing an incomplete photo backup. Keep downloaded JSON private; it contains wardrobe details and photographs. Export after each upload session and before changing the live page. Exports cover inventory, not saved outfits or the outfit in progress.
- **Import** merges a JSON inventory by ID after confirmation. Same-ID records are replaced; other records stay. Test restoration in a separate browser profile first. On the private backend embedded photos are uploaded as assets. Import is sequential, not an all-or-nothing transaction: if it fails, earlier successful records remain and you can retry. Do not import another person's closet without checking IDs. Old exports with asset IDs alone still depend on the original artifact; create a new portable export before moving hosts.
- Replaced/removed photos during editing are not immediately purged from private assets, avoiding destructive cleanup of potentially shared references. Long-term asset lifecycle management, authentication outside Claude, larger local storage (e.g. IndexedDB) and automatic backups remain future work. An optional Supabase backend is now provisioned; see the storage guide.

### Updating the live Claude page

A GitHub commit **does not update the published Claude artifact automatically**.

1. Open the existing private artifact as owner/editor and export its current real inventory. Check the JSON and preserve original photos; keep a separate backup of outfits if needed.
2. Review this branch's `prototype/index.html`. Open it locally to try the flow using test data. The local browser inventory is separate from the live artifact.
3. In Claude, manually update the **existing artifact's source** with the full HTML, retaining the same private storage environment, `items`/`outfits` collections, asset service, and owner/editor access policy. Do not delete/recreate its database or reset it to the seed. Claude's hosted artifact may require adjustments to its current runtime; the repository previously described the live page as a trimmed copy.
4. Preview the updated artifact before publishing the revision. Check that existing item counts, photos, evidence, and valuations remain intact. Add one test item with front/label photos, reload on phone and desktop, edit it, export, and verify restoration in a safe separate environment. Only then publish/share through Claude's own controls. If you must create a new artifact, restore the portable backup deliberately; a new artifact may have separate storage and asset permissions.

### Verification

Install Node.js and Playwright, then run from the repository root:

```sh
node digital-closet/tests/upload.cjs
node digital-closet/tests/private-storage.cjs
```

The scripts use installed Google Chrome on macOS by default; set `CHROME_PATH` for another Chrome executable. They cover phone-width layout, add/review/confirmation, reload persistence, edit, duplicate warning, failed storage writes, front/label photos, batch queue, delete, portable export, private-adapter failure/retry, legacy evidence/valuation preservation, and portable-photo import into a mocked private asset service. Mock tests do not prove the deployed Claude permissions or device camera behavior; validate those in the hosted preview.

## Hosted closet

Open **[Digital Closet](https://wordups.github.io/WordUp/closet/)** on your phone or computer. This cloud-first copy is hosted in a new folder on the existing WordUp Pages site, preserving its original page. Sign in to the same app account on both devices. Use **Forgot password?** if your existing account rejects its password; [the storage guide](storage/README.md#rejected-login--password-recovery) explains recovery. The old Claude artifact remains a separate, unchanged copy.
