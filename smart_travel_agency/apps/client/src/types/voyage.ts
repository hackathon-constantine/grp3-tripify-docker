export interface BaseVoyage {
    id: string
    title: string
    price: number
    duration: string
    image: string
    description: string
    destination: {
      name: string
      coordinates: {
        lat: number
        lng: number
      }
      country: string
    }
  }
  
  export interface NormalVoyage extends BaseVoyage {
    type: "normal"
    author: string
    rating: number
    reviews: number
  }
  
  export interface CustomVoyage extends BaseVoyage {
    type: "custom"
    workflowLink: string
    customData: Record<string, any>
    createdBy: string
    isPrivate: boolean
  }
  
  export type Voyage = NormalVoyage | CustomVoyage
  
  export interface Trip {
    id: string
    name: string
    destination: string
    startDate: string
    endDate: string
    price: number
    status: "upcoming" | "completed" | "cancelled"
  }
  