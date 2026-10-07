# Single-page developer portfolio

Royer Adames' build of the Frontend Mentor [Single-page developer portfolio](https://www.frontendmentor.io/challenges) challenge. The page presents the challenge's sample developer, Adam Keyes. It is not Royer's own portfolio.

## What it does

- Header, hero with art-directed profile photo and decorative rings, skills, projects and a contact section, matched to the 375, 768 and 1440 Figma frames.
- On desktop pointers, "View project" and "View code" appear over each screenshot on hover and on keyboard focus. On tablet, phone and touch screens they are always visible.
- The contact form uses TanStack Form with a Zod schema. It checks on submit, then re-checks each field as it is corrected. Errors show the designed red underline, icon and message, are linked with `aria-describedby`, and focus moves to the first invalid field.
- The form is a demo: it sends and stores nothing, and its confirmation says so. Without JavaScript, the browser's own checks run and the form shows the same notice without sending any field values.
- Both "Contact me" links jump to the contact section.

## Stack

Next.js 16.3.6, React 19.2.8, Tailwind 4.2.1, TypeScript 5.9.3, TanStack Form 1.33.5, Zod 4.4.3 and Playwright 1.58.2. Space Grotesk is self-hosted.

## Scripts

```sh
npm install
npm run dev        # development server
npm run lint
npm run typecheck
npm run build
npm test           # Playwright against the production build on port 4413
```

Design files from Frontend Mentor are not committed.
