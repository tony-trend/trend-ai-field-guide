/* Trend Field Guide — minimal page behaviors
   Keep this intentionally small. No frameworks, no build step.
   Adds: scroll progress bar, sticky-header state, nav section highlight,
   subtle reveal-on-scroll for key elements. */

(() => {
  const doc = document.documentElement;
  const body = document.body;

  /* ------- Scroll progress bar ------- */
  const progress = document.getElementById('progress');
  const updateProgress = () => {
    const h = doc.scrollHeight - doc.clientHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    progress.style.width = p + '%';
  };

  /* ------- Sticky header state ------- */
  const header = document.getElementById('header');
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  /* ------- Nav section highlight ------- */
  const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
  const targets = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  let activeIndex = -1;
  const setActive = (idx) => {
    if (idx === activeIndex) return;
    navLinks.forEach(l => l.classList.remove('is-active'));
    if (idx >= 0 && navLinks[idx]) navLinks[idx].classList.add('is-active');
    activeIndex = idx;
  };

  const updateActiveNav = () => {
    if (!targets.length) return;
    const scrollMidline = window.scrollY + window.innerHeight * 0.22;
    let current = -1;
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      if (t.offsetTop <= scrollMidline) current = i;
    }
    setActive(current);
  };

  /* ------- Reveal on scroll (respects reduced-motion) ------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const revealSelector = [
      '.hero .display', '.hero .lede', '.hero .meta-row', '.stack-diagram',
      '.toc-list',
      '.section-head', '.layers', '.compare', '.callout', '.media',
      '.flow', '.split', '.spectrum', '.cards',
      '.table-wrap', '.aside', '.use-grid', '.risk-list',
      '.split-panel', '.pullquote', '.now-next',
      '.principle', '.glossary'
    ].join(',');
    const revealEls = document.querySelectorAll(revealSelector);
    revealEls.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    revealEls.forEach(el => io.observe(el));
  }

  /* ------- rAF batching for scroll handlers ------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      updateHeader();
      updateActiveNav();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ------- Glossary: close siblings when one opens (nicer UX) ------- */
  const glossaryDetails = document.querySelectorAll('.glossary-item details');
  glossaryDetails.forEach(d => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      glossaryDetails.forEach(other => {
        if (other !== d && other.open) other.open = false;
      });
    });
  });

  /* ------- Click-to-play video embeds -------
     Keeps YouTube's scripts out of the page until someone engages.
     Replaces the branded thumbnail with a nocookie iframe + autoplay. */
  const mediaFrames = document.querySelectorAll('.media-frame[data-video-id]');
  mediaFrames.forEach(frame => {
    const play = () => {
      const id = frame.dataset.videoId;
      const title = frame.dataset.videoTitle || 'Embedded video';
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      iframe.title = title;
      iframe.loading = 'lazy';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '');
      frame.innerHTML = '';
      frame.appendChild(iframe);
      // Neutralize button semantics now that the video is playing
      frame.removeAttribute('role');
      frame.removeAttribute('tabindex');
      frame.removeAttribute('aria-label');
      frame.style.cursor = 'default';
      frame.classList.add('is-playing');
    };
    frame.addEventListener('click', play);
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        play();
      }
    });
  });

  const landscapeCatalog = {
    providers: {
      title: 'Model providers',
      description: 'The upstream companies and labs training frontier models, shaping API terms, safety posture, and ecosystem direction.',
      items: [
        {
          name: 'OpenAI',
          url: 'https://openai.com/',
          summary: 'Ships ChatGPT, Codex, GPT-5.x, and deep research across consumer and developer surfaces.',
          tags: ['chat', 'api', 'agents']
        },
        {
          name: 'Anthropic',
          url: 'https://www.anthropic.com/',
          summary: 'Builds Claude, Claude Code, Cowork, and a safety-forward enterprise and API stack.',
          tags: ['chat', 'api', 'coding']
        },
        {
          name: 'Google DeepMind',
          url: 'https://deepmind.google/',
          summary: 'Combines Gemini, Deep Research, Veo, and broad Google distribution across consumer and enterprise products.',
          tags: ['multimodal', 'search', 'api']
        },
        {
          name: 'xAI',
          url: 'https://x.ai/',
          summary: 'Provider behind Grok and the xAI API, with emphasis on search, tool use, and X-native distribution.',
          tags: ['reasoning', 'search', 'api']
        },
        {
          name: 'Moonshot AI',
          url: 'https://www.kimi.com/',
          summary: 'Maker of Kimi and Kimi Code, known for long-context and agentic multimodal workflows.',
          tags: ['multimodal', 'agents']
        },
        {
          name: 'Meta',
          url: 'https://ai.meta.com/',
          summary: 'Steward of the Llama family and still one of the most important anchors in the open-weight ecosystem.',
          tags: ['open-weight']
        },
        {
          name: 'Mistral AI',
          url: 'https://mistral.ai/',
          summary: 'European frontier lab spanning open and commercial multimodal models plus developer tooling.',
          tags: ['open-weight', 'multimodal']
        },
        {
          name: 'Cohere',
          url: 'https://cohere.com/',
          summary: 'Enterprise-focused provider emphasizing secure deployment, multilingual work, RAG, and agents.',
          tags: ['enterprise', 'rag']
        },
        {
          name: 'Qwen',
          url: 'https://qwen.ai/',
          summary: 'Alibaba-backed family spanning agentic, multimodal, and open-weight models used widely by builders.',
          tags: ['open-weight', 'multimodal']
        },
        {
          name: 'DeepSeek',
          url: 'https://www.deepseek.com/en',
          summary: 'Open and API-accessible model family with strong reasoning and coding mindshare.',
          tags: ['reasoning', 'open']
        }
      ]
    },
    models: {
      title: 'LLMs / frontier models',
      description: 'Specific models are where capability tradeoffs become operational: reasoning depth, coding quality, multimodal input, speed, and cost.',
      items: [
        {
          name: 'GPT-5.4',
          url: 'https://developers.openai.com/api/docs/models/gpt-5.4/',
          summary: 'OpenAI\'s current flagship professional reasoning model for hard coding, tool use, and long-context work.',
          tags: ['reasoning', 'coding', 'agent']
        },
        {
          name: 'Claude Opus 4.6',
          url: 'https://www.anthropic.com/product',
          summary: 'Anthropic\'s top-tier Claude model for deep analysis, research, and ambitious multi-step work.',
          tags: ['reasoning', 'research', 'coding']
        },
        {
          name: 'Gemini 2.5 Pro',
          url: 'https://ai.google.dev/gemini-api/docs/models/gemini-v2',
          summary: 'Google\'s state-of-the-art thinking model with long context and strong coding and data performance.',
          tags: ['reasoning', 'multimodal', 'long-context']
        },
        {
          name: 'Grok 4.1',
          url: 'https://x.ai/news/grok-4-1',
          summary: 'xAI\'s flagship general model focused on strong interactive reasoning, search, and collaborative tone.',
          tags: ['reasoning', 'search']
        },
        {
          name: 'Kimi K2.5',
          url: 'https://www.kimi.com/blog/kimi-k2-5',
          summary: 'Moonshot\'s multimodal open model built for coding, documents, vision, and agent swarms.',
          tags: ['multimodal', 'vision', 'coding']
        },
        {
          name: 'GPT-4o',
          url: 'https://platform.openai.com/docs/models/gpt-4o',
          summary: 'OpenAI\'s omni model for fast text-plus-image tasks, structured outputs, and day-to-day multimodal work.',
          tags: ['vision', 'multimodal', 'speed']
        },
        {
          name: 'Qwen3.5-Omni',
          url: 'https://qwen.ai/research/',
          summary: 'Qwen\'s native omnimodal family spanning text, images, audio, and video understanding.',
          tags: ['omnimodal', 'vision', 'audio']
        },
        {
          name: 'DeepSeek R1',
          url: 'https://api-docs.deepseek.com/news/news250120',
          summary: 'DeepSeek\'s reasoning model with strong math and code mindshare plus open availability.',
          tags: ['reasoning', 'coding']
        },
        {
          name: 'Mistral Large 3',
          url: 'https://docs.mistral.ai/getting-started/models',
          summary: 'Mistral\'s high-end multimodal generalist for enterprise and developer use cases.',
          tags: ['multimodal', 'vision']
        },
        {
          name: 'Command A',
          url: 'https://docs.cohere.com/v1/docs/models/command',
          summary: 'Cohere\'s enterprise agent model designed for multilingual work, tool use, and RAG-heavy systems.',
          tags: ['agent', 'multilingual', 'rag']
        }
      ]
    },
    ides: {
      title: 'AI IDEs',
      description: 'These are the environments where AI becomes part of software delivery itself, not just a separate chatbot tab.',
      items: [
        {
          name: 'Cursor',
          url: 'https://www.cursor.com/',
          summary: 'The breakout AI-first code editor with chat, edits, and background agents built into the workflow.',
          tags: ['coding', 'agents']
        },
        {
          name: 'Windsurf',
          url: 'https://windsurf.com/editor',
          summary: 'AI-native editor centered on Cascade, blending coding, browsing, deploys, and workflow context.',
          tags: ['coding', 'agents', 'browser']
        },
        {
          name: 'GitHub Copilot',
          url: 'https://github.com/features/copilot',
          summary: 'GitHub\'s multi-surface assistant spanning editor completions, chat, reviews, terminal, and cloud agents.',
          tags: ['coding', 'reviews', 'terminal']
        },
        {
          name: 'JetBrains AI Assistant',
          url: 'https://www.jetbrains.com/help/ai-assistant/product-versions.html',
          summary: 'Deep IDE-integrated assistance across the JetBrains suite, now with broader model support.',
          tags: ['coding', 'ide-suite']
        },
        {
          name: 'Replit',
          url: 'https://replit.com/',
          summary: 'Browser-native dev environment increasingly built around app-building agents and hosted deployment.',
          tags: ['coding', 'deploy', 'browser']
        },
        {
          name: 'Zed',
          url: 'https://zed.dev/',
          summary: 'High-performance editor pairing local-first speed with edit prediction, assistants, and open agent protocols.',
          tags: ['coding', 'local', 'open']
        }
      ]
    },
    agents: {
      title: 'Agents',
      description: 'Agents operate across steps and tools, so the point is not conversation quality alone but follow-through.',
      items: [
        {
          name: 'ChatGPT agent',
          url: 'https://openai.com/blog/introducing-chatgpt-agent/',
          summary: 'OpenAI\'s browser-and-tools agent for planning, researching, operating software, and completing tasks.',
          tags: ['browser', 'tools', 'general']
        },
        {
          name: 'Claude Cowork',
          url: 'https://www.anthropic.com/product',
          summary: 'Anthropic\'s desktop agent experience for handing off work beyond chat inside the Claude app.',
          tags: ['desktop', 'general']
        },
        {
          name: 'Perplexity Computer',
          url: 'https://www.perplexity.ai/help-center/en/articles/13837784-what-is-computer',
          summary: 'Perplexity\'s task-running agent for web tasks, connectors, and increasingly local computer use.',
          tags: ['browser', 'connectors', 'research']
        },
        {
          name: 'Codex',
          url: 'https://openai.com/codex/',
          summary: 'OpenAI\'s coding agent for parallel software tasks across the app, editor, terminal, and cloud.',
          tags: ['coding', 'parallel', 'prs']
        },
        {
          name: 'GitHub Copilot cloud agent',
          url: 'https://github.com/features/copilot',
          summary: 'GitHub\'s background task agent that can take issues, plan work, and operate with repo context.',
          tags: ['coding', 'cloud', 'github']
        },
        {
          name: 'Cursor Background Agents',
          url: 'https://docs.cursor.com/en/background-agents',
          summary: 'Async remote coding agents that run tasks in isolated environments from Cursor.',
          tags: ['coding', 'remote', 'async']
        },
        {
          name: 'Replit Agent',
          url: 'https://blog.replit.com/try-agent',
          summary: 'An app-building agent that can generate, deploy, and iterate on software inside Replit.',
          tags: ['app-builder', 'deploy']
        }
      ]
    },
    automation: {
      title: 'Low-code / deterministic automation',
      description: 'This is the layer for repeatable business processes: triggers, approvals, routing, app integrations, and bounded AI steps.',
      items: [
        {
          name: 'Zapier Agents',
          url: 'https://zapier.com/agents',
          summary: 'AI teammates built on top of Zapier\'s broad app ecosystem and trigger-action workflows.',
          tags: ['low-code', 'apps']
        },
        {
          name: 'Make AI Agents',
          url: 'https://www.make.com/en/ai-agents',
          summary: 'Visual automations plus agents for multi-app orchestration with more transparent scenario logic.',
          tags: ['visual', 'apps']
        },
        {
          name: 'n8n',
          url: 'https://n8n.io/ai/',
          summary: 'Technical teams\' favorite workflow builder for combining code, AI, approvals, and self-hosting.',
          tags: ['self-host', 'technical', 'ai']
        },
        {
          name: 'Google Opal',
          url: 'https://developers.googleblog.com/id/introducing-opal/',
          summary: 'Google Labs\' no-code mini-app builder for chaining prompts, models, and tools into shareable flows.',
          tags: ['no-code', 'mini-apps']
        },
        {
          name: 'Relay.app',
          url: 'https://www.relay.app/',
          summary: 'Plain-language workflow builder that aims to make AI-assisted automations easier to trust and maintain.',
          tags: ['plain-language', 'operations']
        },
        {
          name: 'Lindy',
          url: 'https://www.lindy.ai/ai-agent',
          summary: 'No-code AI agent builder focused on inbox, meetings, support, and back-office automation.',
          tags: ['no-code', 'ops']
        },
        {
          name: 'Gumloop',
          url: 'https://www.gumloop.com/document-processing',
          summary: 'AI-first workflow builder that leans into document processing and operational automation.',
          tags: ['documents', 'ai-first']
        }
      ]
    },
    research: {
      title: 'Research agents',
      description: 'These tools are optimized for source-heavy synthesis rather than quick answers, making them closer to junior analysts than chatbots.',
      items: [
        {
          name: 'OpenAI deep research',
          url: 'https://openai.com/index/introducing-deep-research/',
          summary: 'Research agent in ChatGPT that searches, synthesizes, and cites across the web and connected sources.',
          tags: ['citations', 'analysis']
        },
        {
          name: 'Perplexity Deep Research',
          url: 'https://www.perplexity.ai/changelog/what-we-shipped---february-13-2026',
          summary: 'Source-heavy research mode built on Perplexity\'s search stack and top reasoning models.',
          tags: ['search', 'citations']
        },
        {
          name: 'Gemini Deep Research',
          url: 'https://blog.google/products/gemini/google-gemini-deep-research/',
          summary: 'Google\'s long-form research workflow inside Gemini for multi-step web synthesis and report building.',
          tags: ['search', 'reports']
        },
        {
          name: 'Google Scholar Labs',
          url: 'https://blog.google/outreach-initiatives/education/google-scholar-labs/',
          summary: 'AI-assisted scholarly research tool built specifically around academic papers and research questions.',
          tags: ['academic', 'papers']
        },
        {
          name: 'You.com ARI',
          url: 'https://you.com/articles/ari-named-on-times-list-of-the-best-inventions-of-2025',
          summary: 'Professional deep-research agent focused on long reports, many sources, and polished outputs.',
          tags: ['reports', 'multi-source']
        }
      ]
    }
  };

  /* ------- Shared preview modal -------
     Used for the stack references and the richer tool-landscape taxonomy.
     The modal can show either a single outbound reference or a curated list. */
  const preview = document.getElementById('preview');
  if (preview) {
    const previewKicker = preview.querySelector('.preview-kicker');
    const previewTerm = document.getElementById('preview-term');
    const previewSummary = document.getElementById('preview-summary');
    const previewListWrap = document.getElementById('preview-list-wrap');
    const previewList = document.getElementById('preview-list');
    const previewLink = document.getElementById('preview-link');
    const previewClose = preview.querySelector('.preview-close');
    const previewScrim = preview.querySelector('.preview-scrim');
    let lastTrigger = null;

    const isOpen = () => preview.dataset.open === 'true';

    const getFocusables = () => Array
      .from(preview.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.hidden && !el.closest('[hidden]'));

    const makeTag = (label) => {
      const tag = document.createElement('span');
      tag.className = 'preview-tag';
      tag.textContent = label;
      return tag;
    };

    const makeListItem = ({ name, url, summary, tags = [] }) => {
      const item = document.createElement('li');
      item.className = 'preview-list-item';

      const link = document.createElement('a');
      link.className = 'preview-list-link';
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      const head = document.createElement('div');
      head.className = 'preview-item-head';

      const title = document.createElement('span');
      title.className = 'preview-item-name';
      title.textContent = name;

      const arrow = document.createElement('span');
      arrow.className = 'preview-item-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';

      head.appendChild(title);
      head.appendChild(arrow);
      link.appendChild(head);

      const detail = document.createElement('span');
      detail.className = 'preview-item-summary';
      detail.textContent = summary;
      link.appendChild(detail);

      if (tags.length) {
        const tagRow = document.createElement('span');
        tagRow.className = 'preview-item-tags';
        tags.forEach(tag => tagRow.appendChild(makeTag(tag)));
        link.appendChild(tagRow);
      }

      item.appendChild(link);
      return item;
    };

    const renderPreviewList = (items) => {
      previewList.replaceChildren();
      items.forEach(item => previewList.appendChild(makeListItem(item)));
      previewListWrap.hidden = items.length === 0;
    };

    const linkLabelFor = (url) => {
      try {
        const host = new URL(url).hostname;
        return host.includes('grokipedia.com') ? 'Open on Grokipedia' : 'Open source page';
      } catch {
        return 'Open reference';
      }
    };

    const openPreview = ({ kicker = 'Reference', term, summary, url = '', linkLabel = '', items = [], trigger = null }) => {
      if (lastTrigger && lastTrigger.classList?.contains('landscape-trigger')) {
        lastTrigger.setAttribute('aria-expanded', 'false');
      }
      lastTrigger = trigger || document.activeElement;
      if (lastTrigger && lastTrigger.classList?.contains('landscape-trigger')) {
        lastTrigger.setAttribute('aria-expanded', 'true');
      }
      previewKicker.textContent = kicker;
      previewTerm.textContent = term;
      previewSummary.textContent = summary;
      renderPreviewList(items);
      previewLink.hidden = items.length > 0 || !url;
      if (url) {
        previewLink.href = url;
        previewLink.innerHTML = `${linkLabel || linkLabelFor(url)} <span aria-hidden="true">↗</span>`;
      } else {
        previewLink.removeAttribute('href');
      }
      preview.dataset.open = 'true';
      preview.setAttribute('aria-hidden', 'false');
      body.style.overflow = 'hidden';
      try { previewClose?.focus({ preventScroll: true }); } catch {}
    };

    const closePreview = () => {
      preview.dataset.open = 'false';
      preview.setAttribute('aria-hidden', 'true');
      body.style.overflow = '';
      if (lastTrigger && lastTrigger.classList?.contains('landscape-trigger')) {
        lastTrigger.setAttribute('aria-expanded', 'false');
      }
      if (lastTrigger && document.contains(lastTrigger)) {
        try { lastTrigger.focus({ preventScroll: true }); } catch {}
      }
    };

    previewScrim?.addEventListener('click', closePreview);
    previewClose?.addEventListener('click', closePreview);

    document.addEventListener('keydown', (e) => {
      if (!isOpen()) return;
      if (e.key === 'Escape') {
        closePreview();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = getFocusables();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    document.querySelectorAll('.stack-node__link, .layer__link').forEach(link => {
      link.addEventListener('click', (e) => {
        // Let users open in a new tab with modifier keys / middle click
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        const term = link.dataset.previewTerm;
        const summary = link.dataset.previewSummary;
        if (!term || !summary) return; // no data — fall through to default nav
        e.preventDefault();
        openPreview({ term, summary, url: link.href, trigger: link });
      });
    });

    document.querySelectorAll('.landscape-trigger').forEach(trigger => {
      const key = trigger.dataset.landscapeKey;
      const entry = landscapeCatalog[key];
      if (!entry) return;
      trigger.setAttribute('aria-expanded', 'false');

      const count = trigger.querySelector('[data-landscape-count]');
      if (count) {
        const label = entry.items.length === 1 ? 'example' : 'examples';
        count.textContent = `${entry.items.length} ${label}`;
      }

      trigger.addEventListener('click', () => {
        openPreview({
          kicker: 'Landscape category',
          term: entry.title,
          summary: entry.description,
          items: entry.items,
          trigger
        });
      });
    });
  }
})();
