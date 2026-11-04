// =========================================================
// ANIMAL MOTION STUDY — 마우스 인터랙션
// 마우스가 들어오면: 떨림(0.5초)과 펼침(0.9초)이 "동시에" 시작
//                   → 떨면서 부채꼴로 퍼지는 하나의 동작
// 마우스가 영역을 벗어나면: 흔들림 없이 원래의 겹친 상태로 돌아옴
// =========================================================

// 1. 사용할 요소 가져오기
const stage = document.getElementById('stage');   // 인터랙션 영역
const fan = document.getElementById('fan');       // 도형 묶음
const shapes = document.querySelectorAll('.shape'); // 도형 5개

// 2. 펼쳐졌을 때 각 도형의 위치 (포스터 기준 px 단위)
//    x: 가로 이동, y: 세로 이동, r: 회전 각도(도)
const SPREAD = [
  { x: -215, y: 22, r: -32 }, // 왼쪽 바깥: 가장 크게 기울어짐
  { x: -110, y: 6,  r: -16 }, // 왼쪽 안쪽
  { x: 0,    y: 0,  r: 0 },   // 가운데: 똑바로 서 있음
  { x: 110,  y: 6,  r: 16 },  // 오른쪽 안쪽
  { x: 215,  y: 22, r: 32 }   // 오른쪽 바깥: 가장 크게 기울어짐
];

const STAGGER = 50; // 도형끼리 출발 시간 차이 (ms) — 가운데부터 바깥으로

// 3. 사용자가 "동작 줄이기"를 켰는지 확인
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let isOpen = false; // 지금 펼쳐져 있는지 기억

// 가운데 도형(2번)에서 몇 칸 떨어져 있는지 (0, 1, 2)
function distanceFromCenter(index) {
  return Math.abs(index - 2);
}

// 4. 펼치기
function openFan() {
  if (isOpen) return;
  isOpen = true;

  // 펼침용 스프링 곡선(.is-open)으로 바꾸기
  fan.classList.add('is-open');

  shapes.forEach(function (shape, index) {
    const target = SPREAD[index];

    // 가운데에서 바깥쪽으로 차례로 퍼지도록 지연 시간 설정
    const delay = reduceMotion.matches ? 0 : distanceFromCenter(index) * STAGGER;

    // 떨림과 펼침에 같은 지연 시간을 주어 두 동작이 함께 시작되게 합니다
    shape.style.setProperty('--shiver-delay', delay + 'ms');
    shape.style.setProperty('--delay', delay + 'ms');

    // CSS 변수 값을 바꾸면 .shape의 transform이 transition으로 움직입니다
    shape.style.setProperty('--x', target.x);
    shape.style.setProperty('--y', target.y);
    shape.style.setProperty('--r', target.r);
  });

  // 떨림 애니메이션 다시 시작하기
  // (클래스를 뺐다가 다시 넣어야 매번 처음부터 재생됩니다)
  fan.classList.remove('is-shivering');
  void fan.offsetWidth; // 브라우저가 변화를 인식하도록 강제로 다시 계산
  fan.classList.add('is-shivering');
  shiversLeft = shapes.length;
}

// 5. 접기 (원래의 겹친 상태로)
function closeFan() {
  if (!isOpen) return;
  isOpen = false;

  // 튕김 없는 감속 곡선으로 돌아가도록 .is-open 제거
  // (이미 시작된 떨림은 끊지 않고 잦아들며 끝나게 둡니다 → 갑자기 튀지 않음)
  fan.classList.remove('is-open');

  shapes.forEach(function (shape, index) {
    // 펼칠 때와 반대로, 바깥쪽 도형부터 먼저 돌아옵니다
    const delay = reduceMotion.matches ? 0 : (2 - distanceFromCenter(index)) * STAGGER;

    shape.style.setProperty('--delay', delay + 'ms');
    shape.style.setProperty('--x', 0);
    shape.style.setProperty('--y', 0);
    shape.style.setProperty('--r', 0);
  });
}

// 도형 5개의 떨림이 모두 끝나면 클래스 정리
let shiversLeft = 0;
fan.addEventListener('animationend', function (event) {
  if (event.animationName === 'shiver-a' || event.animationName === 'shiver-b') {
    shiversLeft = shiversLeft - 1;
    if (shiversLeft <= 0) fan.classList.remove('is-shivering');
  }
});

// 6. 마우스 이벤트 연결
// 마우스가 도형 위에 들어오면 펼치기
shapes.forEach(function (shape) {
  shape.addEventListener('pointerenter', function (event) {
    if (event.pointerType === 'mouse') openFan();
  });
});

// 마우스가 인터랙션 영역(stage)을 벗어나면 접기
stage.addEventListener('pointerleave', function (event) {
  if (event.pointerType === 'mouse') closeFan();
});

// 7. 터치 화면: 탭할 때마다 펼치기 / 접기
stage.addEventListener('pointerup', function (event) {
  if (event.pointerType === 'mouse') return;
  if (isOpen) {
    closeFan();
  } else {
    openFan();
  }
});

// 8. 키보드: Tab 키로 그래픽에 포커스하면 펼치고, 벗어나면 접기
// (:focus-visible = 키보드로 포커스했을 때만 참 → 클릭·탭과 겹치지 않음)
stage.addEventListener('focus', function () {
  if (stage.matches(':focus-visible')) openFan();
});
stage.addEventListener('blur', closeFan);
