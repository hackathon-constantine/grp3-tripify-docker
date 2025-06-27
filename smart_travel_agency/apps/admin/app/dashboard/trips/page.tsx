"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, DollarSign, Edit, Trash2, Eye, Loader2, AlertCircle, Plane, AlertTriangle } from "lucide-react"
import { tripsAPI, type Trip } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)
  const [tripDependencies, setTripDependencies] = useState<any[]>([])
  const [checkingDependencies, setCheckingDependencies] = useState(false)
  const { toast } = useToast()

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    season: "",
    tags: "",
    image_url: "",
    creator_id: "550e8400-e29b-41d4-a716-446655440006", // Default admin user
  })

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    season: "",
    tags: "",
    image_url: "",
  })

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      setLoading(true)
      console.log("Loading trips...")
      const data = await tripsAPI.getAll()
      setTrips(data)

      // Check if we're using mock data (mock data has specific IDs)
      const isMock = data.some((trip) => trip.id.startsWith("750e8400-e29b-41d4-a716-446655440010"))
      setUsingMockData(isMock)

      if (isMock) {
        toast({
          title: "Using Sample Data",
          description: "Database connection limited. Showing sample trips for demonstration.",
          variant: "default",
        })
      } else {
        console.log(`Loaded ${data.length} trips from database`)
      }
    } catch (error) {
      console.error("Failed to load trips:", error)
      toast({
        title: "Error",
        description: "Failed to load trips. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Creating new trip with form data:", createForm)

      // Validate required fields
      if (!createForm.name || !createForm.description || !createForm.price || !createForm.duration) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const tripData = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        price: Number.parseInt(createForm.price),
        duration: createForm.duration.trim(),
        season: createForm.season.trim() || "All Year",
        tags: createForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        image_url: createForm.image_url.trim() || null,
        creator_id: createForm.creator_id,
        is_agency_trip: true,
      }

      console.log("Processed trip data:", tripData)

      const newTrip = await tripsAPI.create(tripData)
      console.log("Trip created successfully:", newTrip)

      toast({
        title: "Success",
        description: "Trip created successfully",
      })

      setIsCreateDialogOpen(false)
      setCreateForm({
        name: "",
        description: "",
        price: "",
        duration: "",
        season: "",
        tags: "",
        image_url: "",
        creator_id: "550e8400-e29b-41d4-a716-446655440006",
      })

      // Reload trips to show the new one
      await loadTrips()
    } catch (error) {
      console.error("Failed to create trip:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create trip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTrip) return

    setIsSubmitting(true)

    try {
      console.log("Updating trip:", selectedTrip.id, editForm)

      const tripData = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: Number.parseInt(editForm.price),
        duration: editForm.duration.trim(),
        season: editForm.season.trim(),
        tags: editForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        image_url: editForm.image_url.trim() || null,
      }

      await tripsAPI.update(selectedTrip.id, tripData)

      toast({
        title: "Success",
        description: "Trip updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedTrip(null)

      // Reload trips to show the updated data
      await loadTrips()
    } catch (error) {
      console.error("Failed to update trip:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update trip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = async (trip: Trip) => {
    setTripToDelete(trip)
    setCheckingDependencies(true)
    setDeleteDialogOpen(true)

    try {
      // Check for dependencies
      const { reservations, error } = await tripsAPI.checkTripDependencies(trip.id)

      if (error) {
        console.error("Error checking dependencies:", error)
        setTripDependencies([])
      } else {
        setTripDependencies(reservations)
      }
    } catch (error) {
      console.error("Exception checking dependencies:", error)
      setTripDependencies([])
    } finally {
      setCheckingDependencies(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return

    setIsSubmitting(true)

    try {
      console.log("Deleting trip:", tripToDelete.id)
      await tripsAPI.delete(tripToDelete.id)

      toast({
        title: "Success",
        description: "Trip deleted successfully",
      })

      setDeleteDialogOpen(false)
      setTripToDelete(null)
      setTripDependencies([])

      // Reload trips to remove the deleted one
      await loadTrips()
    } catch (error) {
      console.error("Failed to delete trip:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete trip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (trip: Trip) => {
    console.log("Opening edit dialog for trip:", trip)
    setSelectedTrip(trip)
    setEditForm({
      name: trip.name,
      description: trip.description,
      price: trip.price.toString(),
      duration: trip.duration,
      season: trip.season,
      tags: trip.tags.join(", "),
      image_url: trip.image_url || "",
    })
    setIsEditDialogOpen(true)
  }

  const activeReservations = tripDependencies.filter((r) => r.status !== "CANCELLED")
  const canDelete = activeReservations.length === 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading trips...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trips Management</h1>
          <p className="text-gray-600">Create and manage travel packages and destinations</p>
          {usingMockData && (
            <div className="flex items-center gap-2 mt-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Currently showing sample data</span>
            </div>
          )}
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateTrip}>
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
                <DialogDescription>Add a new travel package to your offerings.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trip-name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="trip-name"
                    className="col-span-3"
                    placeholder="Trip name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trip-description" className="text-right">
                    Description *
                  </Label>
                  <Textarea
                    id="trip-description"
                    className="col-span-3"
                    placeholder="Trip description"
                    rows={3}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trip-price" className="text-right">
                    Price (DZD) *
                  </Label>
                  <Input
                    id="trip-price"
                    type="number"
                    className="col-span-3"
                    placeholder="0"
                    min="1"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trip-duration" className="text-right">
                    Duration *
                  </Label>
                  <Input
                    id="trip-duration"
                    className="col-span-3"
                    placeholder="e.g., 3 days"
                    value={createForm.duration}
                    onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trip-season" className="text-right">
                    Season
                  </Label>
                  <Input
                    id="trip-season"
                    className="col-span-3"
                    placeholder="e.g., All Year, Winter, Spring-Summer"
                    value={createForm.season}
                    onChange={(e) => setCreateForm({ ...createForm, season: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trip-tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="trip-tags"
                    className="col-span-3"
                    placeholder="UNESCO, History, Culture (comma separated)"
                    value={createForm.tags}
                    onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trip-image" className="text-right">
                    Image URL
                  </Label>
                  <Input
                    id="trip-image"
                    className="col-span-3"
                    placeholder="https://..."
                    value={createForm.image_url}
                    onChange={(e) => setCreateForm({ ...createForm, image_url: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Trip
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {trips.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="text-center py-8">
            <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first trip package.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="border-gray-200 overflow-hidden">
              <div className="relative h-48">
                <img
                  src={trip.image_url || "/placeholder.svg?height=200&width=300"}
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">{trip.name}</CardTitle>
                <CardDescription className="line-clamp-3">{trip.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{trip.price.toLocaleString()} DZD</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{trip.duration}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {trip.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(trip)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(trip)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {trip.season}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Trip
            </AlertDialogTitle>
            <AlertDialogDescription>
              {checkingDependencies ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking for existing reservations...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p>Are you sure you want to delete "{tripToDelete?.name}"?</p>

                  {tripDependencies.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm font-medium text-yellow-800 mb-2">
                        This trip has {tripDependencies.length} reservation(s):
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {tripDependencies.slice(0, 3).map((reservation) => (
                          <li key={reservation.id} className="flex items-center justify-between">
                            <span>{reservation.full_name}</span>
                            <Badge
                              variant="outline"
                              className={
                                reservation.status === "CONFIRMED"
                                  ? "border-green-300 text-green-700"
                                  : reservation.status === "PENDING"
                                    ? "border-yellow-300 text-yellow-700"
                                    : "border-gray-300 text-gray-700"
                              }
                            >
                              {reservation.status}
                            </Badge>
                          </li>
                        ))}
                        {tripDependencies.length > 3 && (
                          <li className="text-xs">...and {tripDependencies.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {!canDelete && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">
                        Cannot delete this trip because it has {activeReservations.length} active reservation(s). Please
                        cancel or transfer these reservations first.
                      </p>
                    </div>
                  )}

                  {canDelete && tripDependencies.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">
                        Only cancelled reservations found. These will be permanently deleted along with the trip.
                      </p>
                    </div>
                  )}

                  {canDelete && <p className="text-sm text-red-600 font-medium">This action cannot be undone.</p>}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={!canDelete || isSubmitting || checkingDependencies}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Trip"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleUpdateTrip}>
            <DialogHeader>
              <DialogTitle>Edit Trip</DialogTitle>
              <DialogDescription>Update trip details and information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  className="col-span-3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  required
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
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="edit-duration"
                  className="col-span-3"
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-season" className="text-right">
                  Season
                </Label>
                <Input
                  id="edit-season"
                  className="col-span-3"
                  value={editForm.season}
                  onChange={(e) => setEditForm({ ...editForm, season: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="edit-tags"
                  className="col-span-3"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Trip
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
