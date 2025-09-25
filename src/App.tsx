import { useEffect, useRef, useState } from "react"; // 👈 useState 추가!
import "./index.css";
import { mountSurvey } from "./surveyLogic";
// import { useMediaQuery } from "./hooks/useMediaQuery"; // 👈 더 이상 사용하지 않으므로 제거

export default function App() {
  // 👈 즉시 모바일 상태 감지로 변경
  const [isMobile, setIsMobile] = useState(() => {
    // 초기값을 즉시 계산
    const width = window.innerWidth;
    const isIframe = window !== window.parent;
    
    // Wix iframe 환경에서 모바일 감지
    if (isIframe && width <= 350) {
      console.log(`📱 즉시 모바일 감지: iframe ${width}px`);
      return true;
    }
    
    // 일반적인 모바일 감지
    if (width <= 768) {
      console.log(`📱 즉시 모바일 감지: 화면폭 ${width}px`);
      return true;
    }
    
    console.log(`🖥️ 즉시 데스크톱 감지: 화면폭 ${width}px`);
    return false;
  });

  const mountedRef = useRef(false);
  const currentMobileRef = useRef(isMobile);

  useEffect(() => {
    // 👈 DOM 준비되면 즉시 모바일 상태 적용
    document.body.classList.toggle('mobile-mode', isMobile);
    document.body.classList.toggle('desktop-mode', !isMobile);
    
    // 처음 마운트시에만 전체 초기화
    if (!mountedRef.current) {
      mountSurvey(isMobile);
      mountedRef.current = true;
      currentMobileRef.current = isMobile;
    } 
    // 모바일/데스크톱 전환시에만 화면 크기 업데이트
    else if (currentMobileRef.current !== isMobile) {
      // 백업 다이얼로그 재생성 방지 - 화면 크기만 업데이트
      updateMobileState(isMobile);
      currentMobileRef.current = isMobile;
    }
  }, [isMobile]);

  // 👈 즉시 클래스 적용 (중복이지만 확실하게)
  useEffect(() => {
    document.body.classList.toggle('mobile-mode', isMobile);
    document.body.classList.toggle('desktop-mode', !isMobile);
  }, [isMobile]);

  // 👈 resize 이벤트 리스너 추가
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width <= 768;
      
      if (newIsMobile !== isMobile) {
        console.log(`📱 화면 크기 변경: ${width}px → ${newIsMobile ? 'MOBILE' : 'DESKTOP'}`);
        setIsMobile(newIsMobile);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // 👈 나머지 코드는 그대로 유지
  const updateMobileState = (mobile: boolean) => {
    const event = new CustomEvent('mobileStateChange', { detail: { isMobile: mobile } });
    window.dispatchEvent(event);
  };

  const getButtonText = (mobileText: string, desktopText: string) => 
    isMobile ? mobileText : desktopText;

  return (
    // 나머지 JSX 코드는 그대로...
    <main className={`relative w-full h-screen bg-pattern ${isMobile ? 'mobile-mode' : 'desktop-mode'}`}>
      {/* Toast Notification */}
      <div
        id="toast"
        className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-semibold opacity-0 transform -translate-y-10 transition-all duration-300 ease-out z-[100]"
        role="alert"
        aria-live="polite"
      >
        <p id="toast-message"></p>
      </div>

      {/* 진행 단계 표시 */}
      <div
        id="progressBarContainer"
        className="fixed top-0 left-0 right-0 z-50 progress-bar-container hidden"
        role="progressbar"
        aria-label="설문 진행률"
      >
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              id="progressBar"
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      </div>

      {/* 인트로 화면 */}
      <section
        id="intro-screen"
        className="screen fixed inset-0 flex justify-center z-40 pt-20"
        aria-labelledby="intro-title"
      >
        <div className="text-center px-6">
          <div className="icon-large" role="img" aria-label="안녕하세요">👋</div>
          <h1 id="intro-title" className="text-5xl md:text-7xl font-bold text-gray-800 mb-8 typing">
            안녕하세요!
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-md mx-auto">
            브랜드 사운드 제작의 새로운 경험을 시작해보세요
          </p>
          <button
            id="introNextBtn"
            className="btn-primary px-10 py-4 text-lg font-semibold rounded-2xl animate-fade-in"
            style={{ animationDelay: '1s', animationFillMode: 'both' }}
            aria-label="설문 시작하기"
          >
            {getButtonText("시작 →", "시작하기 →")}
          </button>
        </div>
      </section>

      {/* 브랜드 소개 화면 */}
      <section
        id="brand-intro-screen"
        className="screen fixed inset-0 flex justify-center z-30 hidden pt-20"
        aria-labelledby="brand-intro-title"
      >
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="card rounded-3xl p-12 text-center">
            <div className="icon-large" role="img" aria-label="음악">🎵</div>
            <h2 id="brand-intro-title" className="text-6xl font-bold mb-6 text-gradient">쏙쏙</h2>
            <p className="text-2xl text-gray-700 mb-4 font-medium">
              브랜드의 목소리를 만드는 전문가
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
              브랜드송부터 나레이션까지, 당신의 브랜드를 더욱 특별하게 만들어 줄
              <br />
              프리미엄 사운드 콘텐츠를 제작해드립니다.
            </p>
            <div className="flex justify-center space-x-4 button-group">
              <button
                id="brandIntroPrevBtn"
                className="bg-gray-100 text-gray-700 px-8 py-4 text-lg font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 flex-shrink-0"
                aria-label="이전 단계로"
              >
                {getButtonText("←", "← 이전")}
              </button>
              <button
                id="brandIntroNextBtn"
                className="btn-primary px-10 py-4 text-lg font-semibold rounded-2xl"
                aria-label="설문 시작하기"
              >
                {getButtonText("→", "설문 시작하기 →")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 매장명 입력 화면 */}
      <section
        id="store-name-screen"
        className="screen fixed inset-0 flex justify-center z-20 hidden pt-20"
        aria-labelledby="store-name-title"
      >
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="card rounded-3xl p-10">
            <div className="text-center mb-10">
              <div className="icon-medium" role="img" aria-label="매장">🏪</div>
              <h3 id="store-name-title" className="text-3xl font-bold mb-4 text-gradient">
                브랜드 정보를 입력해주세요
              </h3>
              <p className="text-gray-600 text-lg">
                맞춤형 사운드 제작을 위해 브랜드명이 필요해요
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="storeName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  브랜드/매장명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="storeName"
                  placeholder="예: 카페 모카"
                  className="input-field w-full px-6 py-4 text-lg rounded-2xl"
                  required
                  aria-describedby="storeName-help"
                />
                <p id="storeName-help" className="sr-only">
                  브랜드 또는 매장명을 입력해주세요
                </p>
              </div>
              <NavigationButtons
                prevId="storeNamePrevBtn"
                nextId="nextToServices"
                nextDisabled={true}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 업종 입력 화면 */}
      <section
        id="industry-input-screen"
        className="screen fixed inset-0 flex justify-center z-20 hidden pt-20"
        aria-labelledby="industry-title"
      >
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="card rounded-3xl p-10">
            <div className="text-center mb-10">
              <div className="icon-medium" role="img" aria-label="업종">🏢</div>
              <h3 id="industry-title" className="text-3xl font-bold mb-4 text-gradient">
                업종을 입력해주세요
              </h3>
              <p className="text-gray-600 text-lg">
                맞춤형 설문을 위해 업종 정보가 필요해요
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="industryInput"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  업종 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="industryInput"
                  placeholder="예: 카페, 음식점, 병원, 레저시설 등"
                  className="input-field w-full px-6 py-4 text-lg rounded-2xl"
                  required
                  aria-describedby="industry-help"
                />
                <p id="industry-help" className="sr-only">
                  업종을 입력해주세요
                </p>
              </div>
              <NavigationButtons
                prevId="industryInputPrevBtn"
                nextId="industryInputNextBtn"
                nextDisabled={true}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 연락처 입력 화면 */}
      <section
        id="contact-info-screen"
        className="screen fixed inset-0 flex justify-center z-20 hidden pt-20"
        aria-labelledby="contact-title"
      >
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="card rounded-3xl p-10">
            <div className="text-center mb-10">
              <div className="icon-medium" role="img" aria-label="이메일">📧</div>
              <h3 id="contact-title" className="text-3xl font-bold mb-4 text-gradient">
                연락처 정보를 입력해주세요
              </h3>
              <p className="text-gray-600 text-lg">
                설문이 마치면 확인 후 연락드릴 예정입니다.
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  placeholder="예: sssg@ssokssok.com"
                  className="input-field w-full px-6 py-4 text-lg rounded-2xl"
                  autoCapitalize="off"
                  autoCorrect="off"
                  required
                  aria-describedby="email-help"
                />
                <p id="email-help" className="sr-only">
                  연락받을 이메일 주소를 입력해주세요
                </p>
              </div>
              <NavigationButtons
                prevId="contactInfoPrevBtn"
                nextId="contactInfoNextBtn"
                nextDisabled={true}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 선택 화면 */}
      <section
        id="service-selection-screen"
        className="screen fixed inset-0 flex items-start justify-center z-10 hidden pt-20 overflow-y-auto"
        aria-labelledby="service-selection-title"
      >
        <div className="container mx-auto px-6 max-w-6xl py-12">
          <div className="card rounded-3xl p-10">
            <div className="text-center mb-12">
              <h3 id="service-selection-title" className="text-4xl font-bold mb-4 text-gradient">
                어떤 음원을 제작하고 싶으세요?
              </h3>
              <p className="text-gray-600 text-xl mb-6" id="brandNameDisplay" aria-live="polite"></p>
              <button
                id="serviceSelectionPrevBtn"
                className="bg-gray-100 text-gray-700 px-6 py-3 text-base font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
                aria-label="이전 단계로"
              >
                {getButtonText("← 이전", "← 이전 단계로")}
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-8" id="service-cards-container" role="group" aria-labelledby="service-selection-title">
              <ServiceCard
                service="브랜드송"
                icon="🎵"
                title="브랜드송"
                description="브랜드를 기억하게 하는 멜로디"
              />
              <ServiceCard
                service="나레이션"
                icon="🎙️"
                title="나레이션"
                description="브랜드 스토리를 전하는 목소리"
              />
              <ServiceCard
                service="브랜드송+나레이션"
                icon="🎼"
                title="브랜드송 + 나레이션"
                description="완벽한 브랜드 사운드 패키지"
                className="md:col-span-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 설문 화면 */}
      <section
        id="survey-screen"
        className="screen fixed inset-0 flex items-start justify-center z-10 hidden pt-20 overflow-y-auto"
        aria-labelledby="survey-title"
      >
        <div className="container mx-auto px-6 max-w-4xl py-12">
          <div className="card rounded-3xl p-10">
            <div id="question-container">
              <div className="text-center mb-8">
                <h2
                  id="question-section"
                  className="text-xl font-semibold text-gray-500 mb-6 hidden animate-fade-in"
                />
                <h3
                  id="question-title"
                  className="text-3xl font-bold mb-4 text-gradient question-title"
                />
                <p id="question-text" className="text-gray-600 text-lg" />
                <p id="question-example" className="text-gray-500 text-sm mt-2" />
              </div>
              <div 
                id="answer-container" 
                className="grid gap-3 options-grid"
                role="group"
                aria-labelledby="question-title"
              />
            </div>
            <NavigationButtons
              prevId="surveyPrevBtn"
              nextId="surveyNextBtn"
              isMobile={isMobile}
            />
          </div>
        </div>
      </section>


      {/* 완료 화면 - 체크마크 애니메이션 + 스크롤 가능 */}
      <section
        id="completion-screen"
        className="screen fixed inset-0 flex items-start justify-center z-10 hidden pt-20 overflow-y-auto"
        aria-labelledby="completion-title"
      >
        <div className="container mx-auto px-6 max-w-4xl py-12 min-h-screen flex flex-col justify-start">
          {/* 체크마크 애니메이션 섹션 */}
          <div className="completion-animation-container text-center mb-12 flex-shrink-0">
            <div className="checkmark-container mx-auto mb-6">
              <div className="checkmark"></div>
            </div>
            <h1 id="completion-title" className="completion-text text-4xl font-bold mb-8">
              설문 완료!
            </h1>
            <p id="completion-message" className="completion-subtitle text-xl text-gray-600 mb-12">
              소중한 답변 감사드립니다. 답변 내용을 검토하시고 필요시 수정하실 수 있습니다.
            </p>
          </div>

          {/* 답변 요약 섹션 - 애니메이션 후 표시 + 스크롤 가능 */}
          <div className="completion-summary-wrapper opacity-0 flex-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">📋 답변 요약</h2>
              <div id="completion-summary" className="space-y-6" role="region" aria-label="답변 요약">
                {/* 답변 요약이 여기에 동적으로 삽입됩니다 */}
              </div>
            </div>

            {/* 액션 버튼 - 하단 고정 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg mb-6">
              <button 
                id="restartBtn" 
                className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                aria-label="처음부터 다시 시작"
              >
                🔄 처음부터 다시 시작
              </button>
              <button 
                id="submitBtn" 
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                aria-label="설문 제출하기"
              >
                📤 제출하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 제출 완료 화면 - 새로운 체크마크 애니메이션 */}
      <section
        id="submit-success-screen"
        className="screen fixed inset-0 flex justify-center items-center z-10 hidden"
        aria-labelledby="success-title"
      >
        <div className="container mx-auto px-6 max-w-2xl">
          {/* 체크마크 애니메이션 섹션 */}
          <div className="completion-animation-container text-center mb-12">
            <div className="checkmark-container mx-auto mb-6">
              <div className="checkmark"></div>  
            </div>
            <h1 id="success-title" className="completion-text text-4xl font-bold mb-8">
              제출 완료!
            </h1>
            
            <div id="submit-success-message" className="completion-subtitle space-y-4 mb-8">
              <p className="text-xl text-gray-700 font-medium">
                <span id="brand-name-display" aria-live="polite"></span>님의 소중한 답변을 받았습니다.
              </p>
              <p className="text-lg text-gray-600">
                전문 상담사가 24시간 내로 연락드릴 예정입니다.
              </p>
              <p className="text-base text-gray-500">
                더 자세한 상담을 원하시면 언제든 문의해 주세요! 🎵
              </p>
            </div>
          </div>

          {/* 액션 버튼들 - 애니메이션 후 표시 */}
          <div className="completion-summary-wrapper opacity-0 flex flex-col gap-4 justify-center">
            {/* 구매 버튼 */}
            <button 
              id="purchase-plan-btn" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
              aria-label="선택한 플랜 구매하기"
            >
              🎵 <span id="selected-service-name"></span> 플랜 구매
            </button>
            
            {/* 새로운 설문 시작 버튼 */}
            <button 
              id="restart-from-success-btn" 
              className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              aria-label="새로운 설문 시작하기"
            >
              🔄 새로운 설문 시작하기
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

