import { NextResponse, NextRequest } from "next/server";

const WEATHER_API_KEY = "97080fea0e8d4489850144816251503";
const WEATHER_API_BASE_URL = "http://api.weatherapi.com/v1";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get("city");
  const date = searchParams.get("date"); // Expected format: YYYY-MM-DD

  console.log(`Tool 'get_weather' called for city: ${city}, date: ${date}`);

  if (!city) {
    return NextResponse.json(
      { error: "City parameter is required" },
      { status: 400 }
    );
  }

  try {
    let apiUrl: string;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Determine which API endpoint to use based on the date
    if (!date || date === todayStr) {
      // Use current weather API for today or no date specified
      apiUrl = `${WEATHER_API_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
        city
      )}&aqi=no`;
    } else {
      // Use forecast API for future dates or history API for past dates
      const requestDate = new Date(date);
      const diffTime = requestDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && diffDays <= 14) {
        // Future date within forecast range - use forecast API
        apiUrl = `${WEATHER_API_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
          city
        )}&dt=${date}&aqi=no`;
      } else if (diffDays < 0) {
        // Past date - use history API
        apiUrl = `${WEATHER_API_BASE_URL}/history.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
          city
        )}&dt=${date}`;
      } else {
        // Date too far in future (>14 days) - return error
        return NextResponse.json(
          {
            error: `Weather forecast only available up to 14 days in advance. Requested date: ${date}`,
          },
          { status: 400 }
        );
      }
    }

    console.log(`Fetching weather from: ${apiUrl}`);

    // Make request to WeatherAPI.com
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 400) {
        return NextResponse.json(
          { error: `Weather data not found for city: ${city}` },
          { status: 404 }
        );
      }
      throw new Error(`WeatherAPI response: ${response.status}`);
    }

    const weatherData = await response.json();

    let transformedData;

    if (apiUrl.includes("/current.json")) {
      // Transform current weather response
      transformedData = {
        temp: Math.round(weatherData.current.temp_c),
        condition: weatherData.current.condition.text,
        humidity: `${weatherData.current.humidity}%`,
        date: todayStr,
      };
    } else if (apiUrl.includes("/forecast.json")) {
      // Transform forecast response - get the specific day
      const forecastDay = weatherData.forecast.forecastday[0];
      if (forecastDay) {
        transformedData = {
          temp: Math.round(forecastDay.day.avgtemp_c),
          condition: forecastDay.day.condition.text,
          humidity: `${forecastDay.day.avghumidity}%`,
          date: date,
        };
      } else {
        throw new Error("Forecast data not available for the requested date");
      }
    } else if (apiUrl.includes("/history.json")) {
      // Transform history response
      const historyDay = weatherData.forecast.forecastday[0];
      if (historyDay) {
        transformedData = {
          temp: Math.round(historyDay.day.avgtemp_c),
          condition: historyDay.day.condition.text,
          humidity: `${historyDay.day.avghumidity}%`,
          date: date,
        };
      } else {
        throw new Error(
          "Historical weather data not available for the requested date"
        );
      }
    }

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Unable to fetch weather data at the moment" },
      { status: 500 }
    );
  }
}
