This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Mobile / App packaging notes

This project is web-first but prepared to be packaged as a mobile app (hybrid) or run in a WebView. A few notes:

- Layouts and global CSS now use full-viewport utilities (see `globals.css` and `app/layout.tsx`) so pages stretch to the full screen on desktop and mobile.
- We added safe bottom padding for pages that use a fixed bottom navigation (`BottomNav`) so content isn't hidden behind it on small screens.
- To package as a mobile app consider:
	- Capacitor: wrap the Next.js build as a web asset and use Capacitor to produce iOS/Android apps. See https://capacitorjs.com/docs/web
	- Alternatively, create a small React Native/Expo shell and embed the web app inside a WebView.

Quick test on device: open the site in a mobile browser and inspect using device toolbar (Chrome DevTools) to ensure no vertical scroll clipping and that header/footer behave as expected.
