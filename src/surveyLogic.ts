import type { Question } from './questions';
import {
  brandSongQuestions,
  narrationQuestions,
  getNarrationQuestions,
} from './questions';

// ==================== 타입 정의 ====================
type Answers = Record<string, string | string[]>;

interface SurveyState {
  stage: 1 | 2;
  questions: Question[];
  currentStep: number;
  answers: Answers;
}

interface AppState {
  currentScreenId: string;
  history: any[];
  brandName: string;
  contactEmail: string;
  selectedService: string | null;
  survey: SurveyState;
  totalSteps: number;
  currentStep: number;
  isMobile: boolean;
  industryInput: string;
}

// ==================== 상태 관리 ====================
let state: AppState = {
  currentScreenId: 'intro-screen',
  history: [],
  brandName: '',
  contactEmail: '',
  selectedService: null,
  survey: { stage: 1, questions: [], currentStep: 0, answers: {} },
  totalSteps: 0,
  currentStep: 0,
  isMobile: false,
  industryInput: '',
};

// ==================== 전역 변수 ====================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwjMoP762fMBJU21ScZvZ7MbM8FgskuKrihNYKPbOi43nO-FeWkbhJYlIc-Vsd1vhnbVw/exec';
const STORAGE_KEY = 'ssokssok_survey_backup';
const STORAGE_VERSION = '1.0';

let screens: Record<string, HTMLElement> = {};
let progressBarContainer!: HTMLElement;
let progressBar!: HTMLElement;
let toastTimeout: number | undefined;
let isSubmitting = false;
let isInitialized = false; // 중복 초기화 방지 플래그

// ==================== 유틸리티 함수 ====================
function el<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showToast(message: string): void {
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

// ==================== 로컬 스토리지 관리 ====================
function saveToLocalStorage(): void {
  try {
    const backupData = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      state: {
        brandName: state.brandName,
        contactEmail: state.contactEmail,
        selectedService: state.selectedService,
        industryInput: state.industryInput,
        currentScreenId: state.currentScreenId,
        currentStep: state.currentStep,
        totalSteps: state.totalSteps,
        survey: {
          stage: state.survey.stage,
          currentStep: state.survey.currentStep,
          answers: { ...state.survey.answers }, // 👈 모든 설문 답변 포함
          // 추가: 현재 질문 세트 정보
          questionsType: state.selectedService // 어떤 설문인지 저장
        }
      }
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(backupData));
    console.log('🔄 자동 백업 완료 (설문 답변 포함):', new Date().toLocaleTimeString());
    console.log('📊 백업된 답변 수:', Object.keys(state.survey.answers).length);
  } catch (error) {
    console.error('❌ 로컬 스토리지 저장 실패:', error);
  }
}

function loadFromLocalStorage(): boolean {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return false;
    
    const backupData = JSON.parse(savedData);
    
    // 버전 및 시간 체크
    if (backupData.version !== STORAGE_VERSION) {
      clearLocalStorageBackup();
      return false;
    }
    
    const hoursDiff = (Date.now() - new Date(backupData.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      clearLocalStorageBackup();
      return false;
    }
    
    // 상태 복원
    const savedState = backupData.state;
    Object.assign(state, {
      brandName: savedState.brandName || '',
      contactEmail: savedState.contactEmail || '',
      selectedService: savedState.selectedService || null,
      industryInput: savedState.industryInput || '',
      currentScreenId: savedState.currentScreenId || 'intro-screen',
      currentStep: savedState.currentStep || 0,
      totalSteps: savedState.totalSteps || 0,
      survey: {
        stage: savedState.survey?.stage || 1,
        questions: [], // 이후에 initializeSurvey()에서 설정
        currentStep: savedState.survey?.currentStep || 0,
        answers: savedState.survey?.answers || {} // 👈 설문 답변 복원
      }
    });
    
    console.log('✅ 로컬 스토리지에서 복원 완료');
    console.log('📊 복원된 답변 수:', Object.keys(state.survey.answers).length);
    console.log('🔄 복원된 답변들:', state.survey.answers);
    return true;
  } catch (error) {
    console.error('❌ 로컬 스토리지 복원 실패:', error);
    clearLocalStorageBackup();
    return false;
  }
}

function clearLocalStorageBackup(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ 로컬 스토리지 백업 삭제 완료');
  } catch (error) {
    console.error('❌ 로컬 스토리지 삭제 실패:', error);
  }
}

function hasLocalStorageBackup(): boolean {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return false;
    
    const backupData = JSON.parse(savedData);
    const hoursDiff = (Date.now() - new Date(backupData.timestamp).getTime()) / (1000 * 60 * 60);
    
    return hoursDiff <= 24 && backupData.version === STORAGE_VERSION;
  } catch {
    return false;
  }
}

// ==================== 백업 복원 다이얼로그 ====================
function showBackupRestoreDialog(): void {
  // 기존 다이얼로그가 있으면 제거
  const existingDialog = document.querySelector('.backup-restore-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }

  // 백업 정보 분석
  const backupInfo = getBackupInfo();
  
  const dialog = document.createElement('div');
  dialog.className = 'backup-restore-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay">
      <div class="dialog-content">
        <h3>💾 저장된 설문이 있습니다</h3>
        <div class="backup-info">
          <p><strong>브랜드명:</strong> ${backupInfo.brandName}</p>
          <p><strong>선택 서비스:</strong> ${backupInfo.selectedService}</p>
          <p><strong>진행률:</strong> ${backupInfo.progress}% (${backupInfo.answeredQuestions}/${backupInfo.totalQuestions}문)</p>
          <p class="backup-time">저장 시간: ${backupInfo.saveTime}</p>
        </div>
        <p>이전에 진행하던 설문을 계속하시겠습니까?</p>
        <div class="dialog-buttons">
          <button id="restore-backup" class="btn-primary">계속하기</button>
          <button id="start-new" class="btn-secondary">새로 시작</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // 이벤트 리스너
  dialog.querySelector('#restore-backup')?.addEventListener('click', () => {
    if (loadFromLocalStorage()) {
      restoreUIFromState();
      transitionToScreen(state.currentScreenId);
      updateProgressBar();
    }
    document.body.removeChild(dialog);
    if (!isInitialized) {
      initialize();
    }
  });
  
  dialog.querySelector('#start-new')?.addEventListener('click', () => {
    clearLocalStorageBackup();
    document.body.removeChild(dialog);
    if (!isInitialized) {
      initialize();
    }
  });
}

// 백업 정보 분석 함수
function getBackupInfo(): any {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return null;
    
    const backupData = JSON.parse(savedData);
    const savedState = backupData.state;
    
    const answeredCount = Object.keys(savedState.survey?.answers || {}).length;
    const totalQuestions = savedState.totalSteps - 5; // 기본 단계 5개 제외
    const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    
    return {
      brandName: savedState.brandName || '미입력',
      selectedService: savedState.selectedService || '미선택',
      answeredQuestions: answeredCount,
      totalQuestions: totalQuestions,
      progress: progress,
      saveTime: new Date(backupData.timestamp).toLocaleString('ko-KR')
    };
  } catch {
    return {
      brandName: '미입력',
      selectedService: '미선택',
      answeredQuestions: 0,
      totalQuestions: 0,
      progress: 0,
      saveTime: '알 수 없음'
    };
  }
}

