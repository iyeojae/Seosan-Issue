// src/services/weather.js
// 백엔드 날씨 API 엔드포인트 - 프록시 사용
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8083';
const WEATHER_API_URL =
  process.env.NODE_ENV === "development"
    ? "/api/v1/weather/ncst" // CRA 프록시로 /api/v1/* 를 백엔드로 전달
    : `${BACKEND_URL}/api/v1/weather/ncst`;

// (옵션) 한글 상태를 코드로 매핑 (백업용)
function mapConditionToCode(txt = "") {
  const t = String(txt).trim();
  if (/맑/.test(t)) return "sunny";
  if (/구름|흐림?/.test(t)) return "cloudy";
  if (/비|소나기/.test(t)) return "rain";
  if (/눈|진눈깨비/.test(t)) return "snow";
  return "sunny";
}

// 기상청 단기/초단기예보에 맞는 base_date, base_time 생성 함수
// eslint-disable-next-line no-unused-vars
function getBaseDateTime() {
  const now = new Date();
  const forecastTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let hour = now.getHours();

  let baseHour = forecastTimes[0];
  for (let i = 0; i < forecastTimes.length; i++) {
    if (hour >= forecastTimes[i]) baseHour = forecastTimes[i];
  }

  let baseDate = now.toISOString().slice(0, 10).replace(/-/g, "");
  if (hour < forecastTimes[0]) {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    baseDate = yesterday.toISOString().slice(0, 10).replace(/-/g, "");
    baseHour = 23;
  }
  const baseTime = String(baseHour).padStart(2, "0") + "00";
  return { baseDate, baseTime };
}

// 실제 API 요청 함수
// 지역명으로 날씨 데이터 요청 (백엔드 API는 city=서산시로 전체 지역 반환)
export async function fetchWeatherData(region = "서산시") {
  const params = new URLSearchParams({ city: "서산시" });
  const url = `${WEATHER_API_URL}?${params.toString()}`;

  console.log("날씨 API 호출:", url, "요청 지역:", region);

  try {
    const res = await fetch(url);
    const text = await res.text(); // 로깅/디버깅을 위해 먼저 text로 받음

    let data;
    try {
      data = JSON.parse(text);
      console.log("날씨 API 응답:", data);
    } catch (jsonError) {
      console.error("날씨 API JSON 파싱 에러:", text);
      throw new Error("날씨 API 응답을 파싱할 수 없습니다.");
    }

    // 백엔드가 에러 포맷을 줄 수 있으니 가드
    if (data.status && data.status >= 400) {
      console.error("날씨 API 에러 응답:", data);
      throw new Error(`날씨 API 에러: ${data.message || "Unknown error"}`);
    }

    // --- 스키마 정규화 ---
    // 1) 이미 cards가 있는 구(old) 스키마면 그대로 통과
    if (Array.isArray(data.cards) && data.cards.length > 0) {
      return data;
    }

    // 2) 새 스키마: { city, results: [...], count }
    if (Array.isArray(data.results) && data.results.length > 0) {
      const cards = data.results.map((r, idx) => ({
        id: idx,
        region: r.region,
        condition: r.condition, // "맑음"
        conditionCode: r.conditionCode || mapConditionToCode(r.condition), // "sunny"
        temperature: r.temperature,
        humidity: r.humidity,
        windSpeed: r.windSpeed,
        windDirection: r.windDirection,
        baseDate: r.baseDate,
        baseTime: r.baseTime,
        nx: r.nx,
        ny: r.ny,
      }));

      return {
        city: data.city || region,
        count: data.count ?? cards.length,
        cards, // ✅ UI는 여전히 cards 배열만 보면 됨
      };
    }

    console.error("날씨 API 응답에 유효한 데이터가 없음:", data);
    throw new Error("날씨 데이터를 찾을 수 없습니다.");
  } catch (err) {
    console.error("날씨 API 에러:", err);
    throw err;
  }
}

export default {
  fetchWeatherData,
};
