# Digital Closet

An AI-assisted personal wardrobe and styling platform focused on getting more from clothing you already own. **Status:** concept development, Wave 1 prototype.

- [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md): product vision and development blueprint, v1.0 (October 2026)
- [`schema/garment.schema.json`](schema/garment.schema.json): the inventory record (JSON Schema)
- [`schema/inventory.seed.json`](schema/inventory.seed.json): the first inventory record, OUT-001
- [`prototype/index.html`](prototype/index.html): a clickable Digital Rack prototype

## Prototype

Open `prototype/index.html` in a browser. It is a single file with no build step and no server. Data stays in the browser's local storage. Use **Export inventory JSON** to keep a copy.

What it covers from Wave 1:

| Wave 1 feature | Prototype |
|---|---|
| Digital inventory | Add, edit, and remove items. IDs follow the `OUT-001` pattern. |
| Interactive Digital Rack | Hanging rail, drawers, accessory storage, footwear, and an illuminated fragrance shelf |
| Owner verification | Each brand, model, color, and material value is marked observed, estimated, verified, or unverified |
| Search and filtering | Text search, zone filter, and an available-only filter |
| Manual outfit creation and saving | Outfit slots that reference item IDs and never copy item data |
| Basic outfit recommendations | Rule-based and **Closet Only**: it picks from available owned items by formality and season. It is not AI yet. |
| Wave 2 preview | Laundry and availability status, wear logging, cost per wear, and wardrobe insights |

Not built yet: user accounts, photo-based AI identification, cloud storage, and the Date Night, Events, and Family modes. The stack and AI provider are still open decisions (Blueprint section 18).

## Data rules carried from the blueprint

- **Recognition is not identification.** A brand or model is only `verified` with evidence such as a label, receipt, documentation, or the owner's confirmation. Owner confirmation is recorded as evidence. It is not authentication.
- **Valuations stay separate.** Original MSRP, purchase price, replacement cost, and resale value are separate fields. A comparable retail range is stored on its own, is marked provisional, and is never shown as an item's price.
- **Cost per wear uses the actual purchase price only.**
- **Outfits reference inventory records.** They never duplicate them.