// ==================== UI 복원 - 설문 답변 포함 ====================
function restoreUIFromState(): void {
  try {
    console.log('🔄 UI 상태 복원 시작...');
    
    // 입력 필드 복원
    const inputs = [
      { id: 'storeName', value: state.brandName, buttonId: 'nextToServices' },
      { id: 'industryInput', value: state.industryInput, buttonId: 'industryInputNextBtn' },
      { id: 'contactEmail', value: state.contactEmail, buttonId: 'contactInfoNextBtn' }
    ];
    
    inputs.forEach(({ id, value, buttonId }) => {
      const input = el<HTMLInputElement>(id);
      const button = el<HTMLButtonElement>(buttonId);
      if (input && value) {
        input.value = value;
        if (button) button.disabled = false;
      }
    });
    
    // 서비스 선택 복원
    if (state.selectedService) {
      const serviceCard = document.querySelector(`[data-service="${state.selectedService}"]`);
      serviceCard?.classList.add('selected');
      
      // 브랜드명 표시 복원
      const brandNameDisplay = el('brandNameDisplay');
      if (brandNameDisplay) {
        brandNameDisplay.textContent = `${state.brandName}님을 위한 맞춤 서비스`;
      }
    }
    
    // 설문 상태 복원
    if (state.selectedService && (state.currentScreenId === 'survey-screen' || Object.keys(state.survey.answers).length > 0)) {
      console.log('📊 설문 상태 복원 중...');
      initializeSurvey(); // 질문 배열 설정
      
      // 설문 화면이라면 현재 질문 렌더링
      if (state.currentScreenId === 'survey-screen') {
        renderQuestion();
        console.log(`✅ 설문 ${state.survey.currentStep + 1}번 문항 복원 완료`);
      }
    }
    
    console.log('✅ UI 상태 복원 완료');
    console.log('📊 복원된 설문 답변:', state.survey.answers);
  } catch (error) {
    console.error('❌ UI 복원 실패:', error);
  }
}

// ==================== 화면 전환 관리 ====================
function updateProgressBar(): void {
  if (!progressBar || !progressBarContainer) return;
  
  if (state.totalSteps > 0) {
    const percentage = Math.round((state.currentStep / state.totalSteps) * 100);
    progressBar.style.width = `${percentage}%`;
    progressBarContainer.classList.remove('hidden');
  } else {
    progressBarContainer.classList.add('hidden');
  }
}

function transitionToScreen(nextScreenId: string): void {
  const currentScreen = screens[state.currentScreenId];
  const nextScreen = screens[nextScreenId];
  
  // 모든 화면 초기화
  Object.values(screens).forEach(screen => {
    if (screen) {
      screen.classList.add('hidden');
      screen.classList.remove('slide-up-exit', 'slide-down-exit', 'slide-down-enter');
    }
  });
  
  // 다음 화면만 표시
  if (nextScreen) {
    nextScreen.classList.remove('hidden');
    nextScreen.classList.add('slide-down-enter');
  }
  
  state.currentScreenId = nextScreenId;
}

function saveAndGoTo(nextScreenId: string): void {
  state.history.push(JSON.parse(JSON.stringify(state)));
  transitionToScreen(nextScreenId);
  saveToLocalStorage();
}

function goBack(): void {
  if (state.history.length === 0) return;
  
  const prevState = state.history.pop() as AppState;
  const prevScreenId = prevState.currentScreenId;
  
  const { currentScreenId: _ignore, ...rest } = prevState as any;
  Object.assign(state, rest);
  
  transitionToScreen(prevScreenId);
  updateProgressBar();
  saveToLocalStorage();
}

// ==================== 입력 핸들러 관리 ====================
function createInputHandler(
  inputId: string,
  buttonId: string,
  stateKey: keyof AppState,
  validator?: (value: string) => boolean
) {
  return () => {
    const input = el<HTMLInputElement>(inputId);
    const button = el<HTMLButtonElement>(buttonId);
    if (!input || !button) return;
    
    const value = input.value.trim();
    (state as any)[stateKey] = value;
    
    const isValid = validator ? validator(value) : value.length > 0;
    button.disabled = !isValid;
    saveToLocalStorage();
  };
}

function setupInputField(
  inputId: string,
  buttonId: string,
  stateKey: keyof AppState,
  nextScreen: string,
  validator?: (value: string) => boolean,
  onNext?: () => void
): void {
  const input = el<HTMLInputElement>(inputId);
  const button = el<HTMLButtonElement>(buttonId);
  if (!input || !button) return;
  
  const handler = createInputHandler(inputId, buttonId, stateKey, validator);
  
  input.oninput = handler;
  button.onclick = () => {
    handler();
    onNext?.();
    saveAndGoTo(nextScreen);
  };
  input.onkeypress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !button.disabled) button.click();
  };
}

// ==================== 설문 관리 ====================
function initializeSurvey(): void {
  try {
    if (state.selectedService === '브랜드송') {
      state.survey.questions = brandSongQuestions;
    } else if (state.selectedService === '나레이션') {
      state.survey.questions = getNarrationQuestions();
    } else if (state.selectedService === '브랜드송+나레이션') {
      state.survey.questions = state.survey.stage === 1 ? brandSongQuestions : getNarrationQuestions();
    }
    
    console.log('설문 초기화 완료 - 서비스:', state.selectedService, '스테이지:', state.survey.stage);
  } catch (error) {
    console.error('설문 초기화 실패:', error);
  }
}

// ==================== 설문 질문 렌더링 - 답변 복원 포함 ====================
function renderQuestion(): void {
  const q = state.survey.questions[state.survey.currentStep];
  if (!q) {
    console.error('❌ 질문을 찾을 수 없습니다:', state.survey.currentStep);
    return;
  }
  
  console.log(`🔄 질문 렌더링: ${q.id} (${state.survey.currentStep + 1}/${state.survey.questions.length})`);
  
  const elements = {
    section: el('question-section'),
    title: el('question-title'),
    text: el('question-text'),
    example: el('question-example'),
    container: el('answer-container')
  };
  
  if (!elements.title || !elements.text || !elements.container) {
    console.error('❌ 필수 UI 요소를 찾을 수 없습니다');
    return;
  }
  
  // UI 업데이트
  elements.container.className = 'pb-4';
  elements.container.innerHTML = '';
  
  if (q.section && elements.section) {
    elements.section.textContent = q.section;
    elements.section.classList.remove('hidden');
  } else {
    elements.section?.classList.add('hidden');
  }
  
  elements.title.textContent = q.title;
  elements.text.textContent = state.isMobile && q.mobileQuestion ? q.mobileQuestion : q.question;
  
  if (elements.example) {
    if (q.example) {
      elements.example.textContent = `💡 ${q.example}`;
      elements.example.classList.remove('hidden');
    } else {
      elements.example.classList.add('hidden');
    }
  }
  
  // 👈 저장된 답변 가져오기
  const saved = state.survey.answers[q.id];
  if (saved) {
    console.log(`📥 저장된 답변 복원: ${q.id} =`, saved);
  }
  
  // 질문 타입별 렌더링 (저장된 답변 포함)
  switch (q.type) {
    case 'text':
    case 'textarea':
      renderTextInput(elements.container, q, saved as string);
      break;
    case 'radio':
    case 'checkbox':
      renderOptions(elements.container, q, saved);
      break;
    case 'priority':
      renderPriorityOptions(elements.container, q, saved as string[]);
      break;
  }
}

function renderTextInput(container: HTMLElement, q: Question, saved?: string): void {
  const isTextarea = q.type === 'textarea';
  const input = document.createElement(isTextarea ? 'textarea' : 'input');
  
  if (isTextarea) {
    (input as HTMLTextAreaElement).className = 'textarea-field w-full px-6 py-4 text-lg rounded-2xl h-60 resize-y';
  } else {
    (input as HTMLInputElement).type = 'text';
    input.className = 'input-field w-full px-6 py-4 text-lg rounded-2xl';
  }
  
  input.id = 'text-answer';
  (input as HTMLInputElement | HTMLTextAreaElement).value = saved || '';
  container.appendChild(input);
  
  // 해당없음 옵션 처리
  if (q.hasNotApplicable) {
    addNotApplicableOption(container, input as HTMLInputElement | HTMLTextAreaElement, saved);
  }
}

