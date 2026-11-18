/* ==========================================================================
   FLAG FORGE CTF 3.0 — behaviour
   Plain JavaScript, no libraries. Replaces React, GSAP/ScrollTrigger and Lenis.

    1. Helpers            2. Render content from data.js
    3. Image slots        4. Background canvas
    5. Alert flash        6. Navbar
    7. Typewriter         8. Countdown
    9. Reveal / count-up / flip cards
   10. ScrollFloat headings (scroll-scrubbed)
   11. Timeline           12. Register panel glow
   13. Smooth scroll + anchor links
   ========================================================================== */
;(function () {
  'use strict'

  const S = window.SITE
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!REDUCED) document.documentElement.classList.add('motion')

  /* ------------------------------------------------------------ 1. HELPERS */
  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)
  const inr = (n) => n.toLocaleString('en-IN')

  // Tiny element builder: el('div', { class: 'x', text: 'hi' }, [children])
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag)
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue
      if (k === 'class') node.className = v
      else if (k === 'style') node.style.cssText = v
      else if (k === 'text') node.textContent = v
      else if (k === 'html') node.innerHTML = v
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v)
      else node.setAttribute(k, v === true ? '' : v)
    }
    for (const c of [].concat(children)) if (c != null) node.append(c)
    return node
  }

  // One scroll/resize listener that fans out to every scroll-driven feature.
  const scrollFns = []
  const onScroll = (fn) => scrollFns.push(fn)
  const runScroll = () => scrollFns.forEach((fn) => fn())
  window.addEventListener('scroll', runScroll, { passive: true })
  window.addEventListener('resize', runScroll)

  const TONE_RGB = {
    primary: 'var(--primary-rgb)',
    accent: 'var(--accent-rgb)',
    highlight: 'var(--highlight-rgb)',
  }

  const ICONS = {
    linkedin:
      '<svg height="1.15em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>',
    instagram:
      '<svg height="1.15em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/></svg>',
  }

  /* ------------------------------------------- 2. RENDER CONTENT FROM DATA */
  function renderSponsors() {
    const list = $('#sponsor-list')
    S.SPONSORS.forEach((s, i) => {
      list.append(
        el('article', { class: 'sponsor surface surface-lit lift' + (i === 0 ? ' is-title' : ''), 'data-reveal': true, 'data-delay': i * 90 }, [
          el('a', { class: 'sponsor-logo', href: s.url, target: '_blank', rel: 'noreferrer', 'aria-label': `${s.name} website` }, [
            el('img', { src: s.logo, alt: `${s.name} logo`, width: 1160, height: 240, loading: 'lazy', decoding: 'async' }),
          ]),
          el('div', { class: 'sponsor-body' }, [
            el('span', { class: 'sponsor-tier', text: s.tier }),
            el('h3', { class: 'sponsor-name', text: s.name }),
            el('p', { class: 'sponsor-desc', text: s.desc }),
            el('a', { class: 'sponsor-link', href: s.url, target: '_blank', rel: 'noreferrer', text: `${s.site} →` }),
          ]),
        ]),
      )
    })
  }

  function renderPrizes() {
    const list = $('#prize-list')

    S.PRIZES.forEach((p, i) => {
      const rgb = TONE_RGB[p.tone] || TONE_RGB.primary
      list.append(
        el(
          'div',
          {
            class: 'prize' + (p.featured ? ' featured' : ''),
            style: `--rgb: ${rgb}`,
            'data-reveal': true,
            'data-delay': i * 80,
          },
          [
            el('div', { class: 'prize-face' + (p.featured ? ' anim-glowpulse' : '') }, [
              p.badge ? el('div', { class: 'prize-badge', text: p.badge }) : null,
              el('div', { class: 'prize-place', text: p.place }),
              el('div', { class: 'prize-rank', text: p.rank }),
              el('div', { class: 'prize-amount tnum', 'data-countup': p.amount, text: '₹0' }),
              p.extra ? el('div', { class: 'prize-extra', text: p.extra }) : null,
            ]),
          ],
        ),
      )
    })
  }

  function renderTimeline() {
    const list = $('#timeline-list')
    S.PHASES.forEach((p, i) => {
      list.append(
        el('div', { class: 'tl-item ' + (i % 2 === 0 ? 'tl-item-left' : 'tl-item-right') }, [
          el('span', { class: 'tl-node' }, [el('span', { class: 'tl-dot' }), el('span', { class: 'tl-ping' })]),
          el('div', { class: 'tl-card surface surface-lit lift' }, [
            el('div', { class: 'tl-title', text: p.title }),
            el('div', { class: 'tl-desc', text: p.desc }),
          ]),
        ]),
      )
    })
  }

  function renderGallery() {
    const root = $('#gallery')
    S.MEMORY_GROUPS.forEach((g, gi) => {
      const grid = el(
        'div',
        { class: 'gal' },
        g.photos.map((src, i) =>
          el('div', { class: 'gal-tile lift' }, [imageSlot(src, `${g.title} — photo ${i + 1}`, { fit: 'cover' })]),
        ),
      )
      root.append(
        el('div', { class: 'gal-group', 'data-reveal': true, 'data-delay': gi * 60 }, [
          el('div', { class: 'gal-head' }, [
            el('h3', { class: 'gal-title', text: g.title }),
            el('span', { class: 'gal-count', text: String(g.photos.length).padStart(2, '0') }),
          ]),
          el('div', { class: 'gal-blurb', text: g.blurb }),
          grid,
        ]),
      )
    })
  }

  function renderFacts() {
    const root = $('#event-facts')
    S.EVENT_FACTS.forEach((f, i) =>
      root.append(
        el('div', { class: 'fact', style: `--i: ${i}` }, [
          el('div', { class: 'fact-icon', text: f.icon }),
          el('div', { class: 'fact-label', text: f.label }),
          el('div', { class: 'fact-value', text: f.value }),
        ]),
      ),
    )

  }

  // Every element marked data-register opens the registration form.
  function wireRegisterLinks() {
    if (!S.REGISTER_URL) return
    $$('[data-register]').forEach((a) => {
      a.href = S.REGISTER_URL
      a.target = '_blank'
      a.rel = 'noreferrer'
    })
  }

  function renderContacts() {
    const PHONE_ICON =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/></svg>'
    const root = $('#footer-contacts')
    S.CONTACTS.forEach((c) => {
      const a = el('a', { class: 'f-contact', href: `tel:${c.tel}` }, [
        el('span', { class: 'f-contact-text', text: `${c.phone} - ${c.name}` }),
      ])
      a.insertAdjacentHTML('afterbegin', PHONE_ICON)
      root.append(a)
    })
  }

  function renderSocials() {
    const footer = $('#footer-socials')
    const mobile = $('#mobile-socials')
    S.SOCIALS.forEach((s) => {
      footer.append(
        el('li', {}, [
          el(
            'a',
            { class: `social-icon social-${s.id}`, href: s.url, target: '_blank', rel: 'noreferrer', 'aria-label': s.name },
            [el('span', { class: 'social-tooltip', 'aria-hidden': 'true', text: s.name })],
          ),
        ]),
      )
      footer.lastElementChild.firstElementChild.insertAdjacentHTML('beforeend', ICONS[s.id] || '')

      mobile.append(
        el('a', { class: 'm-social', href: s.url, target: '_blank', rel: 'noreferrer', 'aria-label': s.name, text: s.short }),
      )
    })
  }

  /* -------------------------------------------------------- 3. IMAGE SLOTS
     A real <img> sitting over a striped placeholder that shimmers while the
     photo is in flight, and switches to a "failed" state if it 404s. */
  const PLACEHOLDER_ICON =
    '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15L16 10L5 21"/></svg>'

  function imageSlot(src, alt, { circle = false, fit = 'cover', lazy = true } = {}) {
    const wrap = el('div', { class: 'img-slot' + (circle ? ' is-circle' : '') })
    const ph = el('div', { class: 'img-ph', html: PLACEHOLDER_ICON }, [])
    ph.prepend(el('div', { class: 'img-shimmer' }))
    const img = el('img', { alt: alt || '', loading: lazy ? 'lazy' : 'eager', decoding: 'async' })
    img.style.objectFit = fit

    img.addEventListener('load', () => wrap.classList.add('is-loaded'))
    img.addEventListener('error', () => {
      wrap.classList.add('is-failed')
      img.remove()
      ph.innerHTML = '<span style="font-size:22px">⚠️</span><span>Failed to load</span>'
    })
    img.src = src

    wrap.append(ph, img)
    return wrap
  }

  // Static slots declared in the HTML: <div data-img-slot data-src="…">
  function mountImageSlots() {
    $$('[data-img-slot]').forEach((node) => {
      const slot = imageSlot(node.dataset.src, node.dataset.alt, {
        circle: node.hasAttribute('data-circle'),
        fit: node.dataset.fit || 'cover',
        lazy: !node.hasAttribute('data-eager'),
      })
      node.replaceWith(slot)
    })
  }

  /* --------------------------------------------------- 4. BACKGROUND CANVAS
     Matrix rain + drifting motes, reacting to the pointer. Colours are read
     from the CSS tokens so the canvas follows the palette. */
  function initBackground() {
    const canvas = $('#bg-canvas')
    const ctx = canvas.getContext('2d')
    const css = getComputedStyle(document.documentElement)
    const tok = (name, fallback) => css.getPropertyValue(name).trim() || fallback
    const P = {
      bg: tok('--bg', '#0B0613'),
      primary: tok('--primary-rgb', '176, 38, 255'),
      accent: tok('--accent-rgb', '0, 229, 255'),
      highlight: tok('--highlight-rgb', '255, 79, 216'),
    }
    const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?/'.split('')
    const pick = (arr) => arr[(Math.random() * arr.length) | 0]
    const pointer = { x: -1000, y: -1000, active: false }

    let w = 0
    let h = 0
    let frameId = null

    // The base gradient never changes between frames: paint once per resize.
    const backdrop = document.createElement('canvas')
    const bctx = backdrop.getContext('2d')
    const paintBackdrop = () => {
      backdrop.width = canvas.width
      backdrop.height = canvas.height
      bctx.setTransform(1, 0, 0, 1, 0, 0)
      bctx.scale(canvas.width / w, canvas.height / h)
      const g = bctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, w * 0.78)
      g.addColorStop(0, `rgba(${P.primary}, 0.10)`)
      g.addColorStop(0.55, `rgba(${P.primary}, 0.03)`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      bctx.fillStyle = P.bg
      bctx.fillRect(0, 0, w, h)
      bctx.fillStyle = g
      bctx.fillRect(0, 0, w, h)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      paintBackdrop()
    }

    class Rain {
      constructor(seed = false) {
        this.reset(seed)
      }
      reset(seed = false) {
        this.x = Math.random() * w
        this.y = seed ? Math.random() * h : -20
        this.speed = 1.6 + Math.random() * 3.4
        this.char = pick(CHARS)
        this.baseSize = 13 + Math.random() * 8
        this.baseAlpha = 0.16 + Math.random() * 0.5
        this.size = this.baseSize
        this.alpha = this.baseAlpha
        this.rgb = Math.random() > 0.72 ? P.accent : P.primary
        this.glitch = false
        this.swapIn = 6 + ((Math.random() * 26) | 0)
      }
      update(mx, my) {
        this.y += this.speed
        const d = Math.hypot(this.x - mx, this.y - my)
        if (d < 210) {
          const f = (210 - d) / 210
          this.y += f * 2
          this.alpha = Math.min(1, this.baseAlpha + f * 0.75)
          this.size = this.baseSize + f * 9
        } else {
          this.alpha = this.baseAlpha
          this.size = this.baseSize
        }
        if (--this.swapIn <= 0) {
          this.char = pick(CHARS)
          this.swapIn = 6 + ((Math.random() * 26) | 0)
        }
        this.glitch = Math.random() > 0.997
        if (this.y > h + 20) this.reset()
      }
      draw() {
        ctx.font = `${this.size}px 'Courier New', monospace`
        if (this.glitch) {
          ctx.fillStyle = `rgba(${P.highlight}, ${this.alpha * 0.55})`
          ctx.fillText(this.char, this.x + 2, this.y + 2)
          ctx.fillStyle = `rgba(${P.accent}, ${this.alpha * 0.55})`
          ctx.fillText(this.char, this.x - 2, this.y - 2)
        }
        ctx.fillStyle = `rgba(${this.rgb}, ${this.alpha})`
        ctx.fillText(this.char, this.x, this.y)
      }
    }

    class Mote {
      constructor() {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.r = 0.8 + Math.random() * 1.9
        this.vx = (Math.random() - 0.5) * 0.42
        this.vy = (Math.random() - 0.5) * 0.42
        this.baseAlpha = 0.12 + Math.random() * 0.3
        this.alpha = this.baseAlpha
        this.pulse = Math.random() * Math.PI * 2
        this.rgb = Math.random() > 0.55 ? P.accent : P.highlight
      }
      update(mx, my) {
        this.x += this.vx
        this.y += this.vy
        this.pulse += 0.02
        const dx = this.x - mx
        const dy = this.y - my
        const d = Math.hypot(dx, dy)
        if (d < 160) {
          const f = (160 - d) / 160
          const a = Math.atan2(dy, dx)
          this.x += Math.cos(a) * f * 0.55
          this.y += Math.sin(a) * f * 0.55
          this.alpha = this.baseAlpha + f * 0.4
        } else {
          this.alpha = this.baseAlpha
        }
        if (this.x > w) this.x = 0
        else if (this.x < 0) this.x = w
        if (this.y > h) this.y = 0
        else if (this.y < 0) this.y = h
      }
      draw() {
        const a = this.alpha * (0.5 + 0.5 * Math.sin(this.pulse))
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${this.rgb}, ${a})`
        ctx.shadowBlur = 14
        ctx.shadowColor = `rgba(${this.rgb}, ${a * 0.6})`
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    resize()
    const rain = Array.from({ length: 70 }, () => new Rain(true))
    const motes = Array.from({ length: 42 }, () => new Mote())

    const render = (animated) => {
      ctx.drawImage(backdrop, 0, 0, w, h)
      const mx = pointer.active ? pointer.x : -1000
      const my = pointer.active ? pointer.y : -1000
      ctx.textBaseline = 'alphabetic'
      for (const p of rain) {
        if (animated) p.update(mx, my)
        p.draw()
      }
      for (const p of motes) {
        if (animated) p.update(mx, my)
        p.draw()
      }
      if (pointer.active) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 170)
        g.addColorStop(0, `rgba(${P.accent}, 0.055)`)
        g.addColorStop(1, `rgba(${P.accent}, 0)`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }
    }

    // Reduced motion: one composed still frame, repainted on resize.
    if (REDUCED) {
      render(false)
      window.addEventListener('resize', () => {
        resize()
        render(false)
      })
      return
    }

    const loop = () => {
      render(true)
      frameId = requestAnimationFrame(loop)
    }
    loop()

    window.addEventListener('resize', resize)
    window.addEventListener(
      'pointermove',
      (e) => {
        pointer.x = e.clientX
        pointer.y = e.clientY
        pointer.active = true
      },
      { passive: true },
    )
    const out = () => (pointer.active = false)
    document.documentElement.addEventListener('mouseleave', out)
    window.addEventListener('blur', out)
    // Don't burn frames on a hidden tab.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId)
        frameId = null
      } else if (frameId === null) {
        frameId = requestAnimationFrame(loop)
      }
    })
  }

  /* --------------------------------------------------------- 5. ALERT FLASH
     Cycle: alert glyph blinks → empty beat → hacker mark holds while a fake
     terminal log types out → quiet interval → repeat. */
  function initAlertFlash() {
    if (REDUCED) return

    const BLINK_MS = 900
    const GAP_MS = 450
    const HACKER_MS = 6100
    const INTERVAL = 5000
    const FIRST_DELAY = 1800
    const CHAR_MS = 16
    const LINE_PAUSE = 70
    const TYPE_START = 380

    const ALERT_SRC = 'assets/photos/alert.webp'
    const HACKER_SRC = 'assets/photos/hacker.webp'
    const HACK_LINES = [
      '> nmap -sS -p- 10.13.37.0/24',
      '> 4 hosts up · 22/tcp open',
      '> handler armed ......... ok',
      '> injecting payload ..... ok',
      '> bypassing auth token .. ok',
      '> root@flagforge:~# cat flag.txt',
      '> FLAG{br3ach_th3_g4t3s}',
    ]
    const HACKER_SPOTS = [
      { top: '30%', left: '27%' },
      { top: '66%', left: '71%' },
      { top: '72%', left: '30%' },
      { top: '26%', left: '68%' },
      { top: '55%', left: '26%' },
      { top: '36%', left: '73%' },
      { top: '78%', left: '52%' },
    ]
    const ANGLES = [-19, 13, -8, 25, -14, 7, -27, 17, 4, -11]
    const SPOTS = [
      { top: '22%', left: '11%' },
      { top: '64%', left: '87%' },
      { top: '38%', left: '80%' },
      { top: '76%', left: '15%' },
      { top: '14%', left: '72%' },
      { top: '52%', left: '9%' },
      { top: '83%', left: '65%' },
      { top: '29%', left: '91%' },
      { top: '69%', left: '34%' },
      { top: '45%', left: '23%' },
      { top: '17%', left: '48%' },
    ]

    // Warm the cache so the first burst doesn't pop in half-decoded.
    ;[ALERT_SRC, HACKER_SRC].forEach((src) => (new Image().src = src))

    const layer = $('#alert-layer')
    let beat = 0
    let stopTyping = null

    const clearLayer = () => {
      if (stopTyping) stopTyping()
      stopTyping = null
      layer.replaceChildren()
    }

    function showAlert() {
      const spot = SPOTS[beat % SPOTS.length]
      const angle = ANGLES[beat % ANGLES.length]
      const glyph = el('div', {
        class: 'af-spot af-glyph',
        // translate first so top/left are the glyph's centre; tilt about it.
        style: `top:${spot.top};left:${spot.left};transform:translate(-50%,-50%) rotate(${angle}deg)`,
      }, [el('img', { src: ALERT_SRC, alt: '' })])
      layer.replaceChildren(glyph)
    }

    function showHacker() {
      const spot = HACKER_SPOTS[beat % HACKER_SPOTS.length]
      const caret = el('i', { class: 'hk-caret' })
      // Every row exists from the first frame (padded with a nbsp) so the
      // centred block doesn't creep upward as lines appear.
      const rows = HACK_LINES.map((text, i) => {
        const tn = document.createTextNode(' ')
        const span = el('span', { class: i === HACK_LINES.length - 1 ? 'hk-hit' : null }, [tn])
        return { text, tn, span }
      })
      rows[0].span.append(caret)

      let timer
      const step = (line, col) => {
        if (line >= rows.length) return // done — caret stays parked on the last line
        const row = rows[line]
        row.span.append(caret)
        if (col < row.text.length) {
          row.tn.data = row.text.slice(0, col + 1)
          timer = setTimeout(() => step(line, col + 1), CHAR_MS)
        } else if (line + 1 < rows.length) {
          timer = setTimeout(() => step(line + 1, 0), LINE_PAUSE)
        }
      }
      timer = setTimeout(() => step(0, 0), TYPE_START)
      stopTyping = () => clearTimeout(timer)

      const burst = el('div', { class: 'af-spot', style: `top:${spot.top};left:${spot.left};transform:translate(-50%,-50%)` }, [
        el('div', { class: 'hk', style: `animation: hackerHold ${HACKER_MS}ms ease-out forwards` }, [
          el('img', { src: HACKER_SRC, alt: '', class: 'hk-art' }),
          el('div', { class: 'hk-log' }, rows.map((r) => r.span)),
        ]),
      ])
      layer.replaceChildren(burst)
    }

    function cycle() {
      beat++
      showAlert()
      // alertBlink ends at opacity 0 (forwards), so the GAP needs no timer of
      // its own — the glyph is already invisible.
      setTimeout(showHacker, BLINK_MS + GAP_MS)
      setTimeout(clearLayer, BLINK_MS + GAP_MS + HACKER_MS)
      setTimeout(cycle, BLINK_MS + GAP_MS + HACKER_MS + INTERVAL)
    }
    setTimeout(cycle, FIRST_DELAY)
  }

  /* -------------------------------------------------------------- 6. NAVBAR */
  function initNavbar() {
    const nav = $('#nav')
    const toggle = $('#menu-toggle')
    const drawer = $('#mobile-menu')
    let open = false

    const setMenu = (v) => {
      open = v
      nav.classList.toggle('menu-open', v)
      toggle.setAttribute('aria-expanded', String(v))
      toggle.setAttribute('aria-label', v ? 'Close menu' : 'Open menu')
      drawer.inert = !v
    }

    toggle.addEventListener('click', () => setMenu(!open))
    $$('[data-close-menu]').forEach((a) => a.addEventListener('click', () => setMenu(false)))
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && open) setMenu(false)
    })

    // Compact, darker bar once the page has moved.
    const update = () => nav.classList.toggle('scrolled', window.scrollY > 34)
    onScroll(update)
    update()

    // Scroll spy: a section becomes active as it crosses the viewport middle.
    const links = $$('[data-nav-link]')
    const setActive = (hash) => links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === hash))
    setActive('#home')

    const ids = [...new Set(links.map((a) => a.getAttribute('href')))]
    const sections = ids.map((id) => document.querySelector(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive('#' + hit.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
  }

  /* --------------------------------------------------------- 7. TYPEWRITER */
  function initTypewriter() {
    const target = $('#typewriter')
    const words = S.HERO_WORDS
    const TYPE = 75
    const DELETE = 50
    const PAUSE = 1500
    let wi = 0
    let ci = 0
    let deleting = false

    const tick = () => {
      const w = words[wi]
      if (!deleting) {
        target.textContent = w.slice(0, ++ci)
        if (ci === w.length) {
          deleting = true
          return setTimeout(tick, PAUSE)
        }
        setTimeout(tick, TYPE)
      } else {
        target.textContent = w.slice(0, --ci)
        if (ci === 0) {
          deleting = false
          wi = (wi + 1) % words.length
          return setTimeout(tick, 400)
        }
        setTimeout(tick, DELETE)
      }
    }
    setTimeout(tick, 700)
  }

  /* ---------------------------------------------------------- 8. COUNTDOWN */
  function initCountdown() {
    const root = $('#countdown')
    const target = new Date(S.EVENT_DATE).getTime()
    const pad = (n) => String(Math.max(0, n)).padStart(2, '0')
    const parts = () => {
      const s = Math.floor(Math.max(0, target - Date.now()) / 1000)
      return {
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        mins: Math.floor((s % 3600) / 60),
        secs: s % 60,
      }
    }
    const isDone = (t) => !t.days && !t.hours && !t.mins && !t.secs

    const renderDone = () => {
      root.classList.add('is-done')
      root.replaceChildren(el('div', { class: 'grad-text cd-done-title', text: 'The gates are open' }))
    }

    let t = parts()
    if (isDone(t)) return renderDone()

    const stamp = new Date(S.EVENT_DATE).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

    const LABELS = { days: 'Days', hours: 'Hours', mins: 'Minutes', secs: 'Seconds' }
    const cells = {}
    const row = el('div', { class: 'cd-cells' })
    for (const key of Object.keys(LABELS)) {
      const digit = el('div', { class: 'cd-digit mono tnum', text: pad(t[key]) })
      const box = el('div', { class: 'cd-cell surface surface-lit' }, [digit, el('div', { class: 'cd-label', text: LABELS[key] })])
      cells[key] = { box, digit, value: t[key], timer: null }
      row.append(box)
    }
    root.replaceChildren(el('div', { class: 'cd-stamp', text: stamp }), row)

    const id = setInterval(() => {
      const next = parts()
      if (isDone(next)) {
        clearInterval(id)
        return renderDone()
      }
      for (const key of Object.keys(cells)) {
        const c = cells[key]
        if (c.value === next[key]) continue
        c.value = next[key]
        // A fresh node replays the digit-roll animation from frame one.
        const digit = el('div', { class: 'cd-digit mono tnum', text: pad(c.value) })
        c.digit.replaceWith(digit)
        c.digit = digit
        c.box.classList.add('flash')
        clearTimeout(c.timer)
        c.timer = setTimeout(() => c.box.classList.remove('flash'), 520)
      }
    }, 1000)
  }

  /* --------------------------------------- 9. REVEAL / COUNT-UP / FLIP CARDS */
  function initReveal() {
    const items = $$('[data-reveal]')
    items.forEach((node) => {
      node.classList.add('reveal')
      if (node.dataset.delay && +node.dataset.delay) node.style.transitionDelay = node.dataset.delay + 'ms'
    })
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('in')
          io.unobserve(e.target)
        }),
      { threshold: 0.12 },
    )
    items.forEach((node) => io.observe(node))
  }

  function initCountUp() {
    const DURATION = 1500
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          io.unobserve(e.target)
          const node = e.target
          const target = +node.dataset.countup
          const start = performance.now()
          const step = (now) => {
            const t = Math.min((now - start) / DURATION, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            node.textContent = '₹' + inr(Math.floor(eased * target))
            if (t < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }),
      { threshold: 0.4 },
    )
    $$('[data-countup]').forEach((n) => io.observe(n))
  }

  /* ------------------------------------------------ 10. SCROLLFLOAT HEADINGS
     Each heading is split into chars that float up into place, scrubbed by
     scroll position. Equivalent to the GSAP version:
       start "center bottom-=2%"  → heading centre at 98% of the viewport
       end   "center center+=5%"  → heading centre at 55% of the viewport
       ease  back.inOut(2), duration 1, stagger per char. */
  function backInOut(overshoot) {
    const out = (p) => (p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0)
    return (p) => (p < 0.5 ? (1 - out(1 - p * 2)) / 2 : 0.5 + out((p - 0.5) * 2) / 2)
  }

  function initScrollFloat() {
    const ease = backInOut(2)
    const START = 0.98
    const END = 0.55

    const items = $$('[data-scroll-float]').map((h2) => {
      const span = h2.querySelector('.scroll-float-text')
      const text = span.textContent.trim()
      // Name the heading once; hide the per-char copy from screen readers.
      h2.setAttribute('aria-label', text)
      span.setAttribute('aria-hidden', 'true')
      span.textContent = ''
      const chars = [...text].map((ch) => {
        const c = el('span', { class: 'char', text: ch === ' ' ? ' ' : ch })
        span.append(c)
        return c
      })
      return { h2, chars, stagger: parseFloat(h2.dataset.stagger) || 0.03, last: -1 }
    })

    if (REDUCED) return
    items.forEach((it) =>
      it.chars.forEach((c) => {
        c.style.transformOrigin = '50% 0%'
        c.style.willChange = 'opacity, transform'
      }),
    )

    const update = () => {
      const vh = window.innerHeight
      // Read every rect first, then write, so layout is computed once.
      const progress = items.map((it) => {
        const r = it.h2.getBoundingClientRect()
        const centre = r.top + r.height / 2
        return clamp((START * vh - centre) / ((START - END) * vh), 0, 1)
      })
      items.forEach((it, i) => {
        const p = progress[i]
        if (p === it.last) return
        it.last = p
        const total = 1 + (it.chars.length - 1) * it.stagger
        const time = p * total
        it.chars.forEach((c, j) => {
          const e = ease(clamp(time - j * it.stagger, 0, 1))
          const y = 120 * (1 - e)
          const sy = 2.3 - 1.3 * e
          const sx = 0.7 + 0.3 * e
          c.style.opacity = e
          c.style.transform = `translate(0, ${y}%) scale(${sx}, ${sy})`
        })
      })
    }
    onScroll(update)
    update()
  }

  /* ----------------------------------------------------------- 11. TIMELINE
     Rail fills to 52% of the viewport; each card slides in from its side as
     it passes 88% and slides back out if you scroll up past it. */
  function initTimeline() {
    const root = $('#timeline-list')
    const rail = $('.tl-rail', root)
    const fill = $('.tl-fill', root)
    const items = $$('.tl-item', root)

    const update = () => {
      const vh = window.innerHeight
      const r = rail.getBoundingClientRect()
      const states = items.map((it) => it.getBoundingClientRect().top < vh * 0.88)
      fill.style.height = clamp(vh * 0.52 - r.top, 0, r.height) + 'px'
      items.forEach((it, i) => it.classList.toggle('tl-in', states[i]))
    }
    onScroll(update)
    // Wait a frame so the hidden start state paints and the first slide-in animates.
    requestAnimationFrame(update)
  }

  /* -------------------------------------------------- 12. REGISTER PANEL GLOW */
  function initRegisterGlow() {
    const panel = $('#register-panel')
    panel.addEventListener('pointermove', (e) => {
      const r = panel.getBoundingClientRect()
      panel.style.setProperty('--gx', ((e.clientX - r.left) / r.width) * 100 + '%')
      panel.style.setProperty('--gy', ((e.clientY - r.top) / r.height) * 100 + '%')
    })
  }

  /* --------------------------------------- 13. SMOOTH SCROLL + ANCHOR LINKS
     Lenis-style damped wheel scrolling (lerp 0.1 @ 60fps, wheel × 0.7).
     Touch, keyboard and scrollbar stay native. Disabled for reduced motion. */
  const NAV_OFFSET = -92
  const Smooth = (function () {
    const LAMBDA = 6 // = lerp 0.1 × 60fps, frame-rate independent
    const WHEEL = 0.7
    let enabled = false
    let current = 0
    let target = 0
    let raf = null
    let last = 0

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      target = clamp(target, 0, maxScroll())
      current += (target - current) * (1 - Math.exp(-LAMBDA * dt))
      if (Math.abs(target - current) < 0.5) current = target
      window.scrollTo(0, current)
      raf = current === target ? null : requestAnimationFrame(tick)
    }

    const to = (y) => {
      if (!raf) {
        current = window.scrollY
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
      target = clamp(y, 0, maxScroll())
    }

    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = null
    }

    const onWheel = (e) => {
      if (e.ctrlKey || e.defaultPrevented) return // pinch-zoom
      let dy = e.deltaY
      if (!dy) return
      if (e.deltaMode === 1) dy *= 100 / 6
      else if (e.deltaMode === 2) dy *= window.innerHeight
      e.preventDefault()
      to((raf ? target : window.scrollY) + dy * WHEEL)
    }

    return {
      enable() {
        enabled = true
        window.addEventListener('wheel', onWheel, { passive: false })
        // Any native scrolling input takes over from an in-flight glide.
        ;['keydown', 'touchstart', 'pointerdown'].forEach((t) => window.addEventListener(t, stop, { passive: true }))
      },
      scrollTo(y) {
        if (enabled) to(y)
        else window.scrollTo(0, y)
      },
      get enabled() {
        return enabled
      },
    }
  })()

  function scrollToHash(hash) {
    // A bare "#" is a placeholder (e.g. empty REGISTER_URL) — stay put.
    if (!hash || hash === '#') return
    let node
    try {
      node = document.querySelector(hash)
    } catch {
      return
    }
    if (!node) return
    if (Smooth.enabled) Smooth.scrollTo(node.getBoundingClientRect().top + window.scrollY + NAV_OFFSET)
    else node.scrollIntoView()
    try {
      history.pushState(null, '', hash)
    } catch {
      /* file:// in some browsers */
    }
  }

  function initAnchors() {
    if (!REDUCED) Smooth.enable()
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null
      if (!a) return
      e.preventDefault()
      scrollToHash(a.getAttribute('href'))
    })
  }

  /* ---------------------------------------------------------------- BOOT */
  renderSponsors()
  renderPrizes()
  renderTimeline()
  renderGallery()
  renderFacts()
  renderSocials()
  renderContacts()
  wireRegisterLinks()
  mountImageSlots()

  initBackground()
  initAlertFlash()
  initNavbar()
  initTypewriter()
  initCountdown()
  initReveal()
  initCountUp()
  initScrollFloat()
  initTimeline()
  initRegisterGlow()
  initAnchors()
})()
