import type { Question } from './questions';
import {
  brandSongQuestions,
  cafeQuestions,
  restaurantQuestions,
  leisureQuestions,
  hospitalQuestions,
} from './questions';

type Answers = Record<string, string | string[]>;
interface SurveyState {
  stage: 1 | 2; // 1: 브랜드송, 2: 업종 설문
  questions: Question[];
  currentStep: number;
  answers: Answers;
}

interface AppState {
  currentScreenId: string;
  history: any[];
  brandName: string;
  selectedService: string | null;
  selectedIndustry: string | null;
  survey: SurveyState;
  totalSteps: number;
  currentStep: number;
}

let state: AppState = {
  currentScreenId: 'intro-screen',
  history: [],
  brandName: '',
  selectedService: null,
  selectedIndustry: null,
  survey: { stage: 1, questions: [], currentStep: 0, answers: {} },
  totalSteps: 0,
  currentStep: 0,
};

let screens: Record<string, HTMLElement> = {} as any;
let progressBarContainer!: HTMLElement;
let progressBar!: HTMLElement;
let toastTimeout: number | undefined;

// ---------- 유틸 ----------
function el<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T | null;
}

function showToast(message: string) {
  const toast = el('toast');
  const toastMessage = el('toast-message');
  if (!toast || !toastMessage) return;
  if (toastTimeout) window.clearTimeout(toastTimeout);

  toastMessage.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0)';

  toastTimeout = window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -40px)';
  }, 3000);
}

function updateProgressBar() {
  if (!progressBar || !progressBarContainer) return;
  if (state.totalSteps > 0) {
    const percentage = Math.round((state.currentStep / state.totalSteps) * 100);
    progressBar.style.width = `${percentage}%`;
    progressBarContainer.classList.remove('hidden');
  } else {
    progressBarContainer.classList.add('hidden');
  }
}

function transitionToScreen(nextScreenId: string) {
  const currentScreen = screens[state.currentScreenId];
  const nextScreen = screens[nextScreenId];
  if (currentScreen) currentScreen.classList.add('slide-up-exit');

  window.setTimeout(() => {
    if (currentScreen) {
      currentScreen.classList.add('hidden');
      currentScreen.classList.remove('slide-up-exit');
    }
    if (nextScreen) {
      nextScreen.classList.remove('hidden');
      nextScreen.classList.add('slide-down-enter');
    }
    state.currentScreenId = nextScreenId;
  }, 500);
}

function saveAndGoTo(nextScreenId: string) {
  state.history.push(JSON.parse(JSON.stringify(state)));
  transitionToScreen(nextScreenId);
}

function goBack() {
  if (state.history.length === 0) return;

  const prevState = state.history.pop() as AppState;
  const prevScreenId = prevState.currentScreenId;
  const currentScreenId = state.currentScreenId;

  // 현재 state를 이전 state로 복구 (currentScreenId 제외)
  const { currentScreenId: _ignore, ...rest } = prevState as any;
  Object.assign(state, rest);

  const currentScreen = screens[currentScreenId];
  const prevScreen = screens[prevScreenId];

  if (currentScreen) currentScreen.classList.add('slide-down-exit');

  window.setTimeout(() => {
    if (currentScreen) {
      currentScreen.classList.add('hidden');
      currentScreen.classList.remove('slide-down-exit');
    }
    if (prevScreen) {
      prevScreen.style.transform = 'translateY(-40px)';
      prevScreen.classList.remove('hidden');
      // reflow
      void prevScreen.offsetHeight;
      prevScreen.classList.add('slide-down-enter');
      prevScreen.addEventListener(
        'transitionend',
        () => {
          prevScreen.style.transform = '';
        },
        { once: true }
      );
    }
    state.currentScreenId = prevScreenId;
    updateProgressBar();
  }, 500);
}

