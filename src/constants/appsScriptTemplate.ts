export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ========================================================
 * 📝 [구글 스프레드시트 방명록 / 게시판 API]
 * 
 * 구글 스프레드시트를 실시간 JSON 데이터베이스로 사용하는 Apps Script 코드입니다.
 * 
 * [배포 방법]
 * 1. 스프레드시트 메뉴 [확장 프로그램] > [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 이 코드를 붙여넣은 뒤 [저장(Ctrl+S)]
 * 3. 오른쪽 상단 [배포] > [새 배포] 클릭
 * 4. 톱니바퀴 아이콘 클릭 > [웹 앱] 선택
 * 5. 설명: "방명록 API" 입력
 * 6. 실행할 사용자: "나 (My account)"
 * 7. ⭐ 액세스 권한: "모든 사용자 (Anyone)" 로 꼭 설정!
 * 8. [배포] 버튼 누르고 나온 '웹 앱 URL'을 복사하여 방명록 앱에 등록하면 끝!
 * ========================================================
 */

// 1. GET 요청: 방명록 목록 불러오기
function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = getOrCreateSheet();
    var data = sheet.getDataRange().getValues();

    // 헤더 행만 있거나 비어있는 경우
    if (data.length <= 1) {
      return createJsonResponse({ status: "success", count: 0, data: [] });
    }

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // 빈 행 건너뛰기
      if (!row[0] && !row[2] && !row[3]) continue;

      var entry = {
        id: String(row[0] || "entry_" + i),
        timestamp: row[1] ? formatTimestamp(row[1]) : new Date().toISOString(),
        name: String(row[2] || "익명"),
        message: String(row[3] || ""),
        emoji: String(row[4] || "💖"),
        color: String(row[5] || "yellow"),
        likes: Number(row[6] || 0)
      };
      rows.push(entry);
    }

    // 최신 글이 위로 오도록 역순 정렬
    rows.reverse();

    return createJsonResponse({
      status: "success",
      count: rows.length,
      data: rows
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

// 2. POST 요청: 새 글 등록 및 좋아요 증가
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = getOrCreateSheet();
    var params = {};

    // 요청 데이터 파싱
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }

    // 기능 A: 좋아요 증가 요청 처리
    if (params.action === "like" && params.id) {
      var data = sheet.getDataRange().getValues();
      var targetId = String(params.id);
      var updatedLikes = 1;
      var foundRow = -1;

      for (var r = 1; r < data.length; r++) {
        if (String(data[r][0]) === targetId) {
          foundRow = r + 1; // 1-indexed sheet row
          var currentLikes = Number(data[r][6] || 0);
          updatedLikes = currentLikes + 1;
          sheet.getRange(foundRow, 7).setValue(updatedLikes);
          break;
        }
      }

      return createJsonResponse({
        status: "success",
        action: "like",
        id: targetId,
        likes: updatedLikes
      });
    }

    // 기능 B: 새 방명록 글 등록
    var id = "entry_" + new Date().getTime();
    var nowStr = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    var name = (params.name || "익명").toString().trim();
    var message = (params.message || "").toString().trim();
    var emoji = (params.emoji || "💖").toString();
    var color = (params.color || "yellow").toString();
    var likes = 0;

    if (!message) {
      return createJsonResponse({
        status: "error",
        message: "메시지 내용을 입력해주세요."
      });
    }

    // 스프레드시트 맨 아래에 새 행 추가
    sheet.appendRow([id, nowStr, name, message, emoji, color, likes]);

    var newEntry = {
      id: id,
      timestamp: nowStr,
      name: name,
      message: message,
      emoji: emoji,
      color: color,
      likes: likes
    };

    return createJsonResponse({
      status: "success",
      message: "등록되었습니다!",
      data: newEntry
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

// 시트 확인 및 자동 헤더 생성
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("방명록");
  if (!sheet) {
    sheet = ss.getActiveSheet();
    sheet.setName("방명록");
  }

  // 아직 내용이 없으면 헤더 행 생성 및 디자인 적용
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "작성일시", "작성자", "응원메시지", "이모지", "카드색상", "좋아요"]);
    var headerRange = sheet.getRange("A1:G1");
    headerRange.setBackground("#FEF3C7") // 연한 노란색
               .setFontWeight("bold")
               .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 140); // ID
    sheet.setColumnWidth(2, 160); // 작성일시
    sheet.setColumnWidth(3, 100); // 작성자
    sheet.setColumnWidth(4, 300); // 응원메시지
    sheet.setColumnWidth(5, 70);  // 이모지
    sheet.setColumnWidth(6, 90);  // 색상
    sheet.setColumnWidth(7, 70);  // 좋아요
  }
  return sheet;
}

