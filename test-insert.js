// Test data insertion
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oaposzfjmcnrmtytdcoy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcG9zemZqbWNucm10eXRkY295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDQ3MTEsImV4cCI6MjA3NTQyMDcxMX0.c-M7w-xqlafNWD7CHYFo3niUxFvoA4Dp7WAwZR1RgP0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDataInsertion() {
  try {
    console.log('Testing data insertion...')
    
    const testData = {
      name: "Test User",
      phone: "+971501234567",
      email: "test@example.com",
      source: "instagram",
      sourcePlatform: "instagram",
      sourceType: "Video",
      sourceUrl: "https://test.com",
      marketingChannel: "instagram_ad",
      pageSlug: "instagram_landing",
      language: "ar"
    }
    
    const { data, error } = await supabase
      .from('consultations')
      .insert([testData])
      .select()
    
    if (error) {
      console.error('Insert error:', error)
    } else {
      console.log('Success! Data inserted.')
      console.log('Inserted ID:', data[0]?.id)
      
      // Clean up - delete the test record
      const { error: deleteError } = await supabase
        .from('consultations')
        .delete()
        .eq('id', data[0]?.id)
      
      if (deleteError) {
        console.error('Delete error:', deleteError)
      } else {
        console.log('Test record cleaned up.')
      }
    }
  } catch (err) {
    console.error('Test failed:', err)
  }
}

testDataInsertion()