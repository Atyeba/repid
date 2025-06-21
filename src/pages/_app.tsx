import '../styles/globals.css';  // make sure this path matches where your CSS file is

import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
