/**
 * ========================================================
 * [당 스캐너 & 저당 큐레이션 :: 안먹었당 코어 비즈니스 스크립트 엔진]
 * ========================================================
 */

const app = (() => {
  // --------------------------------------------------------
  // [1] 애플리케이션 반응형 가상 통합 메모리 데이터베이스 (State)
  // --------------------------------------------------------
  const state = {
    totalSugar: 12,       // 오늘 실시간 섭취 총 당류 (g)
    sugarLimit: 50,       // 일일 당류 제한 가이드 상한선 (g)
    savedSugarTotal: 36,  // 누적 가드 절약 당류 (g) 
    swapsCount: 2,        // 누적 저당 제로 스왑 총 누계 횟수
    waterDrank: 1000,     // 누적 디톡스 수분 음용량 (ml)
    walkTime: 20,         // 식후 산책 활동 시간 (분)
    squatsDone: 0,        // 스쿼트 운동 카운트
    userScore: 400,       // 활동 누적 스코어 점수
    detoxMissions: {      // 미션 수행 가부 불리언 토글 변수
      water: false,
      walk: false,
      squat: false
    },
    currentTab: 'home',
    scannedProduct: null,
    
    // 바코드 OCR 프리셋 제품 가상 데이터셋
    products: {
      cola: {
        name: '코카콜라 클래식 (350ml)',
        sugar: 38, cubes: 13, emoji: '🥤', badge: 'SUGAR CRITICAL', rating: 'bad',
        shock: '⚠️ 단 1캔으로 일일 상한 권장량의 76%를 직격 돌파합니다! 혈당 스파이크의 주범입니다.',
        alt: { name: '코카콜라 제로 (350ml)', sugar: 0, cubes: 0, emoji: '🧼', savedCubes: 13 }
      },
      latte: {
        name: '바닐라 라떼 (L)',
        sugar: 45, cubes: 15, emoji: '☕', badge: 'SUGAR CRITICAL', rating: 'bad',
        shock: '⚠️ 에스프레소의 중독성 있는 쓴맛 뒤에 각설탕 15개 분량의 무서운 액상과당이 은폐되어 있습니다!',
        alt: { name: '알룰로스 대체 바닐라 라떼', sugar: 4, cubes: 1, emoji: '🧪', savedCubes: 14 }
      },
      tanghulu: {
        name: '딸기 탕후루 (1꼬치)',
        sugar: 24, cubes: 8, emoji: '🍓', badge: 'SUGAR ALERT', rating: 'bad',
        shock: '⚠️ 시럽 설탕 유리 코팅막이 위장을 거치지 않고 혈류로 즉각 흡수되어 극심한 식곤증을 야기합니다.',
        alt: { name: '라이트 제로 이소말트 탕후루', sugar: 2, cubes: 0.5, emoji: '🍭', savedCubes: 7.5 }
      },
      cookie: {
        name: '초코칩 쿠키 (1개)',
        sugar: 18, cubes: 6, emoji: '🍪', badge: 'SUGAR CAUTION', rating: 'warning',
        shock: '⚠️ 정제 버터밀크 포화지방과 정제당이 결합되어 뇌의 포만감 신호를 마비시키고 중독을 유발합니다.',
        alt: { name: '프로틴 무설탕 단백질 초코쿠키', sugar: 1, cubes: 0, emoji: '💪', savedCubes: 6 }
      }
    },
    
    // 오프라인 저당지도 트래킹 제휴점 가상 스팟 데이터셋
    spots: {
      mega: {
        category: 'CAFÉ OPTIONS', name: '메가커피 역삼역점', distance: '내 위치에서 180m (도보 2.5분)',
        stocks: [
          { name: '라이트 아일랜드 티 (알룰로스 완비)', stock: '주문 가능 🟢' },
          { name: '바닐라 시럽 라이트 시럽 전면 교체', stock: '커스텀 즉시 변경 가능 🟢' },
          { name: '스테비아 초코 스노우 프라페 고정재고', stock: '실시간 잔여 8개 🟡' }
        ]
      },
      gs25: {
        category: 'CONVENIENCE', name: 'GS25 역삼디오빌점', distance: '내 위치에서 110m (도보 1.5분)',
        stocks: [
          { name: '코카콜라 제로 슈가 500ml 페트', stock: '재고 14개 보유 🟢' },
          { name: '라라스윗 다이어트 초콜릿 초코바', stock: '재고 2개 브레이크 (품절임박) 🔴' },
          { name: '자연원 레몬에이드 무설탕 파우치', stock: '재고 6개 보유 🟢' }
        ]
      },
      cu: {
        category: 'CONVENIENCE', name: 'CU 강남아너스빌점', distance: '내 위치에서 280m (도보 4분)',
        stocks: [
          { name: '라라스윗 고단백 바닐라 초코바', stock: '재고 4개 잔존 🟡' },
          { name: '티젠 발효 콤부차 파인애플 번들', stock: '재고 12개 넉넉 🟢' },
          { name: '제로 슈가 웰치스 샤인머스캣 캔', stock: '재고 8개 보유 🟢' }
        ]
      },
      starbucks: {
        category: 'CAFÉ OPTIONS', name: '스타벅스 역삼대로점', distance: '내 위치에서 320m (도보 5분)',
        stocks: [
          { name: '천연 바닐라 라이트 시럽 변경 제조', stock: 'POS 주문 요청 즉시 제조 가능 🟢' },
          { name: '유자 민트 블렌디드 (클래식시럽 제거버전)', stock: '사이렌오더 전용 커스텀 옵션 🟢' }
        ]
      }
    }
  };

  // 물리 엔진 시뮬레이션용 코어 핸들러 변수
  let canvas, ctx;
  let animationId = null;
  let sugarCubes = [];
  let physicsRunning = false;

  // --------------------------------------------------------
  // [2] 시스템 구동 및 모의 컴포넌트 초기화 실행 부
  // --------------------------------------------------------
  const init = () => {
    setupEventListeners();
    updateDashboardUI();
    
    // 모의 물리 캔버스 기본 세팅 바인딩
    canvas = document.getElementById('sugar-physics-canvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }
    
    changeRandomTip();
  };

  // --------------------------------------------------------
  // [3] 반응형 듀얼 내비게이션 탭 라우팅 제어 모듈 (이사이드바 & 모바일 하단바 싱크 동기화 핵심)
  // --------------------------------------------------------
  const switchTab = (tabId, element) => {
    state.currentTab = tabId;
    
    // 1. 전체 DOM 트리의 모든 내비게이션 클래스 액티브 일괄 제어 차단
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
    
    // 2. [핵심 동기화] 데스크톱용 사이드바와 모바일용 바닥 내비 중 동일한 tabId를 가리키는 요소를 동시 점등
    document.querySelectorAll(`.nav-item[data-tab="${tabId}"]`).forEach(item => item.classList.add('active'));
    if (element) element.classList.add('active'); // 안전장치 백업 타겟팅
    
    // 3. 대상 타겟 뷰 개방
    const activeView = document.getElementById(`tab-${tabId}`);
    if (activeView) activeView.classList.add('active');
    
    // 4. 화면 이동 시 리소스 클리어 및 탭 연계 초기화 바인딩
    stopPhysicsSimulation();
    hideScanResult();
    
    if (tabId === 'home') {
      updateDashboardUI();
    } else if (tabId === 'curation') {
      updateLeaderboardUI();
    } else if (tabId === 'profile') {
      updateProfileUI();
    }
  };

  // --------------------------------------------------------
  // [4] 홈 대시보드 그래픽 가시화 및 캐릭터 인슐린 수치 모핑 연동
  // --------------------------------------------------------
  const updateDashboardUI = () => {
    const ratio = Math.max(0, state.totalSugar) / state.sugarLimit;
    const percentage = Math.round(ratio * 100);
    
    // 기본 카운터 돔 출력 반영
    document.getElementById('sugar-current-text').textContent = Math.round(state.totalSugar);
    document.getElementById('sugar-percentage').textContent = `${percentage}%`;
    document.getElementById('sugar-cubes-text').textContent = `${(state.totalSugar / 3).toFixed(1)}개`;
    
    // 헤더 상태 정보 동시 바인딩
    const scoreEl = document.getElementById('header-user-score');
    if (scoreEl) scoreEl.textContent = state.userScore;
    
    // SVG 게이지 트랙 채우기 원형 연산 애니메이션
    const ring = document.getElementById('sugar-progress-ring');
    if (ring) {
      const radius = ring.r.baseVal.value;
      const circumference = radius * 2 * Math.PI;
      const offset = circumference - (Math.min(ratio, 1) * circumference);
      ring.style.strokeDashoffset = offset;
      
      // 혈당 안전 등급별 색채 피드백 반전 처리
      if (ratio <= 0.5) {
        ring.style.stroke = 'var(--neon-green)';
        document.getElementById('sugar-percentage').className = 'stat-value text-green';
      } else if (ratio <= 1.0) {
        ring.style.stroke = 'var(--neon-yellow)';
        document.getElementById('sugar-percentage').className = 'stat-value text-yellow';
      } else {
        ring.style.stroke = 'var(--neon-red)';
        document.getElementById('sugar-percentage').className = 'stat-value text-red';
      }
    }
    
    morphCharacter(ratio);
  };

  // 캐릭터 이미지 및 아우라 연색성 변환 제어
  const morphCharacter = (ratio) => {
    const aura = document.getElementById('character-aura');
    const charImg = document.getElementById('character-img');
    const stateDesc = document.getElementById('char-state-desc');
    const badge = document.getElementById('header-sugar-badge');
    
    if (!aura) return;
    
    if (ratio <= 0.4) {
      aura.style.background = 'var(--neon-green)';
      if (charImg) charImg.src = 'dodu_png/3.png'; // 상쾌한 상태 아바타 이미지
      if (stateDesc) stateDesc.textContent = '단게 전혀 생각나지 않는 쾌적하고 투명한 혈당 상태예요! 🌱';
      if (badge) badge.innerHTML = '<span class="dot green"></span><span class="label">안전</span>';
    } else if (ratio <= 0.8) {
      aura.style.background = 'var(--neon-yellow)';
      if (charImg) charImg.src = 'dodu_png/4.png'; // 가벼운 피로감 유발 상태
      if (stateDesc) stateDesc.textContent = '점점 입안이 텁텁해지고 집중력이 약간 저하되기 시작합니다. 🥱';
      if (badge) badge.innerHTML = '<span class="dot yellow"></span><span class="label">주의</span>';
    } else if (ratio <= 1.2) {
      aura.style.background = 'var(--neon-red)';
      if (charImg) charImg.src = 'dodu_png/1.png'; // 스파이크 폭탄 발령 상태
      if (stateDesc) stateDesc.textContent = '인슐린 폭격 경보! 급격한 혈당 스파이크와 지방 축적이 우려됩니다! 🚨';
      if (badge) badge.innerHTML = '<span class="dot red"></span><span class="label">위험</span>';
    } else {
      aura.style.background = 'var(--neon-purple)';
      if (charImg) charImg.src = 'dodu_png/5.png'; // 슈가 크래쉬 혼수상태
      if (stateDesc) stateDesc.textContent = '급격한 인슐린 저항 슈가크래쉬 엄습! 전신 무력감과 가짜 배고픔이 시작됩니다. ☠️';
      if (badge) badge.innerHTML = '<span class="dot purple"></span><span class="label">크래쉬</span>';
    }
  };

  // --------------------------------------------------------
  // [5] 디톡스 액션 미션 수행 엔진 처리반
  // --------------------------------------------------------
  const completeMission = (missionId, decreaseAmount, element) => {
    if (state.totalSugar <= 0) {
      showToast('이미 신체가 완벽히 정화된 청정 제로 혈당 상태입니다! 🌿', 'info');
      return;
    }
    
    state.totalSugar = Math.max(0, state.totalSugar - decreaseAmount);
    let scoreGained = 0;
    
    if (missionId === 'water') {
      state.waterDrank += 500;
      scoreGained = 50;
      showToast('💧 수분 흡수 완료! 혈중 당류 농도가 안정적으로 희석 지연됩니다.', 'success');
    } else if (missionId === 'walk') {
      state.walkTime += 10;
      scoreGained = 75;
      showToast('👟 허벅지 근육 가동! 세포가 인슐린 없이 당을 즉각 소모합니다.', 'success');
    } else if (missionId === 'squat') {
      state.squatsDone += 20;
      scoreGained = 100;
      showToast('🏋️ 하체 특급 펌핑 완료! 혈류 속에 정체된 과잉 글루코스를 소모했습니다.', 'success');
    }
    
    state.userScore += scoreGained;
    if (element) element.classList.add('disabled');
    
    updateDashboardUI();
  };

  // --------------------------------------------------------
  // [6] 바코드 시뮬레이터 및 2D 각설탕 파티클 물리 엔진 가동 모듈
  // --------------------------------------------------------
  const simulateScan = (productKey) => {
    const prod = state.products[productKey];
    if (!prod) return;
    
    state.scannedProduct = prod;
    stopPhysicsSimulation();
    hideScanResult();
    
    // 물리 시뮬레이터 엔진 연산 시작 변수 온
    physicsRunning = true;
    sugarCubes = [];
    const cubeCount = Math.min(prod.cubes, 35); // 그래픽 프레임 드랍을 저지하기 위한 임계 제한선 배치
    
    for (let i = 0; i < cubeCount; i++) {
      sugarCubes.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -30 - (i * 25), // 동시다발 낙하 방지를 위한 순차 계단식 오프셋 가산
        size: 16,
        vx: Math.random() * 4 - 2,
        vy: 0,
        rotation: Math.random() * Math.PI * 2,
        vrotation: Math.random() * 0.1 - 0.05,
        gravity: 0.38,
        bounce: 0.42,
        friction: 0.98,
        active: true
      });
    }
    
    animatePhysics();
    showToast(`⚠️ 정밀 바코드 분석 결과: 각설탕 ${prod.cubes}개 분량의 인슐린 탄탄 폭격 투하!`, 'warning');
    
    // 3초간 물리적 낙하 쇼케이스 후 정밀 진단 모달을 인라인 출력하도록 지연 래핑
    setTimeout(() => {
      showScanResult();
    }, 3000);
  };

  // 중력 및 하단 바닥 충돌 경계면을 처리하는 고전적 물리 피드백 리스너
  const animatePhysics = () => {
    if (!physicsRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    sugarCubes.forEach(cube => {
      if (cube.active) {
        cube.vy += cube.gravity;
        cube.x += cube.vx;
        cube.y += cube.vy;
        cube.rotation += cube.vrotation;
        
        // 좌우 가로 측벽 바운싱 반전 경계 처리
        if (cube.x - cube.size/2 < 0 || cube.x + cube.size/2 > canvas.width) {
          cube.vx *= -1;
        }
        
        // 뷰포트 최하단 바닥 쿠션 충돌 상쇄 메커니즘
        if (cube.y + cube.size/2 > canvas.height) {
          cube.y = canvas.height - cube.size/2;
          cube.vy *= -cube.bounce;
          cube.vx *= cube.friction;
          
          if (Math.abs(cube.vy) < 0.2) cube.vy = 0;
        }
        
        // 각설탕 글래스 파티클 그리기 레퍼런스 입체 드로잉
        ctx.save();
        ctx.translate(cube.x, cube.y);
        ctx.rotate(cube.rotation);
        
        // 3D 와이어프레임 큐브 메쉬 모사 기하학 처리
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.fillRect(-cube.size/2, -cube.size/2, cube.size, cube.size);
        ctx.strokeRect(-cube.size/2, -cube.size/2, cube.size, cube.size);
        
        ctx.restore();
      }
    });
    
    animationId = requestAnimationFrame(animatePhysics);
  };

  const stopPhysicsSimulation = () => {
    physicsRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // --------------------------------------------------------
  // [7] 스캔 결과 모달 도큐먼트 결합 처리
  // --------------------------------------------------------
  const showScanResult = () => {
    const modal = document.getElementById('scan-result-card');
    const prod = state.scannedProduct;
    if (!modal || !prod) return;
    
    document.getElementById('res-badge').textContent = prod.badge;
    document.getElementById('res-badge').className = `prod-badge ${prod.rating === 'bad' ? '' : 'text-yellow'}`;
    document.getElementById('res-name').textContent = prod.name;
    document.getElementById('res-sugar-value').textContent = `${prod.sugar}g`;
    document.getElementById('res-cubes-value').textContent = `${prod.cubes}개`;
    document.getElementById('res-shock-text').textContent = prod.shock;
    
    // 스왑 추천 대안 데이터 맵핑
    document.getElementById('res-alt-emoji').textContent = prod.alt.emoji;
    document.getElementById('res-alt-name').textContent = prod.alt.name;
    document.getElementById('res-tradein-text').textContent = `스마트 제로 스왑 선택 시 각설탕 [ ${prod.alt.savedCubes}개 ] 분량을 즉시 영구 방어해냅니다!`;
    
    modal.classList.add('active');
  };

  const hideScanResult = () => {
    const modal = document.getElementById('scan-result-card');
    if (modal) modal.classList.remove('active');
  };

  // 과당 투하 폭탄 강행 선택 시 비즈니스 로직
  const eatSugarItem = () => {
    const prod = state.scannedProduct;
    if (!prod) return;
    
    state.totalSugar += prod.sugar;
    showToast(`☠️ 액상 정제과당 수용 감행! 즉각적인 급격 고혈당 국면으로 진입합니다.`, 'error');
    hideScanResult();
    stopPhysicsSimulation();
    
    // 즉각적인 시각 피드백 수용을 위한 홈 탭 복귀 유도 강제 트리거
    const homeBtn = document.querySelector('.nav-item[data-tab="home"]');
    switchTab('home', homeBtn);
  };

  // 대망의 제로 스왑 성공 축하 세레머니 연동
  const tradeInAlternative = () => {
    const prod = state.scannedProduct;
    if (!prod) return;
    
    const savedAmt = Math.max(0, prod.sugar - prod.alt.sugar);
    state.savedSugarTotal += savedAmt;
    state.swapsCount += 1;
    state.userScore += 150; // 스왑 보너스 150점 가산
    
    // 제로 탄산 음료 등을 먹은 미미한 잔여량 가산처리
    state.totalSugar += prod.alt.sugar;
    
    hideScanResult();
    stopPhysicsSimulation();
    
    // 홈 탭 복귀 및 스파클 세레머니 이펙트 점화
    const homeBtn = document.querySelector('.nav-item[data-tab="home"]');
    switchTab('home', homeBtn);
    
    triggerSparkleConfetti();
    showToast(`✨ 혈당 세이브 디펜딩 성공! 안전지대로 우회 대안 섭취 처리되었습니다.`, 'success');
  };

  // 녹색 네온 축하 스파클 입체 파티클 방출 연출
  const triggerSparkleConfetti = () => {
    const container = document.getElementById('app-content');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'green-confetti';
      sparkle.textContent = ['✨', '💚', '🌿', '🌱'][Math.floor(Math.random() * 4)];
      sparkle.style.left = `${Math.random() * 80 + 10}%`;
      sparkle.style.top = `${Math.random() * 30 + 10}%`;
      container.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 1500);
    }
  };

  // --------------------------------------------------------
  // [8]대체 큐레이션 및 저당지도 연계 바인딩 함수군
  // --------------------------------------------------------
  const updateLeaderboardUI = () => {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    
    // 가상 가디언즈 경쟁 유저 랭킹 데이터 스냅샷
    const competitors = [
      { name: '대체당마스터_역삼', score: 2450, desc: '각설탕 81개 방어' },
      { name: '제로콜라중독자', score: 1980, desc: '각설탕 66개 방어' },
      { name: '혈당가디언_Me', score: state.userScore, desc: `각설탕 ${(state.savedSugarTotal/3).toFixed(0)}개 세이브 중`, isMe: true },
      { name: '탕후루차단러', score: 1250, desc: '각설탕 41개 방어' }
    ];
    
    // 고득점 순 정렬 정렬
    competitors.sort((a, b) => b.score - a.score);
    listEl.innerHTML = '';
    
    competitors.forEach((c, idx) => {
      const item = document.createElement('div');
      item.className = `leaderboard-item rank-${idx + 1} ${c.isMe ? 'me' : ''}`;
      item.innerHTML = `
        <span class="rank-badge">${idx + 1}</span>
        <div class="user-meta">
          <span class="user-name">${c.name}</span>
          <span class="user-desc">${c.desc}</span>
        </div>
        <span class="user-points">${c.score.toLocaleString()} 점</span>
      `;
      listEl.appendChild(item);
    });
  };

  // 레시피 세이브 가산 연동
  const useRecipeReward = (rewardAmount, recipeName) => {
    state.savedSugarTotal += rewardAmount;
    state.userScore += 80;
    showToast(`🍳 [${recipeName}] 매뉴얼을 확인했습니다! 가상 누적 절약 지수 ${rewardAmount}g 추가 획득!`, 'success');
    updateLeaderboardUI();
  };

  // 오프라인 지도 핀 연산 바인딩 스위치
  const showSpotDetail = (spotKey) => {
    const spot = state.spots[spotKey];
    const card = document.getElementById('spot-detail-card');
    if (!spot || !card) return;
    
    document.getElementById('spot-category').textContent = spot.category;
    document.getElementById('spot-name').textContent = spot.name;
    document.getElementById('spot-distance').textContent = spot.distance;
    
    const stockWrapper = document.getElementById('spot-stock-list');
    stockWrapper.innerHTML = '';
    
    spot.stocks.forEach(s => {
      const node = document.createElement('div');
      node.className = 'stock-node';
      node.innerHTML = `<span class="s-name">${s.name}</span><span class="s-qty">${s.stock}</span>`;
      stockWrapper.appendChild(node);
    });
    
    showToast(`📍 [${spot.name}] 스마트 제휴 스팟의 실시간 재고를 파이프 연동했습니다.`, 'info');
  };

  // --------------------------------------------------------
  // [9] 개인 설정 및 마이 스탯 리포트 출력 제어
  // --------------------------------------------------------
  const updateProfileUI = () => {
    document.getElementById('my-saved-sugar').textContent = `${Math.round(state.savedSugarTotal)}g`;
    document.getElementById('my-swaps-count').textContent = `${state.swapsCount}회`;
    document.getElementById('my-water-drank').textContent = `${state.waterDrank}ml`;
    document.getElementById('my-walk-time').textContent = `${state.walkTime}분`;
    
    // 오늘의 주간 트랙 지표 바 가시화 동형 매칭
    const todayBar = document.getElementById('my-today-bar');
    if (todayBar) {
      const ratio = Math.max(0, state.totalSugar) / state.sugarLimit;
      todayBar.style.height = `${Math.min(100, ratio * 100)}%`;
      
      if (ratio <= 0.5) todayBar.style.background = 'var(--neon-green)';
      else if (ratio <= 1.0) todayBar.style.background = 'var(--neon-yellow)';
      else todayBar.style.background = 'var(--neon-red)';
    }
  };

  // 초기화 버튼 리셋 모듈
  const resetData = () => {
    state.totalSugar = 12;
    state.savedSugarTotal = 0;
    state.swapsCount = 0;
    state.waterDrank = 0;
    state.walkTime = 0;
    state.squatsDone = 0;
    state.userScore = 0;
    
    // 모든 비활성화 미션 복원
    document.querySelectorAll('.mission-item').forEach(item => item.classList.remove('disabled'));
    
    showToast('🔄 로컬 스택에 보존중이던 헬스 데이터를 초기 출하 상태로 전면 리셋했습니다.', 'info');
    
    if (state.currentTab === 'home') updateDashboardUI();
    else if (state.currentTab === 'profile') updateProfileUI();
  };

  // --------------------------------------------------------
  // [10] 전역 헬퍼 및 이벤트 청취 스위칭 셋
  // --------------------------------------------------------
  const resizeCanvas = () => {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  const changeRandomTip = () => {
    const tips = [
      "음식 섭취 순서: 섬유질(채소) ➡️ 단백질(고기/생선) ➡️ 탄수화물/당 순서로 먹으면 혈당 스파이크가 억제됩니다.",
      "음료수를 고를 땐 영양성분표의 '당류(g)'를 꼭 확인하세요! 대체당 음료는 인슐린에 무해합니다.",
      "식후 바로 수면을 취하는 습관은 위산 역류와 역류성 혈당 피크의 직격탄을 날립니다. 10분만 제자리 족보를 해보세요.",
      "액상과당은 소화 위장 분해 공정 없이 간으로 다이렉트 고속도로 직행하므로 설탕보다 3배 위험합니다."
    ];
    const tipEl = document.getElementById('daily-tip');
    if (tipEl) tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
  };

  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '✨';
    if (type === 'error') icon = '🚨';
    if (type === 'warning') icon = '⚠️';
    if (type === 'info') icon = 'ℹ️';
    
    toast.innerHTML = `<span>${icon}</span><p>${message}</p>`;
    container.appendChild(toast);
    
    // 3초 후 엘리먼트 소멸 파괴 소거
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const setupEventListeners = () => {
    // 마크업 내 인라인 태깅 배치 완료로 시스템 로드 안정화 코드 대체 선언
  };

  return {
    init,
    switchTab,
    completeMission,
    simulateScan,
    eatSugarItem,
    tradeInAlternative,
    useRecipeReward,
    showSpotDetail,
    resetData
  };
})();

// 도큐먼트 최초 파싱 완료 시 코어 구동 엔진 킥스타트 점화
document.addEventListener('DOMContentLoaded', app.init);