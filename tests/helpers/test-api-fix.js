// Test the fixed FashionRNN API call
async function testFixedAPI() {
  try {
    console.log('🧪 Testing fixed API call...')
    
    // Test with a simple clothing image
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

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ API Response:', JSON.stringify(result, null, 2))
    
    // Test parsing the prediction string
    if (result.data && result.data.length >= 1) {
      const predictionString = result.data[0]
      console.log('Prediction string:', predictionString)
      
      const predictionMatch = predictionString.match(/^([^(]+)\s*\(([0-9.]+)\)/)
      if (predictionMatch) {
        const category = predictionMatch[1].trim()
        const confidence = parseFloat(predictionMatch[2])
        console.log(`✅ Parsed: ${category} with ${(confidence * 100).toFixed(1)}% confidence`)
      } else {
        console.log('❌ Could not parse prediction string')
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testFixedAPI()
