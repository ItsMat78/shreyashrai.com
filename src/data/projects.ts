// The /projects page renders this list. Add a project = add an object here.
// `live` and `source` are optional — a project with neither shows no links.

export type Project = {
  title: string;
  blurb: string;
  live?: string;
  source?: string;
};

export const projects: Project[] = [
  {
    title: 'Lagrange-Lock',
    blurb:
      'A PPO reinforcement-learning agent that learns satellite station-keeping at the Earth–Moon L1 Lagrange point, on a custom CR3BP physics engine, with a Three.js/WebGL viewer.',
    live: 'https://lagrange-lock.shreyashrai.com',
    source: 'https://github.com/ItsMat78/Lagrange-Lock',
  },
  {
    title: 'Taxshila Companion',
    blurb:
      'An institutional management app on the Play Store (Next.js, TypeScript, Firebase) serving 100+ users.',
    live: 'https://timetable.shreyashrai.com',
  },
  {
    title: 'journal-advisory',
    blurb:
      'A retrieval-augmented (RAG) TUI over an Obsidian notes corpus, using sentence-transformers + ChromaDB with hybrid semantic + recency-weighted retrieval.',
  },
  {
    title: 'Glutamate',
    blurb:
      'A BERT model fine-tuned for sentiment analysis, served through a Chrome extension.',
  },
  {
    title: 'FDTD / DMD wave simulation',
    blurb:
      'An electromagnetic wave simulation sped up ~10× using Dynamic Mode Decomposition.',
  },
];
