// Test script for FashionRNN Hugging Face API
// Run with: node test-fashionrnn-api.js

async function testFashionRNNAPI() {
  try {
    console.log('🧠 Testing FashionRNN API...')
    
    // Test with a clothing image URL
    const response = await fetch('https://canken-is216.hf.space/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
        fn_index: 0
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ API Response:', JSON.stringify(result, null, 2))
    
    if (result.error) {
      console.log('❌ API Error:', result.error)
    } else {
      console.log('🎉 FashionRNN API is working!')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testFashionRNNAPI()