// 네비게이션 버튼 컴포넌트
interface NavigationButtonsProps {
  prevId: string;
  nextId: string;
  nextDisabled?: boolean;
  isMobile: boolean;
}

function NavigationButtons({ prevId, nextId, nextDisabled = false, isMobile }: NavigationButtonsProps) {
  return (
    <div className="flex space-x-4 button-group">
      <button
        id={prevId}
        className="bg-gray-100 text-gray-700 px-8 py-4 text-lg font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 flex-shrink-0"
        aria-label="이전 단계로"
      >
        {isMobile ? "←" : "← 이전"}
      </button>
      <button
        id={nextId}
        className="btn-primary flex-1 py-4 text-lg font-semibold rounded-2xl"
        disabled={nextDisabled}
        aria-label="다음 단계로"
      >
        {isMobile ? "다음 →" : "다음 단계로 →"}
      </button>
    </div>
  );
}

// 서비스 카드 컴포넌트
interface ServiceCardProps {
  service: string;
  icon: string;
  title: string;
  description: string;
  className?: string;
}

function ServiceCard({ service, icon, title, description, className = "" }: ServiceCardProps) {
  return (
    <div 
      className={`service-card rounded-3xl p-8 ${className}`} 
      data-service={service}
      role="button"
      tabIndex={0}
      aria-label={`${title} 선택`}
    >
      <div className="text-center">
        <div className="icon-medium" role="img" aria-label={title}>{icon}</div>
        <h4 className="text-2xl font-bold text-gray-800 mb-4">{title}</h4>
        <p className="text-gray-600 text-lg mb-4">{description}</p>
      </div>
    </div>
  );
}