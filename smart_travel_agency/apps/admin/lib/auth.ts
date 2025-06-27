import { supabase } from "./supabase"

export interface User {
  id: string
  email: string
  name?: string
  role: "User" | "Vendeur" | "Admin"
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: "User",
      },
    },
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Add a helper function to verify password (for development/testing)
export const verifyPassword = async (plainPassword: string, hashedPassword: string) => {
  // In a real application, you would use bcrypt to compare passwords
  // For development purposes, we'll use a simple comparison
  // The hash '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' corresponds to password '1234567'

  if (
    plainPassword === "1234567" &&
    hashedPassword === "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
  ) {
    return true
  }

  // In production, use bcrypt:
  // const bcrypt = require('bcrypt');
  // return await bcrypt.compare(plainPassword, hashedPassword);

  return false
}

// Add a development login function
export const devSignIn = async (email: string, password: string) => {
  // This is for development purposes only
  if (email === "soyed.dev@gmail.com" && password === "1234567") {
    return {
      user: {
        id: "550e8400-e29b-41d4-a716-446655440006",
        email: "soyed.dev@gmail.com",
        name: "Soyed Developer",
        role: "Admin",
      },
    }
  }

  throw new Error("Invalid credentials")
}