function addNotApplicableOption(container: HTMLElement, input: HTMLInputElement | HTMLTextAreaElement, saved?: string): void {
  const div = document.createElement('div');
  div.className = 'mt-4';
  div.innerHTML = `
    <label class="flex items-center space-x-3 cursor-pointer">
      <input type="checkbox" id="not-applicable-checkbox" class="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500" />
      <span class="text-gray-700 font-medium">해당없음</span>
    </label>
  `;
  container.appendChild(div);
  
  const checkbox = div.querySelector('#not-applicable-checkbox') as HTMLInputElement;
  
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      input.value = '';
      input.disabled = true;
      input.style.backgroundColor = '#f3f4f6';
    } else {
      input.disabled = false;
      input.style.backgroundColor = '';
      input.focus();
    }
  });
  
  input.addEventListener('input', () => {
    if (input.value.trim() && checkbox.checked) {
      checkbox.checked = false;
      input.disabled = false;
      input.style.backgroundColor = '';
    }
  });
  
  if (saved === '해당없음') {
    checkbox.checked = true;
    input.disabled = true;
    input.style.backgroundColor = '#f3f4f6';
  }
}

function renderOptions(container: HTMLElement, q: Question, saved: string | string[]): void {
  const options = q.options ?? [];
  const isGrid = options.length > 4;
  const maxSelections = getMaxSelections(q);
  
  container.className = (isGrid ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-2') + ' pb-4';
  
  options.forEach(option => {
    const wrapper = document.createElement('div');
    const button = document.createElement('button');
    const hasOther = option === '기타' || option === '있음 (구체적으로)';
    
    button.className = `option-card w-full ${isGrid ? 'rounded-xl p-3 text-center text-base flex items-center justify-center' : 'rounded-xl py-3 px-4 text-left text-base'}`;
    button.textContent = option;
    
    if (isGrid && hasOther) {
      wrapper.className = 'col-span-2 md:col-span-3';
    }
    
    let otherInput: HTMLInputElement | null = null;
    if (hasOther) {
      otherInput = createOtherInput();
      wrapper.appendChild(otherInput);
    }
    
    // 상태 복원
    restoreOptionState(button, otherInput, option, saved, hasOther);
    
    // 클릭 이벤트
    button.onclick = () => handleOptionClick(button, otherInput, q, option, hasOther, maxSelections, container);
    
    wrapper.appendChild(button);
    container.appendChild(wrapper);
  });
}

function createOtherInput(): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '내용을 직접 입력해주세요.';
  input.className = 'input-field w-full px-4 py-3 text-base rounded-lg mt-2 hidden';
  input.onclick = (e) => e.stopPropagation();
  return input;
}

function getMaxSelections(q: Question): number {
  if (q.type === 'radio') return 1;
  
  const title = q.title.toLowerCase();
  if (title.includes('최대 2개')) return 2;
  if (title.includes('최대 3개')) return 3;
  if (title.includes('최대 5개')) return 5;
  return 999;
}

function restoreOptionState(button: HTMLElement, otherInput: HTMLInputElement | null, option: string, saved: string | string[], hasOther: boolean): void {
  const baseText = hasOther ? option.split('(')[0].trim() : '';
  
  if (Array.isArray(saved)) {
    if (saved.includes(option)) {
      button.classList.add('selected');
    }
    if (hasOther && otherInput) {
      const val = saved.find(a => a.startsWith(baseText + ': '));
      if (val) {
        button.classList.add('selected');
        otherInput.value = val.substring((baseText + ': ').length);
        otherInput.classList.remove('hidden');
      }
    }
  } else if (typeof saved === 'string') {
    if (saved === option) {
      button.classList.add('selected');
    } else if (hasOther && saved.startsWith(baseText + ': ')) {
      button.classList.add('selected');
      if (otherInput) {
        otherInput.value = saved.substring((baseText + ': ').length);
        otherInput.classList.remove('hidden');
      }
    }
  }
}

