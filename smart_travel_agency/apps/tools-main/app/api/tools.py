from http.client import HTTPException
from typing import Any, Dict, List, Optional
from tools.get_trips import TripsService
from tools.get_weather import WeatherService
from tools.hotels import HotelsService
from fastapi import APIRouter, Query

service = TripsService()
hotels_service = HotelsService()
weather_service = WeatherService()
router = APIRouter()
@router.get("/hotels", response_model=list)
async def get_all_hotels_endpoint():
    """Endpoint to get all hotels."""
    return await hotels_service.get_all_hotels()
@router.get("/hotels", response_model=list)
async def get_hotel_by_id_endpoint(hotel_id: str):
    """Endpoint to get hotel by ID."""
    return await hotels_service.get_hotel_by_id(hotel_id)
@router.get("/hotels", response_model=list)
async def get_hotels_by_destination_endpoint(destination: str):
    """Endpoint to get hotels by destination."""
    return await hotels_service.get_hotels_by_destination(destination)
@router.get("/hotels", response_model=list)
async def get_hotels_by_price_range_endpoint(min_price: Optional[int] = None, max_price: Optional[int] = None):
    """Endpoint to get hotels by price range."""
    return await hotels_service.get_hotels_by_price_range(min_price, max_price)
@router.get("/hotels", response_model=list)
async def get_hotels_by_stars_endpoint(stars: int):
    """Endpoint to get hotels by star rating."""
    return await hotels_service.get_hotels_by_stars(stars)
@router.get("/search", response_model=list)
async def search_hotels_endpoint(
    destination: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_stars: Optional[int] = None,
    activities: Optional[str] = None  # Comma-separated string
):
    """Endpoint to search hotels with filters."""
    activities_list = None
    if activities:
        activities_list = [a.strip() for a in activities.split(",")]
    
    return await hotels_service.search_hotels(
        destination=destination,
        min_price=min_price,
        max_price=max_price,
        min_stars=min_stars,
        activities=activities_list
    )
@router.get("/statistics", response_model=dict)
async def get_hotel_statistics_endpoint():
    """Endpoint to get hotel statistics."""
    return await hotels_service.get_hotel_statistics()
@router.get("/weather/{city}", response_model=dict)
def get_weather_endpoint(city: str):
    """Endpoint to get current weather for a city."""
    return weather_service.get_current_weather(city)
@router.get("/forecast/{city}", response_model=dict)
def get_forecast_endpoint(city: str, days: int = 7):
    """Endpoint to get weather forecast for a city."""
    return weather_service.get_forecast(city, days)
@router.get("/", response_model=Dict[str, Any])
async def get_all_trips():
    """
    Retrieve a list of all trips from the database.
    """
    return await service.get_all_trips()

@router.get("/search", response_model=Dict[str, Any])
async def search_trips(
    name: Optional[str] = Query(None, description="Search by trip name or description"),
    season: Optional[str] = Query(None, description="Filter by season (e.g., 'Summer', 'Winter')"),
    min_price: Optional[int] = Query(None, description="Minimum price filter"),
    max_price: Optional[int] = Query(None, description="Maximum price filter"),
    status: Optional[str] = Query(None, description="Filter by trip status (e.g., 'APPROVED')"),
    is_agency_trip: Optional[bool] = Query(None, description="Filter by agency trips"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
):
    """
    Search for trips with multiple optional filters.
    This endpoint allows for a combination of search criteria to find specific trips.
    """
    return await service.search_trips(
        name=name,
        season=season,
        min_price=min_price,
        max_price=max_price,
        status=status,
        is_agency_trip=is_agency_trip,
        tags=tags
    )

@router.get("/statistics", response_model=Dict[str, Any])
async def get_trip_statistics():
    """
    Get aggregated statistics about the trips in the database.
    This includes total count, average price, price range, and status distribution.
    """
   
    conn = await service.get_connection()
    try:
        total_count = await conn.fetchval('SELECT COUNT(*) FROM "Trip"')
        avg_price = await conn.fetchval('SELECT AVG(price) FROM "Trip" WHERE price IS NOT NULL')
        price_stats = await conn.fetchrow('SELECT MIN(price) as min_price, MAX(price) as max_price FROM "Trip" WHERE price IS NOT NULL')
        status_distribution_rows = await conn.fetch('SELECT status, COUNT(*) as count FROM "Trip" GROUP BY status')
        season_distribution_rows = await conn.fetch('SELECT season, COUNT(*) as count FROM "Trip" GROUP BY season')

        return {
            "success": True,
            "statistics": {
                "total_trips": total_count,
                "average_price": round(avg_price, 2) if avg_price else 0,
                "min_price": price_stats['min_price'] if price_stats else 0,
                "max_price": price_stats['max_price'] if price_stats else 0,
                "status_distribution": {row['status']: row['count'] for row in status_distribution_rows},
                "season_distribution": {row['season']: row['count'] for row in season_distribution_rows}
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trip statistics: {str(e)}")
    finally:
        if conn:
            await conn.close()


@router.get("/status/{status}", response_model=Dict[str, Any])
async def get_trips_by_status(
    status: str
):
    """
    Get a list of trips filtered by their status (e.g., PENDING, APPROVED, REJECTED).
    """
    return await service.get_trips_by_status(status)

@router.get("/creator/{creator_id}", response_model=Dict[str, Any])
async def get_trips_by_creator(
    creator_id: str
):
    """
    Get all trips created by a specific user ID.
    """
    return await service.get_trips_by_creator(creator_id)

@router.get("/name-search/{name}", response_model=Dict[str, Any])
async def get_trips_by_name(
    name: str
):
    """
    Search for trips by a keyword in their name or description.
    Note: The more advanced '/search' endpoint is generally recommended.
    """
    return await service.get_trips_by_name(name)

@router.get("/{trip_id}", response_model=Dict[str, Any])
async def get_trip_by_id(
    trip_id: str
):
    """
    Retrieve a single trip by its unique ID, including its reservations.
    """
    return await service.get_trip_by_id(trip_id)
