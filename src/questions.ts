export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'priority';

export interface Question {
  id: string;
  section?: string;
  title: string;
  question: string;
  mobileQuestion?: string; // 모바일용 짧은 질문 속성 추가
  type: QuestionType;
  options?: string[];
  example?: string;
  hasNotApplicable?: boolean; // [추가] 해당없음 옵션 여부
}

/** ===== 브랜드송 공통 질문 ===== */
export const brandSongQuestions: Question[] = [
  { 
    id: 'q1', section: '📝 1단계: 브랜드의 시작', 
    title: 'Q1. 브랜드 탄생 이유', 
    question: '우리 브랜드는 『_________________________________』 때문에 시작하게 되었습니다.', 
    mobileQuestion: '우리 브랜드는 『___________』 때문에 시작했습니다.', 
    example: '(예시: 고객들이 진짜 원하는 서비스가 없어서)', 
    type: 'text' 
  },
  { 
    id: 'q2', section: '📝 1단계: 브랜드의 시작', 
    title: 'Q2. 고객의 아쉬움 발견', 
    question: '우리 고객들이 기존 경쟁업체에서 가장 아쉬워하는 점은『_________________________________』라고 생각합니다.', 
    mobileQuestion: '고객들이 경쟁사에서 아쉬워하는 점은 『___________』입니다.', 
    example: '(예시: 품질은 좋은데 너무 비싸거나, 저렴한데 품질이 떨어지거나)', 
    type: 'text' 
  },
  { 
    id: 'q3', section: '📝 1단계: 브랜드의 시작', 
    title: 'Q3. 우리만의 해결책', 
    question: '그래서 우리는『_________________________________』로 이 문제를 해결해주고 있습니다.', 
    mobileQuestion: '우리는 『___________』로 이 문제를 해결합니다.', 
    example: '(예시: 합리적인 가격에 최고 품질을 제공하는 것)', 
    type: 'text' 
  },
  { 
    id: 'q4', section: '💭 2단계: 브랜드의 감성과 분위기', 
    title: 'Q4. 브랜드 분위기', 
    question: '우리 브랜드는 『_______』 색깔 같고, 『_______』 순간(시간대)의 분위기와 닮았습니다.', 
    mobileQuestion: '우리 브랜드는 『___』 색깔, 『___』 순간의 분위기와 닮았습니다.', 
    example: '(예시: 따뜻한 베이지 색깔 같고, 일요일 오후 2시의 여유로운 순간)', 
    type: 'text' 
  },
  { 
    id: 'q5', section: '💭 2단계: 브랜드의 감성과 분위기', 
    title: 'Q5. 고객이 느끼는 기분', 
    question: '고객들은 우리 브랜드를 경험하면 마치 『_________________』 같은 기분이 든다고 합니다.', 
    mobileQuestion: '고객들은 우리 브랜드를 경험하면 『___________』 같은 기분이 듭니다.', 
    example: '(예시: 믿을 수 있는 오랜 친구와 함께 있는 듯하다 / 따뜻한 휴일 아침을 맞이한 듯하다)', 
    type: 'text' 
  },
  { 
    id: 'q6', section: '💭 2단계: 브랜드의 감성과 분위기', 
    title: 'Q6. 절대 안 어울리는 이미지', 
    question: '우리 브랜드는 절대로 『_________________________________』 같은 느낌은 아닙니다.', 
    mobileQuestion: '우리 브랜드는 절대로 『___________』 느낌은 아닙니다.', 
    example: '(예시: 복잡하고 화려하기만 한 브랜드)', 
    type: 'text' 
  },
  { 
    id: 'q7', section: '⭐ 3단계: 브랜드의 핵심 가치', 
    title: 'Q7. 가장 자신 있는 서비스/제품', 
    question: '우리가 고객들께 가장 자신 있게 제공하는 것은『_________________________________』입니다.', 
    mobileQuestion: '우리가 가장 자신 있는 것은 『___________』입니다.', 
    example: '(예시: 24시간 언제든 믿고 맡길 수 있는 고객 서비스)', 
    type: 'text' 
  },
  { 
    id: 'q8', section: '⭐ 3단계: 브랜드의 핵심 가치', 
    title: 'Q8. 그것의 특별한 점', 
    question: '이것이 다른 브랜드와 다른 점은『_________________________________』입니다.', 
    mobileQuestion: '이것이 다른 브랜드와 다른 점은 『___________』입니다.', 
    example: '(예시: 고객 한 분 한 분을 가족처럼 생각하고 응대한다는 것)', 
    type: 'text' 
  },
  { 
    id: 'q9', section: '⭐ 3단계: 브랜드의 핵심 가치', 
    title: 'Q9. 고객들의 반응', 
    question: '이것을 경험한 고객들이 가장 자주 하시는 말은『_________________________________』입니다.', 
    mobileQuestion: '이것을 경험한 고객들의 말은 『___________』입니다.', 
    example: '(예시: "여기는 정말 믿을 수 있어요")', 
    type: 'text' 
  },
  { 
    id: 'q10', section: '🎯 4단계: 브랜드의 정체성과 메시지', 
    title: 'Q10. 브랜드만의 상징적 장면',
    question: '우리 브랜드 하면 가장 먼저 떠오르는 장면은『_________________________________』입니다.', 
    mobileQuestion: '우리 브랜드 하면 떠오르는 장면은 『___________』입니다.', 
    example: '(예시: 직원이 고객에게 진심으로 감사 인사를 드리는 모습)', 
    type: 'text'
  },
  { 
    id: 'q11', section: '🎯 4단계: 브랜드의 정체성과 메시지', 
    title: 'Q11. 고객이 느꼈으면 하는 기분', 
    question: '우리 브랜드를 경험한 고객이 마지막에 『_________________』라는 기분을 느꼈으면 합니다.', 
    mobileQuestion: '고객이 마지막에 『___________』 기분을 느꼈으면 합니다.', 
    example: '(예시: 오늘 정말 좋은 선택을 했다다는 / 따뜻하게 위로받았다는)', 
    type: 'text' 
  },
  { 
    id: 'q12', section: '🎯 4단계: 브랜드의 정체성과 메시지', 
    title: 'Q12. 한 문장 브랜드 소개', 
    question: '우리 브랜드를 누군가에게 소개한다면『_________________________________』라고 말하겠습니다.', 
    mobileQuestion: '우리 브랜드를 소개한다면 『___________』라고 말하겠습니다.', 
    example: '(예시: 고객을 진심으로 생각하는 마음이 다른 곳)', 
    type: 'text' 
  },
  { 
    id: 'q13', section: '🎼 5단계: 브랜드 송을 위한 감각적 디테일', 
    title: 'Q13. 브랜드의 첫인상', 
    question: '우리 브랜드를 경험하면 가장 먼저 『_________________』 같은 느낌이 떠오릅니다.', 
    mobileQuestion: '우리 브랜드를 경험하면 『___________』 느낌이 떠오릅니다.', 
    example: '(예시: 따뜻하고 안정적인 느낌 / 웅장하고 믿음직한 느낌)', 
    type: 'text' 
  },
  { 
    id: 'q14', section: '🎼 5단계: 브랜드 송을 위한 감각적 디테일', 
    title: 'Q14. 브랜드의 템포', 
    question: '우리 브랜드의 템포(리듬감)는 『_________________』 같은 느낌입니다.', 
    mobileQuestion: '우리 브랜드의 템포는 『___________』 느낌입니다.', 
    example: '(예시: 차분하지만 힘이 있는 행진곡 같아요 / 경쾌하게 흐르는 재즈 같아요)', 
    type: 'text' 
  },
  { 
    id: 'q15', section: '🎼 5단계: 브랜드 송을 위한 감각적 디테일', 
    title: 'Q15. 타겟 고객층', 
    question: '우리 주요 고객들은『________』대 『________________』입니다.', 
    mobileQuestion: '주요 고객은 『___』대 『___________』입니다.', 
    example: '(예시: 30대 직장인 가족들)', 
    type: 'text' 
  },
  { 
    id: 'q16', section: '🎼 5단계: 브랜드 송을 위한 감각적 디테일', 
    title: 'Q16. 브랜드가 빛나는 순간', 
    question: '우리 브랜드가 가장 빛나는 순간은 『_________________』일 때입니다.', 
    mobileQuestion: '우리 브랜드가 빛나는 순간은 『___________』일 때입니다.', 
    example: '(예시: 고객이 어려움에 처했을 때 / 하루를 시작하는 아침 시간 / 스스로를 돌보고 싶을 때)', 
    type: 'text' 
  },
  { 
    id: 'q17', section: '🎼 5단계: 브랜드 송을 위한 감각적 디테일', 
    title: 'Q17. 브랜드 철학', 
    question: '우리가 브랜드를 운영할 때 가장 중요하게 생각하는 것은 『_________________________________』입니다.', 
    mobileQuestion: '우리가 가장 중요하게 생각하는 것은 『___________』입니다.', 
    example: '(예시: 고객과의 약속은 반드시 지키는 것)', 
    type: 'text' 
  },
  { 
    id: 'q18', section: '🎤 6단계: 브랜드 송 제작을 위한 특별 질문', 
    title: 'Q18. 브랜드를 대표하는 키워드 3개', 
    question: '우리 브랜드를 표현하는 핵심 단어 3개는 『______』, 『______』『______』입니다.', 
    mobileQuestion: '핵심 단어 3개는 『___』, 『___』, 『___』입니다.', 
    example: '(예시: “따뜻함, 신뢰, 전문성” / “젊음, 활력, 도전”)', 
    type: 'text' 
  },
  { 
    id: 'q19', section: '🎤 6단계: 브랜드 송 제작을 위한 특별 질문', 
    title: 'Q19. 브랜드 송 핵심 메시지', 
    question: '브랜드 송에서 꼭 전하고 싶은 핵심 메시지는『_________________________________』입니다. 슬로건이 있다면 우리 브랜드를 대표하는 슬로건을 작성해주세요.', 
    mobileQuestion: '브랜드 송의 핵심 메시지는 『___________』입니다. (슬로건 포함)', 
    example: '(예시: "고객과 함께 성장하는 우리", "언제나 당신 곁에", "Tomorrow Starts Today")', 
    type: 'text' 
  },
  { 
    id: 'q20', section: '🎤 6단계: 브랜드 송 제작을 위한 특별 질문', 
    title: 'Q20. 선호하는 음악 장르/스타일', 
    question: '우리 브랜드와 어울리는 음악 스타일은 『_________________________________』입니다.', 
    mobileQuestion: '어울리는 음악 스타일은 『___________』입니다.', 
    example: '(예시: 따뜻하고 희망적인 발라드 / 신나고 에너지 넘치는 팝 / 세련된 재즈)', 
    type: 'text' 
  }
];