function handleOptionClick(
  button: HTMLElement,
  otherInput: HTMLInputElement | null,
  q: Question,
  option: string,
  hasOther: boolean,
  maxSelections: number,
  container: HTMLElement
): void {
  if (q.type === 'radio') {
    container.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
    container.querySelectorAll('input[type="text"]').forEach(i => i.classList.add('hidden'));
    button.classList.add('selected');
    
    if (hasOther && otherInput) {
      otherInput.classList.remove('hidden');
      otherInput.focus();
      setTimeout(() => otherInput?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  } else {
    const isSelected = button.classList.contains('selected');
    const selectedCount = container.querySelectorAll('.selected').length;
    
    if (!isSelected && selectedCount >= maxSelections) {
      showToast(`최대 ${maxSelections}개까지 선택할 수 있습니다.`);
      return;
    }
    
    button.classList.toggle('selected');
    
    if (hasOther && otherInput) {
      if (button.classList.contains('selected')) {
        otherInput.classList.remove('hidden');
        otherInput.focus();
        setTimeout(() => otherInput?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      } else {
        otherInput.classList.add('hidden');
        otherInput.value = '';
      }
    }
  }
}

function renderPriorityOptions(container: HTMLElement, q: Question, saved?: string[]): void {
  container.className = 'space-y-2 pb-4';
  const currentSelections = Array.isArray(saved) ? [...saved] : [];
  
  if (!Array.isArray(state.survey.answers[q.id])) {
    state.survey.answers[q.id] = currentSelections;
  }
  
  (q.options ?? []).forEach(option => {
    const button = document.createElement('button');
    button.className = 'option-card priority-button rounded-2xl p-4 text-left w-full flex items-center justify-between';
    
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
    
    button.onclick = () => handlePriorityClick(button, option, currentSelections, container);
    container.appendChild(button);
  });
}

function handlePriorityClick(button: HTMLElement, option: string, currentSelections: string[], container: HTMLElement): void {
  const index = currentSelections.indexOf(option);
  
  if (index > -1) {
    currentSelections.splice(index, 1);
  } else {
    if (currentSelections.length < 3) {
      currentSelections.push(option);
    } else {
      showToast('최대 3개까지 선택할 수 있습니다.');
      return;
    }
  }
  
  // 배지 업데이트
  container.querySelectorAll('button').forEach(btn => {
    const labelEl = btn.querySelector('span:first-child') as HTMLElement;
    const text = labelEl?.textContent?.trim() ?? '';
    if (!text) return;
    
    const badge = btn.querySelector('.priority-badge') as HTMLElement;
    const idx = currentSelections.indexOf(text);
    
    if (idx > -1) {
      btn.classList.add('selected');
      badge.textContent = `${idx + 1}`;
      badge.classList.remove('hidden');
    } else {
      btn.classList.remove('selected');
      badge.classList.add('hidden');
    }
  });
}

// ==================== 설문 진행 관리 ====================
function saveAnswerAndProceed(): void {
  const q = state.survey.questions[state.survey.currentStep];
  if (!q) return;
  
  const answer = collectAnswer(q);
  if (answer === null) return; // 유효성 검사 실패
  
  state.survey.answers[q.id] = answer;
  console.log(`💾 답변 저장: ${q.id} =`, answer);
  
  state.survey.currentStep++;
  state.currentStep++;
  
  // 👈 답변 저장 즉시 백업
  saveToLocalStorage();
  
  if (state.survey.currentStep < state.survey.questions.length) {
    renderQuestion();
    updateProgressBar();
  } else {
    handleSurveyCompletion();
  }
}

function collectAnswer(q: Question): string | string[] | null {
  const container = el('answer-container')!;
  
  switch (q.type) {
    case 'text':
    case 'textarea':
      return collectTextAnswer(q, container);
    case 'radio':
      return collectRadioAnswer(container);
    case 'checkbox':
      return collectCheckboxAnswer(container);
    case 'priority':
      return collectPriorityAnswer(q);
    default:
      return null;
  }
}

function collectTextAnswer(q: Question, container: HTMLElement): string | null {
  // 해당없음 체크박스 확인
  if (q.hasNotApplicable) {
    const checkbox = el<HTMLInputElement>('not-applicable-checkbox');
    if (checkbox?.checked) return '해당없음';
  }
  
  const input = container.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null;
  const value = input?.value.trim() ?? '';
  
  if (!value) {
    showToast('답변을 입력해주세요.');
    return null;
  }
  
  // 질문별 추가 검증
  if (!validateTextAnswer(q.id, value)) return null;
  
  return value;
}

function validateTextAnswer(questionId: string, value: string): boolean {
  const validations: Record<string, () => boolean> = {
    q18: () => {
      const keywords = value.split(',').map(k => k.trim()).filter(Boolean);
      if (keywords.length !== 3) {
        showToast('핵심 단어 3개를 쉼표(,)로 구분하여 입력해주세요.');
        return false;
      }
      return true;
    },
    q15: () => {
      if (value.split(/\s+/).filter(Boolean).length < 2) {
        showToast('고객층의 연령대와 특징을 모두 입력해주세요.');
        return false;
      }
      return true;
    },
    q4: () => {
      if (!value.includes(',')) {
        showToast('색깔과 시간 느낌, 두 가지를 쉼표(,)로 구분하여 입력해주세요.');
        return false;
      }
      return true;
    }
  };
  
  return validations[questionId]?.() ?? true;
}

function collectRadioAnswer(container: HTMLElement): string | null {
  const selected = container.querySelector('.selected') as HTMLElement | null;
  if (!selected) {
    showToast('옵션을 선택해주세요.');
    return null;
  }
  
  const text = selected.textContent || '';
  if (text === '기타' || text === '있음 (구체적으로)') {
    const otherInput = selected.parentElement?.querySelector('input') as HTMLInputElement | null;
    const otherValue = otherInput?.value.trim() ?? '';
    if (!otherValue) {
      showToast('세부 내용을 입력해주세요.');
      return null;
    }
    const baseText = text.split('(')[0].trim();
    return `${baseText}: ${otherValue}`;
  }
  
  return text;
}

function collectCheckboxAnswer(container: HTMLElement): string[] | null {
  const selected = Array.from(container.querySelectorAll('.selected')) as HTMLElement[];
  if (selected.length === 0) {
    showToast('하나 이상의 옵션을 선택해주세요.');
    return null;
  }
  
  const answers: string[] = [];
  let hasError = false;
  
  selected.forEach(btn => {
    const text = btn.textContent || '';
    if (text === '기타' || text === '있음 (구체적으로)') {
      const otherInput = btn.parentElement?.querySelector('input') as HTMLInputElement | null;
      const value = otherInput?.value.trim() ?? '';
      if (!value) {
        hasError = true;
      } else {
        const baseText = text.split('(')[0].trim();
        answers.push(`${baseText}: ${value}`);
      }
    } else {
      answers.push(text);
    }
  });
  
  if (hasError) {
    showToast('세부 내용을 입력해주세요.');
    return null;
  }
  
  return answers;
}

function collectPriorityAnswer(q: Question): string[] | null {
  const selections = state.survey.answers[q.id] as string[];
  if (!Array.isArray(selections) || selections.length !== 3) {
    showToast('3개의 우선순위를 선택해주세요.');
    return null;
  }
  return selections;
}

function handleSurveyCompletion(): void {
  if (state.selectedService === '브랜드송+나레이션' && state.survey.stage === 1) {
    // 2단계 (나레이션) 시작
    state.survey.stage = 2;
    state.survey.currentStep = 0;
    state.survey.questions = getNarrationQuestions();
    renderQuestion();
    updateProgressBar();
  } else {
    showCompletionScreen();
  }
}

function goBackInSurvey(): void {
  if (state.survey.currentStep > 0) {
    state.survey.currentStep--;
    state.currentStep--;
    renderQuestion(); // 이전 답변이 자동으로 복원됨
    updateProgressBar();
    
    // 백스텝도 백업
    saveToLocalStorage();
  } else {
    if (state.selectedService === '브랜드송+나레이션' && state.survey.stage === 2) {
      // 1단계로 돌아가기
      state.survey.stage = 1;
      state.survey.questions = brandSongQuestions;
      state.survey.currentStep = state.survey.questions.length - 1;
      state.currentStep--;
      renderQuestion();
      updateProgressBar();
      saveToLocalStorage();
    } else {
      goBack();
    }
  }
}

function goToQuestion(questionId: string, stage?: number): void {
  if (state.selectedService === '브랜드송+나레이션') {
    if (stage === 1) {
      const questionIndex = brandSongQuestions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        state.survey.stage = 1;
        state.survey.questions = brandSongQuestions;
        state.survey.currentStep = questionIndex;
        state.currentStep = 5 + questionIndex;
      }
    } else if (stage === 2) {
      const questionIndex = narrationQuestions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        state.survey.stage = 2;
        state.survey.questions = getNarrationQuestions();
        state.survey.currentStep = questionIndex;
        state.currentStep = 5 + brandSongQuestions.length + questionIndex;
      }
    }
  } else {
    const questionIndex = state.survey.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      state.survey.currentStep = questionIndex;
      state.currentStep = 5 + questionIndex;
    }
  }
  
  transitionToScreen('survey-screen');
  renderQuestion();
  updateProgressBar();
}

// ==================== 완료 화면 관리 ====================
function showCompletionScreen(): void {
  const msgEl = el('completion-message');
  if (msgEl) {
    msgEl.textContent = `소중한 답변 감사드립니다. ${state.brandName}의 멋진 콘텐츠 제작을 위해 전문 상담사가 곧 연결될 예정입니다.`;
  }
  
  const summaryContainer = el('completion-summary');
  if (summaryContainer) {
    summaryContainer.innerHTML = '';
    
    // 기본 정보 섹션
    summaryContainer.appendChild(createBasicInfoSection());
    
    // 브랜드송 결과 섹션
    summaryContainer.appendChild(createSurveyResultSection('브랜드송', brandSongQuestions, 1));
    
    // 나레이션 결과 섹션
    summaryContainer.appendChild(createSurveyResultSection('나레이션', narrationQuestions, 2));
  }
  
  // 기존 요약 컨테이너 숨김
  const summaryWrapper = el('summary-container-wrapper');
  summaryWrapper?.classList.add('hidden');
  
  state.currentStep = state.totalSteps;
  updateProgressBar();
  saveAndGoTo('completion-screen');

  // 👈 애니메이션 시퀀스 시작
  setTimeout(() => {
    triggerCompletionAnimations();
  }, 100);
}

// 👈 새로 추가: 완료 화면 애니메이션 트리거 함수
function triggerCompletionAnimations(): void {
  console.log('🎉 설문 완료 애니메이션 시작');
  
  // 체크마크 애니메이션은 CSS에서 자동 실행됨
  // 추가적인 JavaScript 제어가 필요한 경우 여기서 처리
  
  // 선택사항: 완료 사운드 효과 (브라우저가 지원하는 경우에만)
  playCompletionSound();
  
  // 선택사항: 축하 메시지 로그
  console.log(`🎊 ${state.brandName}님의 설문이 완료되었습니다!`);
  
  // 선택사항: 성공 통계 업데이트
  updateCompletionStats();
}

// 👈 새로 추가: 완료 사운드 재생 (선택사항)
function playCompletionSound(): void {
  try {
    // 브라우저에서 오디오 컨텍스트를 지원하는 경우에만 실행
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 간단한 성공 벨소리 생성
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // C5 음표로 시작 (523.25 Hz)
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    
    // E5 음표로 변경 (659.25 Hz) - 0.15초 후
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
    
    // G5 음표로 변경 (783.99 Hz) - 0.3초 후
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
    
    // 볼륨 설정 (부드럽게 시작해서 페이드아웃)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // 사운드 재생 (0.5초간)
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    console.log('🔊 완료 사운드 재생됨');
  } catch (error) {
    // 오디오 재생 실패시 무시 (사운드는 선택사항)
    console.log('🔇 사운드 재생 불가 (브라우저 제한 또는 미지원)');
  }
}

