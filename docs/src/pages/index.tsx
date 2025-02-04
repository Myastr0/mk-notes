import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          <img 
            alt={siteConfig.title} 
            src="/img/logo_full_white.svg"
            className={styles.heroLogo}
          />
        </Heading>
        <p className="hero__subtitle">
          Seamlessly sync your Markdown files to Notion
        </p>
        <p className={styles.heroDescription}>
          Keep writing in Markdown, version control with Git, and let MK Notes handle the Notion integration.
          Transform your documentation workflow with a single command.
        </p>
        <div className={styles.commandBox}>
          <code className={styles.command}>
            mk-notes sync --input ./my-repo/docs --destination https://notion.so/my-org/my-page-url --notion-api-key my-key
          </code>
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Get Started in 5 Minutes 🚀
          </Link>
          <Link
            className={clsx(
              'button button--lg',
              styles.buttonOutline
            )}
            to="https://github.com/leodumond/mk-notes"
          >
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="MK Notes - Markdown to Notion Sync"
      description="Synchronize your Markdown files to Notion with a single command. Keep your documentation workflow while leveraging Notion's collaborative features."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