function getIndustryQuestions(): Question[] {
  switch (state.selectedIndustry) {
    case '카페': return cafeQuestions;
    case '음식점': return restaurantQuestions;
    case '레저': return leisureQuestions;
    case '병원/클리닉': return hospitalQuestions;
    default: return [];
  }
}

function getAllQuestionsForSummary(): Question[] {
  if (state.selectedService === '브랜드송') return brandSongQuestions;
  if (state.selectedService === '나레이션') return getIndustryQuestions();
  if (state.selectedService === '브랜드송+나레이션')
    return [...brandSongQuestions, ...getIndustryQuestions()];
  return [];
}

// ---------- 설문 렌더링 ----------
function renderQuestion() {
  const q = state.survey.questions[state.survey.currentStep];
  if (!q) return;

  const sectionEl = el('question-section');
  const titleEl = el('question-title');
  const textEl = el('question-text');
  const exampleEl = el('question-example');
  const answerContainer = el('answer-container');

  if (!titleEl || !textEl || !answerContainer) return;

  // ✅ 컨테이너 클래스/내용 초기화 (레이아웃 잔상 방지)
  answerContainer.className = 'pb-4';
  answerContainer.innerHTML = '';

  if (q.section) {
    if (sectionEl) {
      sectionEl.textContent = q.section;
      sectionEl.classList.remove('hidden');
    }
  } else {
    sectionEl?.classList.add('hidden');
  }

  titleEl.textContent = q.title;
  textEl.textContent = q.question;

  if (exampleEl) {
    if (q.example) {
      exampleEl.textContent = `💡 ${q.example}`;
      exampleEl.classList.remove('hidden');
    } else {
      exampleEl.classList.add('hidden');
    }
  }

  const saved = state.survey.answers[q.id];

  switch (q.type) {
    case 'text': {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'text-answer';
      input.className = 'input-field w-full px-6 py-4 text-lg rounded-2xl';
      input.value = (saved as string) || '';
      answerContainer.appendChild(input);
      break;
    }
    case 'textarea': {
      const ta = document.createElement('textarea');
      ta.id = 'text-answer';
      ta.className = 'textarea-field w-full px-6 py-4 text-lg rounded-2xl h-60 resize-y';
      ta.value = (saved as string) || '';
      answerContainer.appendChild(ta);
      break;
    }
    case 'radio':
    case 'checkbox': {
      const options = q.options ?? [];
      const isGrid = options.length > 4;
      answerContainer.className =
        (isGrid ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-2') + ' pb-4';

      const maxSelections =
        q.type === 'checkbox'
          ? q.title.includes('최대 2개')
            ? 2
            : q.title.includes('최대 3개')
            ? 3
            : q.title.includes('최대 5개')
            ? 5
            : 999
          : 1;

      options.forEach((option) => {
        const hasOther = option === '기타' || option === '있음 (구체적으로)';
        const wrapper = document.createElement('div');

        const button = document.createElement('button');
        const base = 'option-card w-full';
        const gridCls = 'rounded-xl p-3 text-center text-base flex items-center justify-center';
        const listCls = 'rounded-xl py-3 px-4 text-left text-base';
        button.className = `${base} ${isGrid ? gridCls : listCls}`;
        button.textContent = option;

        if (isGrid && hasOther) {
          wrapper.className = 'col-span-2 md:col-span-3';
        }

        let otherInput: HTMLInputElement | null = null;
        if (hasOther) {
          otherInput = document.createElement('input');
          otherInput.type = 'text';
          otherInput.placeholder = '내용을 직접 입력해주세요.';
          otherInput.className = 'input-field w-full px-4 py-3 text-base rounded-lg mt-2 hidden';
          otherInput.onclick = (e) => e.stopPropagation();
        }

        const baseText = hasOther ? option.split('(')[0].trim() : '';

        // 복원
        if (q.type === 'radio') {
          if (saved === option) {
            button.classList.add('selected');
          } else if (hasOther && typeof saved === 'string' && saved.startsWith(baseText + ': ')) {
            button.classList.add('selected');
            if (otherInput) {
              otherInput.value = (saved as string).substring((baseText + ': ').length);
              otherInput.classList.remove('hidden');
            }
          }
        } else {
          if (Array.isArray(saved)) {
            if ((saved as string[]).includes(option)) {
              button.classList.add('selected');
            }
            if (hasOther && otherInput) {
              const val = (saved as string[]).find((a) => a.startsWith(baseText + ': '));
              if (val) {
                button.classList.add('selected');
                otherInput.value = val.substring((baseText + ': ').length);
                otherInput.classList.remove('hidden');
              }
            }
          }
        }

        button.onclick = () => {
          if (q.type === 'radio') {
            answerContainer.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
            answerContainer
              .querySelectorAll('input[type="text"]')
              .forEach((i) => i.classList.add('hidden'));
            button.classList.add('selected');
            if (hasOther && otherInput) {
              otherInput.classList.remove('hidden');
              otherInput.focus();
              window.setTimeout(
                () => otherInput?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                300
              );
            }
          } else {
            const isSelected = button.classList.contains('selected');
            const selectedCount = answerContainer.querySelectorAll('.selected').length;
            if (!isSelected && selectedCount >= maxSelections) {
              showToast(`최대 ${maxSelections}개까지 선택할 수 있습니다.`);
              return;
            }
            button.classList.toggle('selected');
            if (hasOther && otherInput) {
              if (button.classList.contains('selected')) {
                otherInput.classList.remove('hidden');
                otherInput.focus();
                window.setTimeout(
                  () => otherInput?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                  300
                );
              } else {
                otherInput.classList.add('hidden');
                otherInput.value = '';
              }
            }
          }
        };

        wrapper.appendChild(button);
        if (otherInput) wrapper.appendChild(otherInput);
        answerContainer.appendChild(wrapper);
      });

      break;
    }
    case 'priority': {
      answerContainer.className = 'space-y-2 pb-4';
      if (!Array.isArray(state.survey.answers[q.id])) {
        state.survey.answers[q.id] = [];
      }
      const currentSelections = state.survey.answers[q.id] as string[];

      (q.options ?? []).forEach((option) => {
        const button = document.createElement('button');
        button.className =
          'option-card priority-button rounded-2xl p-4 text-left w-full flex items-center justify-between';

        const priorityIndex = currentSelections.indexOf(option);
        button.innerHTML = `
          <span class="flex-1 mr-4 text-lg">${option}</span>
          <div class="priority-badge-container flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <span class="priority-badge hidden w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-base flex items-center justify-center"></span>
          </div>
        `;
        const badge = button.querySelector('.priority-badge') as HTMLElement;

        if (priorityIndex > -1) {
          button.classList.add('selected');
          badge.textContent = `${priorityIndex + 1}`;
          badge.classList.remove('hidden');
        }

        button.onclick = () => {
          const i = currentSelections.indexOf(option);
          if (i > -1) currentSelections.splice(i, 1);
          else {
            if (currentSelections.length < 3) currentSelections.push(option);
            else {
              showToast('최대 3개까지 선택할 수 있습니다.');
              return;
            }
          }
          // 뱃지 갱신 (✅ 가드 추가)
          answerContainer.querySelectorAll('button').forEach((btn) => {
            const labelEl = btn.querySelector('span:first-child') as HTMLElement | null;
            const text = labelEl?.textContent?.trim() ?? '';
            if (!text) return;
            const b = btn.querySelector('.priority-badge') as HTMLElement;
            const idx = currentSelections.indexOf(text);
            if (idx > -1) {
              btn.classList.add('selected');
              b.textContent = `${idx + 1}`;
              b.classList.remove('hidden');
            } else {
              btn.classList.remove('selected');
              b.classList.add('hidden');
            }
          });
        };

        answerContainer.appendChild(button);
      });

      break;
    }
  }
}

// ---------- 저장 & 진행 ----------
function saveAnswerAndProceed() {
  const q = state.survey.questions[state.survey.currentStep];
  if (!q) return;

  const answerContainer = el('answer-container')!;
  let answer: string | string[] | undefined;

  switch (q.type) {
    case 'text':
    case 'textarea': {
      const input = answerContainer.querySelector('input, textarea') as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      const val = input?.value.trim() ?? '';
      if (!val) {
        showToast('답변을 입력해주세요.');
        return;
      }

      // 추가 검증(원 코드 유지)
      const keywords = val.split(',').map((k) => k.trim()).filter(Boolean);
      let invalid = false;
      switch (q.id) {
        case 'q18':
          if (keywords.length !== 3) {
            showToast('핵심 단어 3개를 쉼표(,)로 구분하여 입력해주세요.');
            invalid = true;
          }
          break;
        case 'leisure_q6':
          if (keywords.length > 5) {
            showToast('주요 프로그램/서비스는 최대 5개까지만 입력해주세요.');
            invalid = true;
          }
          break;
        case 'q15':
          if (val.split(/\s+/).filter(Boolean).length < 2) {
            showToast('고객층의 연령대와 특징을 모두 입력해주세요.');
            invalid = true;
          }
          break;
        case 'cafe_q13':
        case 'restaurant_q6':
        case 'hospital_q13':
          if (keywords.length !== 3) {
            showToast('TOP 3 항목을 쉼표(,)로 구분하여 모두 입력해주세요.');
            invalid = true;
          }
          break;
        case 'q4':
          if (!val.includes(',')) {
            showToast('색깔과 시간 느낌, 두 가지를 쉼표(,)로 구분하여 입력해주세요.');
            invalid = true;
          }
          break;
        case 'cafe_q26':
          if (!val.includes(',')) {
            showToast('추천 시간대와 이유를 쉼표(,)로 구분하여 입력해주세요.');
            invalid = true;
          }
          break;
      }
      if (invalid) return;

      // ✅ textarea 상세 입력 검증은 진행 차단되도록 return 추가
      if (q.id.endsWith('_q22') && q.type === 'textarea') {
        if (val.split('\n').length < 2) {
          showToast('소식 종류, 내용, 기간/조건 등을 상세히 적어주세요.');
          return;
        }
      }
      if (q.id === 'leisure_q32' && q.type === 'textarea') {
        if (!val.includes('\n')) {
          showToast('걱정하는 점과 해결책을 줄을 바꿔 모두 입력해주세요.');
          return;
        }
      }

      answer = val;
      break;
    }
    case 'radio': {
      const selected = answerContainer.querySelector('.selected') as HTMLElement | null;
      if (!selected) {
        showToast('옵션을 선택해주세요.');
        return;
      }
      const text = selected.textContent || '';
      if (text === '기타' || text === '있음 (구체적으로)') {
        const other = selected.parentElement?.querySelector('input') as HTMLInputElement | null;
        const otherVal = other?.value.trim() ?? '';
        if (!otherVal) {
          showToast('세부 내용을 입력해주세요.');
          return;
        }
        const baseText = text.split('(')[0].trim();
        answer = `${baseText}: ${otherVal}`;
      } else {
        answer = text;
      }
      break;
    }
    case 'checkbox': {
      const selected = Array.from(answerContainer.querySelectorAll('.selected')) as HTMLElement[];
      if (selected.length === 0) {
        showToast('하나 이상의 옵션을 선택해주세요.');
        return;
      }
      const out: string[] = [];
      let otherInvalid = false;
      selected.forEach((btn) => {
        const text = btn.textContent || '';
        if (text === '기타' || text === '있음 (구체적으로)') {
          const other = btn.parentElement?.querySelector('input') as HTMLInputElement | null;
          const val = other?.value.trim() ?? '';
          if (!val) otherInvalid = true;
          else {
            const baseText = text.split('(')[0].trim();
            out.push(`${baseText}: ${val}`);
          }
        } else {
          out.push(text);
        }
      });
      if (otherInvalid) {
        showToast('세부 내용을 입력해주세요.');
        return;
      }
      answer = out;
      break;
    }
    case 'priority': {
      const selections = state.survey.answers[q.id];
      if (!Array.isArray(selections) || selections.length !== 3) {
        showToast('3개의 우선순위를 선택해주세요.');
        return;
      }
      answer = selections as string[];
      break;
    }
  }

  state.survey.answers[q.id] = answer!;
  state.survey.currentStep++;
  state.currentStep++;

  if (state.survey.currentStep < state.survey.questions.length) {
    renderQuestion();
    updateProgressBar();
  } else {
    if (state.selectedService === '브랜드송+나레이션' && state.survey.stage === 1) {
      // 업종 설문으로 이어가기
      state.survey.stage = 2;
      state.survey.currentStep = 0;
      state.survey.questions = getIndustryQuestions();
      renderQuestion();
      updateProgressBar();
    } else {
      showCompletionScreen();
    }
  }
}

function goBackInSurvey() {
  if (state.survey.currentStep > 0) {
    state.survey.currentStep--;
    state.currentStep--;
    renderQuestion();
    updateProgressBar();
  } else {
    if (state.selectedService === '브랜드송+나레이션' && state.survey.stage === 2) {
      state.survey.stage = 1;
      state.survey.questions = brandSongQuestions;
      state.survey.currentStep = state.survey.questions.length - 1;
      state.currentStep--;
      renderQuestion();
      updateProgressBar();
    } else {
      goBack();
    }
  }
}

// ---------- 완료 화면 ----------
function showCompletionScreen() {
  const msgEl = el('completion-message');
  const summaryWrapper = el('summary-container-wrapper');
  const summaryContainer = el('summary-container');

  if (!msgEl) return;

  if (state.selectedService === '플레이리스트') {
    msgEl.textContent = `${state.brandName}의 분위기에 딱 맞는 플레이리스트 제작을 위해 전문 상담사가 곧 연결될 예정이에요! 잠시만 기다려주세요!`;
    summaryWrapper?.classList.add('hidden');
  } else {
    msgEl.textContent = `소중한 답변 감사드립니다. ${state.brandName}의 멋진 콘텐츠 제작을 위해 전문 상담사가 곧 연결될 예정입니다.`;

    if (summaryWrapper && summaryContainer) {
      let html = '';
      const all = getAllQuestionsForSummary();
      all.forEach((q) => {
        const ans = state.survey.answers[q.id];
        if (ans) {
          html += `<div class="mb-3"><p class="font-semibold text-gray-700">${q.title}</p><p class="text-purple-700 mt-1">→ ${
            Array.isArray(ans) ? (ans as string[]).join(', ') : ans
          }</p></div>`;
        }
      });
      summaryContainer.innerHTML = html;
      summaryWrapper.classList.remove('hidden');
    }
  }

  state.currentStep = state.totalSteps;
  updateProgressBar();
  saveAndGoTo('completion-screen');
}

function restartApp() {
  state.history = [];
  state.brandName = '';
  state.selectedService = null;
  state.selectedIndustry = null;
  state.survey = { stage: 1, questions: [], currentStep: 0, answers: {} };
  state.totalSteps = 0;
  state.currentStep = 0;

  const storeNameInput = el<HTMLInputElement>('storeName');
  if (storeNameInput) storeNameInput.value = '';
  const nextBtn = el<HTMLButtonElement>('nextToServices');
  if (nextBtn) nextBtn.disabled = true;

  transitionToScreen('intro-screen');
  updateProgressBar();
}

// ---------- 초기화 & 마운트 ----------
function initialize() {
  screens = {
    'intro-screen': el('intro-screen')!,
    'brand-intro-screen': el('brand-intro-screen')!,
    'store-name-screen': el('store-name-screen')!,
    'service-selection-screen': el('service-selection-screen')!,
    'industry-selection-screen': el('industry-selection-screen')!,
    'survey-screen': el('survey-screen')!,
    'completion-screen': el('completion-screen')!,
  };

  progressBarContainer = el('progressBarContainer')!;
  progressBar = el('progressBar')!;

  // Intro
  const introNextBtn = el('introNextBtn')!;
  introNextBtn.onclick = () => saveAndGoTo('brand-intro-screen');
  window.setTimeout(() => {
    introNextBtn.classList.add('pulse-glow');
  }, 4300);

  // Brand Intro
  el('brandIntroNextBtn')!.onclick = () => saveAndGoTo('store-name-screen');
  el('brandIntroPrevBtn')!.onclick = goBack;

  // Store Name
  const storeNameInput = el<HTMLInputElement>('storeName')!;
  const nextToServicesBtn = el<HTMLButtonElement>('nextToServices')!;
  storeNameInput.oninput = () => {
    nextToServicesBtn.disabled = storeNameInput.value.trim().length === 0;
  };
  nextToServicesBtn.onclick = () => {
    state.brandName = storeNameInput.value.trim();
    const brandNameDisplay = el('brandNameDisplay');
    const industryBrandNameDisplay = el('industryBrandNameDisplay');
    if (brandNameDisplay) brandNameDisplay.textContent = `${state.brandName}님을 위한 맞춤 서비스`;
    if (industryBrandNameDisplay)
      industryBrandNameDisplay.textContent = `${state.brandName}님의 업종은 무엇인가요?`;
    saveAndGoTo('service-selection-screen');
  };
  el('storeNamePrevBtn')!.onclick = goBack;
  storeNameInput.onkeypress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !nextToServicesBtn.disabled) nextToServicesBtn.click();
  };

  // Service Selection
  document.querySelectorAll('#service-cards-container .service-card').forEach((card) => {
    card.addEventListener('click', () => {
      const service = (card as HTMLElement).dataset.service!;
      state.selectedService = service;
      state.survey = { stage: 1, questions: [], currentStep: 0, answers: {} };

      const baseSteps = 3;
      if (service === '플레이리스트') {
        state.totalSteps = baseSteps;
        state.currentStep = baseSteps;
        showCompletionScreen();
        return;
      }
      if (service === '브랜드송') {
        state.survey.questions = brandSongQuestions;
        state.totalSteps = baseSteps + state.survey.questions.length;
        state.currentStep = baseSteps;
        saveAndGoTo('survey-screen');
        renderQuestion();
      } else {
        // 나레이션 / 브랜드송+나레이션
        state.currentStep = baseSteps;
        saveAndGoTo('industry-selection-screen');
      }
      updateProgressBar();
    });
  });
  el('serviceSelectionPrevBtn')!.onclick = goBack;

  // Industry Selection
  document.querySelectorAll('#industry-cards-container .service-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedIndustry = (card as HTMLElement).dataset.industry!;
      const industryQs = getIndustryQuestions();
      const baseSteps = 4;

      if (state.selectedService === '나레이션') {
        state.survey.questions = industryQs;
        state.totalSteps = baseSteps + industryQs.length;
      } else {
        // 브랜드송+나레이션
        state.survey.stage = 1;
        state.survey.questions = brandSongQuestions;
        state.totalSteps = baseSteps + state.survey.questions.length + industryQs.length;
      }
      state.currentStep = baseSteps;
      saveAndGoTo('survey-screen');
      renderQuestion();
      updateProgressBar();
    });
  });
  el('industrySelectionPrevBtn')!.onclick = goBack;

  // Survey Screen
  el('surveyNextBtn')!.onclick = saveAnswerAndProceed;
  el('surveyPrevBtn')!.onclick = goBackInSurvey;

  // Completion
  el('restartBtn')!.onclick = restartApp;
}

export function mountSurvey() {
  // 중복 마운트 방지
  const mounted = el('introNextBtn');
  if (mounted && mounted.getAttribute('data-mounted') === '1') return;

  initialize();
  mounted?.setAttribute('data-mounted', '1');
}