// 👈 새로 추가: 완료 통계 업데이트 (선택사항)
function updateCompletionStats(): void {
  try {
    const stats = {
      completedAt: new Date().toISOString(),
      brandName: state.brandName,
      selectedService: state.selectedService,
      totalAnswers: Object.keys(state.survey.answers).length,
      completionTime: Date.now() - (performance.timeOrigin || 0) // 대략적인 소요 시간
    };
    
    // 로컬 스토리지에 완료 통계 저장 (선택사항)
    const existingStats = JSON.parse(localStorage.getItem('ssokssok_completion_stats') || '[]');
    existingStats.push(stats);
    
    // 최근 10개만 보관
    if (existingStats.length > 10) {
      existingStats.splice(0, existingStats.length - 10);
    }
    
    localStorage.setItem('ssokssok_completion_stats', JSON.stringify(existingStats));
    
    console.log('📈 완료 통계 업데이트됨:', stats);
  } catch (error) {
    // 통계 저장 실패시 무시
    console.log('📊 통계 저장 실패 (무시됨)');
  }
}

function createBasicInfoSection(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'mb-8';
  
  const title = document.createElement('h3');
  title.className = 'text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200';
  title.textContent = '입력 정보';
  
  const content = document.createElement('div');
  content.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3';
  
  const infos = [
    { label: '브랜드명', value: state.brandName },
    { label: '업종', value: state.industryInput || '미입력' },
    { label: '이메일', value: state.contactEmail },
    { label: '선택 서비스', value: state.selectedService || '' }
  ];
  
  infos.forEach(({ label, value }) => {
    if (label === '업종' && !state.industryInput) return;
    
    const div = document.createElement('div');
    div.className = 'flex text-left';
    div.innerHTML = `
      <span class="text-sm font-medium text-gray-700 w-24">${label}:</span>
      <span class="text-gray-800">${value}</span>
    `;
    content.appendChild(div);
  });
  
  section.appendChild(title);
  section.appendChild(content);
  return section;
}

function createSurveyResultSection(sectionName: string, questions: Question[], stage: number): HTMLElement {
  const section = document.createElement('div');
  section.className = 'mb-8';
  
  const title = document.createElement('h3');
  title.className = 'text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200';
  title.textContent = `${sectionName} 설문결과`;
  
  section.appendChild(title);

  const hasResults = (sectionName === '브랜드송' && (state.selectedService === '브랜드송' || state.selectedService === '브랜드송+나레이션')) ||
                    (sectionName === '나레이션' && (state.selectedService === '나레이션' || state.selectedService === '브랜드송+나레이션'));
  
  if (hasResults) {
    const questionsDiv = document.createElement('div');
    questionsDiv.className = 'space-y-4';
    
    questions.forEach(q => {
      const answer = state.survey.answers[q.id];
      if (answer === undefined) return;
      
      questionsDiv.appendChild(createQuestionSummary(q, answer, stage));
    });
    
    section.appendChild(questionsDiv);
  } else {
    const noResultDiv = document.createElement('div');
    noResultDiv.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200 text-left';
    noResultDiv.textContent = `${sectionName} 설문결과: 없음`;
    section.appendChild(noResultDiv);
  }
  
  return section;
}

function createQuestionSummary(question: Question, answer: string | string[], stage: number): HTMLElement {
  const div = document.createElement('div');
  div.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow';
  
  const header = document.createElement('div');
  header.className = 'flex justify-between items-start mb-3';
  
  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex-1 pr-4 text-left';
  
  const questionTitle = document.createElement('h4');
  questionTitle.className = 'font-medium text-gray-800 mb-1 text-left';
  questionTitle.textContent = question.title;
  
  const questionText = document.createElement('p');
  questionText.className = 'text-sm text-gray-600 text-left';
  questionText.textContent = state.isMobile && question.mobileQuestion ? question.mobileQuestion : question.question;
  
  titleDiv.appendChild(questionTitle);
  titleDiv.appendChild(questionText);
  
  const editBtn = document.createElement('button');
  editBtn.className = 'px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex-shrink-0';
  editBtn.textContent = '✏️ 수정';
  editBtn.onclick = () => goToQuestion(question.id, stage);
  
  header.appendChild(titleDiv);
  header.appendChild(editBtn);
  
  const answerDiv = document.createElement('div');
  answerDiv.className = 'mt-3 pt-3 border-t border-gray-300 text-left';
  
  const answerLabel = document.createElement('span');
  answerLabel.className = 'text-sm font-medium text-gray-700';
  answerLabel.textContent = '답변: ';
  
  const answerContent = document.createElement('span');
  answerContent.className = 'text-gray-800';
  answerContent.textContent = Array.isArray(answer) ? answer.join(', ') : answer;
  
  answerDiv.appendChild(answerLabel);
  answerDiv.appendChild(answerContent);
  
  div.appendChild(header);
  div.appendChild(answerDiv);
  
  return div;
}

// ==================== 제출 관리 ====================
async function submitToGoogleSheets(): Promise<boolean> {
  try {
    console.log('Google Sheets 제출 시작...');
    
    const brandSongAnswers: Record<string, any> = {};
    const narrationAnswers: Record<string, any> = {};
    
    Object.entries(state.survey.answers).forEach(([questionId, answer]) => {
      const brandSongQuestion = brandSongQuestions.find(q => q.id === questionId);
      const narrationQuestion = narrationQuestions.find(q => q.id === questionId);
      
      if (brandSongQuestion) {
        brandSongAnswers[brandSongQuestion.title] = answer;
      } else if (narrationQuestion) {
        narrationAnswers[narrationQuestion.title] = answer;
      }
    });
    
    const submitData = {
      brandName: state.brandName,
      industry: state.industryInput || '미입력',
      email: state.contactEmail,
      selectedService: state.selectedService,
      brandSongAnswers,
      narrationAnswers
    };
    
    console.log('전송할 데이터:', submitData);
    
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData)
    });
    
    console.log('데이터 전송 완료');
    return true;
  } catch (error) {
    console.error('Google Sheets 제출 오류:', error);
    return false;
  }
}

