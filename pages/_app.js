import Layout from '../components/Layout';
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import { ThemeProvider } from '../lib/ThemeContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Head>
          <title>General Q&A — Ask, Answer, Discover</title>
          <meta name="description" content="A community-driven general question and answer platform. Ask questions, share knowledge, and discover answers." />
          <link rel="icon" href="/images/icon.png" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp; 