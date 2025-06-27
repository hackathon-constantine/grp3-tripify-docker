export interface Trip {
  id: number;
  title: string;
  author: string;
  price: number;
  duration: string;
  rating: number;
  image: string;
  description: string;
  reviews: number;
}

export interface Todo {
  id: number;
  task: string;
  assignee: string;
  priority: "Low" | "Medium" | "High";
}

export interface TimelineEvent {
  time: string;
  type: "flight" | "transfer" | "hotel";
  title: string;
  subtitle: string;
}

export interface CalendarDay {
  day: number;
  month: "current" | "next";
}
type UserRoles = ["User","Admin"]
export interface User {
  credits: number;
  name: string;
  email: string;
 
  avatar?: string;
}

export interface BookingCalculation {
  tripCost: number;
  taxes: number;
  discount: number;
  totalCost: number;
}
