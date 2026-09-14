'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const PAUSE_AT = 3.55;
const START_POSITION = { x: 12.8, y: 84 };

type Phase = 'intro' | 'waiting' | 'continuing' | 'transition' | 'map';
type BridgeState = 'ready' | 'growing' | 'dropping' | 'walking' | 'falling' | 'failed' | 'won';

const bridgePlatforms = [
  { left: 0, right: 18.1 },
  { left: 26.1, right: 38.4 },
  { left: 56.7, right: 70.8 },
  { left: 82.5, right: 100 },
];

const sparkles = [
  { x: 20.4, y: 73.2, delay: '0s' },
  { x: 33.4, y: 58.8, delay: '.7s' },
  { x: 67, y: 42.2, delay: '1.1s' },
  { x: 78, y: 34.1, delay: '.35s' },
  { x: 88, y: 22.4, delay: '1.5s' },
  { x: 57.5, y: 30.5, delay: '.9s' },
];

const memoryClips = {
  camera: { title: '拍下今天', src: '/memory-camera.webm' },
  portrait: { title: '安安的站姿', src: '/memory-pose.webm' },
  mushroom: { title: '蘑菇小回忆', src: '/memory-mushroom.webm' },
  book: { title: '书页里的灵感', src: '/memory-book.webm' },
  magnifier: { title: '放大镜下的发现', src: '/memory-magnifier.webm' },
};

const memoryClipKeys = Object.keys(memoryClips) as Array<keyof typeof memoryClips>;

const galleryPhotos = [
  { title: '下班前的夕阳', src: '/gallery/01.webp' },
  { title: '等车的午后', src: '/gallery/02.webp' },
  { title: '沙发上的夜晚', src: '/gallery/03.webp' },
  { title: '上班打卡', src: '/gallery/04.webp' },
  { title: '奔向麦田', src: '/gallery/05.webp' },
  { title: '海边假日', src: '/gallery/06.webp' },
  { title: '海岸花店', src: '/gallery/07.webp' },
  { title: '晴日垂钓', src: '/gallery/08.webp' },
  { title: '雪山远足', src: '/gallery/09.webp' },
];

const DIARY_STOPS = [0, 1.55, 3.05, 4.05];

const outfits = [
  { name: '海岛假日', image: '/outfit-01.webp' },
  { name: '橙格工匠', image: '/outfit-02.webp' },
  { name: '潮流街头', image: '/outfit-03.webp' },
  { name: '田园农夫', image: '/outfit-04.webp' },
  { name: '黑色机车', image: '/outfit-05.webp' },
  { name: '篮球少年', image: '/outfit-06.webp' },
  { name: '苹果邮差', image: '/outfit-07.webp' },
  { name: '学院格纹', image: '/outfit-08.webp' },
  { name: '复古绅士', image: '/outfit-09.webp' },
];

const emotions = [
  { name: '放松', image: '/emotions/01.png', x: 8.8, y: 28.5 },
  { name: '生气', image: '/emotions/02.png', x: 18.5, y: 28.5 },
  { name: '困倦', image: '/emotions/03.png', x: 28.5, y: 28.5 },
  { name: '喜欢', image: '/emotions/04.png', x: 71.3, y: 28.5 },
  { name: '期待', image: '/emotions/05.png', x: 81.2, y: 28.5 },
  { name: '得意', image: '/emotions/06.png', x: 91.2, y: 28.5 },
  { name: '疲惫', image: '/emotions/07.png', x: 8.8, y: 52.4 },
  { name: '超棒', image: '/emotions/08.png', x: 18.5, y: 52.4 },
  { name: '难过', image: '/emotions/09.png', x: 28.5, y: 52.4 },
  { name: '惊讶', image: '/emotions/10.png', x: 71.3, y: 52.4 },
  { name: '亲亲', image: '/emotions/11.png', x: 81.2, y: 52.4 },
  { name: '兴奋', image: '/emotions/12.png', x: 91.2, y: 52.4 },
];

