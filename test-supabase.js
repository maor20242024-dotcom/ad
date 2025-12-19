// Test script for Supabase connection
import { supabase } from './src/lib/supabase.js'

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('consultations').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Connection failed:', error)
    } else {
      console.log('Connection successful! Table exists.')
      console.log('Current lead count:', data)
    }
  } catch (err) {
    console.error('Test failed:', err)
  }
}

testConnection()