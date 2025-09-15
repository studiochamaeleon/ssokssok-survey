import { useEffect } from "react";
import "./index.css";
import { mountSurvey } from "./surveyLogic";

export default function App() {
  useEffect(() => {
    mountSurvey(); // 화면이 그려진 뒤 DOM 이벤트/로직 연결
  }, []);

  return (
    <main className="relative w-full h-screen bg-pattern">
      {/* Toast Notification */}
      <div
        id="toast"
        className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-semibold opacity-0 transform -translate-y-10 transition-all duration-300 ease-out z-[100]"
      >
        <p id="toast-message"></p>
      </div>

      {/* 진행 단계 표시 */}
      <div
        id="progressBarContainer"
        className="fixed top-0 left-0 right-0 z-50 progress-bar-container hidden"
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
      <div
        id="intro-screen"
        className="screen fixed inset-0 flex justify-center z-40 pt-20"
      >
        <div className="text-center px-6">
          <div className="icon-large">👋</div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8 typing">
            안녕하세요!
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-md mx-auto">
            브랜드 사운드 제작의 새로운 경험을 시작해보세요
          </p>
          <button
            id="introNextBtn"
            className="btn-primary px-10 py-4 text-lg font-semibold rounded-2xl opacity-0"
            style={{ animation: "fadeIn 0.8s 3.5s ease-out forwards" }}
          >
            시작하기 →
          </button>
        </div>
      </div>

      {/* 브랜드 소개 화면 */}
      <div
        id="brand-intro-screen"
        className="screen fixed inset-0 flex justify-center z-30 hidden pt-20"
      >
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="card rounded-3xl p-12 text-center">
            <div className="icon-large">🎵</div>
            <h2 className="text-6xl font-bold mb-6 text-gradient">쏙쏙</h2>
            <p className="text-2xl text-gray-700 mb-4 font-medium">
              브랜드의 목소리를 만드는 전문가
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
              브랜드송부터 나레이션까지, 당신의 브랜드를 더욱 특별하게 만들어 줄
              <br />
              프리미엄 사운드 콘텐츠를 제작해드립니다.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                id="brandIntroPrevBtn"
                className="bg-gray-100 text-gray-700 px-8 py-4 text-lg font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 flex-shrink-0"
              >
                ← 이전
              </button>
              <button
                id="brandIntroNextBtn"
                className="btn-primary px-10 py-4 text-lg font-semibold rounded-2xl"
              >
                설문 시작하기 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 매장명 입력 화면 */}
      <div
        id="store-name-screen"
        className="screen fixed inset-0 flex justify-center z-20 hidden pt-20"
      >
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="card rounded-3xl p-10">
            <div className="text-center mb-10">
              <div className="icon-medium">🏪</div>
              <h3 className="text-3xl font-bold mb-4 text-gradient">
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
                  브랜드/매장명
                </label>
                <input
                  type="text"
                  id="storeName"
                  placeholder="예: 카페 모카"
                  className="input-field w-full px-6 py-4 text-lg rounded-2xl"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  id="storeNamePrevBtn"
                  className="bg-gray-100 text-gray-700 px-8 py-4 text-lg font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 flex-shrink-0"
                >
                  ← 이전
                </button>
                <button
                  id="nextToServices"
                  className="btn-primary flex-1 py-4 text-lg font-semibold rounded-2xl"
                  disabled
                >
                  다음 단계로 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 서비스 선택 화면 */}
      <div
        id="service-selection-screen"
        className="screen fixed inset-0 flex items-start justify-center z-10 hidden pt-20 overflow-y-auto"
      >
        <div className="container mx-auto px-6 max-w-6xl py-12">
          <div className="card rounded-3xl p-10">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4 text-gradient">
                어떤 음원을 제작하고 싶으세요?
              </h3>
              <p className="text-gray-600 text-xl mb-6" id="brandNameDisplay"></p>
              <button
                id="serviceSelectionPrevBtn"
                className="bg-gray-100 text-gray-700 px-6 py-3 text-base font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                ← 이전 단계로
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-8" id="service-cards-container">
              <div className="service-card rounded-3xl p-8" data-service="브랜드송">
                <div className="text-center">
                  <div className="icon-medium">🎵</div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">브랜드송</h4>
                  <p className="text-gray-600 text-lg mb-4">
                    브랜드를 기억하게 하는 멜로디
                  </p>
                </div>
              </div>
              <div className="service-card rounded-3xl p-8" data-service="나레이션">
                <div className="text-center">
                  <div className="icon-medium">🎙️</div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">나레이션</h4>
                  <p className="text-gray-600 text-lg mb-4">
                    브랜드 스토리를 전하는 목소리
                  </p>
                </div>
              </div>
              <div
                className="service-card rounded-3xl p-8"
                data-service="브랜드송+나레이션"
              >
                <div className="text-center">
                  <div className="icon-medium">🎼</div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">
                    브랜드송 + 나레이션
                  </h4>
                  <p className="text-gray-600 text-lg mb-4">
                    완벽한 브랜드 사운드 패키지
                  </p>
                </div>
              </div>
              <div className="service-card rounded-3xl p-8" data-service="플레이리스트">
                <div className="text-center">
                  <div className="icon-medium">📱</div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">플레이리스트</h4>
                  <p className="text-gray-600 text-lg mb-4">
                    브랜드 분위기에 맞는 음악 모음
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 업종 선택 화면 */}
      <div
        id="industry-selection-screen"
        className="screen fixed inset-0 flex items-start justify-center z-10 hidden pt-20 overflow-y-auto"
      >
        <div className="container mx-auto px-6 max-w-6xl py-12">
          <div className="card rounded-3xl p-10">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4 text-gradient">
                어떤 업종에 해당하시나요?
              </h3>
              <p
                className="text-gray-600 text-xl mb-6"
                id="industryBrandNameDisplay"
              ></p>
              <button
                id="industrySelectionPrevBtn"
                className="bg-gray-100 text-gray-700 px-6 py-3 text-base font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                ← 이전 단계로
              </button>
            </div>
            <div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              id="industry-cards-container"
            >
              <div className="service-card rounded-3xl p-8" data-industry="카페">
                <div className="text-center">
                  <div className="icon-medium">☕</div>
                  <h4 className="text-2xl font-bold text-gray-800">카페</h4>
                </div>
              </div>
              <div className="service-card rounded-3xl p-8" data-industry="병원/클리닉">
                <div className="text-center">
                  <div className="icon-medium">🏥</div>
                  <h4 className="text-2xl font-bold text-gray-800">병원/클리닉</h4>
                </div>
              </div>
              <div className="service-card rounded-3xl p-8" data-industry="음식점">
                <div className="text-center">
                  <div className="icon-medium">🍽️</div>
                  <h4 className="text-2xl font-bold text-gray-800">음식점</h4>
                </div>
              </div>
              <div className="service-card rounded-3xl p-8" data-industry="레저">
                <div className="text-center">
                  <div className="icon-medium">🎯</div>
                  <h4 className="text-2xl font-bold text-gray-800">레저</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 설문 화면 */}
      <div
        id="survey-screen"
        className="screen fixed inset-0 flex items-start justify-center z-10 hidden pt-20 overflow-y-auto"
      >
        <div className="container mx-auto px-6 max-w-4xl py-12">
          <div className="card rounded-3xl p-10">
            <div id="question-container">
              <div className="text-center mb-8">
                <h2
                  id="question-section"
                  className="text-xl font-semibold text-gray-500 mb-6 hidden"
                  style={{ animation: "fadeIn 0.5s" }}
                />
                <h3
                  id="question-title"
                  className="text-3xl font-bold mb-4 text-gradient question-title"
                />
                <p id="question-text" className="text-gray-600 text-lg" />
                <p id="question-example" className="text-gray-500 text-sm mt-2" />
              </div>
              <div id="answer-container" className="grid gap-3 options-grid" />
            </div>
            <div className="flex space-x-4 mt-8">
              <button
                id="surveyPrevBtn"
                className="bg-gray-100 text-gray-700 px-8 py-4 text-lg font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 flex-shrink-0"
              >
                ← 이전
              </button>
              <button
                id="surveyNextBtn"
                className="btn-primary flex-1 py-4 text-lg font-semibold rounded-2xl"
              >
                다음 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 완료 화면 */}
      <div
        id="completion-screen"
        className="screen fixed inset-0 flex justify-center z-10 hidden pt-20"
      >
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="card rounded-3xl p-12 text-center">
            <div className="icon-large">🎉</div>
            <h2 className="text-4xl font-bold mb-6 text-gradient">
              설문이 완료되었습니다!
            </h2>
            <p
              className="text-gray-600 text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
              id="completion-message"
            />
            <div id="summary-container-wrapper" className="hidden">
              <h3 className="font-bold text-xl mb-4 text-gray-700">제출된 답변 요약</h3>
              <div
                id="summary-container"
                className="text-left bg-gray-50 p-6 rounded-2xl max-h-60 overflow-y-auto mb-10 border"
              />
            </div>
            <button
              id="restartBtn"
              className="btn-primary px-10 py-4 text-lg font-semibold rounded-2xl"
            >
              처음으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}