async function handleSubmit(): Promise<void> {
  if (isSubmitting) return;
  
  const submitBtn = el<HTMLButtonElement>('submitBtn');
  if (!submitBtn) return;
  
  const originalText = submitBtn.textContent || '제출하기';
  
  try {
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = '제출 중...';
    submitBtn.classList.add('submitting');
    
    const success = await submitToGoogleSheets();
    
    if (success) {
      showToast('설문이 성공적으로 제출되었습니다!');
      isSubmitting = false;
      setTimeout(() => showSubmitSuccessScreen(), 1000);
    } else {
      throw new Error('제출에 실패했습니다.');
    }
  } catch (error) {
    console.error('제출 오류:', error);
    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.classList.remove('submitting');
    showToast('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

function showSubmitSuccessScreen(): void {
  const brandNameDisplay = el('brand-name-display');
  if (brandNameDisplay) {
    brandNameDisplay.textContent = state.brandName;
  }
  
    // 👈 선택된 서비스명 표시
  const selectedServiceName = el('selected-service-name');
  if (selectedServiceName) {
    selectedServiceName.textContent = state.selectedService || '선택한 서비스';
  }

  transitionToScreen('submit-success-screen');
  
    // 👈 제출 완료 애니메이션 트리거
  setTimeout(() => {
    triggerSubmitSuccessAnimations();
  }, 100);
}

// 👈 새로 추가: 제출 완료 애니메이션 트리거 함수
function triggerSubmitSuccessAnimations(): void {
  console.log('🎉 제출 완료 애니메이션 시작');
  
  // 체크마크 애니메이션은 CSS에서 자동 실행됨
  // 완료 사운드 재생
  playCompletionSound();
  
  // 축하 메시지 로그
  console.log(`🎊 ${state.brandName}님의 설문 제출이 완료되었습니다!`);
  
  // 제출 완료 통계 업데이트
  updateSubmitSuccessStats();
}

// 👈 새로 추가: 제출 완료 통계 업데이트
function updateSubmitSuccessStats(): void {
  try {
    const stats = {
      submittedAt: new Date().toISOString(),
      brandName: state.brandName,
      selectedService: state.selectedService,
      email: state.contactEmail,
      totalAnswers: Object.keys(state.survey.answers).length
    };
    
    // 로컬 스토리지에 제출 완료 통계 저장
    const existingStats = JSON.parse(localStorage.getItem('ssokssok_submit_stats') || '[]');
    existingStats.push(stats);
    
    // 최근 5개만 보관
    if (existingStats.length > 5) {
      existingStats.splice(0, existingStats.length - 5);
    }
    
    localStorage.setItem('ssokssok_submit_stats', JSON.stringify(existingStats));
    
    console.log('📈 제출 완료 통계 업데이트됨:', stats);
  } catch (error) {
    console.log('📊 통계 저장 실패 (무시됨)');
  }
}

// 👈 새로 추가: 구매 버튼 클릭 핸들러
function handlePurchasePlan(): void {
  try {
    const purchaseUrl = 'https://studiochamaeleon.wixsite.com/ssokssok/pricing-plans/list';
    
    // 구매 의도 로그 기록
    console.log(`🛒 ${state.brandName}님이 ${state.selectedService} 플랜 구매 페이지로 이동`);
    
    // 구매 의도 통계 저장
    const purchaseIntent = {
      timestamp: new Date().toISOString(),
      brandName: state.brandName,
      selectedService: state.selectedService,
      email: state.contactEmail,
      fromPage: 'submit-success-screen'
    };
    
    const existingIntents = JSON.parse(localStorage.getItem('ssokssok_purchase_intents') || '[]');
    existingIntents.push(purchaseIntent);
    
    if (existingIntents.length > 10) {
      existingIntents.splice(0, existingIntents.length - 10);
    }
    
    localStorage.setItem('ssokssok_purchase_intents', JSON.stringify(existingIntents));
    
    // 새 탭에서 구매 페이지 열기
    window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
    
    // 구매 버튼 클릭 피드백
    const purchaseBtn = el('purchase-plan-btn');
    if (purchaseBtn) {
      const originalText = purchaseBtn.textContent;
      purchaseBtn.textContent = '🚀 페이지로 이동 중...';
      purchaseBtn.classList.add('animate-pulse');
      
      setTimeout(() => {
        if (purchaseBtn) {
          purchaseBtn.textContent = originalText;
          purchaseBtn.classList.remove('animate-pulse');
        }
      }, 2000);
    }
    
  } catch (error) {
    console.error('구매 페이지 이동 실패:', error);
    showToast('페이지 이동 중 오류가 발생했습니다.');
  }

  // 순차적 애니메이션
  const animations = [
    { selector: 'submit-success-title', class: 'animate-fade-in-up', delay: 500 },
    { selector: 'submit-success-message', class: 'animate-fade-in-up delay-500', delay: 800 },
    { selector: 'restart-from-success-btn', class: 'animate-fade-in-scale delay-800', delay: 1200 }
  ];
  
  animations.forEach(({ selector, class: className, delay }) => {
    setTimeout(() => {
      const element = el(selector);
      if (element) element.classList.add(...className.split(' '));
    }, delay);
  });
}

// ==================== 초기화 관리 ====================
function resetAllStates(): void {
  Object.assign(state, {
    currentScreenId: 'intro-screen',
    history: [],
    brandName: '',
    contactEmail: '',
    selectedService: null,
    survey: { stage: 1, questions: [], currentStep: 0, answers: {} },
    totalSteps: 0,
    currentStep: 0,
    industryInput: ''
  });
  isSubmitting = false;
}

function resetAllUI(): void {
  // 버튼 상태 초기화
  const buttonConfigs = [
    { id: 'submitBtn', text: '📤 제출하기' },
    { id: 'restartBtn', text: '🔄 처음부터 다시 시작' },
    { id: 'restart-from-success-btn', text: '🔄 새로운 설문 시작하기' },
    { id: 'purchase-plan-btn', text: '🎵 플랜 구매' } // 👈 구매 버튼 추가
  ];
  
  buttonConfigs.forEach(({ id, text }) => {
    const btn = el<HTMLButtonElement>(id);
    if (btn) {
      btn.disabled = false;
      btn.textContent = text;
      btn.classList.remove('submitting', 'animate-pulse');
    }
  });
  
  // 입력 필드 초기화
  const inputConfigs = [
    { inputId: 'storeName', buttonId: 'nextToServices' },
    { inputId: 'industryInput', buttonId: 'industryInputNextBtn' },
    { inputId: 'contactEmail', buttonId: 'contactInfoNextBtn' }
  ];
  
  inputConfigs.forEach(({ inputId, buttonId }) => {
    const input = el<HTMLInputElement>(inputId);
    const button = el<HTMLButtonElement>(buttonId);
    
    if (input) input.value = '';
    if (button) button.disabled = true;
  });
  
  // 서비스 선택 초기화
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.remove('selected');
  });
}

function restartApp(): void {
  clearLocalStorageBackup();
  resetAllStates();
  resetAllUI();
  
  // 모든 화면 초기화
  Object.values(screens).forEach(screen => {
    if (screen) {
      screen.classList.add('hidden');
      screen.classList.remove('slide-up-exit', 'slide-down-exit', 'slide-down-enter');
    }
  });
  
  // 인트로 화면만 표시
  transitionToScreen('intro-screen');
  updateProgressBar();
  console.log('앱이 완전히 초기화되었습니다.');
}

// ==================== 이벤트 정리 함수 ====================
function cleanupEventListeners(): void {
  // 모든 버튼의 기존 이벤트 리스너 제거
  const buttonIds = [
    'introNextBtn', 'brandIntroNextBtn', 'brandIntroPrevBtn',
    'nextToServices', 'storeNamePrevBtn', 'industryInputNextBtn', 
    'industryInputPrevBtn', 'contactInfoNextBtn', 'contactInfoPrevBtn',
    'serviceSelectionPrevBtn', 'surveyNextBtn', 'surveyPrevBtn',
    'restartBtn', 'submitBtn', 'restart-from-success-btn',
    'purchase-plan-btn' // 👈 구매 버튼 추가
  ];
  
  buttonIds.forEach(id => {
    const btn = el(id);
    if (btn) {
      btn.onclick = null;
      // 기존 이벤트 리스너 완전 제거를 위해 복제 후 교체
      const newBtn = btn.cloneNode(true) as HTMLElement;
      btn.parentNode?.replaceChild(newBtn, btn);
    }
  });
  
  // 입력 필드 이벤트 정리
  const inputIds = ['storeName', 'industryInput', 'contactEmail'];
  inputIds.forEach(id => {
    const input = el<HTMLInputElement>(id);
    if (input) {
      input.oninput = null;
      input.onkeypress = null;
    }
  });
  
  // 서비스 카드 이벤트 정리
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    const newCard = card.cloneNode(true) as HTMLElement;
    card.parentNode?.replaceChild(newCard, card);
  });
  
  // 모바일 상태 변경 리스너 제거
  window.removeEventListener('mobileStateChange', handleMobileStateChange);
}

// 모바일 상태 변경 핸들러
function handleMobileStateChange(event: Event): void {
  const customEvent = event as CustomEvent<{ isMobile: boolean }>;
  state.isMobile = customEvent.detail.isMobile;
  // 현재 설문 화면이라면 질문 다시 렌더링
  if (state.currentScreenId === 'survey-screen') {
    renderQuestion();
  }
}