const mutterNotes = [
  { text: '今天看到一朵像棉花糖的云。', x: 29.5, y: 23.4, w: 8, h: 14, tilt: -4 },
  { text: '慢一点也没关系，我还在前进。', x: 49.5, y: 20.4, w: 7, h: 10, tilt: 3 },
  { text: '为什么周一总是来得这么快？', x: 61.2, y: 26, w: 10, h: 17, tilt: -3 },
  { text: '如果蘑菇会说话，它会怕下雨吗？', x: 72, y: 22.7, w: 8, h: 13, tilt: 4 },
  { text: '海边的风，把烦恼吹走了一点点。', x: 28.8, y: 42.6, w: 7, h: 11, tilt: 2 },
  { text: '今天也要记得晒晒太阳。', x: 71.5, y: 38.5, w: 7, h: 13, tilt: -2 },
  { text: '好想拥有一顶新的小帽子。', x: 60.8, y: 49.5, w: 12, h: 19, tilt: 3 },
  { text: '路边的小花，在偷偷对我笑。', x: 61.3, y: 68, w: 6, h: 11, tilt: -4 },
  { text: '累了就坐一会儿，不算偷懒。', x: 71.5, y: 63.5, w: 7, h: 12, tilt: 4 },
  { text: '今天的晚霞像橘子汽水。', x: 50.5, y: 66, w: 10, h: 15, tilt: -2 },
  { text: '明天也许会遇见新的惊喜。', x: 39, y: 67.5, w: 7, h: 11, tilt: 3 },
  { text: '把开心的小事装进口袋里。', x: 28.7, y: 60.5, w: 7, h: 13, tilt: -3 },
];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const diaryVideoRef = useRef<HTMLVideoElement>(null);
  const diaryAnimationRef = useRef<number | null>(null);
  const startTriggeredRef = useRef(false);
  const mapEnteredRef = useRef(false);
  const mapTimerRef = useRef<number | null>(null);
  const keysRef = useRef(new Set<string>());
  const nodeInsideRef = useRef({ story: false, profile: false, wardrobe: false, game: false, memory: false, gallery: false, emotion: false, mutter: false });
  const lastTimeRef = useRef(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [muted, setMuted] = useState(true);
  const [position, setPosition] = useState(START_POSITION);
  const [moving, setMoving] = useState(false);
  const [direction, setDirection] = useState(1);
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [wardrobeRoomOpen, setWardrobeRoomOpen] = useState(false);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [memoryRoomOpen, setMemoryRoomOpen] = useState(false);
  const [memoryClip, setMemoryClip] = useState<keyof typeof memoryClips | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [emotionMuseumOpen, setEmotionMuseumOpen] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [mutterOpen, setMutterOpen] = useState(false);
  const [selectedMutter, setSelectedMutter] = useState<number | null>(null);
  const [mutterComposerOpen, setMutterComposerOpen] = useState(false);
  const [mutterDraft, setMutterDraft] = useState('');
  const [savedMutter, setSavedMutter] = useState('');
  const [selectedOutfit, setSelectedOutfit] = useState(0);
  const [gameOpen, setGameOpen] = useState(false);
  const [bridgeState, setBridgeState] = useState<BridgeState>('ready');
  const [bridgeIndex, setBridgeIndex] = useState(0);
  const [plankLength, setPlankLength] = useState(0);
  const [bridgeSheepX, setBridgeSheepX] = useState(14.3);
  const [restartFlash, setRestartFlash] = useState(false);
  const [storyUnlocked, setStoryUnlocked] = useState(false);
  const [profileUnlocked, setProfileUnlocked] = useState(false);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [storySpread, setStorySpread] = useState(0);
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null);
  const modalOpen = backpackOpen || bookOpen || profileOpen || wardrobeRoomOpen || gameOpen || memoryRoomOpen || galleryOpen || emotionMuseumOpen || mutterOpen;

  const checkPausePoint = useCallback(() => {
    const video = videoRef.current;
    if (!video || phase !== 'intro') return;
    if (video.currentTime >= PAUSE_AT) {
      video.pause();
      video.currentTime = PAUSE_AT;
      setPhase('waiting');
    }
  }, [phase]);

  const startGame = async () => {
    const video = videoRef.current;
    if (!video || phase !== 'waiting' || startTriggeredRef.current) return;
    startTriggeredRef.current = true;
    setPhase('continuing');
    video.muted = true;
    setMuted(true);
    if (video.currentTime < PAUSE_AT - .08) video.currentTime = PAUSE_AT;
    try {
      await video.play();
    } catch {
      startTriggeredRef.current = false;
      setPhase('waiting');
    }
  };

  const enterMap = () => {
    if (mapEnteredRef.current) return;
    mapEnteredRef.current = true;
    setPhase('transition');
    mapTimerRef.current = window.setTimeout(() => setPhase('map'), 650);
  };

  useEffect(() => () => {
    if (mapTimerRef.current !== null) window.clearTimeout(mapTimerRef.current);
    if (diaryAnimationRef.current !== null) cancelAnimationFrame(diaryAnimationRef.current);
  }, []);

  useEffect(() => {
    if (phase !== 'map' || modalOpen) {
      keysRef.current.clear();
      setMoving(false);
      return;
    }
    const movementKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright']);

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!movementKeys.has(key)) return;
      event.preventDefault();
      keysRef.current.add(key);
      setMoving(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase());
      setMoving(keysRef.current.size > 0);
    };
    const onBlur = () => {
      keysRef.current.clear();
      setMoving(false);
    };

    let activeFrame = 0;
    const tick = (time: number) => {
      const elapsed = Math.min(32, time - (lastTimeRef.current || time));
      lastTimeRef.current = time;
      const keys = keysRef.current;
      let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
      let dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
      const isMoving = dx !== 0 || dy !== 0;
      if (isMoving) {
        const length = Math.hypot(dx, dy);
        dx /= length;
        dy /= length;
        if (dx !== 0) setDirection(dx > 0 ? 1 : -1);
        const speed = 0.018 * elapsed;
        setPosition((current) => ({
          x: Math.max(3, Math.min(96, current.x + dx * speed)),
          y: Math.max(9, Math.min(91, current.y + dy * speed)),
        }));
      }
      setMoving(isMoving);
      activeFrame = requestAnimationFrame(tick);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    activeFrame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      cancelAnimationFrame(activeFrame);
      keysRef.current.clear();
      lastTimeRef.current = 0;
    };
  }, [phase, modalOpen]);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem('anan-story-spread'));
    if (Number.isInteger(saved) && saved >= 0 && saved <= 3) setStorySpread(saved);
    setStoryUnlocked(window.localStorage.getItem('anan-story-unlocked') === '1');
    setProfileUnlocked(window.localStorage.getItem('anan-profile-unlocked') === '1');
    const savedOutfit = Number(window.localStorage.getItem('anan-selected-outfit'));
    if (Number.isInteger(savedOutfit) && savedOutfit >= 0 && savedOutfit < outfits.length) setSelectedOutfit(savedOutfit);
    const localMutter = window.localStorage.getItem('anan-mutter') || '';
    setSavedMutter(localMutter);
    setMutterDraft(localMutter);
    setInventoryLoaded(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('anan-story-spread', String(storySpread));
  }, [storySpread]);

  useEffect(() => {
    if (!inventoryLoaded) return;
    window.localStorage.setItem('anan-story-unlocked', storyUnlocked ? '1' : '0');
  }, [storyUnlocked, inventoryLoaded]);

  useEffect(() => {
    if (!inventoryLoaded) return;
    window.localStorage.setItem('anan-profile-unlocked', profileUnlocked ? '1' : '0');
  }, [profileUnlocked, inventoryLoaded]);

  useEffect(() => {
    if (!inventoryLoaded) return;
    window.localStorage.setItem('anan-selected-outfit', String(selectedOutfit));
  }, [selectedOutfit, inventoryLoaded]);

  useEffect(() => {
    if (phase !== 'map' || modalOpen) return;
    const nodes = [
      { id: 'story' as const, x: 20.1, y: 73.2 },
      { id: 'profile' as const, x: 33.4, y: 58.8 },
      { id: 'wardrobe' as const, x: 32.4, y: 43.2 },
      { id: 'game' as const, x: 55.7, y: 54.6 },
      { id: 'memory' as const, x: 57.5, y: 30.5 },
      { id: 'gallery' as const, x: 78, y: 34.1 },
      { id: 'emotion' as const, x: 67, y: 42.2 },
      { id: 'mutter' as const, x: 88, y: 22.4 },
    ];
    for (const node of nodes) {
      const dx = position.x - node.x;
      const dy = (position.y - node.y) * 1.75;
      const inside = Math.hypot(dx, dy) < 5.2;
      if (inside && !nodeInsideRef.current[node.id]) {
        nodeInsideRef.current[node.id] = true;
        if (node.id === 'story') {
          setStoryUnlocked(true);
          setBookOpen(true);
        } else if (node.id === 'profile') {
          setProfileUnlocked(true);
          setProfileOpen(true);
        } else if (node.id === 'wardrobe') {
          setWardrobeOpen(false);
          setWardrobeRoomOpen(true);
        } else if (node.id === 'game') {
          setBridgeIndex(0);
          setPlankLength(0);
          setBridgeSheepX(14.3);
          setBridgeState('ready');
          setGameOpen(true);
        } else if (node.id === 'memory') {
          setMemoryClip(null);
          setMemoryRoomOpen(true);
        } else if (node.id === 'gallery') {
          setGalleryIndex(0);
          setGalleryOpen(true);
        } else if (node.id === 'emotion') {
          setSelectedEmotion(null);
          setEmotionMuseumOpen(true);
        } else {
          setSelectedMutter(null);
          setMutterComposerOpen(false);
          setMutterOpen(true);
        }
      } else if (!inside) {
        nodeInsideRef.current[node.id] = false;
      }
    }
  }, [position, phase, modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const closeTopLayer = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (memoryClip) setMemoryClip(null);
      else if (memoryRoomOpen) setMemoryRoomOpen(false);
      else if (galleryOpen) setGalleryOpen(false);
      else if (emotionMuseumOpen) { if (selectedEmotion !== null) setSelectedEmotion(null); else setEmotionMuseumOpen(false); }
      else if (mutterOpen) { if (mutterComposerOpen) setMutterComposerOpen(false); else if (selectedMutter !== null) setSelectedMutter(null); else setMutterOpen(false); }
      else if (gameOpen) setGameOpen(false);
      else if (wardrobeRoomOpen && wardrobeOpen) setWardrobeOpen(false);
      else if (wardrobeRoomOpen) setWardrobeRoomOpen(false);
      else if (bookOpen) setBookOpen(false);
      else if (profileOpen) setProfileOpen(false);
      else setBackpackOpen(false);
    };
    window.addEventListener('keydown', closeTopLayer);
    return () => window.removeEventListener('keydown', closeTopLayer);
  }, [modalOpen, bookOpen, profileOpen, wardrobeRoomOpen, wardrobeOpen, gameOpen, memoryRoomOpen, memoryClip, galleryOpen, emotionMuseumOpen, selectedEmotion, mutterOpen, mutterComposerOpen, selectedMutter]);

  useEffect(() => {
    if (!gameOpen || bridgeState !== 'growing') return;
    const timer = window.setInterval(() => setPlankLength((length) => Math.min(36, length + .22)), 16);
    return () => window.clearInterval(timer);
  }, [gameOpen, bridgeState]);

  const releaseBridge = useCallback(() => {
    if (bridgeState !== 'growing') return;
    setBridgeState('dropping');
    const origin = bridgePlatforms[bridgeIndex].right;
    const destination = bridgePlatforms[bridgeIndex + 1];
    const plankEnd = origin + plankLength;
    const successful = plankEnd >= destination.left && plankEnd <= destination.right;
    window.setTimeout(() => {
      setBridgeState('walking');
      setBridgeSheepX(successful ? destination.right - 3.8 : Math.min(96, plankEnd - 1.2));
      window.setTimeout(() => {
        if (!successful) {
          setBridgeState('falling');
          window.setTimeout(() => setBridgeState('failed'), 650);
          return;
        }
        const nextIndex = bridgeIndex + 1;
        if (nextIndex === bridgePlatforms.length - 1) {
          setBridgeState('won');
          setBridgeSheepX(88);
        } else {
          setBridgeIndex(nextIndex);
          setBridgeSheepX(bridgePlatforms[nextIndex].right - 3.8);
          setPlankLength(0);
          setBridgeState('ready');
        }
      }, 920);
    }, 430);
  }, [bridgeState, bridgeIndex, plankLength]);

  useEffect(() => {
    if (!gameOpen) return;
    const keyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      if (!event.repeat && bridgeState === 'ready') {
        setPlankLength(.5);
        setBridgeState('growing');
      }
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      releaseBridge();
    };
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [gameOpen, bridgeState, releaseBridge]);

  const retryBridge = () => {
    setBridgeIndex(0);
    setPlankLength(0);
    setBridgeSheepX(14.3);
    setBridgeState('ready');
  };

  const restartAdventure = () => {
    ['anan-story-spread', 'anan-story-unlocked', 'anan-profile-unlocked', 'anan-selected-outfit'].forEach((key) => window.localStorage.removeItem(key));
    keysRef.current.clear();
    setStorySpread(0);
    setStoryUnlocked(false);
    setProfileUnlocked(false);
    setSelectedOutfit(0);
    setPosition(START_POSITION);
    setBackpackOpen(false);
    setBookOpen(false);
    setProfileOpen(false);
    setWardrobeRoomOpen(false);
    setMemoryRoomOpen(false);
    setMemoryClip(null);
    setGalleryOpen(false);
    setGalleryIndex(0);
    setGameOpen(false);
    setRestartFlash(true);
    window.setTimeout(() => setRestartFlash(false), 900);
  };

  const openStory = () => {
    setBackpackOpen(false);
    setBookOpen(true);
  };

  const turnStory = (directionToTurn: 'next' | 'prev') => {
    if (turning) return;
    const target = storySpread + (directionToTurn === 'next' ? 1 : -1);
    if (target < 0 || target > 3) return;
    const diary = diaryVideoRef.current;
    if (!diary || !Number.isFinite(diary.duration)) return;
    if (diaryAnimationRef.current !== null) cancelAnimationFrame(diaryAnimationRef.current);
    diary.pause();
    const from = Math.min(DIARY_STOPS[storySpread], diary.duration - .04);
    const to = Math.min(DIARY_STOPS[target], diary.duration - .04);
    setTurning(directionToTurn);
    diary.currentTime = from;
    if (directionToTurn === 'next') {
      void diary.play();
      const pauseAtPage = () => {
        if (diary.currentTime >= to - .025) {
          diary.pause();
          diary.currentTime = to;
          diaryAnimationRef.current = null;
          setStorySpread(target);
          setTurning(null);
          return;
        }
        diaryAnimationRef.current = requestAnimationFrame(pauseAtPage);
      };
      diaryAnimationRef.current = requestAnimationFrame(pauseAtPage);
      return;
    }
    let previousFrame = performance.now();
    const reversePage = (now: number) => {
      const elapsed = Math.min(.05, (now - previousFrame) / 1000);
      previousFrame = now;
      diary.currentTime = Math.max(to, diary.currentTime - elapsed);
      if (diary.currentTime <= to + .015) {
        diary.currentTime = to;
        diaryAnimationRef.current = null;
        setStorySpread(target);
        setTurning(null);
        return;
      }
      diaryAnimationRef.current = requestAnimationFrame(reversePage);
    };
    diaryAnimationRef.current = requestAnimationFrame(reversePage);
  };

  const showVideo = phase !== 'map';

  return (
    <main className="experience">
      <section className={`intro-scene ${phase === 'transition' || phase === 'map' ? 'is-leaving' : ''}`} aria-hidden={!showVideo}>
        <div className="video-stage">
          <video ref={videoRef} className="opening-video" src="/opening.mp4" autoPlay muted={muted} playsInline preload="auto" onTimeUpdate={checkPausePoint} onEnded={enterMap}>
            <track kind="captions" src="/captions.vtt" srcLang="zh-CN" label="无对白" default />
          </video>
          {phase === 'waiting' && <button className="start-hotspot" onClick={startGame} aria-label="开始游戏"><span className="hotspot-ring" /></button>}
          {phase === 'waiting' && <p className="start-hint" aria-live="polite">点击屏幕里的「开始游戏」</p>}
          <button className="sound-toggle" onClick={() => { const next = !muted; setMuted(next); if (videoRef.current) videoRef.current.muted = next; }} aria-label={muted ? '开启声音' : '关闭声音'}>{muted ? '声音：关' : '声音：开'}</button>
        </div>
      </section>

      <section className={`map-scene ${phase === 'map' ? 'is-visible' : ''}`} aria-hidden={phase !== 'map'}>
        <div className="map-stage">
          <img className="map-image" src="/map-clean-v2.png" alt="安安的像素冒险地图" width="1672" height="941" draggable={false} />
          <div className="sun-glow" /><div className="water-glint glint-one" /><div className="water-glint glint-two" /><div className="portal-pulse" />
          {sparkles.map((sparkle) => <span className="node-sparkle" key={`${sparkle.x}-${sparkle.y}`} style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%`, animationDelay: sparkle.delay }} />)}
          <span className="moving-cloud cloud-one" aria-hidden="true"><img src="/cloud-sprite-v2.png" alt="" /></span>
          <span className="moving-cloud cloud-two" aria-hidden="true"><img src="/cloud-sprite-v2.png" alt="" /></span>
          <span className="moving-cloud cloud-three" aria-hidden="true"><img src="/cloud-sprite-v2.png" alt="" /></span>
          <span className="flying-bird bird-one" aria-hidden="true"><img src="/bird-sprite.png" alt="" /></span>
          <span className="flying-bird bird-two" aria-hidden="true"><img src="/bird-sprite.png" alt="" /></span>
          <span className="flying-bird bird-three" aria-hidden="true"><img src="/bird-sprite.png" alt="" /></span>
          <div className={`anan ${moving ? 'is-walking' : ''}`} style={{ left: `${position.x}%`, top: `${position.y}%`, transform: `translate(-50%, -74%) scaleX(${direction})` }}>
            <img className="anan-idle" src="/anan-idle.png" alt="安安" draggable={false} />
            <img className="anan-walk" src="/anan-walk.webp" alt="" aria-hidden="true" draggable={false} />
            <span className="character-shadow" />
          </div>
        </div>
        <div className="map-instructions"><span className="key-group" aria-hidden="true"><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></span><p><strong>移动安安</strong><small>WASD 或方向键，自由探索地图</small></p></div>
        <div className="map-title" aria-hidden="true"><span>安安的</span><strong>奇妙旅行</strong></div>
        <button className="backpack-button" onClick={() => setBackpackOpen(true)} aria-label="打开背包"><span className="pixel-bag" aria-hidden="true">▣</span><strong>背包</strong><i>{Number(storyUnlocked) + Number(profileUnlocked)}</i></button>
        <button className="adventure-restart" onClick={restartAdventure} aria-label="清空进度并重新开始"><span aria-hidden="true">↻</span><strong>重新开始</strong><small>清空进度</small></button>
        {restartFlash && <div className="restart-flash" aria-live="polite"><span>重新进入像素世界…</span></div>}

        {backpackOpen && <div className="modal-shade" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setBackpackOpen(false); }}>
          <section className="backpack-panel" role="dialog" aria-modal="true" aria-label="安安的背包">
            <header><div><span>ITEM BAG</span><h2>安安的背包</h2></div><button onClick={() => setBackpackOpen(false)} aria-label="关闭背包">×</button></header>
            <div className="bag-grid">
              {storyUnlocked ? <button className="bag-slot has-item" onClick={openStory}><span className="diary-icon">✦<b>安安<br />日记</b></span><small>小羊日记本</small></button> : <span className="bag-slot locked-slot"><b>?</b><small>尚未发现</small></span>}
              {profileUnlocked ? <button className="bag-slot has-item" onClick={() => { setBackpackOpen(false); setProfileOpen(true); }}><span className="profile-item-icon"><b>安安</b></span><small>角色身份证</small></button> : <span className="bag-slot locked-slot"><b>?</b><small>尚未发现</small></span>}
              {Array.from({ length: 6 }).map((_, index) => <span className="bag-slot" key={index} aria-hidden="true" />)}
            </div>
            <p className="bag-tip">走到地图项目点完成发现，道具才会收入背包。</p>
          </section>
        </div>}

        {gameOpen && <section className="bridge-game" role="dialog" aria-modal="true" aria-label="小羊过桥游戏">
          <img className="bridge-map" src="/bridge-game-map.png" alt="海上平台组成的小羊过桥关卡" draggable={false} />
          <div className="bridge-water-shine" aria-hidden="true" />
          <span className="bridge-cloud bridge-cloud-one" aria-hidden="true"><img src="/cloud-sprite-v2.png" alt="" /></span>
          <span className="bridge-cloud bridge-cloud-two" aria-hidden="true"><img src="/cloud-sprite-v2.png" alt="" /></span>
          <span className="bridge-bird bridge-bird-one" aria-hidden="true"><img src="/bird-sprite.png" alt="" /></span>
          <span className="bridge-bird bridge-bird-two" aria-hidden="true"><img src="/bird-sprite.png" alt="" /></span>
          <span className="bridge-bird bridge-bird-three" aria-hidden="true"><img src="/bird-sprite.png" alt="" /></span>
          <button className="bridge-close" onClick={() => setGameOpen(false)} aria-label="退出小羊过桥">×<span>退出</span></button>
          <div className="bridge-progress" aria-label={`当前第 ${Math.min(bridgeIndex + 1, 3)} 段桥`}><strong>过桥进度</strong><span>{[0, 1, 2].map((step) => <i className={step < bridgeIndex || bridgeState === 'won' ? 'done' : step === bridgeIndex ? 'active' : ''} key={step} />)}</span></div>
          {plankLength > 0 && bridgeState !== 'failed' && bridgeState !== 'won' && <span className={`bridge-plank is-${bridgeState}`} style={{ left: `${bridgePlatforms[bridgeIndex].right}%`, width: `${plankLength}%` }} aria-hidden="true" />}
          <div className={`bridge-sheep is-${bridgeState} ${bridgeIndex > 0 && bridgeIndex < bridgePlatforms.length - 1 ? 'on-middle-platform' : ''}`} style={{ left: `${bridgeSheepX}%` }}>
            <img className="bridge-sheep-idle" src="/anan-side-idle.png" alt="安安站在起点" draggable={false} />
            <img className="bridge-sheep-walk" src="/anan-walk.webp" alt="安安正在过桥" draggable={false} />
            <span />
          </div>
          {(bridgeState === 'ready' || bridgeState === 'growing') && <div className="bridge-instruction"><p>{bridgeState === 'growing' ? '木板正在变长…松开空格放下' : '长按空格，让木板伸向下一座平台'}</p><button className={bridgeState === 'growing' ? 'is-holding' : ''} onPointerDown={() => { if (bridgeState === 'ready') { setPlankLength(.5); setBridgeState('growing'); } }} onPointerUp={releaseBridge} onPointerLeave={() => { if (bridgeState === 'growing') releaseBridge(); }}><kbd>SPACE</kbd><span>{bridgeState === 'growing' ? '松开放下' : '长按生成木板'}</span></button></div>}
          {bridgeState === 'failed' && <div className="bridge-result is-failed"><span>扑通！</span><h2>木板没有落在平台上</h2><p>控制好长度，再帮助安安试一次吧。</p><button onClick={retryBridge}>重新挑战</button></div>}
          {bridgeState === 'won' && <div className="bridge-result is-won"><span>✦ 挑战成功 ✦</span><h2>安安顺利到达终点！</h2><p>三段木板都准确落在了平台上。</p><div><button onClick={retryBridge}>再玩一次</button><button onClick={() => setGameOpen(false)}>返回地图</button></div></div>}
        </section>}

        {wardrobeRoomOpen && <section className="wardrobe-room" role="dialog" aria-modal="true" aria-label="百变衣橱换装房间"><div className="wardrobe-stage">
          <img className="wardrobe-room-background" src="/wardrobe-room-v2.png" alt="像素风安安换装房间" draggable={false} />
          <div className="wardrobe-room-shade" aria-hidden="true" />
          <figure className={`outfit-preview outfit-fit-${selectedOutfit + 1} ${wardrobeOpen ? 'closet-is-open' : ''}`}>
            <span className="outfit-sparkle sparkle-a" aria-hidden="true">✦</span><span className="outfit-sparkle sparkle-b" aria-hidden="true">✦</span>
            <img key={selectedOutfit} src={outfits[selectedOutfit].image} alt={`安安穿着${outfits[selectedOutfit].name}套装`} draggable={false} />
            <figcaption><small>安安今日穿搭</small><strong>{outfits[selectedOutfit].name}</strong></figcaption>
          </figure>
          {!wardrobeOpen && <button className="wardrobe-hotspot" onClick={() => setWardrobeOpen(true)} aria-label="打开衣柜">
            <span className="wardrobe-pulse" aria-hidden="true" /><strong>打开衣柜</strong><small>CLICK</small>
          </button>}
          </div>
          <button className="wardrobe-exit" onClick={() => { setWardrobeOpen(false); setWardrobeRoomOpen(false); }} aria-label="退出百变衣橱"><span>×</span>退出房间</button>
          {wardrobeOpen && <aside className="open-wardrobe" aria-label="衣柜服装列表">
            <header><div><small>AN AN&apos;S CLOSET</small><h3>选择一套穿搭</h3></div><button onClick={() => setWardrobeOpen(false)} aria-label="关上衣柜">×</button></header>
            <div className="wardrobe-rail" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <div className="outfit-grid">
              {outfits.map((outfit, index) => <button className={`outfit-option ${selectedOutfit === index ? 'is-selected' : ''}`} key={outfit.name} onClick={() => setSelectedOutfit(index)} aria-pressed={selectedOutfit === index}>
                <span><img src={outfit.image} alt="" draggable={false} /></span><strong>{outfit.name}</strong>{selectedOutfit === index && <i>穿着中</i>}
              </button>)}
            </div>
            <p>点击服装即可立即换装 · 选择会自动保存</p>
          </aside>}
        </section>}

        {memoryRoomOpen && <section className="memory-room" role="dialog" aria-modal="true" aria-label="回忆小屋">
          <img className="memory-room-bg" src="/memory-room.png" alt="安安温暖的像素回忆小屋" draggable={false} />
          <header className="memory-title"><small>MEMORY HOUSE</small><h2>回忆小屋</h2><p>点击发光的物品，看看安安留下的回忆</p></header>
          <button className="memory-exit" onClick={() => { setMemoryClip(null); setMemoryRoomOpen(false); }} aria-label="退出回忆小屋">×<span>退出</span></button>
          <button className="memory-prop prop-camera" onClick={() => setMemoryClip('camera')}><span />相机</button>
          <button className="memory-prop prop-portrait" onClick={() => setMemoryClip('portrait')}><span />相框</button>
          <button className="memory-prop prop-mushroom" onClick={() => setMemoryClip('mushroom')}><span />蘑菇</button>
          <button className="memory-prop prop-book" onClick={() => setMemoryClip('book')}><span />书本</button>
          <button className="memory-prop prop-magnifier" onClick={() => setMemoryClip('magnifier')}><span />放大镜</button>
          {memoryClip && <div className="memory-player-shade">
            <section className="memory-player">
              <img src="/memory-camera-v3.png" alt="正面像素相机播放器" draggable={false} />
              <video key={memoryClip} src={memoryClips[memoryClip].src} autoPlay playsInline controls aria-label={memoryClips[memoryClip].title} />
              <button className="camera-nav camera-prev" onClick={() => setMemoryClip(memoryClipKeys[(memoryClipKeys.indexOf(memoryClip) - 1 + memoryClipKeys.length) % memoryClipKeys.length])} aria-label="播放上一段回忆" />
              <button className="camera-nav camera-next" onClick={() => setMemoryClip(memoryClipKeys[(memoryClipKeys.indexOf(memoryClip) + 1) % memoryClipKeys.length])} aria-label="播放下一段回忆" />
              <button className="memory-player-close" onClick={() => setMemoryClip(null)} aria-label="关闭视频">×</button>
              <strong>{memoryClips[memoryClip].title}</strong>
            </section>
          </div>}
        </section>}

        {emotionMuseumOpen && <section className="emotion-museum" role="dialog" aria-modal="true" aria-label="表情博物馆"><div className="emotion-stage">
          <img className="emotion-museum-bg" src="/emotion-museum.png" alt="没有招牌的像素风表情博物馆" draggable={false} />
          {emotions.map((emotion, index) => <button className="emotion-frame" key={emotion.name} style={{ left: `${emotion.x}%`, top: `${emotion.y}%` }} onClick={() => setSelectedEmotion(index)} aria-label={`放大查看${emotion.name}表情`}>
            <img src={emotion.image} alt={`${emotion.name}表情`} draggable={false} /><span>{emotion.name}</span>
          </button>)}
          </div>
          <button className="emotion-exit" onClick={() => { setSelectedEmotion(null); setEmotionMuseumOpen(false); }} aria-label="退出表情博物馆">×<span>退出</span></button>
          <p className="emotion-hint">点击任意表情即可放大查看</p>
          {selectedEmotion !== null && <div className="emotion-focus" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedEmotion(null); }}>
            <article>
              <button className="emotion-focus-close" onClick={() => setSelectedEmotion(null)} aria-label="关闭放大表情">×</button>
              <button className="emotion-focus-prev" onClick={() => setSelectedEmotion((selectedEmotion - 1 + emotions.length) % emotions.length)} aria-label="上一个表情">‹</button>
              <img src={emotions[selectedEmotion].image} alt={`${emotions[selectedEmotion].name}表情大图`} draggable={false} />
              <button className="emotion-focus-next" onClick={() => setSelectedEmotion((selectedEmotion + 1) % emotions.length)} aria-label="下一个表情">›</button>
              <strong>{emotions[selectedEmotion].name}</strong>
            </article>
          </div>}
        </section>}

        {mutterOpen && <section className="mutter-scene" role="dialog" aria-modal="true" aria-label="小羊碎碎念"><div className="mutter-stage">
          <img className="mutter-board-bg" src="/mutter-board.png" alt="户外像素风碎碎念木板，贴着大小不一的纸张" draggable={false} />
          {mutterNotes.map((note, index) => <button className="mutter-note" key={note.text} style={{ left: `${note.x}%`, top: `${note.y}%`, width: `${note.w}%`, height: `${note.h}%`, rotate: `${note.tilt}deg` }} onClick={() => setSelectedMutter(index)} aria-label={`查看碎碎念：${note.text}`}><span>{note.text}</span></button>)}
          <button className="mutter-compose-hotspot" onClick={() => { setMutterDraft(savedMutter); setMutterComposerOpen(true); }} aria-label="写下今天的碎碎念"><span>{savedMutter || '写下今天的碎碎念'}</span><small>点击记录</small></button>
          </div>
          <button className="mutter-exit" onClick={() => { setSelectedMutter(null); setMutterComposerOpen(false); setMutterOpen(false); }} aria-label="退出小羊碎碎念">×<span>退出</span></button>
          <p className="mutter-hint">点击纸张看看安安的想法 · 中间大纸可以写下自己的碎碎念</p>
          {selectedMutter !== null && <div className="mutter-focus" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedMutter(null); }}><article>
            <button onClick={() => setSelectedMutter(null)} aria-label="关闭碎碎念">×</button><small>安安的碎碎念</small><p>{mutterNotes[selectedMutter].text}</p>
          </article></div>}
          {mutterComposerOpen && <div className="mutter-focus"><form className="mutter-composer" onSubmit={(event) => { event.preventDefault(); const value = mutterDraft.trim().slice(0, 80); setSavedMutter(value); setMutterDraft(value); if (value) window.localStorage.setItem('anan-mutter', value); else window.localStorage.removeItem('anan-mutter'); setMutterComposerOpen(false); }}>
            <button type="button" onClick={() => setMutterComposerOpen(false)} aria-label="关闭记录">×</button><small>今天想说什么？</small><textarea autoFocus maxLength={80} value={mutterDraft} onChange={(event) => setMutterDraft(event.target.value)} placeholder="在这里写下一句话……" aria-label="今天的碎碎念" /><div><span>{mutterDraft.length} / 80</span><button type="button" onClick={() => setMutterDraft('')}>清空</button><button type="submit">贴到木板上</button></div>
          </form></div>}
        </section>}

        {galleryOpen && <section className="gallery-overlay" role="dialog" aria-modal="true" aria-label="风景图鉴">
          <header className="gallery-title"><small>SCENERY ALBUM</small><h2>风景图鉴</h2><p>{galleryIndex + 1} / {galleryPhotos.length} · {galleryPhotos[galleryIndex].title}</p></header>
          <button className="gallery-close" onClick={() => setGalleryOpen(false)} aria-label="退出风景图鉴">×<span>退出</span></button>
          <div className="gallery-camera">
            <img className="gallery-photo" key={galleryPhotos[galleryIndex].src} src={galleryPhotos[galleryIndex].src} alt={galleryPhotos[galleryIndex].title} />
            <img className="gallery-camera-shell" src="/memory-camera-v3.png" alt="正面像素相机图鉴" draggable={false} />
            <button className="camera-nav camera-prev" onClick={() => setGalleryIndex((index) => (index - 1 + galleryPhotos.length) % galleryPhotos.length)} aria-label="查看上一张照片" />
            <button className="camera-nav camera-next" onClick={() => setGalleryIndex((index) => (index + 1) % galleryPhotos.length)} aria-label="查看下一张照片" />
          </div>
          <p className="gallery-hint">点击相机方向键的左侧或右侧，切换照片</p>
        </section>}

        {profileOpen && <div className="profile-overlay" role="dialog" aria-modal="true" aria-label="安安角色档案">
          <section className="identity-image-card">
            <button className="identity-close" onClick={() => setProfileOpen(false)} aria-label="关闭角色档案">×</button>
            <img src="/anan-identity-card.png" alt="安安的像素世界居民身份证，包含姓名、生日、住址、喜好与身份号码" draggable={false} />
          </section>
        </div>}

        {bookOpen && <div className="book-overlay" role="dialog" aria-modal="true" aria-label="小羊日记 背景故事" onKeyDown={(event) => event.stopPropagation()}>
          <button className="book-close" onClick={() => setBookOpen(false)} aria-label="退出日记本">×<span>退出</span></button>
          <div className={`video-story-book ${turning ? 'is-turning' : ''}`}>
            <video ref={diaryVideoRef} src="/diary-pages.webm" muted playsInline preload="auto" onLoadedMetadata={(event) => { const video = event.currentTarget; video.pause(); const stop = DIARY_STOPS[storySpread] ?? 0; if (Number.isFinite(video.duration) && video.duration > 0) video.currentTime = Math.min(stop, Math.max(0, video.duration - .04)); }} />
            <button className="page-arrow page-prev" onClick={() => turnStory('prev')} disabled={turning !== null || storySpread === 0} aria-label="上一页">‹</button>
            <button className="page-arrow page-next" onClick={() => turnStory('next')} disabled={turning !== null || storySpread === 3} aria-label="下一页">›</button>
            <div className="book-progress"><span>{storySpread === 0 ? '封面' : `第 ${storySpread} 页`}</span>{[0, 1, 2, 3].map((dot) => <i className={dot === storySpread ? 'active' : ''} key={dot} />)}</div>
          </div>
        </div>}
      </section>
    </main>
  );
}
