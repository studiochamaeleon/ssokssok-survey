// src/wixCommunicator.ts - 완전 수정된 버전
export class WixCommunicator {
  private isWixCustomElement: boolean = false;
  private lastHeight: number = 0;
  private heightUpdateTimeout: number | null = null;
  
  constructor() {
    this.detectEnvironment();
    this.setupCommunication();
  }
  
  /**
   * Custom Element 환경인지 감지
   */
  private detectEnvironment(): void {
    try {
      // Custom Element에서는 parent와 통신 가능
      if (window.parent !== window && window.parent.postMessage) {
        this.isWixCustomElement = true;
        console.log('🎯 Wix Custom Element 환경 감지됨');
        
        // 환경 확인 메시지 전송
        this.postMessageToWix({
          type: 'environment',
          message: 'Custom Element 연결 성공',
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        });
      } else {
        console.log('🖥️ 일반 브라우저 환경');
      }
    } catch (error) {
      console.log('📱 독립 실행 환경');
      this.isWixCustomElement = false;
    }
  }
  
  /**
   * 높이 통신 시스템 설정
   */
  private setupCommunication(): void {
    if (!this.isWixCustomElement) return;
    
    console.log('🔄 Custom Element 통신 시스템 초기화...');
    
    // 1. 페이지 로드 완료 시 초기 높이 전송
    if (document.readyState === 'complete') {
      setTimeout(() => this.sendHeight(), 500);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.sendHeight(), 500);
      });
    }
    
    // 2. ResizeObserver로 실시간 크기 변화 감지
    this.setupResizeObserver();
    
    // 3. DOM 변화 감지
    this.setupMutationObserver();
    
    // 4. 윈도우 리사이즈 감지
    window.addEventListener('resize', () => {
      this.debouncedSendHeight();
    });
    
    // 5. 키보드 이벤트 감지
    this.setupKeyboardEvents();
  }
  
  /**
   * ResizeObserver 설정
   */
  private setupResizeObserver(): void {
    if (!window.ResizeObserver) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      console.log('📏 ResizeObserver 감지됨');
      this.debouncedSendHeight();
    });
    
    // body와 main 요소 관찰
    resizeObserver.observe(document.body);
    if (document.documentElement) {
      resizeObserver.observe(document.documentElement);
    }
    
    // 메인 컨테이너 관찰
    const observer = new MutationObserver(() => {
      const container = document.querySelector('.container');
      if (container) {
        resizeObserver.observe(container);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  /**
   * DOM 변화 감지
   */
  private setupMutationObserver(): void {
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || 
            mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || 
             mutation.attributeName === 'class')) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        console.log('🔄 DOM 변화 감지됨');
        this.debouncedSendHeight();
      }
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
  
  /**
   * 키보드 이벤트 설정
   */
  private setupKeyboardEvents(): void {
    let initialHeight = window.innerHeight;
    
    const handleKeyboard = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialHeight - currentHeight;
      
      if (heightDiff > 150) {
        console.log(`⌨️ 키보드 활성화 (높이 차이: ${heightDiff}px)`);
        document.body.classList.add('keyboard-visible');
      } else {
        console.log(`📱 키보드 비활성화 (높이 차이: ${heightDiff}px)`);
        document.body.classList.remove('keyboard-visible');
      }
      
      this.debouncedSendHeight();
    };
    
    window.addEventListener('resize', handleKeyboard);
    
    // 입력 필드 포커스 이벤트
    document.addEventListener('focusin', (e) => {
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        setTimeout(() => this.sendHeight(), 300);
      }
    });
    
    document.addEventListener('focusout', () => {
      setTimeout(() => this.sendHeight(), 300);
    });
  }
  
  /**
   * 디바운싱된 높이 전송
   */
  private debouncedSendHeight(): void {
    if (this.heightUpdateTimeout) {
      clearTimeout(this.heightUpdateTimeout);
    }
    
    this.heightUpdateTimeout = window.setTimeout(() => {
      this.sendHeight();
    }, 100);
  }
  
  /**
   * 정확한 높이 계산 및 전송
   */
  public sendHeight(): void {
    if (!this.isWixCustomElement) return;
    
    try {
      // 여러 방법으로 높이 계산
      const bodyHeight = document.body.scrollHeight;
      const bodyOffsetHeight = document.body.offsetHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      
      // 가장 정확한 높이 선택
      const calculatedHeight = Math.max(
        bodyHeight,
        bodyOffsetHeight,
        documentHeight,
        windowHeight
      );
      
      // 최소/최대 높이 제한
      const minHeight = 400;
      const maxHeight = 2000;
      const finalHeight = Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
      
      // 이전 높이와 차이가 클 때만 전송 (성능 최적화)
      if (Math.abs(finalHeight - this.lastHeight) > 5) {
        this.postMessageToWix({
          type: 'resize',
          height: finalHeight,
          details: {
            bodyHeight,
            bodyOffsetHeight,
            documentHeight,
            windowHeight,
            finalHeight
          },
          timestamp: Date.now()
        });
        
        console.log(`📏 높이 전송: ${this.lastHeight}px → ${finalHeight}px`);
        this.lastHeight = finalHeight;
      }
    } catch (error) {
      console.error('❌ 높이 계산 실패:', error);
    }
  }
  
  /**
   * 설문 진행 상태 전송
   */
  public sendProgress(currentStep: number, totalSteps: number, screenId: string): void {
    if (!this.isWixCustomElement) return;
    
    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    
    this.postMessageToWix({
      type: 'progress',
      currentStep,
      totalSteps,
      progressPercent,
      screenId,
      timestamp: Date.now()
    });
    
    console.log(`📊 진행률 전송: ${progressPercent}% (${currentStep}/${totalSteps})`);
  }
  
  /**
   * 설문 완료 상태 전송
   */
  public sendCompletion(surveyData: any): void {
    if (!this.isWixCustomElement) return;
    
    this.postMessageToWix({
      type: 'completed',
      surveyData,
      completedAt: new Date().toISOString(),
      timestamp: Date.now()
    });
    
    console.log('✅ 설문 완료 상태 전송');
  }
  
  /**
   * 화면 전환 알림
   */
  public sendScreenChange(fromScreen: string, toScreen: string): void {
    if (!this.isWixCustomElement) return;
    
    this.postMessageToWix({
      type: 'screenChange',
      fromScreen,
      toScreen,
      timestamp: Date.now()
    });
    
    console.log(`🔄 화면 전환: ${fromScreen} → ${toScreen}`);
    
    // 화면 전환 후 높이 재계산
    setTimeout(() => this.sendHeight(), 200);
  }
  
  /**
   * Wix로 메시지 전송 (핵심 메서드)
   */
  private postMessageToWix(data: any): void {
    if (!this.isWixCustomElement) return;
    
    try {
      // 1. 기본 postMessage 방식
      window.parent.postMessage(data, '*');
      
      // 2. Wix Custom Element API 다중 접근 시도
      if (typeof window !== 'undefined') {
        // customElement1 직접 참조 시도
        const customElement1 = (window.parent as any).customElement1;
        if (customElement1 && typeof customElement1.postMessage === 'function') {
          customElement1.postMessage(data);
          console.log('📨 customElement1 API를 통한 메시지 전송');
        }
        
        // Wix API 객체 참조 시도
        const wixAPI = (window as any).wixCustomElement || 
                      (window as any).Wix || 
                      (window.parent as any).wixCustomElement;
        
        if (wixAPI && typeof wixAPI.postMessage === 'function') {
          wixAPI.postMessage(data);
          console.log('📨 Wix API를 통한 메시지 전송');
        }
      }
      
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
    }
  }
  
  /**
   * 공개 메시지 전송 메서드 (외부에서 호출 가능)
   */
  public sendMessage(data: any): void {
    this.postMessageToWix(data);
  }
  
  /**
   * 강제 높이 업데이트 (외부에서 호출 가능)
   */
  public forceHeightUpdate(): void {
    console.log('🔄 강제 높이 업데이트 실행');
    setTimeout(() => this.sendHeight(), 100);
  }
  
  /**
   * Custom Element 연결 상태 확인
   */
  public isConnected(): boolean {
    return this.isWixCustomElement;
  }
}

// 전역 인스턴스 생성
export const wixCommunicator = new WixCommunicator();

// 디버깅을 위해 window에 노출
if (typeof window !== 'undefined') {
  (window as any).wixCommunicator = wixCommunicator;
}