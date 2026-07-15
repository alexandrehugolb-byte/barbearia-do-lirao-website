/* ============================================================
   Barbearia do Lirão — Script principal
   Extraído do <script> inline de index.html para uma estrutura
   de projeto profissional (assets/js/main.js).
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ================================================================
       1) ENTRADAS — navbar (.nav-load) e reveals do hero,
          seguindo o timing do design system (100ms / 400ms).
       ================================================================ */
    setTimeout(() => document.getElementById('nav').classList.add('loaded'), 100);
    setTimeout(() => document.getElementById('hero').classList.add('is-revealed'), 400);

    // A palavra "ritual." ganha o reveal letra-a-letra (.clip-letters
    // do DS) logo depois que a linha mascarada termina de assentar.
    setTimeout(() => {
        const word = document.getElementById('ritualWord');
        if (word) word.classList.add('active');
    }, 1550);

    /* ================================================================
       1.1) SPOTLIGHT DE CURSOR — adaptação do .flashlight-card do DS
            para toda a cena da hero (segue --mx/--my do mouse).
       ================================================================ */
    const heroSection = document.getElementById('hero');
    const heroSpot = document.getElementById('heroSpot');
    heroSection.addEventListener('mousemove', (e) => {
        const r = heroSection.getBoundingClientRect();
        heroSpot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        heroSpot.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    heroSection.addEventListener('mouseenter', () => heroSection.classList.add('spot-active'));
    heroSection.addEventListener('mouseleave', () => heroSection.classList.remove('spot-active'));

    /* ================================================================
       2) MENU MOBILE
       ================================================================ */
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');

    const toggleMenu = (open) => {
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        mobileMenu.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', () =>
        toggleMenu(burger.getAttribute('aria-expanded') !== 'true'));

    mobileMenu.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => toggleMenu(false)));

    /* ================================================================
       2.1) REVEAL AO ROLAR — dobras abaixo da hero. Reaproveita o
            mesmo par de classes .reveal/.is-revealed da hero (aqui
            disparado por IntersectionObserver em vez de timers, já
            que essas seções começam fora da viewport).
       ================================================================ */
    const revealOnScroll = (id) => {
        const section = document.getElementById(id);
        if (!section) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        observer.observe(section);
    };
    revealOnScroll('historia');
    revealOnScroll('servicos');
    revealOnScroll('galeria');
    revealOnScroll('barbeiros');
    revealOnScroll('avaliacoes');
    revealOnScroll('agendar');

    /* ================================================================
       3) SCROLL-SCRUBBING DO VÍDEO (estilo Apple)
       ----------------------------------------------------------------
       Estratégia:
       - O hero é "pinado" (fixado) enquanto o usuário rola ~220% de
         viewport; nesse trecho o progresso do scroll (0 → 1) é mapeado
         para video.currentTime (0 → duration). scrub suavizado (0.8s)
         dá o glide cinematográfico sem travar wheel nem touch.
       - Pré-carregamento: quando servido via http(s), o vídeo é baixado
         inteiro como Blob antes do scrub — seeks ficam instantâneos.
         Em file:// o fetch falha (CORS); caímos no src direto, que em
         disco local também busca rápido.
       - Fallbacks: prefers-reduced-motion ou erro no vídeo → loop
         normal em autoplay mudo, sem pin.
       ================================================================ */
    const video = document.getElementById('heroVideo');
    const progressBar = document.getElementById('progressBar');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fallback: reprodução contínua em loop (sem scrubbing, sem pin)
    const playAsLoop = () => {
        video.loop = true;
        // Se o autoplay for bloqueado, o primeiro frame fica como poster.
        video.play().catch(() => {});
    };

    // Ajuda no diagnóstico se o arquivo de vídeo não for encontrado
    // (ex.: index.html movido para fora da pasta do projeto).
    video.addEventListener('error', () => {
        console.warn('[Hero] Falha ao carregar o vídeo:', video.currentSrc || video.src,
            '— confira se a pasta "assets" está ao lado do index.html.');
    });

    // GSAP bloqueado/offline (CDN indisponível): vídeo em loop normal.
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[Hero] GSAP/ScrollTrigger não carregou do CDN — usando vídeo em loop.');
        playAsLoop();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) {
        playAsLoop();
        return;
    }

    // --- Pré-carregamento como Blob (melhor caso: http/https) ---
    const originalSrc = video.currentSrc || video.src;
    fetch(originalSrc)
        .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(blob => { video.src = URL.createObjectURL(blob); })
        .catch(() => { /* file:// ou rede falhou: mantém o src direto */ })
        .finally(initScrub);

    function initScrub() {
        // O arquivo já vem cortado em exatamente 6s (todo frame é
        // keyframe — reencodado para permitir seek instantâneo em
        // qualquer ponto, sem o que o scrub trava/pula). VIDEO_END
        // fica como teto de segurança caso o vídeo mude no futuro.
        const VIDEO_END = 6;

        // Proxy 0→1: permite montar o ScrollTrigger antes mesmo de o
        // metadata do vídeo chegar (duration é lida a cada update).
        const scrub = { progress: 0 };

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '+=320%',        // distância longa = vídeo avança devagar
                scrub: 0.6,           // suaviza o avanço/retrocesso sem
                                      // introduzir atraso perceptível —
                                      // a fluidez real vem do vídeo
                                      // reencodado com keyframe/frame
                pin: true,
                anticipatePin: 1
            }
        });

        // a) Sincroniza currentTime com o progresso do scroll
        //    (duração 1 = ocupa 100% do trecho pinado; 0 → VIDEO_END s)
        tl.to(scrub, {
            progress: 1,
            duration: 1,
            onUpdate: () => {
                progressBar.style.transform = `scaleX(${scrub.progress})`;
                if (!video.duration) return; // metadata ainda não chegou
                const t = scrub.progress * Math.min(VIDEO_END, video.duration);
                // evita seeks redundantes em frames idênticos
                if (Math.abs(video.currentTime - t) > 0.005) {
                    video.currentTime = t;
                }
            }
        }, 0);

        // b) Zoom sutil no vídeo ao longo do scrub (profundidade)
        tl.to(video, { scale: 1.07, duration: 1 }, 0);

        // c) O bloco de texto sobe e esmaece no trecho final,
        //    entregando o quadro ao vídeo (transição cinematográfica)
        tl.to('#heroContent', { yPercent: -14, autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, 0.6);
        tl.to('.hero__cue', { autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, 0.25);

        // Garante o primeiro frame renderizado como "poster" e valida
        // que o vídeo é utilizável; se não for, cai para o loop.
        let ready = false;
        video.addEventListener('loadeddata', () => {
            ready = true;
            video.currentTime = 0.001; // força o paint do frame inicial
        }, { once: true });

        setTimeout(() => {
            // 6s sem metadata (conexão lenta/formato não suportado):
            // desiste do scrub frame a frame e toca em loop.
            if (!ready && !video.duration) {
                tl.scrollTrigger.kill(true); // remove o pin e o scrub
                tl.kill();
                gsap.set([video, '#heroContent', '.hero__cue'], { clearProps: 'all' });
                playAsLoop();
            }
        }, 6000);
    }
});
