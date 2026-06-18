# AFM Testimonial Collector — Setup Guide

This guide will walk you through everything step by step. No technical experience needed. Every platform you need to create an account on is named clearly. If you follow these steps in order, it will work.

---

## What this does (in plain English)

You will end up with a link — something like `https://afm-testimonials.up.railway.app` — that you can send to any client. They click it, answer 5 short questions in a conversational flow, and hit submit. A few seconds later, you receive an email at yvan@activatedfrequencymarketing.com with their full testimonial already written out, a suggested pull quote highlighted at the top, and all their raw answers below it.

That's it. One link, works forever, zero manual work on your end.

---

## Before you start — accounts you need to create

You will need accounts on four platforms. All of them are free to start. Create these before you do anything else.

1. **GitHub** — github.com — This is where you store the code files. Think of it like Google Drive but specifically for code. It's free.

2. **Railway** — railway.app — This is the service that puts your form on the internet so clients can access it. It's free for the usage you'll have.

3. **Anthropic** — console.anthropic.com — This is where Claude lives. You need an API key so the app can use Claude to generate the testimonials. You may already have an Anthropic account from using Claude — if so, you just need to go to the console, not create a new account.

4. **Gmail** — You just need any Gmail address you own. It doesn't have to be your main one. This is the address the system will use to send emails to you. You likely already have one.

Go create those four accounts now, then come back here and continue.

---

## Part 1 — Upload the files to GitHub

GitHub is where you store the code so Railway can find it and put it on the internet.

**Step 1.** Go to github.com and sign in to your account.

**Step 2.** In the top right corner, click the **+** button, then click **New repository**.

**Step 3.** You'll see a form. Fill it in like this:
- Repository name: type `afm-testimonials`
- Description: leave it blank, it doesn't matter
- Select **Private** (so the code isn't public)
- Leave everything else as-is

**Step 4.** Click the green **Create repository** button.

**Step 5.** You'll land on a page that looks a bit empty. You now need to upload the files. Look for a link that says **uploading an existing file** and click it.

**Step 6.** Drag and drop these files from the folder you downloaded onto that page:
- `server.js`
- `package.json`
- `package-lock.json`
- The entire `public` folder (which contains `index.html` inside it)

Do NOT upload the `node_modules` folder — it's too large and Railway doesn't need it.

**Step 7.** Scroll down and click the green **Commit changes** button.

Your code is now saved on GitHub. Leave this tab open, you'll come back to it.

---

## Part 2 — Get your Anthropic API key

This is the key that lets the app use Claude to write the testimonials.

**Step 1.** Go to console.anthropic.com and sign in.

**Step 2.** In the left sidebar, click **API Keys**.

**Step 3.** Click **Create Key**.

**Step 4.** Give it a name — type `AFM Testimonials` — then click **Create Key**.

**Step 5.** A long string of letters and numbers will appear. It starts with `sk-ant-`. Copy it and paste it somewhere safe right now — a notes app, a doc, anywhere. You will not be able to see it again after you close this window.

That string is your `ANTHROPIC_API_KEY`. Keep it private — don't share it or post it anywhere.

---

## Part 3 — Get your Gmail App Password

Gmail requires a special password for apps to send email on your behalf. This is different from your regular Gmail password.

**Step 1.** Go to myaccount.google.com and sign in with the Gmail address you want to use.

**Step 2.** Click **Security** in the left sidebar.

**Step 3.** Make sure **2-Step Verification** is turned on. If it's not, turn it on first — Google requires this before you can create App Passwords.

**Step 4.** In the search bar at the top of the page, type **App passwords** and click the result that appears.

**Step 5.** Under "App name", type `AFM Testimonials`, then click **Create**.

**Step 6.** Google will show you a 16-character password (it looks like four groups of four letters, like `abcd efgh ijkl mnop`). Copy it exactly and paste it somewhere safe. You won't be able to see it again.

That string is your `GMAIL_APP_PASSWORD`. Note down the Gmail address you used as well — that's your `GMAIL_USER`.

---

## Part 4 — Deploy on Railway

Railway is what takes your code from GitHub and puts it on the internet so clients can access the form.

**Step 1.** Go to railway.app and sign in to your account.

**Step 2.** Click **New Project**.

**Step 3.** Click **Deploy from GitHub repo**.

**Step 4.** If this is your first time, Railway will ask permission to connect to your GitHub account. Click **Authorize Railway** and follow the prompts.

**Step 5.** You'll see a list of your GitHub repositories. Click on **afm-testimonials**.

**Step 6.** Railway will start setting things up. Wait about 30 seconds until you see your project dashboard appear.

**Step 7.** Now you need to add your secret keys. In your project dashboard, click on the service box (it usually has your repo name on it).

**Step 8.** Click the **Variables** tab at the top.

**Step 9.** You need to add four variables, one at a time. For each one, click **New Variable**, type the name on the left, paste the value on the right, and click Add.

Here are the four variables to add:

| Variable name | What to paste as the value |
|---|---|
| `ANTHROPIC_API_KEY` | The key you copied in Part 2 (starts with `sk-ant-`) |
| `GMAIL_USER` | The Gmail address you used in Part 3 (e.g. yourname@gmail.com) |
| `GMAIL_APP_PASSWORD` | The 16-character password you copied in Part 3 |
| `PORT` | Just type the number `3000` |

**Step 10.** Once all four are added, click the **Settings** tab and scroll down to find the **Domains** section. Click **Generate Domain**.

**Step 11.** Railway will give you a URL — something like `afm-testimonials.up.railway.app`. Click it to test that the form opens. If you see the AFM form with the 5–7 minute badge, everything is working.

Copy that URL. That's the link you'll send to clients.

---

## Part 5 — Send it to a client

You're done with setup. From now on, whenever you want a testimonial, just send this message:

> Hey [name] — would you be open to sharing a quick testimonial? It's 5 questions, takes about 5–7 minutes, and it's totally conversational — no essay writing required. Here's the link: [your Railway URL]
> No pressure at all, and genuinely appreciate it if you have a few minutes.

When they submit, you'll get an email with everything ready to go.

---

## If something isn't working

The most common issues and what they mean:

- **The form opens but submissions don't arrive by email** — double-check that your `GMAIL_USER` and `GMAIL_APP_PASSWORD` variables in Railway are correct. The App Password must have no spaces in it.

- **The form doesn't open at all** — go back to Railway, click on your project, and look for a red error message in the Deploy tab. Copy it and send it to Yvan or a developer.

- **You get an email but there's no testimonial, just raw answers** — your `ANTHROPIC_API_KEY` may be wrong. Go back to Part 2 and generate a new one.

---

## Updating the questions in the future

If you ever want to change the questions, open the `public/index.html` file in your GitHub repository. Find the section that says `const questions = [` — each question has three parts you can edit:
- `text` — the question the client sees
- `context` — the small hint underneath the question
- `placeholder` — the example text shown in the answer box

Edit, save, and GitHub will automatically update the live form within a minute or two.
