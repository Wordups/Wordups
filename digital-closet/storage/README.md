# Your private cloud closet

Storage was provisioned on October 26, 2026 in the existing **Midnight** Supabase project, under organization **Midnight**. A separate project could not be created because the account had reached its two-active-free-project limit. No new project or subscription was created. Existing Midnight tables, authentication settings, and application data were not changed.

- Project: `depvhpxqlpcvsuuzkwyo`
- Dashboard: https://supabase.com/dashboard/project/depvhpxqlpcvsuuzkwyo
- Inventory: `public.dc_items`
- Saved outfits: `public.dc_outfits`
- Photos: private `closet-photos` bucket, in a separate folder for each signed-in user
- Browser connection: the project URL and publishable key are prefilled. This key is public client configuration, not a database password. The app rejects secret/service-role keys.

## Start using it

1. Open the updated closet from a stable HTTPS URL (or localhost for a computer preview). Open **Storage & sync**.
2. Keep the prefilled Midnight project settings. Sign in with a Supabase **app user account**, or choose **Create account** with your email and a new password of at least 12 characters. Your Supabase dashboard/Google login is not necessarily an app-user password. An existing Google-only app user may need to establish an email/password login through the existing app's account recovery process. No user account or password has been created on your behalf.
3. The cloud closet starts empty. **It does not automatically copy your browser or Claude inventory.** Export a portable inventory backup from the original page, then use **Import** in the cloud closet. Verify item counts, front/label photos, and details. Retain the original inventory and backup until you have checked the result on a second device.
4. On your phone and computer, open the **same updated hosted closet URL** and sign in to the same account. Project details are public and can be configured on either device; your records are separated by signed-in account. The app refreshes roughly every 30 seconds while active and on return to the tab; **Refresh closet** is also available in settings.
5. Use **Export inventory JSON** after upload sessions for a separate backup, including embedded photo data. Cloud syncing propagates deletions and is not an independent backup. The current export still covers inventory only, not outfits.

An account may require an email confirmation depending on the project's current auth settings. If so, confirm through Supabase's email and return to the closet to sign in. Do not send passwords, service keys, or database passwords in chat. Sign out on shared devices; the Supabase SDK remembers the sign-in session in that browser, while the closet app does not save your password.

## Publishing the updated interface

The storage service is live. **The existing Claude artifact and any other hosted copy have not been updated.** Cloud storage only works in a copy that includes this new code.

For ordinary static hosting, publish both `prototype/index.html` and `prototype/cloud-storage.js` at the same stable HTTPS origin. No server secrets are needed. The browser loads a pinned Supabase SDK from jsDelivr only when cloud is selected.

For a single HTML file suitable for copying into an artifact, build it from the repository root:

```sh
node digital-closet/tools/build-standalone.cjs
```

The output is `digital-closet/releases/digital-closet.html` (generated, excluded from Git). It embeds the cloud adapter. Back up the live artifact before manually updating its HTML, following the main README's preservation steps. The artifact host must allow external Supabase network requests, its SDK, and session storage; that has not been verified against the private Claude artifact. If its sandbox blocks these features, use a normal HTTPS static host. No public closet data or photo URLs are required.

## How privacy and persistence work

- Postgres row-level security checks `auth.uid()` against `user_id` for every record operation. Composite keys include both the user and item/outfit ID. The `owner` inside a garment record stays a wardrobe profile field; it is not used for authorization.
- Photo objects are private. Access policies permit a signed-in user to read, create, and remove only objects in their own folder. The app downloads photos with the signed-in session and displays temporary browser object URLs; it never stores expiring public/signed URLs in item records.
- Cloud mode does not write the inventory or photos to `dc.items` in browser storage. Its incomplete outfit draft uses an account-specific browser key; saved outfits are stored in the cloud.
- Switching to cloud never uploads the previous inventory automatically. Switching back to browser storage opens that browser's separate inventory. Signing out clears the displayed cloud records and upload preview and locks editing; it does not open a different local closet silently.
- The app requires an internet connection to read/write cloud data. Failed writes remain errors, not apparent successful saves or an offline queue. Initial account/table verification must succeed before switching storage. Record reads are paginated to avoid the service's default row cap.
- New cloud item IDs include a timestamp and random digits to avoid the simple sequential-ID collision between devices. Concurrent edits to the *same existing* item still use last-write-wins; this prototype has no merge/conflict history.
- The bucket permits JPEG, PNG, and WebP up to 10 MiB per object. The guided flow resizes uploads to a 1200-pixel longest edge. Overall storage, transfer, and availability follow Midnight's existing Supabase plan and are shared with its other apps. Check usage in the dashboard; no unlimited-storage claim is made. Free projects may hibernate after inactivity.
- Item deletion is permanent; export before deleting. Replaced photo assets can remain in storage to avoid deleting a shared reference. Automatic scheduled backups, retention, and unused-photo cleanup are not configured.

## Verification performed

- Applied `digital_closet_private_storage` migration successfully and inspected live table RLS, policy definitions, and the private photo bucket.
- Executed live database access-control assertions in a rolled-back transaction: an owner could read a temporary test record, another user could not read it, and a cross-user insert was rejected. The test record and transaction were rolled back. No real wardrobe records were migrated.
- Confirmed no other existing `storage.objects` policies broaden closet photo access. Anonymous API access is denied.
- Browser tests with a simulated SDK cover separate cloud inventory, two-device read/refresh, separate-account visibility, photo upload/download, failed writes, portable export, sign-out locking, and deletion refresh. Real user sign-in, device camera behavior, and the private Claude host remain to be checked with the user.
- Ran Supabase's security advisor after migration. It reported no closet-table issues. Existing shared-project advisories were left unchanged: [mutable function search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [public SECURITY DEFINER execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), and [disabled leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), among other non-closet findings. These require a separate review of Midnight's existing application before changes.

Run all browser checks with Node.js, Playwright, and Chrome installed:

```sh
node digital-closet/tests/upload.cjs
node digital-closet/tests/private-storage.cjs
node digital-closet/tests/cloud-storage.cjs
```

`storage/supabase.sql` is the migration source for a fresh project. Do not re-run it on Midnight; it is already applied and deliberately fails if its table names exist rather than replacing anything.