// ==================== 초기화 및 이벤트 바인딩 ====================
function initialize(): void {
  // 중복 초기화 방지
  if (isInitialized) return;
  
  console.log('🚀 설문 시스템 초기화 시작');
  
  // 화면 요소 매핑
  screens = {
    'intro-screen': el('intro-screen')!,
    'brand-intro-screen': el('brand-intro-screen')!,
    'store-name-screen': el('store-name-screen')!,
    'industry-input-screen': el('industry-input-screen')!,
    'contact-info-screen': el('contact-info-screen')!,
    'service-selection-screen': el('service-selection-screen')!,
    'survey-screen': el('survey-screen')!,
    'completion-screen': el('completion-screen')!,
    'submit-success-screen': el('submit-success-screen')!,
  };
  
  progressBarContainer = el('progressBarContainer')!;
  progressBar = el('progressBar')!;
  
  // 기존 이벤트 리스너 모두 제거
  cleanupEventListeners();
  
  // 기본 네비게이션 이벤트
  setupBasicNavigation();
  
  // 입력 필드 설정
  setupInputFields();
  
  // 서비스 선택 설정
  setupServiceSelection();
  
  // 설문 이벤트 설정
  setupSurveyEvents();
  
  // 완료 화면 이벤트 설정
  setupCompletionEvents();
  
  // 모바일 상태 변경 리스너 추가
  window.addEventListener('mobileStateChange', handleMobileStateChange);
  
  // 👈 새로 추가: 크기 변경 감지
  window.addEventListener('resize', handleResize);
  handleResize(); // 초기 실행
  
  isInitialized = true;
  console.log('✅ 설문 시스템 초기화 완료');
}

function setupBasicNavigation(): void {
  // Intro
  const introNextBtn = el('introNextBtn');
  if (introNextBtn) {
    introNextBtn.onclick = () => saveAndGoTo('brand-intro-screen');
    // 지연된 글로우 효과 추가
    setTimeout(() => introNextBtn.classList.add('pulse-glow'), 4300);
  }
  
  // Brand Intro
  const brandIntroNextBtn = el('brandIntroNextBtn');
  const brandIntroPrevBtn = el('brandIntroPrevBtn');
  if (brandIntroNextBtn) brandIntroNextBtn.onclick = () => saveAndGoTo('store-name-screen');
  if (brandIntroPrevBtn) brandIntroPrevBtn.onclick = goBack;
  
  // Previous buttons
  const prevButtons = [
    { id: 'storeNamePrevBtn', handler: goBack },
    { id: 'industryInputPrevBtn', handler: goBack },
    { id: 'contactInfoPrevBtn', handler: goBack },
    { id: 'serviceSelectionPrevBtn', handler: goBack }
  ];
  
  prevButtons.forEach(({ id, handler }) => {
    const btn = el(id);
    if (btn) btn.onclick = handler;
  });
}

function setupInputFields(): void {
  // Store Name
  setupInputField('storeName', 'nextToServices', 'brandName', 'industry-input-screen');
  
  // Industry Input
  setupInputField('industryInput', 'industryInputNextBtn', 'industryInput', 'contact-info-screen', undefined, () => {
    const contactEmailInput = el<HTMLInputElement>('contactEmail');
    contactEmailInput?.focus();
  });
  
  // Contact Info
  setupInputField('contactEmail', 'contactInfoNextBtn', 'contactEmail', 'service-selection-screen', isValidEmail, () => {
    const brandNameDisplay = el('brandNameDisplay');
    if (brandNameDisplay) brandNameDisplay.textContent = `${state.brandName}님을 위한 맞춤 서비스`;
  });
}

// ==================== 서비스 선택 - 변경 감지 및 확인(백업) ====================
function setupServiceSelection(): void {
  const serviceCardsContainer = document.querySelector('#service-cards-container');
  if (!serviceCardsContainer) return;
  
  serviceCardsContainer.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const newService = (card as HTMLElement).dataset.service!;
      
      // 👈 백업 복원 중이고 다른 서비스를 선택한 경우
      if (hasBackupData() && state.selectedService && state.selectedService !== newService) {
        showServiceChangeConfirmDialog(state.selectedService, newService);
        return;
      }
      
      // 일반적인 서비스 선택 처리
      handleServiceSelection(newService);
    });
  });
}

// 👈 새로 추가: 백업 데이터 존재 확인
function hasBackupData(): boolean {
  return Object.keys(state.survey.answers).length > 0 || 
         state.brandName !== '' || 
         state.contactEmail !== '' || 
         state.industryInput !== '';
}

// 👈 새로 추가: 서비스 변경 확인 다이얼로그
function showServiceChangeConfirmDialog(originalService: string, newService: string): void {
  const existingDialog = document.querySelector('.service-change-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }
  
  // 진행률 계산
  const progressInfo = calculateProgressInfo(originalService);
  
  const dialog = document.createElement('div');
  dialog.className = 'service-change-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay">
      <div class="dialog-content service-change-content">
        <div class="warning-icon">⚠️</div>
        <h3>서비스 변경 확인</h3>
        
        <div class="service-change-info">
          <div class="current-progress">
            <h4>현재 진행 중인 설문</h4>
            <div class="progress-details">
              <span class="service-name">${originalService}</span>
              <div class="progress-bar-mini">
                <div class="progress-fill" style="width: ${progressInfo.percentage}%"></div>
              </div>
              <span class="progress-text">${progressInfo.percentage}% 완료 (${progressInfo.completed}/${progressInfo.total}문)</span>
            </div>
          </div>
          
          <div class="arrow-down">↓</div>
          
          <div class="new-service">
            <h4>새로 선택한 서비스</h4>
            <span class="service-name new">${newService}</span>
          </div>
        </div>
        
        <p class="warning-text">
          <strong>${originalService}</strong> 플랜으로 진행중이던 설문이 있습니다.<br>
          <strong>${newService}</strong>으로 새롭게 시작하시겠습니까?
        </p>
        
        <div class="consequences">
          <div class="consequence-item">
            <span class="icon">✅</span>
            <div>
              <strong>예</strong>를 선택하면:
              <ul>
                <li>${newService} 설문을 처음부터 시작</li>
                <li>기존 브랜드 정보는 유지됨</li>
                <li>${originalService} 답변은 삭제됨</li>
              </ul>
            </div>
          </div>
          
          <div class="consequence-item">
            <span class="icon">🔄</span>
            <div>
              <strong>아니오</strong>를 선택하면:
              <ul>
                <li>${originalService} 설문을 이어서 진행</li>
                <li>모든 기존 답변이 보존됨</li>
                <li>${progressInfo.nextQuestion}번째 문항부터 시작</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="dialog-buttons">
          <button id="continue-original" class="btn-secondary">
            <span class="button-icon">🔄</span>
            아니오, ${originalService} 계속
          </button>
          <button id="start-new-service" class="btn-primary">
            <span class="button-icon">🆕</span>
            예, ${newService} 새로 시작
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // 이벤트 리스너
  dialog.querySelector('#continue-original')?.addEventListener('click', () => {
    // 원래 서비스 카드 선택 표시
    highlightServiceCard(originalService);
    document.body.removeChild(dialog);
    
    // 사용자 피드백 토스트
    showServiceChangeToast(`${originalService} 설문을 계속 진행합니다`, 'info');
    
    // 원래 진행 지점으로 이동
    if (state.currentScreenId === 'survey-screen') {
      renderQuestion();
    } else {
      transitionToScreen(state.currentScreenId);
    }
  });
  
  dialog.querySelector('#start-new-service')?.addEventListener('click', () => {
    // 새 서비스로 전환
    startNewService(newService);
    document.body.removeChild(dialog);
    
    // 사용자 피드백 토스트
    showServiceChangeToast(`${newService} 설문을 새로 시작합니다`, 'success');
  });
}

// 👈 새로 추가: 진행률 정보 계산
function calculateProgressInfo(serviceName: string): any {
  const baseSteps = 5; // 기본 정보 입력 단계
  let totalQuestions = 0;
  
  if (serviceName === '브랜드송') {
    totalQuestions = brandSongQuestions.length;
  } else if (serviceName === '나레이션') {
    totalQuestions = getNarrationQuestions().length;
  } else if (serviceName === '브랜드송+나레이션') {
    totalQuestions = brandSongQuestions.length + getNarrationQuestions().length;
  }
  
  const completedAnswers = Object.keys(state.survey.answers).length;
  const percentage = totalQuestions > 0 ? Math.round((completedAnswers / totalQuestions) * 100) : 0;
  
  return {
    completed: completedAnswers,
    total: totalQuestions,
    percentage: percentage,
    nextQuestion: completedAnswers + 1
  };
}

// 👈 새로 추가: 새 서비스로 시작
function startNewService(newService: string): void {
  // 기존 설문 답변 삭제 (기본 정보는 유지)
  state.survey = {
    stage: 1,
    questions: [],
    currentStep: 0,
    answers: {}
  };
  state.selectedService = newService;
  
  // 새 서비스 설정
  handleServiceSelection(newService);
  
  // 백업 업데이트
  saveToLocalStorage();
  
  console.log(`🔄 서비스 변경: ${newService}로 새로 시작`);
}

// 👈 새로 추가: 서비스 카드 강조 표시
function highlightServiceCard(serviceName: string): void {
  // 모든 카드 선택 해제
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // 해당 서비스 카드 선택
  const targetCard = document.querySelector(`[data-service="${serviceName}"]`);
  if (targetCard) {
    targetCard.classList.add('selected');
    
    // 시각적 피드백 (펄스 효과)
    targetCard.classList.add('pulse-glow');
    setTimeout(() => {
      targetCard.classList.remove('pulse-glow');
    }, 2000);
  }
}

// 👈 새로 추가: 일반적인 서비스 선택 처리 (기존 로직 분리)
function handleServiceSelection(service: string): void {
  state.selectedService = service;
  
  // 👈 기존 답변이 있는 경우 유지, 없는 경우에만 초기화
  if (Object.keys(state.survey.answers).length === 0) {
    state.survey = { stage: 1, questions: [], currentStep: 0, answers: {} };
  } else {
    // 기존 답변 유지하면서 스테이지만 확인
    console.log('📊 기존 답변 유지:', Object.keys(state.survey.answers).length, '개');
  }
  
  const baseSteps = 5;
  
  if (service === '브랜드송') {
    state.survey.questions = brandSongQuestions;
    state.totalSteps = baseSteps + state.survey.questions.length;
  } else if (service === '나레이션') {
    const questions = getNarrationQuestions();
    state.survey.questions = questions;
    state.totalSteps = baseSteps + questions.length;
  } else if (service === '브랜드송+나레이션') {
    const narrationQs = getNarrationQuestions();
    state.survey.stage = state.survey.stage || 1; // 기존 스테이지 유지
    state.survey.questions = state.survey.stage === 1 ? brandSongQuestions : getNarrationQuestions();
    state.totalSteps = baseSteps + brandSongQuestions.length + narrationQs.length;
  }
  
  // 서비스 카드 선택 표시
  highlightServiceCard(service);
  
  // 현재 단계 계산 (기존 답변 수 기반)
  const answeredCount = Object.keys(state.survey.answers).length;
  if (answeredCount > 0 && state.survey.currentStep === 0) {
    // 백업에서 복원된 경우, 저장된 currentStep 사용
    // 새로 선택한 경우, 답변 수로 계산하지 않고 0부터 시작
  }
  
  state.currentStep = baseSteps + state.survey.currentStep;
  saveAndGoTo('survey-screen');
  initializeSurvey();
  renderQuestion();
  updateProgressBar();
}

// 👈 새로 추가: 서비스 변경 전용 토스트 알림 시스템
function showServiceChangeToast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  const icons = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  };
  
  const colors = {
    success: '#10b981',
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444'
  };
  
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div class="toast-content" style="border-left-color: ${colors[type]}">
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // 3초 후 자동 제거
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-fadeout');
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }
  }, 3000);
}

