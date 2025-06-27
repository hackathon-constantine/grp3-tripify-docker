import os
import asyncpg
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
import json
from datetime import datetime, date

class HotelsService:
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
    
    async def get_all_hotels(self) -> List[Dict[str, Any]]:
        """Get all hotels from database."""
        conn = None
        try:
            conn = await self.get_connection()
            
            query = """
                SELECT 
                    h.*,
                    d.name as destination_name,
                    d.description as destination_description
                FROM "Hotel" h
                LEFT JOIN "Destination" d ON h."destinationId" = d.id
                ORDER BY h."createdAt" DESC
            """
            
            rows = await conn.fetch(query)
            
            hotels = []
            for row in rows:
                hotel_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in hotel_dict.items():
                    if isinstance(value, (datetime, date)):
                        hotel_dict[key] = value.isoformat()
                hotels.append(hotel_dict)
            
            return {
                "success": True,
                "count": len(hotels),
                "hotels": hotels
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching hotels: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_hotel_by_id(self, hotel_id: str) -> Dict[str, Any]:
        """Get a specific hotel by ID."""
        conn = None
        try:
            conn = await self.get_connection()
            
            query = """
                SELECT 
                    h.*,
                    d.name as destination_name,
                    d.description as destination_description,
                    d."imageUrl" as destination_image_url
                FROM "Hotel" h
                LEFT JOIN "Destination" d ON h."destinationId" = d.id
                WHERE h.id = $1
            """
            row = await conn.fetchrow(query, hotel_id)
            
            if not row:
                raise HTTPException(status_code=404, detail=f"Hotel with ID {hotel_id} not found")
            
            hotel_dict = dict(row)
            # Convert any datetime objects to strings
            for key, value in hotel_dict.items():
                if isinstance(value, (datetime, date)):
                    hotel_dict[key] = value.isoformat()
            
            return {
                "success": True,
                "hotel": hotel_dict
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching hotel: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_hotels_by_destination(self, destination_name: str) -> List[Dict[str, Any]]:
        """Get hotels by destination name."""
        conn = None
        try:
            conn = await self.get_connection()
            
            query = """
                SELECT 
                    h.*,
                    d.name as destination_name,
                    d.description as destination_description,
                    d."imageUrl" as destination_image_url
                FROM "Hotel" h
                LEFT JOIN "Destination" d ON h."destinationId" = d.id
                WHERE LOWER(d.name) LIKE LOWER($1) OR LOWER(h.name) LIKE LOWER($1)
                ORDER BY h.stars DESC NULLS LAST, h.price ASC
            """
            
            destination_pattern = f"%{destination_name}%"
            rows = await conn.fetch(query, destination_pattern)
            
            hotels = []
            for row in rows:
                hotel_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in hotel_dict.items():
                    if isinstance(value, (datetime, date)):
                        hotel_dict[key] = value.isoformat()
                hotels.append(hotel_dict)
            
            return {
                "success": True,
                "destination": destination_name,
                "count": len(hotels),
                "hotels": hotels
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching hotels for destination {destination_name}: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_hotels_by_price_range(self, min_price: Optional[int] = None, max_price: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get hotels by price range."""
        conn = None
        try:
            conn = await self.get_connection()
            
            conditions = []
            params = []
            param_count = 0
            
            if min_price is not None:
                param_count += 1
                conditions.append(f'h.price >= ${param_count}')
                params.append(min_price)
            
            if max_price is not None:
                param_count += 1
                conditions.append(f'h.price <= ${param_count}')
                params.append(max_price)
            
            where_clause = " AND ".join(conditions) if conditions else "1=1"
            
            query = f"""
                SELECT 
                    h.*,
                    d.name as destination_name,
                    d.description as destination_description
                FROM "Hotel" h
                LEFT JOIN "Destination" d ON h."destinationId" = d.id
                WHERE {where_clause}
                ORDER BY h.price ASC
            """
            
            rows = await conn.fetch(query, *params)
            
            hotels = []
            for row in rows:
                hotel_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in hotel_dict.items():
                    if isinstance(value, (datetime, date)):
                        hotel_dict[key] = value.isoformat()
                hotels.append(hotel_dict)
            
            return {
                "success": True,
                "filters": {
                    "min_price": min_price,
                    "max_price": max_price
                },
                "count": len(hotels),
                "hotels": hotels
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching hotels by price range: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_hotels_by_stars(self, stars: int) -> List[Dict[str, Any]]:
        """Get hotels by star rating."""
        conn = None
        try:
            conn = await self.get_connection()
            
            query = """
                SELECT 
                    h.*,
                    d.name as destination_name,
                    d.description as destination_description
                FROM "Hotel" h
                LEFT JOIN "Destination" d ON h."destinationId" = d.id
                WHERE h.stars = $1
                ORDER BY h.price ASC
            """
            
            rows = await conn.fetch(query, stars)
            
            hotels = []
            for row in rows:
                hotel_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in hotel_dict.items():
                    if isinstance(value, (datetime, date)):
                        hotel_dict[key] = value.isoformat()
                hotels.append(hotel_dict)
            
            return {
                "success": True,
                "star_rating": stars,
                "count": len(hotels),
                "hotels": hotels
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching hotels by stars: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def search_hotels(self, 
                          destination: Optional[str] = None,
                          min_price: Optional[int] = None,
                          max_price: Optional[int] = None,
                          min_stars: Optional[int] = None,
                          activities: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Search hotels with multiple filters."""
        conn = None
        try:
            conn = await self.get_connection()
            
            # Build dynamic query
            conditions = []
            params = []
            param_count = 0
            
            if destination:
                param_count += 1
                conditions.append(f"(LOWER(d.name) LIKE LOWER(${param_count}) OR LOWER(h.name) LIKE LOWER(${param_count}))")
                params.append(f"%{destination}%")
            
            if min_price is not None:
                param_count += 1
                conditions.append(f"h.price >= ${param_count}")
                params.append(min_price)
            
            if max_price is not None:
                param_count += 1
                conditions.append(f"h.price <= ${param_count}")
                params.append(max_price)
            
            if min_stars is not None:
                param_count += 1
                conditions.append(f"h.stars >= ${param_count}")
                params.append(min_stars)
            
            # Build the query
            where_clause = " AND ".join(conditions) if conditions else "1=1"
            
            query = f"""
                SELECT 
                    h.*,
                    d.name as destination_name,
                    d.description as destination_description
                FROM "Hotel" h
                LEFT JOIN "Destination" d ON h."destinationId" = d.id
                WHERE {where_clause}
                ORDER BY h.stars DESC NULLS LAST, h.price ASC
            """
            
            rows = await conn.fetch(query, *params)
            
            hotels = []
            for row in rows:
                hotel_dict = dict(row)
                # Convert any datetime objects to strings
                for key, value in hotel_dict.items():
                    if isinstance(value, (datetime, date)):
                        hotel_dict[key] = value.isoformat()
                        
                # Filter by activities if specified
                if activities and hotel_dict.get('activities'):
                    hotel_activities = hotel_dict['activities']
                    if not any(activity.lower() in [a.lower() for a in hotel_activities] for activity in activities):
                        continue
                
                hotels.append(hotel_dict)
            
            return {
                "success": True,
                "filters": {
                    "destination": destination,
                    "min_price": min_price,
                    "max_price": max_price,
                    "min_stars": min_stars,
                    "activities": activities
                },
                "count": len(hotels),
                "hotels": hotels
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error searching hotels: {str(e)}")
        finally:
            if conn:
                await conn.close()
    
    async def get_hotel_statistics(self) -> Dict[str, Any]:
        """Get statistics about hotels in database."""
        conn = None
        try:
            conn = await self.get_connection()
            
            # Get total count
            total_count = await conn.fetchval('SELECT COUNT(*) FROM "Hotel"')
            
            # Get average price
            avg_price = await conn.fetchval('SELECT AVG(price) FROM "Hotel" WHERE price IS NOT NULL')
            
            # Get price range
            price_stats = await conn.fetchrow("""
                SELECT 
                    MIN(price) as min_price,
                    MAX(price) as max_price
                FROM "Hotel" 
                WHERE price IS NOT NULL
            """)
            
            # Get star distribution
            star_distribution = await conn.fetch("""
                SELECT stars, COUNT(*) as count 
                FROM "Hotel" 
                WHERE stars IS NOT NULL 
                GROUP BY stars 
                ORDER BY stars DESC
            """)
            
            # Get top destinations by hotel count
            top_destinations = await conn.fetch("""
                SELECT d.name, COUNT(h.id) as hotel_count 
                FROM "Destination" d
                LEFT JOIN "Hotel" h ON d.id = h."destinationId"
                WHERE d.name IS NOT NULL 
                GROUP BY d.name 
                ORDER BY hotel_count DESC 
                LIMIT 10
            """)
            
            return {
                "success": True,
                "statistics": {
                    "total_hotels": total_count,
                    "average_price": float(avg_price) if avg_price else None,
                    "price_range": {
                        "min_price": int(price_stats["min_price"]) if price_stats["min_price"] else None,
                        "max_price": int(price_stats["max_price"]) if price_stats["max_price"] else None
                    },
                    "star_distribution": [{"stars": row["stars"], "count": row["count"]} for row in star_distribution],
                    "top_destinations": [{"destination": row["name"], "hotel_count": row["hotel_count"]} for row in top_destinations]
                }
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching hotel statistics: {str(e)}")
        finally:
            if conn:
                await conn.close()