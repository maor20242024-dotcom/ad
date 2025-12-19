// Test the new lead API
const testData = {
  fullName: "Test User",
  phone: "+971501234567",
  email: "test@example.com",
  sourcePlatform: "instagram",
  sourceType: "Video",
  sourceUrl: "https://test.com",
  sourceVideoUrl: ""
};

fetch('http://localhost:3001/api/lead', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => {
  console.log('API Response:', data);
})
.catch(err => {
  console.error('API Error:', err);
});