// JSON 응답 포맷 유틸
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 날짜 포맷 유틸
function formatTimestamp(d) {
  if (d instanceof Date) {
    return Utilities.formatDate(d, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
  }
  return String(d);
}
`;

export const COLOR_THEMES = [
  {
    id: 'yellow',
    name: '레몬 옐로우',
    bgClass: 'bg-amber-100/90 text-amber-950',
    borderClass: 'border-amber-200/80 hover:border-amber-300',
    badgeClass: 'bg-amber-200/70 text-amber-800',
    accentClass: 'text-amber-600',
    dotClass: 'bg-amber-400',
  },
  {
    id: 'pink',
    name: '피치 핑크',
    bgClass: 'bg-rose-100/90 text-rose-950',
    borderClass: 'border-rose-200/80 hover:border-rose-300',
    badgeClass: 'bg-rose-200/70 text-rose-800',
    accentClass: 'text-rose-600',
    dotClass: 'bg-rose-400',
  },
  {
    id: 'mint',
    name: '민트 그린',
    bgClass: 'bg-emerald-100/90 text-emerald-950',
    borderClass: 'border-emerald-200/80 hover:border-emerald-300',
    badgeClass: 'bg-emerald-200/70 text-emerald-800',
    accentClass: 'text-emerald-600',
    dotClass: 'bg-emerald-400',
  },
  {
    id: 'blue',
    name: '스카이 블루',
    bgClass: 'bg-sky-100/90 text-sky-950',
    borderClass: 'border-sky-200/80 hover:border-sky-300',
    badgeClass: 'bg-sky-200/70 text-sky-800',
    accentClass: 'text-sky-600',
    dotClass: 'bg-sky-400',
  },
  {
    id: 'purple',
    name: '라벤더 퍼플',
    bgClass: 'bg-purple-100/90 text-purple-950',
    borderClass: 'border-purple-200/80 hover:border-purple-300',
    badgeClass: 'bg-purple-200/70 text-purple-800',
    accentClass: 'text-purple-600',
    dotClass: 'bg-purple-400',
  },
  {
    id: 'orange',
    name: '선셋 오렌지',
    bgClass: 'bg-orange-100/90 text-orange-950',
    borderClass: 'border-orange-200/80 hover:border-orange-300',
    badgeClass: 'bg-orange-200/70 text-orange-800',
    accentClass: 'text-orange-600',
    dotClass: 'bg-orange-400',
  },
];

export const EMOJI_OPTIONS = [
  { emoji: '💖', label: '응원해요' },
  { emoji: '🍀', label: '행운을빌어요' },
  { emoji: '🎉', label: '축하해요' },
  { emoji: '🔥', label: '파이팅' },
  { emoji: '☕', label: '힐링충전' },
  { emoji: '✨', label: '눈부셔요' },
  { emoji: '🌸', label: '꽃길만걸어요' },
  { emoji: '💪', label: '힘내세요' },
];

export const INITIAL_DEMO_ENTRIES = [
  {
    id: 'demo_1',
    timestamp: '2026-09-30 22:30:15',
    name: '익명의 요정',
    message: '오늘 하루도 정말 고생 많으셨어요! 내일은 오늘보다 더 반짝이고 행복한 일들만 가득하기를 마음 가득 응원합니다 🍀✨',
    emoji: '🍀',
    color: 'yellow',
    likes: 12,
  },
  {
    id: 'demo_2',
    timestamp: '2026-09-30 21:15:40',
    name: '개발자 민우',
    message: '구글 스프레드시트가 이렇게 멋진 실시간 데이터베이스가 되다니 신기하네요! 방명록 UI도 아기자기하고 너무 귀여워요 💕',
    emoji: '🎉',
    color: 'pink',
    likes: 8,
  },
  {
    id: 'demo_3',
    timestamp: '2026-09-30 20:04:12',
    name: '커피러버',
    message: '지치고 힘들 땐 따뜻한 라떼 한 잔의 여유를 잊지 마세요. 우리 모두 힘내봅시다 화이팅! ☕',
    emoji: '☕',
    color: 'mint',
    likes: 15,
  },
  {
    id: 'demo_4',
    timestamp: '2026-09-30 19:42:00',
    name: '수험생 친구',
    message: '끝까지 포기하지 않고 달리는 당신의 모든 노력이 눈부신 결실로 이어질 거예요. 힘내자!! 🔥🔥',
    emoji: '🔥',
    color: 'orange',
    likes: 21,
  },
  {
    id: 'demo_5',
    timestamp: '2026-09-30 18:20:55',
    name: '별빛소녀',
    message: '당신이라는 존재 자체가 이미 충분히 소중하고 빛나요. 늘 응원하고 있어요 🌸',
    emoji: '🌸',
    color: 'purple',
    likes: 9,
  },
];
