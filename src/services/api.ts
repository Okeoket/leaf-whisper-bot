
const API_URL = '/predict';

export const predictDisease = async (data: { text?: string; image?: File }) => {
  try {
    let requestBody;
    let headers = {};
    
    if (data.image) {
      // Image upload - use multipart/form-data
      requestBody = new FormData();
      requestBody.append('image', data.image);
    } else if (data.text) {
      // Text only - use JSON
      requestBody = JSON.stringify({ text: data.text });
      headers = {
        'Content-Type': 'application/json'
      };
    } else {
      throw new Error('Either text or image must be provided');
    }
    
    // For development and demo purposes, mock API response
    // In a real app, replace this with actual fetch API call
    return mockApiResponse(data);
    
    // Actual API call would look like this:
    /*
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: requestBody,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Mock API response for development and demo
const mockApiResponse = async (data: { text?: string; image?: File }) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let diseaseName = "Unknown disease";
  
  // Mock different responses based on input
  if (data.text) {
    const text = data.text.toLowerCase();
    
    if (text.includes("vàng") || text.includes("yellow")) {
      diseaseName = "Bệnh vàng lá (Chlorosis)";
    } else if (text.includes("đốm") || text.includes("spot")) {
      diseaseName = "Bệnh đốm lá (Leaf spot)";
    } else if (text.includes("héo") || text.includes("wilt")) {
      diseaseName = "Bệnh héo rũ (Fusarium wilt)";
    } else if (text.includes("mốc") || text.includes("mold")) {
      diseaseName = "Bệnh mốc xám (Gray mold)";
    } else if (text.includes("rỉ") || text.includes("rust")) {
      diseaseName = "Bệnh rỉ sắt (Rust)";
    } else {
      diseaseName = "Không thể xác định bệnh từ mô tả";
    }
  } else if (data.image) {
    // Randomly choose a disease for demonstration purposes
    const diseases = [
      "Bệnh đốm lá (Leaf spot)",
      "Bệnh vàng lá (Chlorosis)",
      "Bệnh héo rũ (Fusarium wilt)",
      "Bệnh mốc xám (Gray mold)",
      "Bệnh rỉ sắt (Rust)"
    ];
    
    diseaseName = diseases[Math.floor(Math.random() * diseases.length)];
  }
  
  return { disease_name: diseaseName };
};
