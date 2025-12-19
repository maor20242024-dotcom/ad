// Simple test script
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oaposzfjmcnrmtytdcoy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcG9zemZqbWNucm10eXRkY295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDQ3MTEsImV4cCI6MjA3NTQyMDcxMX0.c-M7w-xqlafNWD7CHYFo3niUxFvoA4Dp7WAwZR1RgP0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  try {
    console.log('Testing Supabase connection...')
    
    const { data, error } = await supabase
      .from('consultations')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Success! Connection works.')
      console.log('Lead count:', data)
    }
  } catch (err) {
    console.error('Test failed:', err)
  }
}

test()