function setupSurveyEvents(): void {
  const surveyNextBtn = el('surveyNextBtn');
  const surveyPrevBtn = el('surveyPrevBtn');
  
  if (surveyNextBtn) surveyNextBtn.onclick = saveAnswerAndProceed;
  if (surveyPrevBtn) surveyPrevBtn.onclick = goBackInSurvey;
}

function setupCompletionEvents(): void {
  const buttons = [
    { id: 'restartBtn', handler: restartApp },
    { id: 'submitBtn', handler: handleSubmit },
    { id: 'restart-from-success-btn', handler: restartApp },
    { id: 'purchase-plan-btn', handler: handlePurchasePlan } // 👈 구매 버튼 추가
  ];
  
  buttons.forEach(({ id, handler }) => {
    const btn = el(id);
    if (btn) {
      btn.removeEventListener('click', handler);
      btn.addEventListener('click', handler);
    }
  });
}

// ==================== 메인 마운트 함수 ====================
export function mountSurvey(isMobile: boolean): void {
  console.log('🎯 mountSurvey 호출됨 - isMobile:', isMobile);
  
  // 👈 새로 추가: 즉시 모바일 상태 강제 설정
  const actualIsMobile = detectMobileImmediate();
  state.isMobile = actualIsMobile;
  
  // 모바일 감지 로그
  console.log(`📱 모바일 감지 결과: ${actualIsMobile ? 'MOBILE' : 'DESKTOP'}`);
  console.log(`📏 화면 크기: ${window.innerWidth}x${window.innerHeight}`);
  
  // 즉시 CSS 클래스 적용
  document.body.classList.toggle('mobile-mode', actualIsMobile);
  document.body.classList.toggle('desktop-mode', !actualIsMobile);
  
  // 👈 기존 코드는 그대로 유지
  // 이미 초기화되었다면 모바일 상태만 업데이트
  if (isInitialized) {
    console.log('📱 모바일 상태 업데이트만 진행');
    if (state.isMobile !== isMobile) {
      state.isMobile = isMobile;
      if (state.currentScreenId === 'survey-screen') {
        renderQuestion();
      }
    }
    return;
  }
  
  state.isMobile = isMobile;
  
  // 백업 데이터 확인 및 복원 제안
  if (hasLocalStorageBackup()) {
    console.log('💾 백업 데이터 발견 - 복원 다이얼로그 표시');
    showBackupRestoreDialog();
  } else {
    console.log('🆕 새로운 설문 시작 - 초기화 진행');
    initialize();
  }
}

function detectMobileImmediate(): boolean {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;
  
  // 1. 화면 크기 기준 (가장 확실한 방법)
  if (width <= 768) {
    console.log(`✅ 모바일 감지: 화면폭 ${width}px <= 768px`);
    return true;
  }
  
  // 2. iframe 크기 기준 (Wix 삽입시)
  if (width <= 350 && height >= 800) {
    console.log(`✅ 모바일 감지: iframe 크기 ${width}x${height}`);
    return true;
  }
  
  // 3. User Agent 기준
  const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'iPod'];
  if (mobileKeywords.some(keyword => userAgent.includes(keyword))) {
    console.log(`✅ 모바일 감지: User Agent contains mobile keywords`);
    return true;
  }
  
  // 4. 터치 지원 + 작은 화면
  if ('ontouchstart' in window && width <= 1024) {
    console.log(`✅ 모바일 감지: 터치 지원 + 화면폭 ${width}px`);
    return true;
  }
  
  console.log(`🖥️ 데스크톱 감지: 화면폭 ${width}px > 768px`);
  return false;
}

// 👈 기존 handleResize 함수 찾아서 교체 (없다면 추가)
function handleResize(): void {
  const wasMobile = state.isMobile;
  const nowMobile = detectMobileImmediate();
  
  if (wasMobile !== nowMobile) {
    console.log(`📱 모바일 상태 변경: ${wasMobile} → ${nowMobile}`);
    
    state.isMobile = nowMobile;
    
    // CSS 클래스 즉시 적용
    document.body.classList.toggle('mobile-mode', nowMobile);
    document.body.classList.toggle('desktop-mode', !nowMobile);
    
    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('mobileStateChange', { 
      detail: { isMobile: nowMobile } 
    }));
    
    // 현재 화면 다시 렌더링
    if (state.currentScreenId === 'survey-screen') {
      renderQuestion();
    }
  }
  
  updateProgressBar();
}