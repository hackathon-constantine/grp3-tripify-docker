"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, MapPin, Thermometer, Cloud } from "lucide-react"

const destinations = [
  {
    id: "DEST001",
    name: "Tassili N'Ajjer National Park",
    description:
      "UNESCO World Heritage site featuring prehistoric rock art and stunning sandstone formations in the Sahara Desert.",
    price: 85000,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    weather: { temperature: 32, condition: "Sunny", humidity: "12%" },
    trips: 3,
    status: "Active",
  },
  {
    id: "DEST002",
    name: "Hoggar Mountains",
    description: "Majestic volcanic mountain range in southern Algeria, home to Mount Tahat and rich Tuareg culture.",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    weather: { temperature: 28, condition: "Clear", humidity: "18%" },
    trips: 2,
    status: "Active",
  },
  {
    id: "DEST003",
    name: "Casbah of Algiers",
    description: "Historic UNESCO World Heritage citadel with Ottoman palaces and traditional Islamic architecture.",
    price: 35000,
    imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop",
    weather: { temperature: 24, condition: "Partly Cloudy", humidity: "65%" },
    trips: 4,
    status: "Active",
  },
  {
    id: "DEST004",
    name: "Timgad Archaeological Site",
    description: "Best-preserved Roman city in North Africa, featuring ancient theater, forum, and triumphal arch.",
    price: 65000,
    imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop",
    weather: { temperature: 26, condition: "Sunny", humidity: "35%" },
    trips: 2,
    status: "Active",
  },
  {
    id: "DEST005",
    name: "M'zab Valley",
    description:
      "UNESCO site with five fortified cities showcasing unique Mozabite architecture and Ibadi Islamic culture.",
    price: 75000,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    weather: { temperature: 30, condition: "Hot", humidity: "20%" },
    trips: 1,
    status: "Active",
  },
  {
    id: "DEST006",
    name: "Constantine",
    description:
      "The 'City of Bridges' dramatically perched on rocky plateaus with spectacular gorges and historic architecture.",
    price: 40000,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    weather: { temperature: 22, condition: "Mild", humidity: "50%" },
    trips: 3,
    status: "Active",
  },
]

export default function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredDestinations = destinations.filter(
    (destination) =>
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destinations Management</h1>
          <p className="text-gray-600">Manage travel destinations and their information</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Destination</DialogTitle>
                <DialogDescription>Create a new travel destination with details and pricing.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dest-name" className="text-right">
                    Name
                  </Label>
                  <Input id="dest-name" className="col-span-3" placeholder="Destination name" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dest-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="dest-description"
                    className="col-span-3"
                    placeholder="Destination description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dest-price" className="text-right">
                    Price (DZD)
                  </Label>
                  <Input id="dest-price" type="number" className="col-span-3" placeholder="0" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dest-image" className="text-right">
                    Image URL
                  </Label>
                  <Input id="dest-image" className="col-span-3" placeholder="https://..." />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Destination
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDestinations.map((destination) => (
          <Card key={destination.id} className="border-gray-200 overflow-hidden">
            <div className="relative h-48">
              <img
                src={destination.imageUrl || "/placeholder.svg"}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-100 text-green-800">{destination.status}</Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                {destination.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">{destination.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">{destination.price.toLocaleString()} DZD</div>
                  <div className="text-sm text-gray-600">{destination.trips} trips</div>
                </div>

                {/* Weather Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-4 w-4" />
                    <span>{destination.weather.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Cloud className="h-4 w-4" />
                    <span>{destination.weather.condition}</span>
                  </div>
                  <div>
                    <span>{destination.weather.humidity} humidity</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDestination(destination)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Edit Destination</DialogTitle>
                          <DialogDescription>Update destination details and information.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                              Name
                            </Label>
                            <Input id="edit-name" className="col-span-3" defaultValue={selectedDestination?.name} />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-description" className="text-right">
                              Description
                            </Label>
                            <Textarea
                              id="edit-description"
                              className="col-span-3"
                              defaultValue={selectedDestination?.description}
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-price" className="text-right">
                              Price (DZD)
                            </Label>
                            <Input
                              id="edit-price"
                              type="number"
                              className="col-span-3"
                              defaultValue={selectedDestination?.price}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Update Destination
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
