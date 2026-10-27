# AI photo checking

`closet-analyze` is a deployed Supabase Edge Function for the published closet. It receives at most two garment photos (front and label), calls Gemini's Generate Content API with a structured-output schema, and returns conservative suggestions. It never saves or edits inventory itself.

## Activation

In the **Midnight** project, open [Edge Function Secrets](https://supabase.com/dashboard/project/depvhpxqlpcvsuuzkwyo/functions/secrets) and add:

- `GEMINI_API_KEY`: a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey), entered directly in Supabase, never in the browser code, repository, or chat.
The model is pinned to `gemini-3.5-flash-lite`. OpenAI secrets are ignored; there is no paid-provider fallback.

No provider key is committed here. Use a Google project on the free tier without billing enabled to avoid charges. Free quotas and regional eligibility apply; quota errors stop analysis. The app cannot determine the billing tier from a key. Google may use free-tier submissions to improve its products; see [pricing and data use](https://ai.google.dev/gemini-api/docs/pricing). GET on the authenticated function reports only whether a key exists, not its value. A configured key is not proof of working billing/model access; run a live photo check after setup. The existing Supabase connection is not itself an AI subscription.

## Using the closet

For a new garment, add front/label photos and choose **Check photos with AI** on the Details step. For an existing item, choose **AI photo check** in its detail panel. A photo check sends only the selected photos to Gemini through the authenticated backend; it does not send the whole closet, purchase details, login email, or password.

The interface lists suggestions with evidence and confidence. Use **Use / replace** for each detail you want to apply, inspect the result, then confirm and save. Existing details are never automatically overwritten. If a photo changes, accepted AI values still matching those suggestions revert to their previous values, and the stale analysis is discarded. Manual edits remain yours.

Brands/models/sizes require a supplied label photo and a supporting transcription. Backend checks remove those suggestions when the source isn't a label or the quoted evidence doesn't contain the proposed value. This is a conservative guard, not proof the model transcribed the photo correctly. AI suggestions are only `observed` or `estimated`; they are never automatically `verified`. Even label text is not independent brand authentication. Unclear photos should prompt another label photo or manual entry. Condition, availability, purchase prices and ownership are never inferred by AI.

Accepted descriptive fields retain their AI photo evidence when saved and exported. The owner-confirmation step is still required. Errors, missing configuration, provider refusal and timeouts leave manual editing/saving available; no simulated analysis is shown as real.

## Backend access

- Gateway JWT verification remains enabled, and the handler validates the user against Supabase Auth too.
- `public.dc_ai_access` is an owner allowlist with a read-only RLS policy for that owner and linked sub-accounts. Only the provisioned closet owner is enrolled. Other Midnight users and new signups cannot spend this AI key's budget, and clients cannot enroll themselves.
- Origin checks allow the GitHub Pages origin and the known local preview origins. Requests accept only bounded JPEG/PNG/WebP data URIs, not remote image URLs, preventing server-side URL fetching.
- A warm function instance limits an account to 10 analysis attempts per 10 minutes. This is a best-effort cooldown, not a durable spending cap across isolates; use provider project limits for spending controls.
- Responses are not cached. No photos, prompts, keys or session tokens are logged by this code. Provider retention and data use follow Google’s terms. See [structured output documentation](https://ai.google.dev/gemini-api/docs/generate-content/structured-output).
- Existing Claude storage integration is retained, but this AI endpoint is wired for the published Supabase-backed copy; updating GitHub does not update the Claude artifact.

## Deployment and verification

Deploy `closet-analyze/index.ts` with `handler.mjs`, keeping `verify_jwt: true`. The Supabase migration `digital_closet_ai_access` is already applied; `storage/ai-access.sql` is its source and contains no user IDs. Account enrollment is separate backend-only data, not a migration with hardcoded IDs.

```sh
node digital-closet/tests/analysis.mjs
node digital-closet/tests/cloud-storage.cjs
node digital-closet/tools/build-standalone.cjs --cloud
```

The backend tests stub provider calls and exercise missing-key handling, user access, CORS, input limits/shape, schema request, refusal, and label evidence guards. Browser tests stub suggestions and cover explicit application, owner confirmation, recorded provenance, stale-photo invalidation, and missing-key fallback. These tests do not prove live model accuracy. The first live check should include a clear front and label photo and must be reviewed by the owner.
