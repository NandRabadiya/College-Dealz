import axios from 'axios';
import { API_BASE_URL } from '../Api/api';

export const fetchProductWithImages = async (productId) => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Fetch product details
  const productResponse = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!productResponse.ok) {
    throw new Error("Failed to fetch product");
  }

  const product = await productResponse.json();

  // If product already has imageUrls, process them
  if (product.imageUrls && product.imageUrls.length > 0) {
    return {
      ...product,
      images: product.imageUrls.map((url, index) => ({
        id: `${product.id}-${index}`,
        url: url,
        fileName: `image-${index}`
      }))
    };
  }

  // Otherwise fetch images from the images API
  try {
    const imagesResponse = await fetch(
      `${API_BASE_URL}/api/images/product/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (imagesResponse.ok) {
      const images = await imagesResponse.json();
      return {
        ...product,
        images: images
          .map((img) => {
            if (img.s3_url) {
              return {
                id: img.image_id,
                url: img.s3_url,
                fileName: img.file_name
              };
            }
            return null;
          })
          .filter(Boolean)
      };
    }
  } catch (error) {
    console.error(`Error fetching images for product ${productId}:`, error);
  }
  
  return { ...product, images: [] };
};

//   try {
//     const [productResponse, imagesResponse] = await Promise.all([
//       axios.get(`${API_BASE_URL}/api/products/${productId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }),
//       axios.get(`${API_BASE_URL}/api/images/product/${productId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       })
//     ]);

//     return {
//       ...productResponse.data,
//       images: imagesResponse.data
//     };
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     throw error;
//   }
// };
