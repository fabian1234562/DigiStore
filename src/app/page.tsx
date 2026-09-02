import nextDynamic from 'next/dynamic';

const PageContent = nextDynamic(() => import('./page-content'));

export default function HomePage() {
  return <PageContent />;
}
