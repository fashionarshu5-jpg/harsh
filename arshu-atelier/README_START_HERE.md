# ARSHU – Start Here (beginner guide)

You do NOT need to install anything on your computer. Everything is done in the browser.
Total time: about 40 minutes. Free tiers are enough for all services.

IMPORTANT: Make your GitHub repository PRIVATE (the default admin password is inside the code).

---------------------------------------------------------------
STEP 1 – Create the database (Neon)
---------------------------------------------------------------
1. Go to https://neon.tech -> sign up -> "Create project" (name it arshu).
2. On the dashboard click "Connect". Turn ON "Connection pooling". Copy the connection string
   (starts with postgresql:// and has "-pooler" in it). Save it in a notepad: this is DATABASE_URL.
3. Left menu -> "SQL Editor". Open the file  db/schema.sql  from this project, copy everything,
   paste it into the SQL Editor, press RUN. You should see "success". Tables are now created.

---------------------------------------------------------------
STEP 2 – Image storage (Cloudinary)
---------------------------------------------------------------
1. https://cloudinary.com -> sign up (free).
2. Dashboard -> "Product Environment Credentials". Copy: Cloud name, API Key, API Secret.

---------------------------------------------------------------
STEP 3 – AI key (Google Gemini)
---------------------------------------------------------------
1. https://aistudio.google.com/apikey -> "Create API key". Copy it (GEMINI_API_KEY).

---------------------------------------------------------------
STEP 4 – Make a secret for logins
---------------------------------------------------------------
Type any long random text, at least 40 characters, e.g. mix letters and numbers.
Save it as SESSION_SECRET. Never share it.

---------------------------------------------------------------
STEP 5 – Put the code on GitHub
---------------------------------------------------------------
1. Unzip arshu-atelier.zip on your computer.
2. https://github.com -> sign in -> "+" (top right) -> "New repository".
   Name: arshu-atelier. Choose PRIVATE. Click "Create repository".
3. Click "uploading an existing file". Open the unzipped folder, select EVERYTHING inside it
   (the src folder, db folder, package.json, etc.) and drag it into the browser. Wait for upload.
   Tip: if a folder is skipped, upload it separately. Click "Commit changes".

---------------------------------------------------------------
STEP 6 – Publish on Netlify
---------------------------------------------------------------
1. https://app.netlify.com -> sign up with GitHub.
2. "Add new site" -> "Import an existing project" -> GitHub -> choose arshu-atelier.
3. Leave build settings as they are. Click "Add environment variables" and add these 6:
      DATABASE_URL            (from Step 1)
      SESSION_SECRET          (from Step 4)
      GEMINI_API_KEY          (from Step 3)
      CLOUDINARY_CLOUD_NAME   (from Step 2)
      CLOUDINARY_API_KEY      (from Step 2)
      CLOUDINARY_API_SECRET   (from Step 2)
4. Click "Deploy". Wait 3-5 minutes. Netlify gives you a link like https://something.netlify.app.

---------------------------------------------------------------
STEP 7 – First login and setup
---------------------------------------------------------------
1. Open  YOUR-LINK/admin/login
   Username: Harsh Chandegara     Password: Arshu@1226
2. Website Customization -> upload your hero image, edit texts, pick colours/fonts -> "Publish to live site".
3. Collections -> New collection -> set status "published".
4. Materials -> add swatches. Outfits -> add looks (upload photos, pick the collection, link materials, publish).
5. Open the home page: your changes are live.

---------------------------------------------------------------
STEP 8 – Change the admin password (do this soon)
---------------------------------------------------------------
Make a bcrypt hash of your new password at any "bcrypt generator" (cost/rounds = 12).
In Netlify -> Site configuration -> Environment variables add:
   ADMIN_PASSWORD_HASH = (the hash)      ADMIN_USERNAME = (your username)
Then Deploys -> "Trigger deploy". The built-in password stops working.

---------------------------------------------------------------
Using a custom domain (optional)
---------------------------------------------------------------
Netlify -> Domain management -> Add a domain.

---------------------------------------------------------------
If something goes wrong
---------------------------------------------------------------
* Site loads but is empty            -> normal until you publish collections in Admin.
* "Cannot save" / error on admin     -> DATABASE_URL wrong, or schema.sql was not run (Step 1.3).
* Image upload fails                 -> check the 3 Cloudinary variables, then redeploy.
* AI research shows an error         -> check GEMINI_API_KEY. Free tier has limits: research 1-2
                                        categories at a time. If live search is limited, the app
                                        automatically switches to "conceptual" answers.
* PDF upload fails                   -> PDFs only work on the live Netlify site (Netlify Blobs).
* After changing variables           -> Deploys -> Trigger deploy -> "Deploy site".
* Build failed                       -> open the failed deploy, copy the red error text, send it to me.

---------------------------------------------------------------
What is in the project
---------------------------------------------------------------
src/app/(site)      public pages (home, collections, looks, moodboards, sketches, materials, about, contact, research)
src/app/admin       login + dashboard
src/app/api         server routes (auth, AI, uploads, approvals...)
src/db/schema.ts    Drizzle schema (9 tables)      db/schema.sql  same tables as plain SQL for Neon
src/middleware.ts   locks /admin and /api/admin
Preview links: Admin -> Outfits -> "Preview link" gives a private phone link for draft looks (valid 24h).

Notes: the hero is a single image (no slider yet). Admin and AI never publish anything by themselves:
AI suggestions go to Approvals, and approved items arrive as DRAFTS.
