import axios from 'axios';
import { API_BASE_URL } from '../Api/api';

export const fetchProductWithImages = async (productId) => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const [productResponse, imagesResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
      axios.get(`${API_BASE_URL}/api/images/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    ]);

    return {
      ...productResponse.data,
      images: imagesResponse.data
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};
