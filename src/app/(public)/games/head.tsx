import { SITE_URL } from '@/lib/constants';

export default function Head() {
  return (
    <>
      <title>Browse Games | YoPlayables</title>
      <meta
        name="description"
        content="Browse free online browser games on YoPlayables. Explore popular, new, top-rated, and category-specific games with no download required."
      />
      <link rel="canonical" href={`${SITE_URL}/games`} />
    </>
  );
}