/** ===== 나레이션 제작 설문 ===== */
export const narrationQuestions: Question[] = [
  {
    id: 'narration_content_readiness',
    section: '나레이션 콘텐츠',
    title: 'Q1. 나레이션 내용 준비 상태',
    question: '제작하고자 하는 나레이션의 구체적인 내용이나 방향이 정해져 있습니까?',
    mobileQuestion: '나레이션 내용이 정해져 있나요?',
    type: 'radio',
    options: [
      '구체적인 스크립트나 내용이 준비되어 있음',
      '대략적인 컨셉이나 방향은 정해져 있음',
      '참고할 만한 샘플이나 레퍼런스가 있음',
      '아직 구체적으로 정해진 것이 없음'
    ]
  },
  {
    id: 'narration_specific_content',
    section: '나레이션 콘텐츠',
    title: 'Q2. 제작할 나레이션 내용(있는 경우)',
    question: '내용이 준비된 경우, 어떤 나레이션을 제작하려고 하십니까?',
    mobileQuestion: '어떤 나레이션을 제작하려 하나요?',
    type: 'textarea',
    example: '예시: "매장 소개 + 주요 메뉴 안내", "회사 연혁 + 핵심 서비스 설명", "브랜드 스토리 + 차별화 포인트", "이벤트 안내 + 문의처 정보"',
    hasNotApplicable: true
  },
  {
    id: 'existing_script_concept',
    section: '나레이션 콘텐츠',
    title: 'Q3. 현재 보유 스크립트/컨셉(있는 경우)',
    question: '준비된 내용이 있다면, 현재 가지고 있는 스크립트나 컨셉을 간략히 적어주십시오.',
    mobileQuestion: '준비된 스크립트나 컨셉이 있나요?',
    type: 'textarea',
    example: '구체적인 스크립트나 컨셉을 입력해주세요.',
    hasNotApplicable: true
  },
  {
    id: 'reference_style',
    section: '나레이션 스타일',
    title: 'Q4. 참고할 나레이션 스타일(있는 경우)',
    question: '참고하고 싶은 나레이션 스타일이나 레퍼런스가 있습니까?',
    mobileQuestion: '참고할 나레이션 스타일이 있나요?',
    type: 'textarea',
    example: '예시: "○○은행 전화 안내 톤처럼 신뢰감 있게", "○○카페 매장 방송처럼 친근하게", "○○브랜드 광고처럼 세련되게", "첨부한 샘플 파일과 비슷하게"',
    hasNotApplicable: true
  },
  {
    id: 'business_improvement_goal',
    section: '비즈니스 목표',
    title: 'Q5. 사업 운영 개선 목표',
    question: '현재 사업 운영에서 가장 개선하고 싶은 부분은 무엇입니까?',
    mobileQuestion: '사업에서 개선하고 싶은 부분은?',
    type: 'textarea',
    example: '예시: "브랜드 인지도 향상", "신규 고객 유치", "기존 고객 재방문율 증대", "경쟁업체 대비 차별화", "서비스 신뢰도 제고"'
  },
  {
    id: 'business_introduction',
    section: '비즈니스 정보',
    title: 'Q6. 사업체 한 문장 소개',
    question: '귀하의 사업체를 한 문장으로 소개한다면 어떻게 표현하시겠습니까?',
    mobileQuestion: '사업체를 한 문장으로 소개해주세요',
    type: 'textarea',
    example: '예시: "20년 경력의 숙련된 기술진이 운영하는 신뢰할 수 있는 자동차 정비소", "합리적 가격으로 신선한 재료만 사용하는 동네 맛집"'
  },
  {
    id: 'narration_core_goal',
    section: '나레이션 목표',
    title: 'Q7. 나레이션 핵심 목표',
    question: '이번 나레이션을 통해 달성하고자 하는 핵심 목표는 무엇입니까?',
    mobileQuestion: '나레이션의 핵심 목표는?',
    type: 'radio',
    options: [
      '브랜드 인지도 향상 (존재감 알리기)',
      '선택 동기 부여 (경쟁업체 대신 선택하도록)',
      '재방문 유도 (기존 고객 유지)',
      '추천 확산 (고객이 타인에게 추천하도록)'
    ]
  },
  {
    id: 'customer_situation',
    section: '고객 분석',
    title: 'Q8. 고객들의 상황적 특성',
    question: '매장을 이용하는 고객들의 상황적 특성은 어떤 것이 가장 일반적입니까?',
    mobileQuestion: '고객들의 일반적인 상황은?',
    type: 'textarea',
    example: '예시: "점심시간에 급하게 식사하러 오는 직장인들", "여유롭게 차 마시며 대화하러 오는 오후 고객들", "빠르게 업무를 처리하고 나가려는 고객들"'
  },
  {
    id: 'customer_selection_reason',
    section: '고객 분석',
    title: 'Q9. 고객이 선택하는 핵심 동기',
    question: '고객들이 귀하의 서비스를 선택하는 핵심 동기는 무엇입니까?',
    mobileQuestion: '고객이 선택하는 핵심 동기는?',
    type: 'textarea',
    example: '예시: "빠른 처리 속도", "합리적인 가격", "높은 신뢰도", "편리한 접근성", "차별화된 전문성", "개인 맞춤 서비스"'
  },
  {
    id: 'customer_hesitation_reason',
    section: '고객 분석',
    title: 'Q10. 고객이 망설이는 주요 이유',
    question: '반대로 고객들이 망설이거나 타 업체를 선택하는 주요 이유는 무엇입니까?',
    mobileQuestion: '고객이 망설이는 주요 이유는?',
    type: 'textarea',
    example: '예시: "가격 부담", "위치상 접근성", "서비스 신뢰도 의문", "대기 시간", "브랜드 인지도 부족"'
  },
  {
    id: 'customer_relationship',
    section: '고객 관계',
    title: 'Q11. 고객과의 관계 특성',
    question: '귀하와 고객 간의 관계 특성은 다음 중 어느 것에 가장 가깝습니까?',
    mobileQuestion: '고객과의 관계 특성은?',
    type: 'radio',
    options: [
      '전문가-의뢰인 관계 (전문성을 바탕으로 신뢰받는)',
      '친구 관계 (편안하고 허물없는 소통)',
      '가족 관계 (따뜻하고 세심하게 배려하는)',
      '멘토-학습자 관계 (가르치고 안내하는)',
      '파트너 관계 (함께 문제를 해결하는)'
    ]
  },
  {
    id: 'priority_ranking',
    section: '우선순위',
    title: 'Q12. 중요 요소 우선순위',
    question: '다음 요소들을 중요도 순으로 1, 2, 3순위를 매겨주십시오.',
    mobileQuestion: '중요도 순으로 순위를 매겨주세요',
    type: 'priority',
    options: [
      'A. 제공 서비스 및 업무 영역 안내',
      'B. 경쟁업체 대비 우위점 강조',
      'C. 위치, 운영시간 등 기본 정보 제공',
      'D. 특별 혜택이나 차별화 서비스 홍보',
      'E. 신뢰성과 전문성 어필',
      'F. 친근함과 편안함 조성'
    ]
  },
  {
    id: 'unique_strength',
    section: '차별화 요소',
    title: 'Q13. 경쟁업체 대비 고유 강점',
    question: '경쟁업체와 명확히 구별되는 고유 강점은 무엇입니까?',
    mobileQuestion: '경쟁업체와 구별되는 강점은?',
    type: 'textarea',
    example: '예시: "20년간 축적된 기술 노하우", "지역 내 유일한 24시간 서비스", "고객 개별 맞춤 솔루션 제공", "사후관리 시스템 완비"'
  },
  {
    id: 'communication_style_recommendation',
    section: '소통 방식',
    title: 'Q14-1. 추천 방식 성향',
    question: '평소 고객과의 소통에서 추천 방식은 어느 쪽에 더 가깝습니까?',
    mobileQuestion: '추천 방식은?',
    type: 'radio',
    options: [
      '확신을 갖고 적극 추천 ("이것을 추천드립니다")',
      '선택권을 존중하며 제안 ("어떤 것을 선호하시나요?")'
    ]
  },
  {
    id: 'communication_style_explanation',
    section: '소통 방식',
    title: 'Q14-2. 설명 방식 성향',
    question: '평소 고객과의 소통에서 설명 방식은 어느 쪽에 더 가깝습니까?',
    mobileQuestion: '설명 방식은?',
    type: 'radio',
    options: [
      '먼저 설명하고 이해시키는 방식 ("이것의 장점은 다음과 같습니다")',
      '질문을 듣고 맞춤 응답하는 방식 ("어떤 부분이 궁금하신가요?")'
    ]
  },
  {
    id: 'communication_style_tone',
    section: '소통 방식',
    title: 'Q14-3. 소통 톤 성향',
    question: '평소 고객과의 소통에서 톤은 어느 쪽에 더 가깝습니까?',
    mobileQuestion: '소통 톤은?',
    type: 'radio',
    options: [
      '친근하고 개인적인 대화 ("오늘 날씨가 좋네요")',
      '정중하고 업무적인 응대 ("무엇을 도와드릴까요?")'
    ]
  },
  {
    id: 'hesitant_customer_response',
    section: '상황별 응대',
    title: 'Q15-1. 망설이는 고객 응대',
    question: '망설이는 고객에 대한 응대 방식은?',
    mobileQuestion: '망설이는 고객 응대는?',
    type: 'radio',
    options: [
      '"안심하셔도 됩니다. 충분히 만족하실 것입니다"',
      '"다른 고객분들도 높은 만족도를 보이셨습니다"',
      '"충분히 검토하신 후 결정하시기 바랍니다"',
      '"궁금한 사항이 있으시면 언제든 문의하십시오"'
    ]
  },
  {
    id: 'premium_option_response',
    section: '상황별 응대',
    title: 'Q15-2. 고가 옵션 제안 응대',
    question: '고가 옵션 제안 시 응대 방식은?',
    mobileQuestion: '고가 옵션 제안 시는?',
    type: 'radio',
    options: [
      '"이 옵션이 확실히 더 우수합니다"',
      '"예산에 맞는 선택을 하시는 것이 좋겠습니다"',
      '"각각 고유한 장단점이 있습니다"',
      '"어떤 요소를 가장 중시하시나요?"'
    ]
  },
  {
    id: 'problem_situation_response',
    section: '상황별 응대',
    title: 'Q15-3. 문제 발생 시 응대',
    question: '문제 발생 시 응대 방식은?',
    mobileQuestion: '문제 발생 시는?',
    type: 'radio',
    options: [
      '"죄송합니다. 즉시 해결해드리겠습니다"',
      '"상황을 정확히 파악해보겠습니다"',
      '"함께 해결방안을 찾아보겠습니다"',
      '"재발 방지를 위해 개선하겠습니다"'
    ]
  },
  {
    id: 'customer_listening_context_focus',
    section: '매장 환경',
    title: 'Q16-1. 고객의 나레이션 집중도',
    question: '매장에서 나레이션을 청취하는 고객의 집중도는?',
    mobileQuestion: '고객의 나레이션 집중도는?',
    type: 'radio',
    options: [
      '나레이션에 집중하여 끝까지 청취 가능한 환경',
      '다른 활동 중 배경음성으로 청취하는 환경'
    ]
  },
  {
    id: 'customer_listening_context_time',
    section: '매장 환경',
    title: 'Q16-2. 고객의 체류 시간',
    question: '매장을 이용하는 고객의 체류 시간은?',
    mobileQuestion: '고객의 체류 시간은?',
    type: 'radio',
    options: [
      '짧은 시간 동안 매장에 머무는 고객이 대부분',
      '충분한 시간을 갖고 매장을 이용하는 고객이 대부분'
    ]
  },
  {
    id: 'customer_listening_context_interest',
    section: '매장 환경',
    title: 'Q16-3. 고객의 관심도',
    question: '나레이션에 대한 고객의 관심도는?',
    mobileQuestion: '고객의 관심도는?',
    type: 'radio',
    options: [
      '이미 관심을 갖고 추가 정보를 원하는 상태',
      '우연히 접하게 되어 관심을 유발해야 하는 상태'
    ]
  },
  {
    id: 'customer_listening_context_decision',
    section: '매장 환경',
    title: 'Q16-4. 고객의 의사결정 단계',
    question: '나레이션을 듣는 고객의 의사결정 단계는?',
    mobileQuestion: '고객의 의사결정 단계는?',
    type: 'radio',
    options: [
      '거의 결정하고 최종 확인하는 단계',
      '여러 대안을 비교 검토하는 단계',
      '처음 접하여 기본 정보가 필요한 단계'
    ]
  },
  {
    id: 'desired_customer_action',
    section: '고객 행동',
    title: 'Q17. 기대하는 고객 행동',
    question: '매장 내에서 나레이션을 들은 고객이 가장 우선적으로 취하길 원하는 행동은 무엇입니까?',
    mobileQuestion: '고객이 취하길 원하는 행동은?',
    type: 'radio',
    options: [
      '추가 메뉴나 서비스에 관심 갖기',
      '직원에게 문의나 상담 요청하기',
      '더 오래 머물며 매장 분위기 즐기기',
      '브랜드에 대한 신뢰감과 만족감 느끼기',
      '다음 방문 시 기억하고 재방문하기',
      '지인들에게 이 매장을 추천하고 싶어하기'
    ]
  },
  {
    id: 'essential_information',
    section: '필수 정보',
    title: 'Q18. 필수 포함 정보/키워드',
    question: '나레이션에 반드시 포함되어야 하는 필수 정보나 키워드가 있습니까?',
    mobileQuestion: '반드시 포함할 정보가 있나요?',
    type: 'textarea',
    example: '예시: "업체명, 대표 전화번호", "주요 서비스명", "운영시간", "위치", "특별한 인증이나 자격", "브랜드 슬로건"'
  },
  {
    id: 'avoid_tone',
    section: '제외 사항',
    title: 'Q19. 지양할 톤/느낌',
    question: '절대 지양해야 할 톤이나 느낌이 있다면 무엇입니까?',
    mobileQuestion: '지양해야 할 톤이나 느낌은?',
    type: 'textarea',
    example: '예시: "과도하게 시끄러운 톤", "지나치게 격식적인 말투", "과장된 상업적 표현", "복잡하고 어려운 전문용어", "급박하게 재촉하는 느낌"'
  }
];

// [수정] getIndustryQuestions 함수를 단순화 - 항상 나레이션 질문 반환
export function getNarrationQuestions(): Question[] {
  return narrationQuestions; // 이제 나레이션 질문을 반환
}

// [수정] getAllQuestionsForSummary 함수에서 나레이션 질문만 사용
export function getAllQuestionsForSummary(): Question[] {
  return [...brandSongQuestions, ...narrationQuestions]; // 나레이션 질문 포함
}