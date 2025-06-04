
const API_URL = '/api/predict';
const WEATHER_API_URL = '/api/weather';

interface PredictDiseaseParams {
  text?: string;
  image?: File;
}

interface DiseaseResponse {
  disease_name: string;
  details: string;
  treatment: string;
  medications: string[];
}

interface TextQueryResponse {
  message: string;
}

// Hàm gọi API để dự đoán bệnh (cho image) hoặc query text
export const predictDisease = async ({ text, image }: PredictDiseaseParams): Promise<DiseaseResponse | TextQueryResponse> => {
  try {
    let requestBody;
    let headers = {};
    
    if (image) {
      // Image upload - use multipart/form-data
      requestBody = new FormData();
      requestBody.append('image', image);
    } else if (text) {
      // Text only - use JSON
      requestBody = JSON.stringify({ text: text });
      headers = {
        'Content-Type': 'application/json'
      };
    } else {
      throw new Error('Either text or image must be provided');
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: requestBody,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Get weather data based on location
export const getWeatherData = async (location: string) => {
  try {
    const response = await fetch(`${WEATHER_API_URL}?location=${encodeURIComponent(location)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Lỗi khi lấy dữ liệu thời tiết từ server');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thời tiết:', error);
    throw error;
  }
};
