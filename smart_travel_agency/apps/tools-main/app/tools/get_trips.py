import os
import asyncpg
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
import json
from datetime import datetime, date

class TripsService:
    def __init__(self):
        self.database_url = "postgresql://neondb_owner:npg_NeY0xvjPiR2K@ep-dawn-term-a8acacq1.eastus2.azure.neon.tech/neondb?sslmode=require"
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")
    
    async def get_connection(self):
        """Get database connection."""
        try:
            return await asyncpg.connect(self.database_url)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
    
    async def get_all_trips(self) -> List[Dict[str, Any]]:
        """Get all trips from database."""
        conn = None
        try:
            conn = await self.get_connection()
            
            query = """
                SELECT 
                    t.*,
                    u.name as creator_name,
                    u.email as creator_email,
                    ta."availableSeats",
                    ta.status as availability_status,
                    COUNT(r.id) as total_reservations
                FROM "Trip" t
                LEFT JOIN "User" u ON t."creatorId" = u.id
                LEFT JOIN "TripAvailability" ta ON t.id = ta."tripId"
                LEFT JOIN "Reservation" r ON t.id = r."tripId"
                GROUP BY t.id, u.name, u.email, ta."availableSeats", ta.status
                ORDER BY t."createdAt" DESC
            """
            
            rows = await conn.fetch(query)
            
            trips = []
            for row in rows:
                trip_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in trip_dict.items():
                    if isinstance(value, (datetime, date)):
                        trip_dict[key] = value.isoformat()
                trips.append(trip_dict)
            
            return {
                "success": True,
                "count": len(trips),
                "trips": trips
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching trips: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_trip_by_id(self, trip_id: str) -> Dict[str, Any]:
        """Get a specific trip by ID."""
        conn = None
        try:
            conn = await self.get_connection()
            
            query = """
                SELECT 
                    t.*,
                    u.name as creator_name,
                    u.email as creator_email,
                    ta."availableSeats",
                    ta.status as availability_status,
                    COUNT(r.id) as total_reservations
                FROM "Trip" t
                LEFT JOIN "User" u ON t."creatorId" = u.id
                LEFT JOIN "TripAvailability" ta ON t.id = ta."tripId"
                LEFT JOIN "Reservation" r ON t.id = r."tripId"
                WHERE t.id = $1
                GROUP BY t.id, u.name, u.email, ta."availableSeats", ta.status
            """
            row = await conn.fetchrow(query, trip_id)
            
            if not row:
                raise HTTPException(status_code=404, detail=f"Trip with ID {trip_id} not found")
            
            trip_dict = dict(row)
            # Convert any datetime objects to strings
            for key, value in trip_dict.items():
                if isinstance(value, (datetime, date)):
                    trip_dict[key] = value.isoformat()
            
            # Get reservations for this trip
            reservations_query = """
                SELECT 
                    r.*,
                    u.name as user_name,
                    u.email as user_email,
                    p.amount as payment_amount,
                    p.status as payment_status
                FROM "Reservation" r
                LEFT JOIN "User" u ON r."userId" = u.id
                LEFT JOIN "Payment" p ON r.id = p."reservationId"
                WHERE r."tripId" = $1
                ORDER BY r."createdAt" DESC
            """
            
            reservation_rows = await conn.fetch(reservations_query, trip_id)
            reservations = []
            for res_row in reservation_rows:
                res_dict = dict(res_row)
                for key, value in res_dict.items():
                    if isinstance(value, (datetime, date)):
                        res_dict[key] = value.isoformat()
                reservations.append(res_dict)
            
            trip_dict["reservations"] = reservations
            
            return {
                "success": True,
                "trip": trip_dict
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching trip: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_trips_by_creator(self, creator_id: str) -> List[Dict[str, Any]]:
        """Get trips by creator ID."""
        conn = None
        try:
            conn = await self.get_connection()
            
            query = """
                SELECT 
                    t.*,
                    u.name as creator_name,
                    u.email as creator_email,
                    ta."availableSeats",
                    ta.status as availability_status,
                    COUNT(r.id) as total_reservations
                FROM "Trip" t
                LEFT JOIN "User" u ON t."creatorId" = u.id
                LEFT JOIN "TripAvailability" ta ON t.id = ta."tripId"
                LEFT JOIN "Reservation" r ON t.id = r."tripId"
                WHERE t."creatorId" = $1
                GROUP BY t.id, u.name, u.email, ta."availableSeats", ta.status
                ORDER BY t."createdAt" DESC
            """
            
            rows = await conn.fetch(query, creator_id)
            
            trips = []
            for row in rows:
                trip_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in trip_dict.items():
                    if isinstance(value, (datetime, date)):
                        trip_dict[key] = value.isoformat()
                trips.append(trip_dict)
            
            return {
                "success": True,
                "creator_id": creator_id,
                "count": len(trips),
                "trips": trips
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching trips for creator {creator_id}: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_trips_by_name(self, name: str) -> List[Dict[str, Any]]:
        """Get trips by name (search)."""
        conn = None
        try:
            conn = await self.get_connection()
            
            query = """
                SELECT 
                    t.*,
                    u.name as creator_name,
                    u.email as creator_email,
                    ta."availableSeats",
                    ta.status as availability_status,
                    COUNT(r.id) as total_reservations
                FROM "Trip" t
                LEFT JOIN "User" u ON t."creatorId" = u.id
                LEFT JOIN "TripAvailability" ta ON t.id = ta."tripId"
                LEFT JOIN "Reservation" r ON t.id = r."tripId"
                WHERE LOWER(t.name) LIKE LOWER($1) OR LOWER(t.description) LIKE LOWER($1)
                GROUP BY t.id, u.name, u.email, ta."availableSeats", ta.status
                ORDER BY t."createdAt" DESC
            """
            
            name_pattern = f"%{name}%"
            rows = await conn.fetch(query, name_pattern)
            
            trips = []
            for row in rows:
                trip_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in trip_dict.items():
                    if isinstance(value, (datetime, date)):
                        trip_dict[key] = value.isoformat()
                trips.append(trip_dict)
            
            return {
                "success": True,
                "search_term": name,
                "count": len(trips),
                "trips": trips
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error searching trips by name {name}: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_trips_by_status(self, status: str) -> List[Dict[str, Any]]:
        """Get trips by status."""
        conn = None
        try:
            conn = await self.get_connection()
            
            # Validate status
            valid_statuses = ['PENDING', 'APPROVED', 'REJECTED']
            if status.upper() not in valid_statuses:
                raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
            
            query = """
                SELECT 
                    t.*,
                    u.name as creator_name,
                    u.email as creator_email,
                    ta."availableSeats",
                    ta.status as availability_status,
                    COUNT(r.id) as total_reservations
                FROM "Trip" t
                LEFT JOIN "User" u ON t."creatorId" = u.id
                LEFT JOIN "TripAvailability" ta ON t.id = ta."tripId"
                LEFT JOIN "Reservation" r ON t.id = r."tripId"
                WHERE t.status = $1
                GROUP BY t.id, u.name, u.email, ta."availableSeats", ta.status
                ORDER BY t."createdAt" DESC
            """
            
            rows = await conn.fetch(query, status.upper())
            
            trips = []
            for row in rows:
                trip_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in trip_dict.items():
                    if isinstance(value, (datetime, date)):
                        trip_dict[key] = value.isoformat()
                trips.append(trip_dict)
            
            return {
                "success": True,
                "status": status.upper(),
                "count": len(trips),
                "trips": trips
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching trips by status {status}: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def search_trips(self, 
                          name: Optional[str] = None,
                          season: Optional[str] = None,
                          min_price: Optional[int] = None,
                          max_price: Optional[int] = None,
                          status: Optional[str] = None,
                          is_agency_trip: Optional[bool] = None,
                          tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Search trips with multiple filters."""
        conn = None
        try:
            conn = await self.get_connection()
            
            # Build dynamic query
            conditions = []
            params = []
            param_count = 0
            
            if name:
                param_count += 1
                conditions.append(f"(LOWER(t.name) LIKE LOWER(${param_count}) OR LOWER(t.description) LIKE LOWER(${param_count}))")
                params.append(f"%{name}%")
            
            if season:
                param_count += 1
                conditions.append(f"LOWER(t.season) = LOWER(${param_count})")
                params.append(season)
            
            if min_price is not None:
                param_count += 1
                conditions.append(f"t.price >= ${param_count}")
                params.append(min_price)
            
            if max_price is not None:
                param_count += 1
                conditions.append(f"t.price <= ${param_count}")
                params.append(max_price)
            
            if status:
                param_count += 1
                conditions.append(f"t.status = ${param_count}")
                params.append(status.upper())
            
            if is_agency_trip is not None:
                param_count += 1
                conditions.append(f't."isAgencyTrip" = ${param_count}')
                params.append(is_agency_trip)
            
            # Build the query
            where_clause = " AND ".join(conditions) if conditions else "1=1"
            
            query = f"""
                SELECT 
                    t.*,
                    u.name as creator_name,
                    u.email as creator_email,
                    ta."availableSeats",
                    ta.status as availability_status,
                    COUNT(r.id) as total_reservations
                FROM "Trip" t
                LEFT JOIN "User" u ON t."creatorId" = u.id
                LEFT JOIN "TripAvailability" ta ON t.id = ta."tripId"
                LEFT JOIN "Reservation" r ON t.id = r."tripId"
                WHERE {where_clause}
                GROUP BY t.id, u.name, u.email, ta."availableSeats", ta.status
                ORDER BY t.price ASC, t."createdAt" DESC
            """
            
            rows = await conn.fetch(query, *params)
            
            trips = []
            for row in rows:
                trip_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in trip_dict.items():
                    if isinstance(value, (datetime, date)):
                        trip_dict[key] = value.isoformat()
                
                # Filter by tags if specified
                if tags and trip_dict.get('tags'):
                    trip_tags = trip_dict['tags']
                    if not any(tag.lower() in [t.lower() for t in trip_tags] for tag in tags):
                        continue
                
                trips.append(trip_dict)
            
            return {
                "success": True,
                "filters": {
                    "name": name,
                    "season": season,
                    "min_price": min_price,
                    "max_price": max_price,
                    "status": status,
                    "is_agency_trip": is_agency_trip,
                    "tags": tags
                },
                "count": len(trips),
                "trips": trips
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error searching trips: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_trip_statistics(self) -> Dict[str, Any]:
        """Get statistics about trips in database."""
        conn = None
        try:
            conn = await self.get_connection()
            
            # Get total count
            total_count = await conn.fetchval('SELECT COUNT(*) FROM "Trip"')
            
            # Get average price
            avg_price = await conn.fetchval('SELECT AVG(price) FROM "Trip" WHERE price IS NOT NULL')
            
            # Get price range
            price_stats = await conn.fetchrow("""
                SELECT 
                    MIN(price) as min_price,
                    MAX(price) as max_price
                FROM "Trip" 
                WHERE price IS NOT NULL
            """)
            
            # Get status distribution
            status_distribution = await conn.fetch("""
                SELECT status, COUNT(*) as count 
                FROM "Trip" 
                GROUP BY status 
                ORDER BY count DESC
            """)
            status_dist = {row['status']: row['count'] for row in status_distribution}
            # Get season distribution
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching trip statistics: {str(e)}")    
            
            # Get season distribution