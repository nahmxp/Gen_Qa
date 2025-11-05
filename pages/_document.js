import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html data-theme="dark">
        <Head>
          <link rel="icon" href="/images/icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/images/icon.png" />
          <link rel="apple-touch-icon" href="/images/icon.png" />
          <meta name="theme-color" content="#121212" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 