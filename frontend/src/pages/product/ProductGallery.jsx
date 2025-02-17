// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { Heart, Share2, MessageCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { API_BASE_URL } from "../Api/api";
// // ProductGallery Component
// const ProductGallery = ({ productId }) => {
//   const [images, setImages] = useState([]);
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchImages = async () => {
//       try {
//         const token = localStorage.getItem("jwt");
//         const response = await fetch(
//           `${API_BASE_URL}/api/images/product/${productId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         if (!response.ok) throw new Error("Failed to fetch images");
//         const imageData = await response.json();

//         // Process the image data to ensure consistent structure
//         const processedImages = imageData
//           .map((img) => {
//             if (img.s3_url) {
//               return {
//                 id: img.image_id,
//                 url: img.s3_url,
//                 fileName: img.file_name,
//               };
//             }
//             return null;
//           })
//           .filter(Boolean);

//         console.log("Processed images:", processedImages); // Debug log
//         setImages(processedImages);
//       } catch (error) {
//         console.error("Error fetching images:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (productId) {
//       fetchImages();
//     }
//   }, [productId]);

//   if (loading) {
//     return (
//       <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-lg">
//         Loading images...
//       </div>
//     );
//   }

//   if (images.length === 0) {
//     return (
//       <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-lg">
//         <img
//           src="/api/placeholder/400/320"
//           alt="No image available"
//           className="w-full h-full object-cover rounded-lg"
//         />
//       </div>
//     );
//   }

//   const handlePrevious = () => {
//     setSelectedIndex((current) =>
//       current === 0 ? images.length - 1 : current - 1
//     );
//   };

//   const handleNext = () => {
//     setSelectedIndex((current) =>
//       current === images.length - 1 ? 0 : current + 1
//     );
//   };

//   return (
//     <div className="relative w-full h-full flex flex-col items-center space-y-4">
//       {/* Main Image */}
//       <div className="relative aspect-square w-full max-w-xs md:max-w-sm lg:max-w-md h-auto flex-shrink-0">
//         {images.length > 0 ? (
//           <img
//             src={images[selectedIndex]?.url || `/api/placeholder/400/320`}
//             alt={`Product image ${selectedIndex + 1}`}
//             className="h-full w-full object-cover rounded-lg bg-gray-100"
//             onError={(e) => {
//               e.target.onerror = null;
//               e.target.src = "/api/placeholder/400/320";
//             }}
//           />
//         ) : (
//           <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
//             <p>No image available</p>
//           </div>
//         )}
//       </div>

//       {/* Thumbnails */}
//       {images.length > 1 && (
//         <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8">
//           {images.map((image, index) => (
//             <button
//               key={index}
//               onClick={() => setSelectedIndex(index)}
//               className={`relative aspect-square overflow-hidden rounded-md ${
//                 selectedIndex === index
//                   ? "ring-2 ring-primary ring-offset-2"
//                   : ""
//               }`}
//             >
//               <img
//                 src={image.url || `/api/placeholder/400/320`}
//                 alt={`Product thumbnail ${index + 1}`}
//                 className="h-full w-full object-cover"
//               />
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };
// export default ProductGallery;
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '../Api/api';

const ProductGallery = ({ images=[] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);


  if (loading) {
    return (
      <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-lg">
        Loading images...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-lg">
        <img 
          src="/api/placeholder/400/320" 
          alt="No image available"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const handleNext = () => {
    setSelectedIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full max-w-xs md:max-w-sm lg:max-w-md h-auto flex-shrink-0">
        <img
          src={images[selectedIndex]?.url || '/api/placeholder/400/320'}
          alt={`Product image ${selectedIndex + 1}`}
          className="h-full w-full object-cover rounded-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/api/placeholder/400/320";
          }}
        />
        
        {/* Navigation arrows - only show if there are multiple images */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto w-full justify-center">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden ${
                selectedIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/400/320";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;