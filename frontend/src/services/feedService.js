import api from './apiClient';

function normalizePost(post) {
  if (!post) return null;
  const title = post.headline || post.title || 'Curated Synthesis Brief';
  const content = post.body_markdown || post.content || post.summary || '';
  const sourceRaw = post.source_attribution || (post.author?.displayName ? post.author.displayName : post.author?.username) || 'THE HINDU';
  
  // Format clean source label
  const displaySource = sourceRaw.replace(/^X\/@?/, '').toUpperCase();

  // Smart Category Inference
  let category = post.category;
  if (!category || category === 'General Synthesis') {
    const text = (title + ' ' + content + ' ' + sourceRaw).toLowerCase();
    if (
      text.includes('budget') ||
      text.includes('finance') ||
      text.includes('economic') ||
      text.includes('fiscal') ||
      text.includes('gdp') ||
      text.includes('trade') ||
      text.includes('semiconductor') ||
      text.includes('chip') ||
      text.includes('finmin')
    ) {
      category = 'Economics & Tech';
    } else if (
      text.includes('court') ||
      text.includes('law') ||
      text.includes('justice') ||
      text.includes('judiciary') ||
      text.includes('ministry') ||
      text.includes('governance') ||
      text.includes('act') ||
      text.includes('bill') ||
      text.includes('parliament') ||
      text.includes('constitution') ||
      text.includes('pib')
    ) {
      category = 'Governance & Law';
    } else if (
      text.includes('foreign') ||
      text.includes('china') ||
      text.includes('summit') ||
      text.includes('un') ||
      text.includes('diplomacy') ||
      text.includes('bilateral') ||
      text.includes('geopolitic') ||
      text.includes('mea')
    ) {
      category = 'Geopolitics';
    } else if (
      text.includes('brain') ||
      text.includes('memory') ||
      text.includes('focus') ||
      text.includes('science') ||
      text.includes('cognitive') ||
      text.includes('learning')
    ) {
      category = 'Cognitive Science';
    } else {
      category = 'Governance & Law';
    }
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readMinutes = post.read_minutes || post.readTimeMinutes || Math.max(1, Math.ceil(wordCount / 200));

  const takeaways = (post.takeaways && post.takeaways.length > 0)
    ? post.takeaways
    : post.summary
    ? [post.summary]
    : content.length > 80
    ? [content.substring(0, 160) + '...']
    : ['Key insight synthesized from verified institutional briefing.'];

  return {
    ...post,
    id: post.id || `post-${Math.random().toString(36).substr(2, 9)}`,
    title,
    headline: title,
    content,
    summary: post.summary || content.substring(0, 200),
    category,
    readTimeMinutes: readMinutes,
    source_attribution: displaySource,
    author: {
      displayName: displaySource,
      username: displaySource.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      avatarUrl: post.author?.avatarUrl || null,
    },
    takeaways,
    vocabulary: post.vocabulary || [
      { term: 'Core Concept', def: 'Critical factual milestone derived from institutional briefings.' }
    ],
    sections: post.sections || [],
    isBookmarked: post.isBookmarked || false,
    createdAt: post.published_at || post.created_at || new Date().toISOString(),
  };
}

export const feedService = {
  async getPublishedPosts() {
    try {
      const posts = await api.get('/feed/posts');
      if (Array.isArray(posts) && posts.length > 0) {
        return posts.map(normalizePost);
      }
    } catch {
      // Try compatibility endpoint
      try {
        const compatPosts = await api.get('/posts');
        if (Array.isArray(compatPosts) && compatPosts.length > 0) {
          return compatPosts.map(normalizePost);
        }
      } catch (e2) {
        console.warn('Feed endpoint fallback:', e2.message);
      }
    }
    return this.getFallbackPosts().map(normalizePost);
  },

  async getCandidates() {
    try {
      return await api.get('/feed/candidates');
    } catch {
      return [];
    }
  },

  async createPost(postData) {
    return api.post('/feed/posts', postData);
  },

  getFallbackPosts() {
    return [
      {
        id: 'post-1',
        title: 'The Art of Deliberate Focus in High-Noise Environments',
        content: `Modern knowledge work is defined by constant interruption. Deep work requires an architectural approach to attention management.\n\nTo achieve sustained cognitive flow, you must treat your attention like a finite battery. Protect your first 90 minutes of the morning for high-leverage synthesis rather than reactive triage. When encountering complex literature or technical reports, apply progressive summarization: first pass for structure, second pass for core thesis, and third pass for active recall questions.`,
        author: {
          username: 'neural_notes',
          displayName: 'Cognitive Systems Lab',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        },
        category: 'Cognitive Science',
        tags: ['Productivity', 'Deep Work', 'Mental Models'],
        readTimeMinutes: 4,
        likesCount: 342,
        bookmarksCount: 128,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        takeaways: [
          'Attention is non-renewable; schedule synthesis before triage.',
          'Use progressive summarization across three reading passes.',
          'Spaced retrieval cements insights 4x faster than re-reading.',
        ],
        vocabulary: [
          { term: 'Progressive Summarization', def: 'A technique for layering highlights to distill essence over time.' },
          { term: 'Cognitive Flow', def: 'A mental state in which a person is fully immersed in an activity.' },
        ],
        sections: [
          { id: 's1', title: 'The Attention Economy Crisis', content: 'Every digital surface is engineered to fracture deep contemplation.' },
          { id: 's2', title: 'The 90-Minute Focus Protocol', content: 'Reserve your peak circadian window exclusively for synthesis.' },
          { id: 's3', title: 'Active Recall Mechanisms', content: 'Turn passive highlights into self-test questions immediately.' },
        ],
      },
      {
        id: 'post-2',
        title: 'Geopolitical Semiconductor Supply Chains and Sovereign Compute',
        content: `The global lithography landscape represents the most intricate single point of failure in modern industrial history.\n\nExtreme Ultraviolet (EUV) lithography systems produced by ASML depend on over 5,000 precision suppliers across Europe, Japan, and North America. As national governments push for semiconductor sovereignty through multi-billion dollar domestic fabs, the limiting constraint is no longer capital—it is specialized technical talent, cleanroom chemicals, and optical mirror optics with atomic-level tolerances.`,
        author: {
          username: 'silicon_strats',
          displayName: 'Tech Geopolitics Review',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        },
        category: 'Economics & Tech',
        tags: ['Hardware', 'Geopolitics', 'Supply Chain'],
        readTimeMinutes: 6,
        likesCount: 512,
        bookmarksCount: 245,
        isBookmarked: true,
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        takeaways: [
          'EUV lithography remains an irreplaceable bottleneck with 5000+ tier-1 suppliers.',
          'Sovereign fab build-outs face human capital and chemicals constraints before capital limits.',
          'Advanced packaging and chiplet architectures are extending Moore’s Law alternatives.',
        ],
        vocabulary: [
          { term: 'EUV Lithography', def: 'Extreme Ultraviolet technology using 13.5nm wavelength light to etch nanoscale transistors.' },
          { term: 'Sovereign Compute', def: 'A nation state’s capacity to independently fabricate and secure its compute hardware.' },
        ],
        sections: [
          { id: 's1', title: 'The Monopolistic Monolith', content: 'Why no single country can replicate the ASML supply ecosystem in under a decade.' },
          { id: 's2', title: 'The Packaging Paradigm', content: 'CoWoS and 3D stacking becoming the new competitive frontier.' },
        ],
      },
      {
        id: 'post-3',
        title: 'Constitutional Jurisprudence & Fundamental Rights Evolution',
        content: `The doctrine of the Basic Structure established in Kesavananda Bharati remains the anchor of constitutional supremacy.\n\nOver the past five decades, judicial interpretation has expanded Article 21 (Right to Life and Personal Liberty) from mere animal existence to a rich mosaic of dignity, privacy (Puttaswamy), and clean environment. Understanding the proportionality test applied to state action is crucial for mastering constitutional governance.`,
        author: {
          username: 'law_governance',
          displayName: 'Constitutional Insights',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
        },
        category: 'Governance & Law',
        tags: ['Constitution', 'UPSC', 'Polity', 'Jurisprudence'],
        readTimeMinutes: 5,
        likesCount: 890,
        bookmarksCount: 420,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        takeaways: [
          'Basic Structure Doctrine limits amendatory powers under Article 368.',
          'Article 21 has evolved through the Golden Triangle (Articles 14, 19, 21).',
          'Proportionality standard requires legitimate goal, rational nexus, necessity, and balancing.',
        ],
        vocabulary: [
          { term: 'Proportionality Test', def: 'A four-prong judicial review standard measuring whether rights infringements are justified.' },
          { term: 'Basic Structure', def: 'The foundational constitutional features that cannot be abrogated by parliamentary amendments.' },
        ],
        sections: [
          { id: 's1', title: 'The Birth of Basic Structure', content: 'How judicial review safeguarded constitutional supremacy.' },
          { id: 's2', title: 'The Modern Proportionality Framework', content: 'Balancing state interests with individual fundamental freedoms.' },
        ],
      },
    ];
  },
};

export default feedService;
