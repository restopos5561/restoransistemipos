export const compressImage = async (file: File, maxSizeInMB: number = 2): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Dosya boyutunu kontrol et
    if (file.size <= maxSizeInMB * 1024 * 1024) {
      // Dosya zaten istenen boyuttan küçükse, direkt base64'e çevir
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // En boy oranını koru
        const maxDimension = 800;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Kaliteyi ayarla
        let quality = 0.6;
        let base64String = canvas.toDataURL('image/jpeg', quality);
        
        // Base64 boyutunu hesapla
        const calculateBase64Size = (base64: string) => {
          const base64Data = base64.split(',')[1];
          if (!base64Data) return 0;
          return Math.ceil((base64Data.length * 3) / 4);
        };

        let currentSize = calculateBase64Size(base64String);

        // İstenen boyuta ulaşana kadar kaliteyi düşür
        while (currentSize > maxSizeInMB * 1024 * 1024 && quality > 0.1) {
          quality -= 0.1;
          base64String = canvas.toDataURL('image/jpeg', quality);
          currentSize = calculateBase64Size(base64String);
        }

        if (currentSize > maxSizeInMB * 1024 * 1024) {
          reject(new Error('Resim boyutu çok büyük. Lütfen daha küçük bir resim seçin.'));
          return;
        }

        resolve(base64String);
      };

      img.onerror = () => {
        reject(new Error('Resim yüklenirken hata oluştu'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'));
    };

    reader.readAsDataURL(file);
  });
}; 