import requests
import os
from typing import Dict, Any, Optional
from fastapi import HTTPException
import json

class WeatherService:
    def __init__(self):
        # Using Open-Meteo (free, no API key required)
        self.base_url = "https://api.open-meteo.com/v1"
        self.geocoding_url = "https://geocoding-api.open-meteo.com/v1"
        
        # Alternative: OpenWeatherMap (requires API key)
        # self.openweather_api_key = os.getenv("OPENWEATHER_API_KEY")
        # self.openweather_base_url = "https://api.openweathermap.org/data/2.5"
    
    def get_coordinates(self, city: str) -> Optional[Dict[str, float]]:
        """Get latitude and longitude for a city using Open-Meteo geocoding."""
        try:
            params = {
                "name": city,
                "count": 1,
                "language": "en",
                "format": "json"
            }
            
            response = requests.get(f"{self.geocoding_url}/search", params=params)
            response.raise_for_status()
            
            data = response.json()
            if data.get("results") and len(data["results"]) > 0:
                location = data["results"][0]
                return {
                    "latitude": location["latitude"],
                    "longitude": location["longitude"],
                    "name": location["name"],
                    "country": location.get("country", ""),
                    "admin1": location.get("admin1", "")
                }
            return None
            
        except Exception as e:
            print(f"Error getting coordinates for {city}: {str(e)}")
            return None
    
    def get_current_weather(self, city: str) -> Dict[str, Any]:
        """Get current weather for a city using Open-Meteo API."""
        try:
            # First, get coordinates for the city
            location = self.get_coordinates(city)
            if not location:
                raise HTTPException(status_code=404, detail=f"City '{city}' not found")
            
            # Get weather data
            params = {
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "current": [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "apparent_temperature",
                    "is_day",
                    "precipitation",
                    "weather_code",
                    "cloud_cover",
                    "pressure_msl",
                    "surface_pressure",
                    "wind_speed_10m",
                    "wind_direction_10m",
                    "wind_gusts_10m"
                ],
                "timezone": "auto",
                "forecast_days": 1
            }
            
            response = requests.get(f"{self.base_url}/forecast", params=params)
            response.raise_for_status()
            
            data = response.json()
            current = data.get("current", {})
            
            # Weather codes mapping (WMO codes)
            weather_descriptions = {
                0: "Clear sky",
                1: "Mainly clear",
                2: "Partly cloudy",
                3: "Overcast",
                45: "Fog",
                48: "Depositing rime fog",
                51: "Light drizzle",
                53: "Moderate drizzle",
                55: "Dense drizzle",
                61: "Slight rain",
                63: "Moderate rain",
                65: "Heavy rain",
                71: "Slight snow fall",
                73: "Moderate snow fall",
                75: "Heavy snow fall",
                77: "Snow grains",
                80: "Slight rain showers",
                81: "Moderate rain showers",
                82: "Violent rain showers",
                85: "Slight snow showers",
                86: "Heavy snow showers",
                95: "Thunderstorm",
                96: "Thunderstorm with slight hail",
                99: "Thunderstorm with heavy hail"
            }
            
            weather_code = current.get("weather_code", 0)
            weather_description = weather_descriptions.get(weather_code, "Unknown")
            
            return {
                "success": True,
                "city": location["name"],
                "country": location["country"],
                "coordinates": {
                    "latitude": location["latitude"],
                    "longitude": location["longitude"]
                },
                "current_weather": {
                    "temperature": current.get("temperature_2m"),
                    "temperature_unit": "°C",
                    "feels_like": current.get("apparent_temperature"),
                    "humidity": current.get("relative_humidity_2m"),
                    "pressure": current.get("pressure_msl"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "wind_direction": current.get("wind_direction_10m"),
                    "wind_gusts": current.get("wind_gusts_10m"),
                    "cloud_cover": current.get("cloud_cover"),
                    "precipitation": current.get("precipitation"),
                    "weather_code": weather_code,
                    "weather_description": weather_description,
                    "is_day": bool(current.get("is_day")),
                    "last_updated": current.get("time")
                },
                "timezone": data.get("timezone")
            }
            
        except requests.RequestException as e:
            raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")
    
    def get_forecast(self, city: str, days: int = 7) -> Dict[str, Any]:
        """Get weather forecast for a city."""
        try:
            location = self.get_coordinates(city)
            if not location:
                raise HTTPException(status_code=404, detail=f"City '{city}' not found")
            
            params = {
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "daily": [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "apparent_temperature_max",
                    "apparent_temperature_min",
                    "precipitation_sum",
                    "rain_sum",
                    "showers_sum",
                    "snowfall_sum",
                    "precipitation_hours",
                    "wind_speed_10m_max",
                    "wind_gusts_10m_max",
                    "wind_direction_10m_dominant",
                    "uv_index_max"
                ],
                "timezone": "auto",
                "forecast_days": min(days, 16)  # Max 16 days for free tier
            }
            
            response = requests.get(f"{self.base_url}/forecast", params=params)
            response.raise_for_status()
            
            data = response.json()
            daily = data.get("daily", {})
            
            forecast_days = []
            for i in range(len(daily.get("time", []))):
                forecast_days.append({
                    "date": daily["time"][i],
                    "temperature_max": daily["temperature_2m_max"][i],
                    "temperature_min": daily["temperature_2m_min"][i],
                    "feels_like_max": daily["apparent_temperature_max"][i],
                    "feels_like_min": daily["apparent_temperature_min"][i],
                    "precipitation": daily["precipitation_sum"][i],
                    "wind_speed_max": daily["wind_speed_10m_max"][i],
                    "wind_direction": daily["wind_direction_10m_dominant"][i],
                    "uv_index": daily["uv_index_max"][i],
                    "weather_code": daily["weather_code"][i]
                })
            
            return {
                "success": True,
                "city": location["name"],
                "country": location["country"],
                "forecast_days": len(forecast_days),
                "forecast": forecast_days
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching forecast: {str(e)}")