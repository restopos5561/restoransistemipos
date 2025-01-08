API Dokümantasyonu

Base URL: /api

Notasyon:

{...} -> Zorunlu alan

[...] -> Opsiyonel alan

Genel Hata Formatı:

{
  "success": false,
  "message": "Hata Mesajı",
  "error": {
    "code": "HATA_KODU", // Örn: INVALID_REQUEST, UNAUTHORIZED, NOT_FOUND, vb.
    "details": {} // Hataya dair ek bilgiler, validation hataları vb.
  }
}

Genel Response Format (Başarılı):

{
  "success": true,
  "data": {} // İlgili veri
}

1. Authentication & Kullanıcı Yönetimi

1.1. Kimlik Doğrulama (/auth)

POST /auth/login

Açıklama: Kullanıcı girişi yapar ve access token, refresh token döner.

İstek (application/json):

{
    "email": "{email}",
    "password": "{password}",
    "branchId": {branchId}
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "accessToken": "...",
        "refreshToken": "...",
        "user": {
            "id": 1,
            "name": "John Doe",
            "role": "ADMIN",
            "branchId": 1,
            "permissions": ["CREATE_PRODUCT", "READ_PRODUCT", "..."]
        }
    }
}

Hatalı İstek (400 Bad Request): Geçersiz alanlar.

Hatalı İstek (401 Unauthorized): Hatalı parola ya da geçersiz token

Sunucu Hatası (500 Internal Server Error): Beklenmeyen bir hata.

POST /auth/refresh-token

Açıklama: Refresh token kullanarak yeni bir access token ve refresh token oluşturur

İstek (application/json):

{
        "refreshToken": "eski_refresh_token"
    }

Başarılı Yanıt (200 OK):

{
      "success": true,
          "data": {
            "accessToken": "yeni_access_token",
            "refreshToken": "yeni_refresh_token"
        }
    }

Hatalı İstek (400 Bad Request): Geçersiz alanlar.

Hatalı İstek (401 Unauthorized): Geçersiz refresh token

Sunucu Hatası (500 Internal Server Error): Beklenmeyen bir hata.

POST /auth/logout

Açıklama: Kullanıcının oturumunu sonlandırır (refresh token'ı geçersiz kılar).

Başarılı Yanıt (204 No Content)

GET /auth/me

Açıklama: Kimliği doğrulanmış kullanıcının bilgilerini getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "ADMIN",
        "branchId": 1
         // Diğer kullanıcı bilgileri
    }
}

1.2. Kullanıcı Yönetimi (/users)

GET /users

Açıklama: Kullanıcıları listeler.

Query Parametreleri:
- branchId [number]: Şube ID'si ile filtreleme
- role [Role]: Kullanıcı rolü ile filtreleme (ADMIN, MANAGER, vb.)
- isActive [boolean]: Aktiflik durumuna göre filtreleme
- search [string]: İsim veya email ile arama
- page [number]: Sayfa numarası (varsayılan: 1)
- limit [number]: Sayfa başına kayıt sayısı (varsayılan: 10)
- sort [string]: Sıralama (örn: "name:asc,createdAt:desc")

Başarılı Yanıt (200 OK):
{
    "success": true,
    "data": {
        "users": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "role": "ADMIN",
                // ... diğer kullanıcı bilgileri
            }
        ],
        "total": 100,      // Toplam kayıt sayısı
        "page": 1,         // Mevcut sayfa
        "totalPages": 10   // Toplam sayfa sayısı
    }
}

POST /users

Açıklama: Yeni kullanıcı oluşturur.

İstek (application/json):

{
    "name": "{name}",
    "email": "{email}",
    "password": "{password}",
    "role": "{ADMIN | MANAGER | STAFF | ...}",
    "branchId": {branchId},
    "permissions": ["{PERMISSION_NAME}", ...] // Opsiyonel
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        // ... diğer alanlar
    }
}

GET /users/{id}

Açıklama: Belirli bir kullanıcıyı ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "ADMIN",
        "branchId": 1,
        "isActive": true
        // ... diğer alanlar
    }
}

PUT /users/{id}

Açıklama: Kullanıcıyı ID ile günceller.

İstek (application/json):

{
       "name": "{name}",
       "email": "{email}",
       "role": "{ADMIN | MANAGER | STAFF | ...}",
       "branchId": {branchId},
       "isActive":  true  // Diğer alanlar opsiyonel
       "password":"eski_parola" // Kullanıcı kendi parolasını güncellemek istediğinde
   }

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "ADMIN",
        "branchId": 1,
        "isActive": true
    // Diğer kullanıcı bilgileri
  }
}

*   **`DELETE /users/{id}`**
    *   **Açıklama:** Kullanıcıyı ID ile siler.
    *   **Başarılı Yanıt (204 No Content)**

*   **`GET /users/branch/{branchId}`**
    *   **Açıklama:** Belirli bir şubeye ait kullanıcıları getirir.
    *   **Başarılı Yanıt (200 OK):**  `GET /users` ile aynı formatta.

*   **`PUT /users/:id/permissions`**
    *   **Açıklama:** Kullanıcının izinlerini günceller.
    * **İstek (application/json):**

      ```json
            {
              "permissions": ["{PERMISSION_NAME}", "..."] // İzinler listesi
           }
     ```

     * **Başarılı Yanıt (200 OK):**
          ```json
            {
               "success": true,
                 "data": {
                    "id": 1,
                    "name": "John Doe",
                     "email": "john.doe@example.com",
                     "role": "ADMIN",
                    "permissions": ["PERMISSION1", "PERMISSION2"]
                 // Diğer kullanıcı bilgileri
                }
           }
Use code with caution.
GET /users/role/{role}

Açıklama: Belirli bir role sahip kullanıcıları getirir.

Başarılı Yanıt (200 OK): GET /users ile aynı formatta.

Batch (Toplu) İşlemler:

POST /users/batch

Açıklama: Birden fazla kullanıcıyı aynı anda oluşturur.

İstek (application/json):
{
    "users": [
        {
            "name": "User 1",
            "email": "user1@example.com",
            "password": "123456",
            "role": "STAFF",
            "branchId": 1,
            "restaurantId": 1,
            "permissions": ["CREATE_PRODUCT", "VIEW_REPORTS"]
        },
        // ... diğer kullanıcılar
    ]
}

Başarılı Yanıt (201 Created):
{
    "success": true,
    "data": [
        // Oluşturulan kullanıcılar
    ]
}

PUT /users/batch

Açıklama: Birden fazla kullanıcıyı aynı anda günceller.

İstek (application/json):
{
    "users": [
        {
            "id": 1,
            "name": "Updated Name",
            "role": "MANAGER"
        },
        // ... diğer güncellemeler
    ]
}

Başarılı Yanıt (200 OK):
{
    "success": true,
    "data": [
        // Güncellenen kullanıcılar
    ]
}

DELETE /users/batch

Açıklama: Birden fazla kullanıcıyı aynı anda siler.

İstek (application/json):
{
    "ids": [1, 2, 3]
}

Başarılı Yanıt (204 No Content)

Hata Durumları:
- 400 Bad Request: Geçersiz istek verileri
- 401 Unauthorized: Kimlik doğrulama hatası
- 403 Forbidden: Yetki hatası
- 404 Not Found: Kullanıcı bulunamadı
- 500 Internal Server Error: Sunucu hatası

2. Restoran ve Şube Yönetimi

2.1. Restoran (/restaurants)

GET /restaurants

Açıklama: Tüm restoranları listeler.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Restoran A"
            // ... diğer restoran bilgileri
        },
        {
            "id": 2,
            "name": "Restoran B"
            // ... diğer restoran bilgileri
        }
        // ...
    ]
}

POST /restaurants

Açıklama: Yeni restoran oluşturur.

İstek (application/json):

{
    "name": "{name}"
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "Restoran A"
        // ... oluşturulan restoran bilgileri
    }
}

GET /restaurants/{id}

Açıklama: Belirli bir restoranı ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "Restoran A"
        // ... diğer restoran bilgileri
    }
}

PUT /restaurants/{id}

Açıklama: Belirli bir restoranı (ID'si ile) günceller.

İstek (application/json):

{
    "name": "{newName}"
    // ... güncellenecek diğer alanlar
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "Restoran A (Güncellenmiş)"
        // ... güncellenmiş restoran bilgileri
    }
}

DELETE /restaurants/{id}

Açıklama: Belirli bir restoranı (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /restaurants/{id}/settings

Açıklama: Belirli bir restoranın ayarlarını getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "appName": "Restoran A POS",
        "appLogoUrl": "...",
        "currency": "TL",
        // ... diğer ayarlar
    }
}

PUT /restaurants/{id}/settings

Açıklama: Belirli bir restoranın ayarlarını günceller.

İstek (application/json):

{
   "appName": "Restoran Yeni Adı",
   "appLogoUrl": null,
   "currency": "USD",
   // ... diğer ayarlar
}

Başarılı Yanıt (200 OK):

{
  "success": true,
     "data": {
       "appName": "Restoran Yeni Adı",
         "appLogoUrl": null,
        "currency": "USD",
      // ... güncellenmiş restoran bilgileri
       }
   }

2.2. Şube (/branches)

GET /branches

Açıklama: Tüm şubeleri listeler.

Query Parametreleri

restaurantId [number]: Restoran ID'si ile filtreleme.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Restoran A - Şube 1",
            "address": "...",
            "restaurantId": 1,
            "isActive": true,
            "isMainBranch": true
            // ... diğer şube bilgileri
        },
        // ...
    ]
}

POST /branches

Açıklama: Yeni şube oluşturur.

İstek (application/json):

{
    "restaurantId": 1,
    "name": "{name}",
    "address": "{address}",
    "isActive": true,
    "isMainBranch": false
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        "id": 2,
        "restaurantId": 1,
        "name": "Restoran A - Şube 2",
        "address": "...",
        // ... diğer şube bilgileri
    }
}

GET /branches/{id}

Açıklama: Belirli bir şubeyi ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "Restoran A - Şube 1",
        "address": "...",
        "restaurantId": 1,
        "isActive": true,
        "isMainBranch": true
        // ... diğer şube bilgileri
    }
}

PUT /branches/{id}

Açıklama: Belirli bir şubeyi (ID'si ile) günceller.

İstek (application/json):

{
    "name": "{newName}",
    "address": "{newAddress}"
    // ... güncellenecek diğer alanlar
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "Restoran A - Şube 1 (Güncellenmiş)",
        // ... güncellenmiş şube bilgileri
    }
}

DELETE /branches/{id}

Açıklama: Belirli bir şubeyi (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /branches/{id}/settings

Açıklama: Belirli bir şubenin ayarlarını getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "currency": "TL",
        "timezone": "Europe/Istanbul",
        "dailyCloseTime": "23:00",
        "workingHours": "08:00-23:00"
        // ... diğer ayarlar
    }
}

PUT /branches/{id}/settings

Açıklama: Belirli bir şubenin ayarlarını günceller.

İstek (application/json):

{
       "currency": null,
       "timezone": "Europe/London",
        "dailyCloseTime": null,
         "workingHours": "09:00-01:00",
          "id": 1
      // ... güncellenecek diğer ayarlar
 }

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
           "currency": null,
           "timezone": "Europe/London",
          "dailyCloseTime": null,
          "workingHours": "09:00-01:00",
     // ... güncellenmiş şube bilgileri
       }
}

PATCH /branches/{id}/status

Açıklama: Şubenin isActive durumunu günceller.

İstek (application/json):

{
    "isActive": false
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "isActive": false
        // ... diğer şube bilgileri
    }
}

GET /branches/restaurant/{restaurantId}

Açıklama: Belirli bir restorana ait şubeleri listeler.

Başarılı Yanıt (200 OK): GET /branches ile aynı formatta.

3. Masa Yönetimi (/api/tables)

GET /tables

Açıklama: Tüm masaları listeler.

Query Parametreleri:
- branchId: Zorunlu, Şube ID'si ile filtreleme.
- status [TableStatus]: Masa durumuna göre filtreleme.
- location [string]: Konuma göre filtreleme.
- capacity [number]: Kapasiteye göre filtreleme.
- isActive [boolean]: Aktiflik durumuna göre filtreleme.  // active -> isActive
- page [number]: Sayfa numarası.
- limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "tables": [
            {
                "id": 1,
                "branchId": 1,
                "tableNumber": "A1",
                "capacity": 4,
                "location": "Salon 1",
                "status": "IDLE"
            },
           //Diğer masalar
        ],
        "total": 50, // Toplam masa sayısı
        "page": 1,
        "limit": 10,
        "totalPages": 5
    }
}

POST /tables

Açıklama: Yeni masa oluşturur.

İstek (application/json):

{
    "branchId": {branchId},
    "tableNumber": "{tableNumber}",
    "capacity": {capacity},
    "location": "{location}" // Opsiyonel
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        "id": 101, // Yeni masa ID
        "branchId": 1,
        "tableNumber": "A2",
        "capacity": 2,
        "location": "Teras",
        "status": "IDLE"
    }
}

GET /tables/{id}

Açıklama: Belirli bir masayı ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "branchId": 1,
        "tableNumber": "A1",
        "capacity": 4,
        "location": "Salon 1",
        "status": "IDLE"
        // ... diğer masa bilgileri
    }
}

PUT /tables/{id}

Açıklama: Belirli bir masayı (ID'si ile) günceller.

İstek (application/json):

{
      "tableNumber": "A3", // Zorunlu alan
       "capacity": 2, // Diğer alanlar isteğe bağlı
       "location": "Bahçe"
    }

Başarılı Yanıt (200 OK):

{
   "success": true,
       "data": {
         "id": 10,
        "branchId": 1,
         "tableNumber": "A10",
          "capacity": 8,
           "location": "Bahçe Kat",
       "status": "IDLE"
      // ... güncellenmiş masa bilgileri
    }
  }

DELETE /tables/{id}

Açıklama: Belirli bir masayı (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

PATCH /tables/{id}/status

Açıklama: Masanın durumunu günceller (Örn. IDLE, OCCUPIED, RESERVED).

İstek (application/json):

{
    "status": "OCCUPIED"
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "status": "OCCUPIED"
        // ... diğer masa bilgileri
    }
}

POST /tables/merge

Açıklama: İki veya daha fazla masayı birleştirir. Bu olası senaryoya göre düzenlenmeli

İstek (application/json):

{
   "mainTableId": 1,
   "tableIdsToMerge": [2,3,4]
    }

Use code with caution.
POST /tables/transfer

Açıklama: Bir masanın siparişini başka bir masaya transfer eder. Bu olası senaryoya göre düzenlenmeli.

İstek (application/json):

{
          "fromTableId": 1,
           "toTableId": 5
     }

GET /tables/branch/{branchId}

Açıklama: Belirli bir şubedeki tüm masaları getirir.

Başarılı Yanıt (200 OK): GET /tables ile aynı formatta.

GET /tables/location/{location}

Açıklama: Belirli bir konumdaki (location) tüm masaları getirir.

Başarılı Yanıt (200 OK): GET /tables ile aynı formatta.

4. Ürün ve Kategori Yönetimi (/api/categories, /api/products)

4.1. Kategori (/api/categories)

GET /categories

Açıklama: Tüm kategorileri listeler.

Query Parametreleri:

restaurantId [number]: Restoran ID'si ile filtreleme.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": [
        {
            "id": 1,
            "restaurantId": 1,
            "name": "Yemekler"
        },
        // ... diğer kategoriler
    ]
}

POST /categories

Açıklama: Yeni kategori oluşturur.

İstek (application/json):

{
  "restaurantId": {restaurantId},
  "name": "{name}"
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        "id": 2,
        "restaurantId": 1,
        "name": "İçecekler"
        // ... diğer kategori bilgileri
    }
}

GET /categories/{id}

Açıklama: Belirli bir kategoriyi ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "restaurantId": 1,
        "name": "Yemekler"
        // ... diğer kategori bilgileri
    }
}

PUT /categories/{id}

Açıklama: Belirli bir kategoriyi (ID'si ile) günceller.

İstek (application/json):

{
    "name": "{newName}"
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "restaurantId": 1,
        "name": "Ana Yemekler"
        // ... güncellenmiş kategori bilgileri
    }
}

DELETE /categories/{id}

Açıklama: Belirli bir kategoriyi (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /categories/restaurant/{restaurantId}

Açıklama: Belirli bir restorana ait kategorileri getirir.

Başarılı Yanıt (200 OK): GET /categories ile aynı formatta.

4.2. Ürün (/api/products)

GET /products

Açıklama: Tüm ürünleri listeler.

Query Parametreleri:

categoryId [number]: Kategori ID'si ile filtreleme.

search [string]: Ürün adı veya açıklamasında arama.

barcode [string]: Barkod ile arama.

isActive [boolean]: Aktiflik durumuna göre filtreleme (stokta olan/olmayan).

page [number]: Sayfa numarası (varsayılan: 1).

limit [number]: Sayfa başına kayıt sayısı (varsayılan: 10).

Başarılı Yanıt (200 OK):

{
  "success": true,
     "data": {
        "products": [
        {
         "id": 1,
         "name": "Izgara Tavuk",
         "description": "Özel soslu ızgara tavuk",
          "price": 45.0,
          "categoryId": 1,
          "category": {
          "id": 1,
          "name": "Yemekler" // Veya "Ana Yemekler", güncellenmişse
        },
          "barcode": null,
           "cost": 20.0,
         "taxRate": 8.0,
          "unit": "Porsiyon",
          "recipe": null, // Veya reçete detayları
          "stock": {
             "id": 1,
             "quantity": 10,
            "lowStockThreshold": 5
            },
       "productSuppliers": [
        {
        "supplier": {
         "id": 1,
       "name": "Tedarikçi A"
           }
        }
     ],
         "priceHistory": [] // Fiyat geçmişi
     },
// ... diğer ürünler

],
"total": 150,
"page": 1,
"limit": 10,
"totalPages": 15
}
}
```

POST /products

Açıklama: Yeni ürün oluşturur.

İstek (application/json):

{
    "name": "{name}",
    "description": "{description}",
    "price": {price},
    "categoryId": {categoryId},
    "barcode": "{barcode}", // Opsiyonel
    "cost": {cost}, // Opsiyonel
    "taxRate": {taxRate}, // Opsiyonel
    "unit": "{unit}", // Opsiyonel (Adet, Kg, Porsiyon vb.)
    "lowStockThreshold": {lowStockThreshold}, // Opsiyonel
    "idealStockLevel": {idealStockLevel}, // Opsiyonel
    "recipe": {  // Opsiyonel
        "ingredients": [
            {
                "name": "Tavuk Göğsü",
                "quantity": "200 gram"
            },
            {
                 "name": "Tuz",
                "quantity": "1 çay kaşığı"
           }
            // ...
        ]
    }
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        "id": 10,
        "name": "Izgara Tavuk",
        "description": "Özel soslu ızgara tavuk",
        // ... diğer ürün bilgileri,
        "recipe":{
           "id":100
       }
    }
}

GET /products/{id}

Açıklama: Belirli bir ürünü ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "Izgara Tavuk",
        // ... diğer ürün bilgileri
    }
}

PUT /products/{id}

Açıklama: Belirli bir ürünü (ID'si ile) günceller.

İstek (application/json):

{
  "name": "{newName}",
   "description": "{newDescription}",
    "price": {newPrice},
     "categoryId": {newCategoryId},
     "barcode": null,
     "cost": 50,
    "taxRate": 18,
     "unit": "Adet",
     "recipe": {
            "id": 15,
             "ingredients": [
          {
            "id": 25,
              "name": "Yeni Malzeme",
              "quantity": "100 gr"
                }
             ]
         },
       "stock": {
           "lowStockThreshold": 10,
          "idealStockLevel": 200
         }
   }

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "name": "Izgara Tavuk Special",
        // ... güncellenmiş ürün bilgileri
    }
}

DELETE /products/{id}

Açıklama: Belirli bir ürünü (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /products/category/{categoryId}

Açıklama: Belirli bir kategoriye ait ürünleri getirir.

Başarılı Yanıt (200 OK): GET /products ile aynı formatta.

GET /products/barcode/{barcode}

Açıklama: Belirli bir barkoda sahip ürünü getirir.

Başarılı Yanıt (200 OK): GET /products/{id} ile aynı formatta.	

GET /products/search

Açıklama: Ürünleri search query parametresine göre (ürün adı veya açıklamasında arama yaparak) getirir.

Query Parametreleri:

search: Aranacak kelime veya kelimeler.

restaurantId: (Opsiyonel) Belirli bir restoranın ürünlerinde arama yapmak için.

branchId: (Opsiyonel) Belirli bir şubenin ürünlerinde arama yapmak için.

categoryId: (Opsiyonel) Belirli bir kategoriye ait ürünlerde arama yapmak için.

page [number]: Sayfa numarası (varsayılan: 1).

limit [number]: Sayfa başına kayıt sayısı (varsayılan: 10).

Başarılı Yanıt (200 OK): GET /products ile aynı formatta.

GET /products/{id}/variants

Açıklama: Belirli bir ürünün varyantlarını getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": [
        {
            "id": 1,
            "productId": 1,
            "name": "Boyut",
            "value": "Küçük"
        },
        {
            "id": 2,
            "productId": 1,
            "name": "Boyut",
            "value": "Orta"
        },
        {
            "id": 3,
            "productId": 1,
            "name": "Renk",
            "value": "Kırmızı"
        }
        // ... diğer varyantlar
    ]
}

POST /products/{id}/variants

Açıklama: Belirli bir ürüne varyant ekler.

İstek (application/json):

{
    "name": "{Varyant Adı}", // Örn: Beden, Renk
    "value": "{Varyant Değeri}", // Örn: XL, Mavi
    "priceAdjustment": {priceAdjustment} // Opsiyonel, fiyat farkı
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        "id": 4,
        "productId": 1,
        "name": "Boyut",
        "value": "Büyük",
        "priceAdjustment": 5.0
    }
}

PUT /products/{id}/variants/{variantId}

Açıklama: Belirli bir ürün varyantını günceller.

İstek (application/json):

{
    "name": "{Varyant Adı}",
    "value": "{Varyant Değeri}",
    "priceAdjustment": {priceAdjustment} // Opsiyonel
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 4,
        "productId": 1,
        "name": "Boyut",
        "value": "XXL",
        "priceAdjustment": 10.0
    }
}

DELETE /products/{id}/variants/{variantId}

Açıklama: Belirli bir ürün varyantını siler.

Başarılı Yanıt (204 No Content)

GET /products/{id}/options

Açıklama: Belirli bir ürünün seçenek gruplarını ve seçeneklerini getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": [
        {
            "id": 1,
            "productId": 1,
            "name": "Soslar",
            "isRequired": false,
            "minQuantity": 0,
            "maxQuantity": 2,
            "options": [
                {
                    "id": 1,
                    "optionGroupId": 1,
                    "name": "Ketçap",
                    "priceAdjustment": 0
                },
                {
                    "id": 2,
                    "optionGroupId": 1,
                    "name": "Mayonez",
                    "priceAdjustment": 0
                },
                {
                    "id": 3,
                    "optionGroupId": 1,
                    "name": "Acı Sos",
                    "priceAdjustment": 2.5
                }
            ]
        },
        {
            "id": 2,
            "productId": 1,
            "name": "Ek Malzemeler",
            "isRequired": true,
            "minQuantity": 1,
            "maxQuantity": 3,
            "options": [
                {
                    "id": 4,
                    "optionGroupId": 2,
                    "name": "Cheddar Peyniri",
                    "priceAdjustment": 3
                },
                {
                    "id": 5,
                    "optionGroupId": 2,
                    "name": "Turşu",
                    "priceAdjustment": 1.5
                }
            ]
        }
        // ... diğer seçenek grupları
    ]
}

POST /products/{id}/options

Açıklama: Ürüne seçenek grubu veya seçenek ekler.

İstek (application/json):

Seçenek Grubu Eklemek için:

{
    "name": "Ek Malzemeler",
    "isRequired": true,
    "minQuantity": 0,
    "maxQuantity": 3
}

Seçenek Eklemek İçin:

{
    "optionGroupId": 2,
    "name": "Ekstra Peynir",
    "priceAdjustment": 5
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        // Eklenen seçenek grubu veya seçenek bilgisi
        "id": 3, // Eklenen optionGroup id'si
        "productId":1,
        "name": "İçecekler", // Eklenen optionGroup ismi
        "isRequired": false
    }
}

PUT /products/{id}/options/{optionId}

Açıklama: Ürün seçeneğini veya seçenek grubunu günceller. optionId , ProductOptionGroup veya ProductOption için aynı endpoint'de işlem görebilir. Güncellenecek ilgili option türünün id sinin verilmesi yeterlidir

İstek (application/json):

Seçenek Grubu Güncellemek İçin:

{
      "name": "Yeni Ek Malzemeler",
       "isRequired": false,
       "minQuantity": 0,
       "maxQuantity": 5
         }

Seçenek Güncellemek İçin:

{
      "name": "Ekstra Soğan",
        "priceAdjustment": 2
 }

Başarılı Yanıt (200 OK):

{
          "success": true,
          "data": {
         "id": 10,
       "optionGroupId": 2,
       "name": "Ekstra Soğan",
       "priceAdjustment": 2
         // Güncellenen veri döner
      }
 }

DELETE /products/{id}/options/{optionId}

Açıklama: Ürün seçeneğini veya seçenek grubunu siler.optionId , ProductOptionGroup veya ProductOption için aynı endpoint'de işlem görebilir. Silinecek ilgili option türünün id sinin verilmesi yeterlidir

Başarılı Yanıt (204 No Content)

GET /products/{id}/price-history

Açıklama: Ürünün fiyat geçmişini getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": [
        {
            "id": 1,
            "productId": 1,
            "oldPrice": 40,
            "newPrice": 45,
            "startDate": "2023-10-26T00:00:00Z",
            "endDate": "2023-11-15T00:00:00Z"
        },
        {
            "id": 2,
            "productId": 1,
            "oldPrice": 45,
            "newPrice": 42,
            "startDate": "2023-11-15T00:00:00Z",
            "endDate": null
        }
    ]
}

POST /products/{id}/price

Açıklama: Ürünün fiyat bilgisini günceller. (Product üzerinde ki price alanını günceller, PriceHistory oluşturur.)

İstek (application/json):

```json
    {
         "newPrice": 50
   }
  ```
Use code with caution.
Başarılı Yanıt (200 OK):

{
      "success": true,
    "data": {
          "message":"Ürün fiyat bilgisi güncellendi ve fiyat geçmişi kaydı oluşturuldu."
      }
}

5. Sipariş Yönetimi (/api/orders)

GET /orders

Açıklama: Siparişleri listeler.

Query Parametreleri:

branchId [number]: Şube ID'si ile filtreleme.

tableId [number]: Masa ID'si ile filtreleme.

status [OrderStatus]: Sipariş durumuna göre filtreleme (PENDING, PREPARING, vb.).

waiterId [number]: Garson ID'si ile filtreleme.

customerId [number]: Müşteri ID'si ile filtreleme.

startDate [DateTime]: Başlangıç tarihi ile filtreleme.

endDate [DateTime]: Bitiş tarihi ile filtreleme.

page [number]: Sayfa numarası (varsayılan: 1).

limit [number]: Sayfa başına kayıt sayısı (varsayılan: 10).

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "orders": [
            {
                "id": 1,
                "branchId": 1,
                "tableId": 5,
                "waiterId": 2,
                "customerId": null,
                "orderTime": "2023-11-15T10:00:00Z",
                "totalAmount": 87,
                "orderSource": "IN_STORE",
                "status": "PREPARING",
                "orderNotes": "Acısız olsun lütfen.",
                "openingTime": "2023-11-15T09:55:00Z",
                "closingTime": null,
                "priority": false,
                "discounts": [],
                "items": [
                    {
                        "id": 1,
                        "orderId": 1,
                        "productId": 1,
                        "quantity": 2,
                        "unitPrice": 42,
                        "totalPrice": 84,
                        "discount": 0,
                        "isVoid": false,
                        "type": "SALE",
                        "orderItemStatus": "PREPARING",
                        "preparationStartTime": null,
                        "preparationEndTime": null,
                        "selectedOptions": [
                           {
                                 "id": 2,
                                  "optionGroupId": 1,
                                 "name": "Mayonez",
                                 "priceAdjustment": 0
                            }
                         ]
                    }
                // ... diğer sipariş kalemleri
                ],
                "payment": null
            }
        // ... diğer siparişler
        ],
        "total": 200,
        "page": 1,
        "limit": 10,
        "totalPages": 20
    }
}

POST /orders

Açıklama: Yeni sipariş oluşturur.

İstek (application/json):

{
  "branchId": {branchId},
   "tableId": {tableId},
   "waiterId": {waiterId},
   "customerId": {customerId},
   "orderSource": "{IN_STORE | PACKAGE | ONLINE}",
  "items": [
         {
            "productId": {productId},
            "quantity": {quantity},
            "notes": "{Ekstra notlar}",
            "selectedOptions": [
                     {
                         "optionId": 1
                      },
                {
                      "optionId": 3
                }
            ]
           }
    // ... diğer sipariş kalemleri
    ],
  "orderNotes": "{Sipariş notu}",
  "priority": false
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        "id": 10, // Yeni sipariş ID'si
        "branchId": 1,
        "tableId": 5,
         "waiterId": 2,
         "orderTime": "2023-11-29T14:33:37.224Z",
         "totalAmount": 0,
         "orderSource": "IN_STORE",
          "status": "PENDING",
          "orderNotes": "Sipariş notu acısız olsun",
           "openingTime": "2023-11-29T14:33:37.217Z",
         "closingTime": null,
         "priority": false
    }
}

GET /orders/{id}

Açıklama: Belirli bir siparişi ID'si ile getirir.

Başarılı Yanıt (200 OK): POST /orders'ın başarılı yanıt formatı ile benzer.

PUT /orders/{id}

Açıklama: Belirli bir siparişi (ID'si ile) günceller.

İstek (application/json):

{
       "customerId": 55, // Müşteri değişikliği için
       "tableId": 4, // Masa değişikliği için
       "items": [
           {
               "id":119, // id gönderilirse güncelleme işlemi yapılır
                "productId": 3,
               "quantity": 2,
               "notes": "string",
               "selectedOptions": []
           },
             {
                   "productId": 3,
                    "quantity": 2,
                    "notes": "string",
                   "selectedOptions": [
                      {
                       "optionId": 1
                         },
                       {
                       "optionId": 3
                            }
                   ]
              }
       ],
       "orderNotes": "yeni sipariş notu acılı olsun", // sipariş notu güncellenmesi
      "priority": true
  }

Başarılı Yanıt (200 OK):

{
    "success": true,
     "data": {
        "id": 33,
          "branchId": 1,
         "tableId": 4, // Güncellendi
          "customerId": 55, // Güncellendi
         "waiterId": 2,
        "orderTime": "2023-11-29T17:24:03.788Z",
       "totalAmount": 471.5,
        "orderSource": "IN_STORE",
       "status": "PENDING",
       "orderNotes": "yeni sipariş notu acılı olsun", // Güncellendi
         "openingTime": "2023-11-29T17:24:03.780Z",
       "closingTime": null,
       "priority": true, // Güncellendi
          "discounts": []
         }
      }

DELETE /orders/{id}

Açıklama: Belirli bir siparişi (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

PATCH /orders/{id}/status

Açıklama: Belirli bir siparişin durumunu günceller.

İstek (application/json):

{
    "status": "COMPLETED" // Yeni durum
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "status": "COMPLETED"
        // ... diğer sipariş bilgileri
    }
}

POST /orders/{id}/items

Açıklama: Siparişe yeni kalem(ler) ekler

İstek (application/json):

orderId ve id numaraları aynı olmalı

{
           "orderId":12,
            "productId": 3,
            "quantity": 2,
            "notes": "string",
            "selectedOptions": [
             {
                  "optionId": 1
             },
             {
                  "optionId": 3
              }
           ]
       }

PUT /orders/{id}/items/{itemId}

Açıklama: Siparişteki ürünü (kalemi) günceller

İstek (application/json):

orderId ve id numaraları aynı olmalı

itemId değeri değiştirlemez sadece bilgi amaçlı OrderItem id bilgisi verilmeli.

Yeni ProductOption eklenecek ise id verilmez optionId verilir.

{
          "id":12,
         "orderId":12,
          "productId": 3,
         "quantity": 10,
         "notes": "yeni not",
           "selectedOptions": [
                   {
                       "optionId": 1
                  }
             ]
    }

DELETE /orders/{id}/items/{itemId}

Açıklama: Siparişteki ürünü (kalemi) siler

Başarılı Yanıt (204 No Content)

GET /orders/table/{tableId}

Açıklama: Belirli bir masaya ait siparişleri getirir. Eğer birden fazla order var ise hata mesajı ile açık sipariş olup olmadığı bilgisini sorgulatabilir

Başarılı Yanıt (200 OK): GET /orders format ile aynı

GET /orders/waiter/{waiterId}

Açıklama: Belirli bir garsona ait siparişleri getirir.

Başarılı Yanıt (200 OK): GET /orders ile aynı formatta.

GET /orders/customer/{customerId}

Açıklama: Belirli bir müşteriye ait siparişleri getirir.

Başarılı Yanıt (200 OK): GET /orders ile aynı formatta.

GET /orders/branch/{branchId}

Açıklama: Belirli bir şubeye ait siparişleri getirir.

Başarılı Yanıt (200 OK): GET /orders ile aynı formatta.

GET /orders/status/{status}

Açıklama: Belirli bir durumdaki siparişleri getirir (örneğin, PENDING, PREPARING).

Başarılı Yanıt (200 OK): GET /orders ile aynı formatta.

PUT /orders/{id}/notes

Açıklama: Bir siparişin notunu günceller.

İstek (application/json):

{
    "orderNotes": "Yeni not"
}

Başarılı Yanıt (200 OK):

{
  "success": true,
    "data": {
     "id": 1,
     "orderNotes": "Yeni not",
    // ... diğer sipariş bilgileri
   }
}

GET /orders/date-range

Açıklama: Belirli bir tarih aralığındaki siparişleri getirir.

Query Parametreleri:

startDate [DateTime]: Başlangıç tarihi.

endDate [DateTime]: Bitiş tarihi.

Başarılı Yanıt (200 OK): GET /orders ile aynı formatta.

6. Mutfak/Bar Yönetimi (/api/kitchen, /api/bar)

Mutfak için:

GET /kitchen/orders

Açıklama: Mutfağa gelen siparişleri listeler.

Query Parametreleri:

status [OrderStatus[]]: Durumlarına göre filtreleme (PENDING, PREPARING, READY, ITEM_ISSUE). Birden fazla durum virgülle ayrılarak gönderilebilir (ör. status=PENDING,PREPARING).

priority [boolean]: Öncelikli siparişleri filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

branchId [number]: Şube ID'si

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "orders": [
            {
                "id": 1,
                "branchId": 1,
                "table":{
                    "id":1,
                    "tableNumber":"A7"
                 },
                "orderTime": "2023-11-15T10:00:00Z",
                "status": "PREPARING",
                "priority": true,
                "items": [
                    {
                        "id": 1,
                        "productId": 1,
                        "name":"Izgara Tavuk",
                        "quantity": 2,
                        "orderItemStatus": "PREPARING",
                        "preparationStartTime": null,
                        "preparationEndTime": null,
                       "notes": "Acısız olsun",
                       "selectedOptions": [
                         {
                                "id": 2,
                                "optionGroupId": 1,
                               "name": "Mayonez",
                               "priceAdjustment": 0
                         }
                  ]
            },
         // ... diğer sipariş kalemleri
       ]
     }
  // ... diğer siparişler
  ],
"total": 50,
"page": 1,
"limit": 10,
"totalPages": 5
 }
}

PATCH /kitchen/orders/:id/status

Açıklama: Mutfaktaki bir siparişin durumunu günceller.

İstek (application/json):

{
    "status": "READY" // Yeni durum
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "status": "READY"
        // ... diğer sipariş bilgileri
    }
}

GET /kitchen/queue

Açıklama: Mutfak kuyruğunu getirir (hazırlanmayı bekleyen siparişler).

Başarılı Yanıt (200 OK): GET /kitchen/orders ile aynı formatta (veya sadece gerekli alanları içerecek şekilde).

Bar için (Mutfak ile benzer):

GET /bar/orders

Açıklama: Bara gelen siparişleri listeler.

Query Parametreleri: Mutfak ile aynı.

PATCH /bar/orders/:id/status

Açıklama: Bardaki bir siparişin durumunu günceller.

İstek (application/json): Mutfak ile aynı.

GET /bar/queue

Açıklama: Bar kuyruğunu getirir (hazırlanmayı bekleyen siparişler).

7. Stok Yönetimi (/api/stock)

GET /stock

Açıklama: Tüm stok durumunu listeler.

Query Parametreleri:

productId [number]: Ürün ID'si ile filtreleme.

restaurantId [number]: Restoran ID'si ile filtreleme.

branchId [number]: Şube ID'si ile filtreleme.

lowStock [boolean]: Sadece kritik seviyenin altındaki ürünleri getirmek için.

page [number]: Sayfa numarası (varsayılan: 1).

limit [number]: Sayfa başına kayıt sayısı (varsayılan: 10).

Başarılı Yanıt (200 OK):

{
  "success": true,
   "data": {
    "stocks": [
        {
         "id": 1,
         "productId": 1,
           "product":{
               "id": 1,
               "name": "Kola",
                "unit": "Adet",
              "barcode": "1234567890"
          },
        "quantity": 150,
         "lowStockThreshold": 20,
         "idealStockLevel": 500,
          "lastStockUpdate": "2023-11-20T12:34:05.753Z"
   },
  // ... diğer ürünler
  ],
 "total": 15,
  "page": 1,
"limit": 10,
"totalPages": 2
 }

}
```

GET /stock/{id}

Açıklama: Belirli bir ürünün stok durumunu getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "productId": 1,
        "quantity": 150,
        "lowStockThreshold": 20,
        "idealStockLevel": 500,
        "lastStockUpdate": "2023-11-15T09:30:00Z"
        // ... diğer stok bilgileri
    }
}

PATCH /stock/:id/quantity

Açıklama: Belirli bir ürünün stok miktarını günceller. Bu, veritabanında ki Stock nesnesinde ki quantity alanını günceller. Aynı zamanda StockHistory tablosuna da bir kayıt atar

İstek (application/json):

{
   "quantity": 200,
    "type": "IN", // Veya "OUT", "ADJUSTMENT" vb.
   "notes": "Manuel stok güncellemesi" // Opsiyonel
  }

Başarılı Yanıt (200 OK):

Stok Güncelleme İşlemi:

{
  "success": true,
     "data": {
       "message": "Stok Güncelleme İşlemi başarılı."
        }
 }

*   Stok Hareketi Ekleme:
  ```json
   {
     "success": true,
      "data": {
       "message": "Stok Hareketi ekleme başarılı"
       }
    }
  ```

*   **`GET /stock/:id/history`**
 *   **Açıklama:**  Belirli bir ürünün stok hareketleri geçmişini getirir.
 *   **Başarılı Yanıt (200 OK):**

 ```json
 {
  "success": true,
    "data": [
      {
         "id": 1,
         "stockId": 1,
          "productId": 1,
        "quantity": 50,
       "date": "2023-11-14T10:00:00Z",
        "type": "IN",
        "notes": "İlk stok girişi"
   },
    {
        "id": 2,
       "stockId": 1,
       "productId": 1,
        "quantity": -10,
        "date": "2023-11-15T15:30:00Z",
      "type": "OUT",
      "notes": "Satış"
        }
 // ... diğer stok hareketleri
  ]
}
 ```

*   **`POST /stock/transactions`**
 *   **Açıklama:** Yeni bir stok hareketi ekler. (Manuel stok girişi veya çıkışı için)
 *   **İstek (application/json):**

 ```json
 {
     "productId": 1,
     "quantity": 50, // Negatif değer verilirse stok çıkışı yapılır, ürün stoktan düşürülür
     "type": "IN",
     "notes": "Manuel stok girişi",
     "restaurantId":1
 }
 ```

 *   **Başarılı Yanıt (201 Created):**

 ```json
 {
   "success": true,
      "data": {
        "id": 3, // Yeni stok hareketi ID'si
        "stockId": 1,
        "productId": 1,
       "quantity": 50,
        "date": "2023-11-16T11:00:00Z",
       "type": "IN",
      "notes": "Manuel stok girişi",
       "restaurantId": 1
  }
}
 ```

*   **`PUT /stock/:id/threshold`**
 *   **Açıklama:**  Belirli bir ürünün kritik stok eşiğini (`lowStockThreshold`) günceller.
 *   **İstek (application/json):**

 ```json
 {
     "lowStockThreshold": 15
 }
 ```

 *   **Başarılı Yanıt (200 OK):**

 ```json
 {
   "success": true,
      "data": {
          "id": 1,
        "productId": 1,
       "lowStockThreshold": 15
          // ... diğer stok bilgileri
     }
 }
 ```

*   **`POST /stock/count`**
 *   **Açıklama:**  Stok sayımı yapar. Envanter ile Stoklar uyuşup uyuşmadığını kontrol eder
 * **İstek (application/json):**

       ```json
           {
           "branchId": 1,
           "countedBy": 1, // Kullanıcı ID'si
            "countedDate": "2023-11-25T10:00:00Z",
           "products": [
             {
                "productId": 1,
                  "countedQuantity": 145,
                "countedStockId": 1 // İlgili stok ID'si
               },
                {
                   "productId": 2,
                   "countedQuantity": 15,
                  "countedStockId": 2
               }
              ]
          }
      ```
*   **Başarılı Yanıt (200 OK):**

     ```json
          {
           "success": true,
               "data": {
                    "message": "Stok sayımı ve güncelleme işlemleri tamamlandı."
                   }
         }
  ```
  PUT /stock/count/:id

Açıklama: Stok sayım sonuçlarını günceller ve StockHistory kaydı ekler

İstek (application/json):

{
             "branchId": 1,
          "countedBy": 1,
          "countedDate": "2023-11-25T10:00:00Z",
           "products": [
        {
              "productId": 1,
              "countedQuantity": 21,
              "countedStockId": 1 // İlgili stok ID'si
         },
          {
             "productId": 2,
             "countedQuantity": 15,
            "countedStockId": 2
         }
        ]
    }

Başarılı Yanıt (200 OK):

{
         "success": true,
            "data": {
                "message": "Stok sayımı ve güncelleme işlemleri tamamlandı."
           }
}

*   **Not:** `id` parametresi, bu işlem için bir anlam ifade etmiyor, ancak tutarlılık açısından endpoint'te yer alması daha uygun olabilir.
*   **Öneri:** Sayım sonucunda stok miktarları değiştiyse (`countedQuantity` ile mevcut `quantity` uyuşmuyorsa), aradaki fark kadar `StockHistory` kaydı eklenmeli (tipi `ADJUSTMENT` olacak şekilde) ve stok miktarları (`quantity`) güncellenmeli.
Use code with caution.
GET /stock/low

Açıklama: Kritik stok seviyesinin altındaki ürünleri getirir.

Query Parametreleri:

branchId [number]: Şube ID'si ile filtreleme.

restaurantId [number]: Restoran ID'si ile filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK): GET /stock formatına benzer, ancak sadece quantity değeri lowStockThreshold değerinden düşük olan ürünleri içerir.

POST /stock/transfer

Açıklama: İki şube arasında stok transferi gerçekleştirir.

İstek (application/json):

{
    "fromBranchId": 1,
    "toBranchId": 2,
    "productId": 1,
    "quantity": 10,
    "transferBy": 1, // İşlemi yapan kullanıcı ID'si
    "notes": "Şubeler arası transfer"
}

Başarılı Yanıt (200 OK):

{
      "success": true,
        "data": {
           "message": "Stok transferi başarıyla gerçekleştirildi."
          }
}

GET /stock/branch/:branchId

Açıklama: Belirli bir şubedeki tüm stok durumunu listeler.

Başarılı Yanıt (200 OK): GET /stock ile aynı formatta.

GET /stock/threshold-alerts

Açıklama: Kritik stok seviyesi eşiğinin altındaki ürünler için uyarı listesi.

Query Parametreleri:

restaurantId [number]: Restoran ID'si ile filtreleme.

branchId [number]: Şube ID'si ile filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
    "success": true,
       "data": {
         "thresholdAlerts": [
            {
                "productId": 1,
               "productName": "Izgara Tavuk",
              "currentStock": 15,
               "lowStockThreshold": 20
               },
        // ... diğer ürünler
     ],
         "total": 5,
         "page": 1,
         "limit": 10,
         "totalPages": 1
      }
  }

GET /stock/expiring

Açıklama: Son kullanma tarihi yaklaşan ürünleri listeler.

Query Parametreleri:

restaurantId [number]: Restoran ID'si ile filtreleme.

branchId [number]: Şube ID'si ile filtreleme.

daysToExpiration [number]: Kaç gün içinde süresi dolacak ürünleri getirileceği (örneğin, 3 gün içinde süresi dolacaklar).

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "expiringProducts": [
            {
                "productId": 3,
                "productName": "Yoğurt",
                "expirationDate": "2023-12-01",
                "remainingDays": 5
            },
            // ... diğer ürünler
        ],
        "total": 10,
        "page": 1,
        "limit": 10,
        "totalPages": 1
    }
}

GET /stock/movements

Açıklama: Tüm stok hareketlerini (giriş, çıkış, transfer, vb.) listeler.

Query Parametreleri:

restaurantId [number]: Restoran ID'si ile filtreleme.

branchId [number]: Şube ID'si ile filtreleme.

productId [number]: Ürün ID'si ile filtreleme.

startDate [DateTime]: Başlangıç tarihi ile filtreleme.

endDate [DateTime]: Bitiş tarihi ile filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
   "success": true,
     "data": {
         "stockMovements": [
             {
               "id": 1,
                 "product": {
                       "id": 1,
                        "name": "Izgara Tavuk"
                   },
                   "quantity": 50,
                    "date": "2023-11-28T14:21:00.711Z",
                  "type": "IN",
                   "notes": "Satın alma siparişi #123"
            },
            {
              "id": 2,
                  "product": {
                    "id": 2,
                      "name": "Pilav"
                  },
                  "quantity": -5,
                  "date": "2023-11-28T15:12:00.711Z",
                  "type": "OUT",
                 "notes": "Sipariş #45"
          },
            {
               "id": 3,
               "product": {
                "id": 1,
                   "name": "Izgara Tavuk"
                   },
                   "quantity": -2,
                   "date": "2023-11-28T16:45:00.711Z",
                    "type": "ADJUSTMENT",
                   "notes": "Stok sayımı farkı"
           }
   // ... diğer stok hareketleri
     ],
    "total": 20,
     "page": 1,
      "limit": 10,
     "totalPages": 2
    }
}

8. Tedarikçi Yönetimi (/api/suppliers, /api/purchase-orders)

GET /suppliers

Açıklama: Tüm tedarikçileri listeler.

Query Parametreleri:

restaurantId [number]: Restoran ID'si ile filtreleme.

search [string]: Tedarikçi adı veya iletişim bilgilerinde arama.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "suppliers": [
            {
                "id": 1,
                "restaurantId": 1,
                "name": "Tedarikçi A",
                "contactName": "Ahmet Yılmaz",
                "phone": "05551234567",
                "email": "ahmet@tedarikci-a.com"
            },
            // ... diğer tedarikçiler
        ],
        "total": 30,
        "page": 1,
        "limit": 10,
        "totalPages": 3
    }
}

POST /suppliers

Açıklama: Yeni tedarikçi oluşturur.

İstek (application/json):

{
    "restaurantId": 1,
    "name": "{name}",
    "contactName": "{contactName}", // Opsiyonel
    "phone": "{phone}", // Opsiyonel
    "email": "{email}" // Opsiyonel
}

Başarılı Yanıt (201 Created):

{
    "success": true,
    "data": {
        "id": 1,
        "restaurantId": 1,
        "name": "Tedarikçi A",
        // ... diğer tedarikçi bilgileri
    }
}

GET /suppliers/{id}

Açıklama: Belirli bir tedarikçiyi ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "restaurantId": 1,
        "name": "Tedarikçi A",
        // ... diğer tedarikçi bilgileri
    }
}

PUT /suppliers/{id}

Açıklama: Belirli bir tedarikçiyi (ID'si ile) günceller.

İstek (application/json):

{
    "name": "{newName}",
    "contactName": "{newContactName}",
    "phone": "{newPhone}",
    "email": "{newEmail}"
}

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "id": 1,
        "restaurantId": 1,
        "name": "Tedarikçi A Güncel",
        // ... güncellenmiş tedarikçi bilgileri
    }
}

DELETE /suppliers/{id}

Açıklama: Belirli bir tedarikçiyi (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /suppliers/{id}/products

Açıklama: Belirli bir tedarikçinin sağladığı ürünleri getirir.

Başarılı Yanıt (200 OK):

{
     "success": true,
        "data": {
          "products": [
          {
            "productId": 1,
               "product":{
                  "id": 1,
                   "name": "Domates",
               },
         "supplierId": 1,
           "supplier":{
               "id": 1,
             "name": "Tedarikçi A",
            },
            "isPrimary": true,
           "lastPurchasePrice": 4.5,
            "supplierProductCode": "DMT-001"
          }
 // ... diğer ürünler
  ]
}

}
```

GET /suppliers/product/:productId

Açıklama: Belirli bir ürünü sağlayan tedarikçileri getirir.

Başarılı Yanıt (200 OK):

{
      "success": true,
           "data": {
             "suppliers": [
              {
                "supplierId": 1,
                "supplier": {
                 "id": 1,
                    "name": "Tedarikçi A"
                     },
                   "isPrimary": true,
               "lastPurchasePrice": 5,
              "supplierProductCode": "ABC-123"
               },
   // ... diğer tedarikçiler
      ]
   }
}

GET /purchase-orders

Açıklama: Tüm satın alma siparişlerini listeler.

Query Parametreleri:

supplierId [number]: Tedarikçi ID'si ile filtreleme.

status [PurchaseOrderStatus]: Sipariş durumuna göre filtreleme (PENDING, ORDERED, vb.).

startDate [DateTime]: Başlangıç tarihine göre filtreleme.

endDate [DateTime]: Bitiş tarihine göre filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
  "success": true,
   "data": {
     "purchaseOrders": [
        {
          "id": 1,
             "supplierId": 1,
           "supplier":{
                   "id":1,
                "name":"Tedarikçi A"
                  },
            "orderDate": "2023-11-15T08:00:00Z",
             "expectedDeliveryDate": "2023-11-20T08:00:00Z",
          "totalAmount": 250,
             "status": "ORDERED",
              "notes": "Acil",
          "items": [
                   {
                       "id": 1,
                      "purchaseOrderId": 1,
                     "productId": 1,
                      "product":{
                      "id":1,
                   "name":"Domates",
                  "cost":5
                   },
                 "quantity": 50,
              "unitPrice": 4,
              "totalPrice": 200
        },
           {
               "id": 2,
              "purchaseOrderId": 1,
             "productId": 2,
             "product":{
                 "id":2,
                   "name":"Salatalık",
                    "cost":2
                  },
              "quantity": 25,
              "unitPrice": 2,
              "totalPrice": 50
               }
   ]
 },

// ... diğer satın alma siparişleri
],
"total": 100,
"page": 1,
"limit": 10,
"totalPages": 10
}
}
```

POST /purchase-orders

Açıklama: Yeni satın alma siparişi oluşturur.

İstek (application/json):

{
      "supplierId": 1,
        "orderDate": "2023-11-29T08:00:00Z",
       "expectedDeliveryDate": "2023-12-05T10:00:00Z",
      "status": "PENDING",
        "notes": "Yeni sipariş notu deneme",
       "items": [
         {
               "productId": 1,
             "quantity": 15
             },
            {
                "productId": 2,
                "quantity": 10
           }
      ]
  }

Başarılı Yanıt (201 Created):

{
      "success": true,
        "data": {
        "message": "Satın alma siparişi başarıyla oluşturuldu",
          }
  }

GET /purchase-orders/{id}

Açıklama: Belirli bir satın alma siparişini ID'si ile getirir.

Başarılı Yanıt (200 OK): GET /purchase-orders formatı ile benzer.

PUT /purchase-orders/{id}

Açıklama: Belirli bir satın alma siparişini (ID'si ile) günceller.

İstek (application/json):

{
   "supplierId": 1, // tedarikçi id
   "orderDate": "2023-11-28T09:12:31.756Z",
    "expectedDeliveryDate": "2023-12-14T09:12:31.756Z", // teslimat tarihi
    "status": "ORDERED", // sipariş durumu
   "notes": "Güncel sipariş notu", // sipariş notu
     "items": [
      {
         "id":12,
       "productId": 4,
      "quantity": 33,
        "unitPrice": 5,
        "totalPrice": 165
     },
     {
          "productId": 6,
         "quantity": 2,
        "unitPrice": 32,
       "totalPrice": 64
       }
      ]
}

Başarılı Yanıt (200 OK):

{
     "success": true,
       "data": {
      "id": 15, // Güncellenen veri id
      // ... diğer güncellenmiş bilgiler
      }
  }

DELETE /purchase-orders/{id}

Açıklama: Belirli bir satın alma siparişini (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

PATCH /purchase-orders/{id}/status

Açıklama: Belirli bir satın alma siparişinin durumunu günceller.

İstek (application/json):

{
    "status": "DELIVERED"
}

Başarılı Yanıt (200 OK):

{
        "success": true,
           "data": {
             "id": 1,
              "status": "DELIVERED"
           // ... diğer sipariş bilgileri
             }
      }

GET /purchase-orders/supplier/:supplierId

Açıklama: Belirli bir tedarikçiye ait satın alma siparişlerini getirir.

Başarılı Yanıt (200 OK): GET /purchase-orders ile aynı formatta.

GET /purchase-orders/status/:status

Açıklama: Belirli bir durumdaki (status) satın alma siparişlerini getirir.

Başarılı Yanıt (200 OK): GET /purchase-orders ile aynı formatta.

GET /purchase-orders/date-range

Açıklama: Belirli bir tarih aralığındaki satın alma siparişlerini getirir.

Query Parametreleri:

startDate [DateTime]: Başlangıç tarihi.

endDate [DateTime]: Bitiş tarihi.

Başarılı Yanıt (200 OK): GET /purchase-orders ile aynı formatta.

10. Müşteri ve Rezervasyon (/api/customers, /api/reservations)

10.1. Müşteriler (/api/customers)

GET /customers

Açıklama: Tüm müşterileri listeler.

Query Parametreleri:

search [string]: İsim, telefon veya e-posta ile arama.

phoneNumber [string]: Telefon numarası ile arama.

email [string]: E-posta ile arama.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

restaurantId [number]: Restoran Id ile filtreleme

Başarılı Yanıt (200 OK):

{
 "success": true,
     "data": {
         "customers": [
           {
              "id": 1,
               "name": "Ahmet Yılmaz",
              "phoneNumber": "05321234567",
              "email": "ahmet@example.com"
             },
        // ... diğer müşteriler
           ],
           "total": 50,
             "page": 1,
          "limit": 10,
          "totalPages": 5
       }
}

POST /customers

Açıklama: Yeni müşteri oluşturur.

İstek (application/json):

{
    "restaurantId":1,
    "name": "{name}",
    "phoneNumber": "{phoneNumber}", // Opsiyonel
    "email": "{email}" // Opsiyonel
}

Başarılı Yanıt (201 Created):

{
 "success": true,
     "data": {
         "id": 101,
         "restaurantId": 1,
        "name": "Yeni Müşteri",
          "phoneNumber": null,
        "email": null
  }

}
```

GET /customers/{id}

Açıklama: Belirli bir müşteriyi ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ahmet Yılmaz",
     "phoneNumber": "05321234567",
    "email": "ahmet@example.com"
  // ... diğer müşteri bilgileri
 }

}
```

PUT /customers/{id}

Açıklama: Belirli bir müşteriyi (ID'si ile) günceller.

İstek (application/json):

{
    "name": "{newName}",
    "phoneNumber": "{newPhoneNumber}",
    "email": "{newEmail}"
}

Başarılı Yanıt (200 OK):

{
       "success": true,
       "data": {
             "id": 1,
             "name": "Ahmet Yılmaz Güncel",
               "phoneNumber": "05321234568",
              "email": "ahmetyilmaz@example.com"
      // ... güncellenmiş müşteri bilgileri
       }
  }

DELETE /customers/{id}

Açıklama: Belirli bir müşteriyi (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /customers/search

Açıklama: Müşterileri isim, telefon veya e-posta ile arar.

Query Parametreleri: search [string]: Aranacak kelime veya kelimeler.

Başarılı Yanıt (200 OK): GET /customers ile aynı formatta.

GET /customers/:id/orders

Açıklama: Belirli bir müşterinin siparişlerini getirir.

Başarılı Yanıt (200 OK): GET /orders ile aynı formatta (sadece ilgili müşteriye ait siparişler döner).

GET /customers/:id/reservations

Açıklama: Belirli bir müşterinin rezervasyonlarını getirir.

Başarılı Yanıt (200 OK): GET /reservations formatına benzer şekilde, müşteri ile ilişkili reservasyon bilgilerini listeler

GET /api/customers/:id/accounts
* Açıklama: Belirli bir müşterinin carilerini hesaplarını getirir.

Başarılı Yanıt (200 OK): GET /api/accounts formatına benzer şekilde, müşteri ile ilişkili hesap bilgilerini listeler

10.2. Rezervasyonlar (/api/reservations)

GET /reservations

Açıklama: Tüm rezervasyonları listeler.

Query Parametreleri:

customerId [number]: Müşteri ID'si ile filtreleme.

tableId [number]: Masa ID'si ile filtreleme.

branchId [number]: Şube ID'si ile filtreleme.

date [DateTime]: Rezervasyon tarihi ile filtreleme.

status [ReservationStatus]: Rezervasyon durumuna göre filtreleme (PENDING, CONFIRMED, vb.).

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
      "success": true,
        "data": {
          "reservations": [
              {
                   "id": 1,
                "customerId": 1,
                   "customer":{
                      "id":1,
                       "name":"Ahmet Yılmaz"
                },
                   "tableId": 5,
                 "table":{
                    "id":5,
                   "tableNumber":"A7"
                   },
              "reservationTime": "2023-12-01T19:00:00Z",
                  "partySize": 4,
                  "notes": "Cam kenarı olsun.",
                   "status": "PENDING"
         },
      // ... diğer rezervasyonlar
      ],
     "total": 20,
         "page": 1,
      "limit": 10,
      "totalPages": 2
  }
}

POST /reservations

Açıklama: Yeni rezervasyon oluşturur.

İstek (application/json):

{
    "restaurantId":1,
    "customerId": {customerId},
    "tableId": {tableId}, // Opsiyonel
    "reservationTime": "{reservationTime}",
    "partySize": {partySize},
    "notes": "{notes}", // Opsiyonel
    "status": "PENDING" // Gerekli ise
}

Başarılı Yanıt (201 Created):

{
      "success": true,
        "data": {
            "id": 1,
             "restaurantId": 1,
             "customerId": 1,
             "tableId": 5,
              "reservationTime": "2023-12-01T19:00:00Z",
              "partySize": 4,
              "notes": "Cam kenarı olsun."
     }
 }

GET /reservations/{id}

Açıklama: Belirli bir rezervasyonu ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
        "success": true,
       "data": {
          "id": 1,
             "customerId": 1,
          "tableId": 5,
         "reservationTime": "2023-12-01T19:00:00Z",
           "partySize": 4,
           "notes": "Cam kenarı olsun.",
           "status": "PENDING"
             // ... diğer rezervasyon bilgileri
         }
   }

PUT /reservations/{id}

Açıklama: Belirli bir rezervasyonu (ID'si ile) günceller.

İstek (application/json):

{
    "tableId": 10, // Opsiyonel
    "reservationTime": "2023-12-01T20:00:00Z", // Opsiyonel
     "partySize": 6, // Opsiyonel
    "notes": "Güncellenmiş notlar." // Opsiyonel
   }

Başarılı Yanıt (200 OK):

{
   "success": true,
    "data": {
         "id": 1,
     "tableId": 10,
       "reservationTime": "2023-12-01T20:00:00Z",
       "partySize": 6,
      "notes": "Güncellenmiş notlar.",
      "status": "CONFIRMED"
   // ... güncellenmiş rezervasyon bilgileri
    }
}

DELETE /reservations/{id}

Açıklama: Belirli bir rezervasyonu (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

PATCH /reservations/{id}/status

Açıklama: Belirli bir rezervasyonun durumunu günceller.

İstek (application/json):

{
    "status": "CONFIRMED",
    "cancellationReason": null // Opsiyonel, sadece CANCELLED durumunda doldurulabilir
}

Başarılı Yanıt (200 OK):

{
        "success": true,
        "data": {
             "id": 1,
             "status": "CONFIRMED"
             // ... diğer rezervasyon bilgileri
      }
 }

GET /reservations/date/{date}

Açıklama: Belirli bir tarihteki rezervasyonları getirir.

Başarılı Yanıt (200 OK): GET /reservations ile aynı formatta.

GET /reservations/customer/{customerId}

Açıklama: Belirli bir müşteriye ait rezervasyonları getirir.

Başarılı Yanıt (200 OK): GET /reservations ile aynı formatta.

GET /reservations/table/{tableId}

Açıklama: Belirli bir masaya ait rezervasyonları getirir.

Başarılı Yanıt (200 OK): GET /reservations ile aynı formatta.

GET /reservations/branch/{branchId}

Açıklama: Belirli bir şubedeki rezervasyonları getirir.

Başarılı Yanıt (200 OK): GET /reservations ile aynı formatta.

11. Ödeme ve Muhasebe (/api/payments, /api/accounts)

GET /payments

Açıklama: Tüm ödemeleri listeler.

Query Parametreleri:

orderId [number]: Sipariş ID'si ile filtreleme.

startDate [DateTime]: Başlangıç tarihi ile filtreleme.

endDate [DateTime]: Bitiş tarihi ile filtreleme.

paymentMethod [PaymentMethod]: Ödeme yöntemi ile filtreleme.

branchId [number]: Şube ID'si ile filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
"success": true,
"data": {
"payments": [
{
"id": 1,
"orderId": 1,
"order":{
"id":1,
"tableId":5,
"table":{
"id":5,
"tableNumber":"A5"
},
"totalAmount":424
},
"paymentMethod": "CREDIT_CARD",
"amount": 85,
"paymentTime": "2023-11-15T11:30:00Z",
"transactionId": "1234567890abcdef",
"cardPayment": {
"cardType": "VISA",
"lastFourDigits": "1234"
}
},
// ... diğer ödemeler
],
"total": 50,
"page": 1,
"limit": 10,
"totalPages": 5
}
}
```

POST /payments

Açıklama: Yeni ödeme kaydı oluşturur. Order nesnesi içerisinde ki totalAmount ile Payment nesnesi içerisindeki amount arasında ki fark sıfır olana dek ödeme almaya devam etmelidir. Eğer order nesnesi içerisindeki totalAmount dan daha düşük bir ödeme girildiyse ödenen miktara göre Order durumunu güncellemelidir (OrderStatus için yeni bir durum eklenebilir). Payment nesnesi içerisindeki amount ,Order nesnesi içerisinde ki totalAmount dan büyük olamaz.

İstek (application/json):

{
    "orderId": {orderId},
    "paymentMethod": "{CASH | CREDIT_CARD | DEBIT_CARD | VOUCHER | GIFT_CERTIFICATE | LOYALTY_POINTS}",
    "amount": {amount},
    "cardPayment": { // Sadece kartlı ödemelerde doldurulacak
        "cardType": "{VISA | MASTERCARD | AMEX | ...}",
        "lastFourDigits": "{lastFourDigits}",
        "transactionId": "{transactionId}"
    }
}

Başarılı Yanıt (201 Created):

{
   "success": true,
   "data": {
            "id": 3,
          "orderId": 21,
           "paymentMethod": "CASH",
            "amount": 237.5,
         "paymentTime": "2023-12-06T15:30:00.744Z",
         "transactionId": null,
          "cardPayment": null
     }

}
```

GET /payments/{id}

Açıklama: Belirli bir ödemeyi ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
      "success": true,
         "data": {
            "id": 1,
           "orderId": 1,
             "paymentMethod": "CREDIT_CARD",
           "amount": 85,
              "paymentTime": "2023-11-15T11:30:00Z",
               "transactionId": "1234567890abcdef",
                "cardPayment": {
                 "cardType": "VISA",
                "lastFourDigits": "1234"
          }
        }
   }

GET /payments/order/:orderId

Açıklama: Belirli bir siparişe ait ödemeleri getirir.

Başarılı Yanıt (200 OK): GET /payments ile aynı formatta (sadece ilgili siparişe ait ödemeler döner).

GET /payments/date/{date}

Açıklama: Belirli bir tarihteki ödemeleri getirir.

Başarılı Yanıt (200 OK): GET /payments ile aynı formatta.

GET /payments/branch/:branchId

Açıklama: Belirli bir şubeye ait ödemeleri getirir.

Başarılı Yanıt (200 OK): GET /payments ile aynı formatta.

GET /payments/method/:method

Açıklama: Belirli bir ödeme yöntemi (PaymentMethod) ile yapılan ödemeleri getirir.

Başarılı Yanıt (200 OK): GET /payments ile aynı formatta.

11.2. Muhasebe İşlemleri - Cari Hesaplar (/api/accounts)

GET /accounts

Açıklama: Tüm cari hesapları listeler.

Query Parametreleri:

accountType [AccountType]: Hesap türüne göre filtreleme (SUPPLIER, CUSTOMER, REVENUE, EXPENSE).

supplierId [number]: Tedarikçi ID'si ile filtreleme.

customerId [number]: Müşteri ID'si ile filtreleme.

restaurantId [number]: Restoran ID'si ile filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
   "success": true,
    "data": {
      "accounts": [
      {
             "id": 1,
             "restaurantId": 1,
              "accountName": "Tedarikçi A Cari",
               "accountType": "SUPPLIER",
             "balance": -500,
               "creditLimit": 1000,
              "supplierId": 1
             },
         {
             "id": 2,
              "restaurantId": 1,
               "accountName": "Ahmet Yılmaz",
            "accountType": "CUSTOMER",
            "balance": 150,
            "creditLimit": null,
            "customerId": 1
       },
  // ... diğer hesaplar
    ],
  "total": 50,
  "page": 1,
   "limit": 10,
  "totalPages": 5
}

}
```

POST /accounts

Açıklama: Yeni bir cari hesap oluşturur.

İstek (application/json):

{
   "restaurantId":1,
    "accountName": "{accountName}",
     "accountType": "{SUPPLIER | CUSTOMER | REVENUE | EXPENSE}",
     "creditLimit": {creditLimit}, // Opsiyonel
      "supplierId": {supplierId}, // Opsiyonel
    "customerId": {customerId} // Opsiyonel
   }

Başarılı Yanıt (201 Created):

{
      "success": true,
       "data": {
             "id": 3,
           "restaurantId": 1,
             "accountName": "Yeni Tedarikçi",
             "accountType": "SUPPLIER",
             "balance": 0,
          "creditLimit": 5000,
           "supplierId": 5,
            "customerId": null
      }

}
```

GET /accounts/{id}

Açıklama: Belirli bir cari hesabı ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
 "success": true,
  "data": {
      "id": 1,
      "restaurantId": 1,
        "accountName": "Tedarikçi A Cari",
       "accountType": "SUPPLIER",
       "balance": -500,
      "creditLimit": 1000,
     "supplierId": 1,
      "customerId": null
}

}
```

PUT /accounts/{id}

Açıklama: Belirli bir cari hesabı (ID'si ile) günceller.

İstek (application/json):

{
       "accountName": "{newAccountName}",
         "accountType": "{SUPPLIER | CUSTOMER | REVENUE | EXPENSE}",
      "creditLimit": {newCreditLimit}, // Opsiyonel
    }

Başarılı Yanıt (200 OK):

{
        "success": true,
       "data": {
            "id": 1,
          "restaurantId": 1,
             "accountName": "Tedarikçi A Cari - Güncel",
            "accountType": "SUPPLIER",
           "balance": -500, // Bakiye bilgisi değiştirilemez
           "creditLimit": 1500,
         "supplierId": 1,
         "customerId": null
         }
   }

DELETE /accounts/{id}

Açıklama: Belirli bir cari hesabı (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /accounts/transactions

Açıklama: Tüm hesap hareketlerini listeler.

Query Parametreleri:

accountId [number]: Hesap ID'si ile filtreleme.

startDate [DateTime]: Başlangıç tarihi ile filtreleme.

endDate [DateTime]: Bitiş tarihi ile filtreleme.

transactionType [TransactionType]: İşlem türüne göre (CREDIT, DEBIT) filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
     "success": true,
        "data": {
             "accountTransactions": [
             {
                     "id": 1,
                "accountId": 1,
                "date": "2023-11-15T09:00:00Z",
                   "amount": -100,
                 "type": "DEBIT",
                    "description": "Satın alma siparişi #1 ödemesi"
               },
             {
                     "id": 2,
                     "accountId": 2,
                    "date": "2023-11-15T12:00:00Z",
                "amount": 50,
                   "type": "CREDIT",
                "description": "Sipariş #123 ödemesi"
                 }
     // ... diğer hesap hareketleri
      ],
             "total": 100,
             "page": 1,
               "limit": 10,
          "totalPages": 10
   }
}

POST /accounts/transactions

Açıklama: Yeni hesap hareketi oluşturur.

İstek (application/json):

{
  "accountId": {accountId},
   "amount": {amount},
   "type": "{CREDIT | DEBIT}",
   "description": "{description}" // Opsiyonel
 }

Başarılı Yanıt (201 Created):

{
         "success": true,
           "data": {
          "id": 10,
              "accountId": 1,
           "date": "2023-11-29T18:54:44.775Z",
            "amount": 11,
           "type": "CREDIT",
            "description": "deneme"
      }
}

GET /accounts/transactions/{id}

Açıklama: Belirli bir hesap hareketini ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
   "success": true,
     "data": {
        "id": 1,
          "accountId": 1,
         "date": "2023-11-15T09:00:00Z",
        "amount": -100,
      "type": "DEBIT",
     "description": "Satın alma siparişi #1 ödemesi"
      }
 }

GET /accounts/transactions/account/{accountId}

Açıklama: Belirli bir hesaba ait hesap hareketlerini getirir.

Başarılı Yanıt (200 OK): GET /accounts/transactions ile aynı formatta (sadece ilgili hesaba ait hareketler döner).

GET /accounts/balance

Açıklama: Tüm hesapların toplam bakiyesini getirir veya id verilir ise o hesaba ait bakiye bilgisi döner

Query Parametreleri:

id [number]: Belirli bir hesabın bakiyesini almak için.

accountType [AccountType]: Hesap türüne göre (SUPPLIER, CUSTOMER, REVENUE, EXPENSE) bakiyeleri getirir.

supplierId [number]: Tedarikçi ID'si ile filtreleme.

customerId [number]: Müşteri ID'si ile filtreleme.

restaurantId [number]: Restoran ID'si ile filtreleme.

Başarılı Yanıt (200 OK):

{
  "success": true,
     "data": {
       "totalBalance": 1250, // Tüm hesapların toplam bakiyesi
         "accounts": [
          {
                 "id": 1,
              "accountName": "Tedarikçi A Cari",
               "balance": -500
             },
            {
                "id": 2,
              "accountName": "Ahmet Yılmaz",
              "balance": 150
         },
       // ... diğer hesaplar ve bakiyeleri (istenen filtrelere göre)
      ]
    }
 }

12. Raporlama (/api/reports)

Raporlama için daha önce bahsettiğimiz gibi her rapor için ayrı bir model (DailySalesReport, ProductSalesReport, vb.) ve endpoint (/api/reports/daily-sales, /api/reports/product-sales vb.) tasarlanabilir.

Örnek Olarak:

GET /api/reports/sales/daily

Açıklama: Günlük satış raporu getirir.

Query Parametreleri:

date [DateTime]: Raporun tarihi (varsayılan: bugün).

branchId [number]: Şube ID'si ile filtreleme (opsiyonel).

Başarılı Yanıt (200 OK):

{
      "success": true,
           "data": {
            "reportDate": "2023-11-15",
            "totalSales": 1500,
             "totalOrders": 50,
             "totalCustomers": 45,
           "averageOrderValue": 30,
              "topSellingProducts": [
             {
                 "productId": 1,
                  "productName": "Izgara Tavuk",
                "quantitySold": 20,
              "totalRevenue": 840
         },
        {
          "productId": 2,
          "productName": "Köfte",
          "quantitySold": 15,
            "totalRevenue": 600
          }
      // ...
     ],
      "salesByPaymentMethod": {
           "CASH": 500,
           "CREDIT_CARD": 700,
           "DEBIT_CARD": 300
   },
         "discountsTotal": 50,
          "taxesTotal": 120
      }
  }

GET /api/reports/sales/monthly

Açıklama: Aylık satış raporu getirir.

Query Parametreleri:

month [number]: Ay (1-12).

year [number]: Yıl.

branchId [number]: Şube ID'si ile filtreleme (opsiyonel).

Başarılı Yanıt (200 OK): Günlük rapora benzer, ancak aylık toplamları ve belki günlük bazda kırılımları içerir.

GET /api/reports/sales/yearly

Açıklama: Yıllık satış raporu getirir.

Query Parametreleri:

year [number]: Yıl.

branchId [number]: Şube ID'si ile filtreleme (opsiyonel).

Başarılı Yanıt (200 OK): Aylık rapora benzer, ancak yıllık toplamları ve aylık bazda kırılımları içerir.

GET /api/reports/products

Açıklama: Ürün bazlı satış raporu getirir.

Query Parametreleri:

startDate [DateTime]: Başlangıç tarihi.

endDate [DateTime]: Bitiş tarihi.

productId [number]: Ürün ID'si ile filtreleme (opsiyonel).

categoryId [number]: Kategori ID'si ile filtreleme (opsiyonel).

branchId [number]: Şube ID'si ile filtreleme (opsiyonel).

Başarılı Yanıt (200 OK):

{
        "success": true,
          "data": {
          "products": [
             {
                  "productId": 1,
                "productName": "Izgara Tavuk",
                 "totalQuantitySold": 150,
                  "totalRevenue": 6300,
                 "averagePrice": 42
                },
               {
                   "productId": 2,
                "productName": "Köfte",
               "totalQuantitySold": 120,
             "totalRevenue": 4800,
              "averagePrice": 40
                },
      // ... diğer ürünler
     ]
  }
}

GET /api/reports/staff

Açıklama: Personel (garson, kasiyer) performans raporu getirir.

Query Parametreleri:

startDate [DateTime]: Başlangıç tarihi.

endDate [DateTime]: Bitiş tarihi.

branchId [number]: Şube ID'si ile filtreleme (opsiyonel).

role [Role]: Role göre filtreleme (opsiyonel).

Başarılı Yanıt (200 OK):

{
     "success": true,
          "data": {
              "staff": [
             {
                   "staffId": 2,
                   "staffName": "Ali Veli",
                  "totalOrders": 200,
                "totalSales": 9000,
                  "averageOrderValue": 45
                },
            {
               "staffId": 3,
                  "staffName": "Ayşe Demir",
                  "totalOrders": 150,
                 "totalSales": 6750,
                 "averageOrderValue": 45
           }
       // ... diğer personel
      ]
   }
  }

GET /api/reports/tables

Açıklama: Masa bazlı rapor getirir (günlük, haftalık, aylık). Hangi masadan ne kadar sipariş alındı, ne kadar gelir elde edildi.

Query Parametreleri:

branchId [number]: Şube ID'si ile filtreleme (opsiyonel).

startDate [DateTime]: Başlangıç tarihi.

endDate [DateTime]: Bitiş tarihi.

Başarılı Yanıt (200 OK):

{
    "success": true,
         "data": {
         "tables": [
           {
                "tableId": 5,
             "tableName": "A5",
             "totalOrders": 55,
                 "totalRevenue": 2530
           },
         {
           "tableId": 7,
           "tableName": "A7",
              "totalOrders": 43,
              "totalRevenue": 2345
           }
     ]
  }

}
```

Diğer Raporlar: Dokümantasyonda belirtilen diğer raporlar için de benzer şekilde endpoint'ler oluşturulabilir. (/api/reports/stock, /api/reports/payments, /api/reports/customers, /api/reports/tax, /api/reports/cost-analysis, /api/reports/waste, /api/reports/branch-comparison, /api/reports/peak-hours, /api/reports/category-sales, vb.)

13. Yazıcı Yönetimi (/api/printers)

GET /printers

Açıklama: Tüm yazıcıları listeler.

Query Parametreleri:

restaurantId [number]: Restoran ID'si ile filtreleme.

branchId [number]: Şube ID'si ile filtreleme.

type [PrinterType]: Yazıcı türüne göre filtreleme (KITCHEN, CASHIER, LABEL, OTHER).

isActive [boolean]: Aktiflik durumuna göre filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
   "success": true,
   "data": {
       "printers": [
       {
             "id": 1,
             "restaurantId": 1,
               "branchId": 1,
          "name": "Mutfak Yazıcısı",
         "type": "KITCHEN",
         "ipAddress": "192.168.1.100",
        "port": 9100,
           "isActive": true,
         "isDefault": false
         },
      {
         "id": 2,
        "restaurantId": 1,
          "branchId": 1,
         "name": "Kasa Yazıcısı",
           "type": "CASHIER",
           "ipAddress": "192.168.1.101",
          "port": 9100,
           "isActive": true,
          "isDefault": true
        }
         // ... diğer yazıcılar
  ],
        "total": 5,
      "page": 1,
         "limit": 10,
      "totalPages": 1
   }

}
```

POST /printers

Açıklama: Yeni yazıcı ekler.

İstek (application/json):

{
     "restaurantId": 1,
    "branchId": 1, // Hangi şubeye bağlı olduğu
      "name": "Mutfak Yazıcı 2",
     "type": "KITCHEN",
       "ipAddress": "192.168.1.102",
       "port": 9100,
        "isActive": true
  }

Başarılı Yanıt (201 Created):

{
     "success": true,
     "data": {
     "id": 3,
    "restaurantId": 1,
     "branchId": 1,
      "name": "Mutfak Yazıcı 2",
        "type": "KITCHEN",
      "ipAddress": "192.168.1.102",
        "port": 9100,
         "isActive": true,
     "isDefault": false
       }
 }

GET /printers/{id}

Açıklama: Belirli bir yazıcıyı ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
        "success": true,
      "data": {
        "id": 1,
      "restaurantId": 1,
          "branchId": 1,
            "name": "Mutfak Yazıcısı",
          "type": "KITCHEN",
            "ipAddress": "192.168.1.100",
           "port": 9100,
          "isActive": true,
             "isDefault": false
     }
    }

PUT /printers/{id}

Açıklama: Belirli bir yazıcıyı (ID'si ile) günceller.

İstek (application/json):

{
        "name": "Yeni Yazıcı Adı",
       "type": "CASHIER",
        "ipAddress": "192.168.1.105",
         "port": 8100,
          "isActive": false,
        "isDefault": true
  }

Başarılı Yanıt (200 OK):

{
   "success": true,
    "data": {
         "id": 1,
       "restaurantId": 1,
      "branchId": 1,
     "name": "Yeni Yazıcı Adı",
         "type": "CASHIER",
       "ipAddress": "192.168.1.105",
      "port": 8100,
         "isActive": false,
          "isDefault": true
    }

}
```

DELETE /printers/{id}

Açıklama: Belirli bir yazıcıyı (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

POST /printers/{id}/print

Açıklama: Yazıcıya test çıktısı gönderir (veya belirli bir siparişi yazdırır).

İstek (application/json):

{
       "content": "Test çıktısı",
    "orderId": 1 // Opsiyonel, sipariş yazdırmak için
 }

veya sipariş yazdırmak için:

{
   "orderId": 1
  }

GET /printers/branch/:branchId

Açıklama: Belirli bir şubeye ait yazıcıları getirir.

Başarılı Yanıt (200 OK): GET /printers ile aynı formatta.

14. İzinler ve Yetkiler (/api/permissions, /api/user-permissions).......

GET /permissions

Açıklama: Sistemde tanımlı tüm izinleri listeler.

Başarılı Yanıt (200 OK):

{
     "success": true,
        "data": [
             {
            "id": 1,
                "name": "CREATE_PRODUCT",
               "description": "Ürün oluşturma izni"
              },
            {
               "id": 2,
               "name": "UPDATE_PRODUCT",
              "description": "Ürün güncelleme izni"
            },
    // ... diğer izinler
       ]
}

POST /permissions

Açıklama: Yeni bir izin oluşturur.

İstek (application/json):

{
     "name": "DELETE_USER",
       "description": "Kullanıcı silme izni"
  }

Başarılı Yanıt (201 Created):

{
    "success": true,
        "data": {
             "id": 3,
         "name": "DELETE_USER",
             "description": "Kullanıcı silme izni"
         }
}

GET /permissions/{id}

Açıklama: Belirli bir izni ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
       "success": true,
           "data": {
           "id": 1,
            "name": "CREATE_PRODUCT",
         "description": "Ürün oluşturma izni"
           }
 }

PUT /permissions/{id}

Açıklama: Belirli bir izni (ID'si ile) günceller.

İstek (application/json):

{
       "name": "CREATE_PRODUCT_UPDATED",
     "description": "Ürün oluşturma ve güncelleme izni"
   }

Başarılı Yanıt (200 OK):

{
   "success": true,
    "data": {
        "id": 1,
           "name": "CREATE_PRODUCT_UPDATED",
         "description": "Ürün oluşturma ve güncelleme izni"
       }
 }

DELETE /permissions/{id}

Açıklama: Belirli bir izni (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /user-permissions/{userId}

Açıklama: Belirli bir kullanıcının sahip olduğu veya olmadığı izinleri getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
       "userId": 1,
           "user":{
         "id": 1,
        "name": "TestUser"
         },
    "permissions": [
          {
              "id": 1,
            "name": "CREATE_PRODUCT",
           "description": "Ürün oluşturma izni",
           "allowed": true
       },
      {
        "id": 2,
       "name": "VIEW_REPORTS",
           "description": "Raporları görüntüleme izni",
             "allowed": false
       },
   {
    "id": 3,
     "name": "DELETE_USER",
     "description": "Kullanıcı silme izni",
      "allowed": false
 },
{
     "id": 4,
   "name": "MANAGE_ORDERS",
     "description": "Sipariş yönetme izni",
   "allowed": true
   }
 // ... diğer izinler, "allowed" alanı true ise kullanıcı bu izne sahip, false ise sahip değil
 ]
}

}
* **`POST /user-permissions/{userId}`** * **Açıklama:** Kullanıcıya yeni izin ekler veya izinleri güncellerjson
{
"permissions": [
{
"permissionId": 1,
"allowed": false // izin ekle
},
{
"permissionId": 2, // izni güncelle
"allowed": true
}
]
}

*   **`PUT /user-permissions/{userId}`**
        *   **Açıklama:**  Kullanıcının izinlerini günceller.
        *   **İstek (application/json):**

```json
          {
               "permissions": [
                      {
                         "permissionId": 1,
                          "allowed": false  // izin ekle
                      },
                        {
                          "permissionId": 2, // izni güncelle
                        "allowed": true
                  }
                ]
        }
Use code with caution.
DELETE /user-permissions/{userId}/permission/{permissionId}

Açıklama: Kullanıcının belirli bir iznini siler.

Başarılı Yanıt (204 No Content)	

15. Ürün Reçeteleri (/api/recipes)

GET /recipes

Açıklama: Tüm ürün reçetelerini listeler.

Query Parametreleri:

productId [number]: Ürün ID'si ile filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
    "success": true,
    "data": {
        "recipes": [
            {
                "id": 1,
                "productId": 1,
                "product": {
                    "id": 1,
                    "name": "Izgara Tavuk"
                },
                "ingredients": [
                    {
                        "id": 1,
                        "recipeId": 1,
                        "name": "Tavuk Göğsü",
                        "quantity": "200 gram"
                    },
                    {
                        "id": 2,
                        "recipeId": 1,
                        "name": "Tuz",
                        "quantity": "1 çay kaşığı"
                    },
                    {
                         "id": 3,
                        "recipeId": 1,
                        "name": "Özel Sos",
                       "quantity": "50 ml"
                       }
                    // ... diğer içerikler
                ]
            },
            // ... diğer reçeteler
        ],
        "total": 50,
        "page": 1,
        "limit": 10,
        "totalPages": 5
    }
}

POST /recipes

Açıklama: Yeni ürün reçetesi oluşturur.

İstek (application/json):

{
    "productId": 1,
    "ingredients": [
        {
            "name": "Tavuk Göğsü",
            "quantity": "200 gram"
        },
        {
            "name": "Özel Sos",
            "quantity": "50 ml"
        }
        // ... diğer içerikler
    ]
}

Başarılı Yanıt (201 Created):

{
   "success": true,
     "data": {
      "id": 1, // Yeni reçete ID'si
      "productId": 1,
     "ingredients": [
         {
               "id": 1,
            "recipeId": 1,
               "name": "Tavuk Göğsü",
               "quantity": "200 gram"
          },
          {
              "id": 2,
                "recipeId": 1,
              "name": "Özel Sos",
               "quantity": "50 ml"
           }
 // ... diğer içerikler
       ]
     }
  }

GET /recipes/{id}

Açıklama: Belirli bir reçeteyi ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
      "success": true,
           "data": {
           "id": 1,
            "productId": 1,
            "product": {
                "id": 1,
                "name": "Izgara Tavuk"
              },
         "ingredients": [
            {
                "id": 1,
                "recipeId": 1,
               "name": "Tavuk Göğsü",
               "quantity": "200 gram"
            },
             // ... diğer içerikler
       ]
   }
}

PUT /recipes/{id}

Açıklama: Belirli bir reçeteyi (ID'si ile) günceller.

İstek (application/json):

{
       "ingredients": [
       {
         "id": 1, // Eğer içerik zaten varsa ID'si gönderilmeli, yoksa eklenmeli
           "name": "Tavuk Göğsü (Organik)",
         "quantity": "250 gram"
      },
      {
        "name": "Özel Sos (Acılı)",
          "quantity": "60 ml"
       }
     // ... diğer içerikler
   ]
}

Başarılı Yanıt (200 OK):

{
    "success": true,
     "data": {
           "id": 1, // Güncellenen reçete ID'si
             "productId": 1, // Hangi ürüne ait olduğu
             "ingredients": [
           {
            "id": 1,
             "recipeId": 1,
             "name": "Tavuk Göğsü (Organik)",
                "quantity": "250 gram"
          },
      {
        "id": 2,
        "recipeId": 1,
         "name": "Özel Sos (Acılı)",
        "quantity": "60 ml"
    },
       // ... güncellenmiş içerikler
     ]
 }
}

DELETE /recipes/{id}

Açıklama: Belirli bir reçeteyi (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /recipes/product/:productId

Açıklama: Belirli bir ürüne ait reçeteyi getirir.

Başarılı Yanıt (200 OK): GET /recipes/{id} ile aynı formatta.

16. İndirimler (/api/discounts)

GET /discounts

Açıklama: Tüm indirimleri listeler.

Query Parametreleri:

orderId [number]: Sipariş ID'si ile filtreleme.

orderItemId [number]: Sipariş kalemi ID'si ile filtreleme.

type [DiscountType]: İndirim türüne göre filtreleme (PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y_FREE).

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
      "success": true,
       "data": {
         "discounts": [
           {
                "id": 1,
             "orderId": 1,
                 "orderItemId": null,
               "discountType": "PERCENTAGE",
             "discountAmount": 10,
              "note": "Öğrenci indirimi"
            },
         {
               "id": 2,
                "orderId": 1,
                "orderItemId": 2,
              "discountType": "FIXED_AMOUNT",
             "discountAmount": 5,
                 "note": "Özel indirim"
              }
            // ... diğer indirimler
      ],
         "total": 20,
           "page": 1,
           "limit": 10,
          "totalPages": 2
     }
  }

POST /discounts

Açıklama: Yeni indirim oluşturur.

İstek (application/json):

{
   "orderId": {orderId}, // Opsiyonel, sipariş ID'si
  "orderItemId": {orderItemId}, // Opsiyonel, sipariş kalemi ID'si
     "discountType": "{PERCENTAGE | FIXED_AMOUNT | BUY_X_GET_Y_FREE}",
   "discountAmount": {discountAmount},
   "note": "{note}" // Opsiyonel
 }

Başarılı Yanıt (201 Created):

{
    "success": true,
     "data": {
           "id": 3,
          "orderId": 2, // Hangi siparişe uygulandığı
       "orderItemId": 4, // Hangi ürüne (sipariş kalemi) uygulandığı,
     "discountType": "FIXED_AMOUNT",
     "discountAmount": 15,
      "note": "Manuel indirim"
    }
 }

GET /discounts/{id}

Açıklama: Belirli bir indirimi ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
      "success": true,
        "data": {
         "id": 1,
       "orderId": 1,
         "orderItemId": null,
            "discountType": "PERCENTAGE",
             "discountAmount": 10,
         "note": "Öğrenci indirimi"
      }
   }

PUT /discounts/{id}

Açıklama: Belirli bir indirimi (ID'si ile) günceller.

İstek (application/json):

{
     "discountType": "FIXED_AMOUNT", // Opsiyonel
   "discountAmount": 20, // Opsiyonel
  "note": "Yeni indirim notu" // Opsiyonel
 }

Başarılı Yanıt (200 OK):

{
     "success": true,
      "data": {
           "id": 1,
          "orderId": 1,
           "orderItemId": null,
           "discountType": "FIXED_AMOUNT",
           "discountAmount": 20,
        "note": "Yeni indirim notu"
        // ... güncellenmiş indirim bilgileri
        }
   }

DELETE /discounts/{id}

Açıklama: Belirli bir indirimi (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /discounts/order/:orderId

Açıklama: Belirli bir siparişe ait indirimleri getirir.

Başarılı Yanıt (200 OK): GET /discounts ile aynı formatta (sadece ilgili siparişe ait indirimler döner).

POST /discounts/apply

Açıklama: Siparişe veya sipariş kalemine indirim uygular. (Bu endpoint'in işlevi tam net değil, POST /discounts ile aynı işi yapıyor gibi. Siparişe veya sipariş kalemine uygulanacak indirim kurallarının ayrıca dökümante edilmesi gerekmekte.)

Öneri: Bu endpoint kaldırılabilir ve POST /discounts endpoint'i kullanılabilir.

17. Kart Ödemeleri (/api/card-payments)

GET /card-payments

Açıklama: Tüm kart ödemelerini listeler.

Query Parametreleri:

paymentId [number]: Ödeme ID'si ile filtreleme.

orderId [number]: Sipariş ID'si ile filtreleme

startDate [DateTime]: Başlangıç tarihi ile filtreleme.

endDate [DateTime]: Bitiş tarihi ile filtreleme.

cardType [string]: Kart tipi ile filtreleme (VISA, MASTERCARD vb.).

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
       "success": true,
         "data": {
            "cardPayments": [
               {
               "id": 1,
                    "paymentId": 1,
                    "payment":{
                        "id":1,
                       "paymentMethod":"CREDIT_CARD",
                    "amount": 250
                   },
                    "cardType": "VISA",
                     "lastFourDigits": "1234",
                   "transactionId": "tx123abc"
                 },
        {
           "id": 2,
                "paymentId": 2,
                 "payment":{
                 "id":2,
                     "paymentMethod":"CREDIT_CARD",
                 "amount": 150
                },
                   "cardType": "MASTERCARD",
                  "lastFourDigits": "5678",
                  "transactionId": "tx456def"
             }
       // ... diğer kart ödemeleri
     ],
             "total": 100,
             "page": 1,
             "limit": 10,
             "totalPages": 10
     }
 }

POST /card-payments

Açıklama: Yeni kart ödemesi ekler.

İstek (application/json):

{
      "paymentId": {paymentId},
       "cardType": "{VISA | MASTERCARD | AMEX | ...}",
      "lastFourDigits": "{lastFourDigits}",
      "transactionId": "{transactionId}"
  }

Başarılı Yanıt (201 Created):

{
     "success": true,
      "data": {
             "id": 3,
              "paymentId": 3,
          "cardType": "VISA",
          "lastFourDigits": "9876",
         "transactionId": "tx789ghi"
           }
    }

GET /card-payments/{id}

Açıklama: Belirli bir kart ödemesini ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
      "success": true,
      "data": {
      "id": 1,
     "paymentId": 1,
    "cardType": "VISA",
     "lastFourDigits": "1234",
        "transactionId": "tx123abc"
   }
 }

GET /card-payments/payment/:paymentId

Açıklama: Belirli bir ödemeye ait kart ödeme bilgilerini getirir.

Başarılı Yanıt (200 OK): GET /card-payments/{id} ile aynı formatta.

18. Ürün Seçenek Grupları (/api/option-groups, /api/options)

GET /option-groups

Açıklama: Tüm ürün seçenek gruplarını listeler.

Query Parametreleri:

productId [number]: Ürün ID'si ile filtreleme.

restaurantId [number]: Restoran ID'si ile filtreleme

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
   "success": true,
     "data": {
       "optionGroups": [
            {
                  "id": 1,
                  "productId": 1,
              "name": "Soslar",
              "isRequired": false,
             "minQuantity": 0,
                 "maxQuantity": 2
             },
      {
                "id": 2,
             "productId": 1,
                "name": "Ek Malzemeler",
               "isRequired": true,
                  "minQuantity": 1,
              "maxQuantity": 3
       }
    // ... diğer seçenek grupları
  ],
   "total": 15,
    "page": 1,
  "limit": 10,
 "totalPages": 2
   }

}
```

POST /option-groups

Açıklama: Yeni ürün seçeneği grubu oluşturur.

İstek (application/json):

{
      "productId": 1,
      "name": "İçecek Boyutları",
       "isRequired": true,
       "minQuantity": 1,
      "maxQuantity": 1
 }

Başarılı Yanıt (201 Created):

{
       "success": true,
        "data": {
              "id": 3,
              "productId": 1,
               "name": "İçecek Boyutları",
               "isRequired": true,
             "minQuantity": 1,
               "maxQuantity": 1
        }
  }

GET /option-groups/{id}

Açıklama: Belirli bir seçenek grubunu ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
   "success": true,
  "data": {
          "id": 1,
           "productId": 1,
        "name": "Soslar",
        "isRequired": false,
         "minQuantity": 0,
         "maxQuantity": 2,
      "options": [
       {
          "id": 1,
        "name": "Ketçap",
      "priceAdjustment": 0
          },
     {
        "id": 2,
         "name": "Mayonez",
        "priceAdjustment": 0
      }
 ]

}
}
```

PUT /option-groups/{id}

Açıklama: Belirli bir seçenek grubunu (ID'si ile) günceller.

İstek (application/json):

{
       "name": "Sos Seçenekleri",
         "isRequired": true,
     "minQuantity": 1,
       "maxQuantity": 5
 }

Başarılı Yanıt (200 OK):

{
          "success": true,
            "data": {
          "id": 1,
       "name": "Sos Seçenekleri",
     "isRequired": true,
           "minQuantity": 1,
        "maxQuantity": 5
  }
}

DELETE /option-groups/{id}

Açıklama: Belirli bir seçenek grubunu (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /option-groups/product/:productId

Açıklama: Belirli bir ürüne ait seçenek gruplarını getirir.

Başarılı Yanıt (200 OK): GET /option-groups ile aynı formatta, sadece ilgili ürüne ait seçenek grupları döner.

18.2. Seçenekler (/api/options)

GET /options

Açıklama: Tüm ürün seçeneklerini listeler.

Query Parametreleri:

optionGroupId [number]: Seçenek grubu ID'si ile filtreleme.

productId [number]: Ürün ID'si ile filtreleme (seçenek grubuna ve ürüne göre).

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
        "success": true,
       "data": {
          "options": [
              {
                 "id": 1,
                "optionGroupId": 1,
                 "name": "Ketçap",
                "priceAdjustment": 0
                },
           {
             "id": 2,
                "optionGroupId": 1,
                  "name": "Mayonez",
              "priceAdjustment": 0
               },
        {
           "id": 3,
             "optionGroupId": 2,
              "name": "Cheddar Peyniri",
             "priceAdjustment": 3
              }
           // ... diğer seçenekler
           ],
           "total": 50,
          "page": 1,
         "limit": 10,
           "totalPages": 5
   }
 }

POST /options

Açıklama: Yeni ürün seçeneği oluşturur.

İstek (application/json):

{
    "optionGroupId": 2,
     "name": "Ekstra Peynir",
    "priceAdjustment": 2.5
  }

Başarılı Yanıt (201 Created):

{
    "success": true,
   "data": {
      "id": 4,
        "optionGroupId": 2,
      "name": "Ekstra Peynir",
      "priceAdjustment": 2.5
   }

}
```

GET /options/{id}

Açıklama: Belirli bir seçeneği ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
     "success": true,
        "data": {
          "id": 1,
          "optionGroupId": 1,
             "name": "Ketçap",
           "priceAdjustment": 0
        }
}

PUT /options/{id}

Açıklama: Belirli bir seçeneği (ID'si ile) günceller.

İstek (application/json):

{
   "name": "Acı Ketçap",
    "priceAdjustment": 1.5
    }

Başarılı Yanıt (200 OK):

{
    "success": true,
       "data": {
        "id": 1,
         "optionGroupId": 1,
        "name": "Acı Ketçap",
        "priceAdjustment": 1.5
       }
}

DELETE /options/{id}

Açıklama: Belirli bir seçeneği (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /options/group/:groupId

Açıklama: Belirli bir seçenek grubuna ait seçenekleri getirir.

Başarılı Yanıt (200 OK): GET /options ile aynı formatta, sadece ilgili gruba ait seçenekler döner.

19. Sipariş Kalemleri (/api/order-items)

GET /order-items

Açıklama: Tüm sipariş kalemlerini listeler.

Query Parametreleri:

orderId [number]: Sipariş ID'si ile filtreleme.

productId [number]: Ürün ID'si ile filtreleme.

type [OrderItemType]: Sipariş kalem türüne göre filtreleme (SALE, COMPLEMENTARY, VOID).

status [OrderItemStatus]: Sipariş kalem durumuna göre filtreleme (PENDING, PREPARING, READY).

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
   "success": true,
    "data": {
      "orderItems": [
      {
             "id": 1,
         "orderId": 1,
          "productId": 1,
         "quantity": 2,
             "unitPrice": 42,
             "totalPrice": 84,
              "discount": 0,
          "isVoid": false,
         "type": "SALE",
          "orderItemStatus": "PREPARING",
          "preparationStartTime": null,
           "preparationEndTime": null,
        "selectedOptions": [
           {
       "id": 2,
          "optionGroupId": 1,
            "name": "Mayonez",
          "priceAdjustment": 0
             }
        ]
    },
 {
       "id": 2,
         "orderId": 1,
        "productId": 2,
          "quantity": 1,
      "unitPrice": 3,
       "totalPrice": 3,
        "discount": 0,
      "isVoid": false,
      "type": "SALE",
    "orderItemStatus": "READY",
      "preparationStartTime": "2023-11-15T10:15:00Z",
         "preparationEndTime": "2023-11-15T10:20:00Z",
          "selectedOptions": []
         },
    // ... diğer sipariş kalemleri
       ],
       "total": 50,
       "page": 1,
        "limit": 10,
      "totalPages": 5
    }

}
```

POST /order-items

Açıklama: Yeni sipariş kalemi oluşturur.

İstek (application/json):

{
      "orderId": 1,
        "productId": 3,
        "quantity": 1,
        "unitPrice": 15,
        "totalPrice": 15,
      "discount": 0,
      "isVoid": false,
       "type": "SALE",
    "orderItemStatus": "PENDING",
     "preparationStartTime": null,
      "preparationEndTime": null,
     "selectedOptions": [
              {
       "optionId": 5
     },
    {
     "optionId": 6
      }
     ]
}

Başarılı Yanıt (201 Created):

{
  "success": true,
  "data": {
   "id": 3,
    "orderId": 1,
  "productId": 3,
  "quantity": 1,
     "unitPrice": 15,
    "totalPrice": 15,
     "discount": 0,
      "isVoid": false,
   "type": "SALE",
    "orderItemStatus": "PENDING",
      "preparationStartTime": null,
   "preparationEndTime": null,
     "selectedOptions": [
       {
     "id": 5,
      "name": "Cheddar Peyniri"
  },
    {
         "id": 6,
        "name": "Turşu"
         }
    ]
    }
}

PUT /order-items/{id}

Açıklama: Belirli bir sipariş kalemini (ID'si ile) günceller.

İstek (application/json):

{
        "quantity": 3,
       "unitPrice": 16,
     "totalPrice": 48,
     "discount": 5,
       "isVoid": false,
      "type": "SALE",
     "orderItemStatus": "PREPARING",
      "preparationStartTime": "2023-11-29T10:00:00Z",
      "preparationEndTime": null,
        "selectedOptions": [
      {
        "optionId": 5
       },
     {
       "optionId": 6
        }
  ]

}
```

*   **Başarılı Yanıt (200 OK):**

```json
  {
     "success": true,
       "data": {
     "id": 3, // Güncellenen sipariş kalemi ID'si
       "orderId": 1, // Hangi siparişe ait olduğu
    "productId": 3, // Hangi ürüne ait olduğu
     "quantity": 3, // Güncellenmiş miktar
     "unitPrice": 16, // Güncellenmiş birim fiyat
   "totalPrice": 48, // Güncellenmiş toplam fiyat
      "discount": 5, // Güncellenmiş indirim
      "isVoid": false, // Güncellenmiş iptal durumu
     "type": "SALE", // Güncellenmiş tür
       "orderItemStatus": "PREPARING", // Güncellenmiş durum
     "preparationStartTime": "2023-11-29T10:00:00Z", // Güncellenmiş başlama zamanı
   "preparationEndTime": null, // Güncellenmiş bitiş zamanı
       "selectedOptions": [ // Güncellenmiş seçenekler
           {
        "optionId": 5,
             "name": "Cheddar Peyniri"
          },
         {
           "optionId": 6,
               "name": "Turşu"
      }
       ]
      }
    }
```
Use code with caution.
PATCH /order-items/{id}/status

Açıklama: Sipariş kaleminin durumunu günceller (örn. PENDING, PREPARING, READY) ve başlama/bitiş zamanlarını kaydeder.

İstek (application/json):

{
  "status": "READY",
  "preparationStartTime": "2023-11-29T11:00:00Z",
  "preparationEndTime": "2023-11-29T11:15:00Z"
}

Başarılı Yanıt (200 OK):

{
       "success": true,
        "data": {
           "id": 1,
         "orderItemStatus": "READY",
         "preparationStartTime": "2023-11-29T11:00:00Z",
        "preparationEndTime": "2023-11-29T11:15:00Z"
          // ... diğer sipariş kalemi bilgileri
     }
  }

PATCH /order-items/{id}/void

Açıklama: Sipariş kalemini iptal eder (isVoid alanını true yapar, type alanını VOID yapar).

İstek (application/json):

{
     "isVoid": true
  }

Başarılı Yanıt (200 OK):

{
      "success": true,
       "data": {
       "id": 1,
      "isVoid": true,
      "type": "VOID"
     // ... diğer sipariş kalemi bilgileri
        }
  }

GET /order-items/{id}

Açıklama: Belirli bir sipariş kalemini ID'si ile getirir.

Başarılı Yanıt (200 OK): POST /order-items'in başarılı yanıt formatına benzer.

DELETE /order-items/{id}

Açıklama: Belirli bir sipariş kalemini (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /order-items/order/:orderId

Açıklama: Belirli bir siparişe ait tüm sipariş kalemlerini getirir.

Başarılı Yanıt (200 OK): GET /order-items ile aynı formatta, sadece ilgili siparişe ait kalemler döner.

GET /order-items/product/:productId

Açıklama: Belirli bir ürüne ait tüm sipariş kalemlerini (farklı siparişlerdeki) getirir.

Başarılı Yanıt (200 OK): GET /order-items ile aynı formatta.

20. Cari Hesap İşlemleri (/api/accounts, /api/account-transactions)

(Bu bölüm 11.2'de detaylı olarak ele alınmıştı. Sadece endpoint tanımlarını tekrar yazıyorum.)

GET /accounts (parametreler: accountType, supplierId, customerId, restaurantId, page, limit)

POST /accounts

GET /accounts/{id}

PUT /accounts/{id}

DELETE /accounts/{id}

GET /accounts/balance (parametre: id, accountType, supplierId, customerId, restaurantId)

GET /accounts/transactions (parametreler: accountId, startDate, endDate, transactionType, page, limit)

POST /accounts/transactions

GET /accounts/transactions/{id}

GET /accounts/transactions/account/{accountId}

21. Reçete İçerikleri (/api/recipe-ingredients)

GET /recipe-ingredients

Açıklama: Tüm reçete içeriklerini listeler.

Query Parametreleri:

recipeId [number]: Reçete ID'si ile filtreleme.

productId [number]: Ürün ID'si ile filtreleme (reçeteye ve ürüne göre).

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
   "success": true,
      "data": {
        "recipeIngredients": [
        {
             "id": 1,
               "recipeId": 1,
              "name": "Tavuk Göğsü",
              "quantity": "200 gram"
            },
       {
               "id": 2,
              "recipeId": 1,
             "name": "Özel Sos",
                "quantity": "50 ml"
         },
        // ... diğer içerikler
        ],
       "total": 10,
       "page": 1,
         "limit": 10,
       "totalPages": 1
     }
 }

POST /recipe-ingredients

Açıklama: Yeni reçete içeriği oluşturur.

İstek (application/json):

{
    "recipeId": 1,
    "name": "Domates",
    "quantity": "1 adet"
}

Başarılı Yanıt (201 Created):

{
   "success": true,
     "data": {
        "id": 3, // Yeni içerik ID'si
        "recipeId": 1,
        "name": "Domates",
        "quantity": "1 adet"
       }
}

GET /recipe-ingredients/{id}

Açıklama: Belirli bir reçete içeriğini ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
    "success": true,
     "data": {
       "id": 1,
         "recipeId": 1,
       "name": "Tavuk Göğsü",
          "quantity": "200 gram"
       }
 }

PUT /recipe-ingredients/{id}

Açıklama: Belirli bir reçete içeriğini (ID'si ile) günceller.

İstek (application/json):

{
     "name": "Organik Tavuk Göğsü",
     "quantity": "250 gram"
 }

Başarılı Yanıt (200 OK):

{
      "success": true,
         "data": {
          "id": 1,
             "recipeId": 1,
          "name": "Organik Tavuk Göğsü",
            "quantity": "250 gram"
    }
 }

DELETE /recipe-ingredients/{id}

Açıklama: Belirli bir reçete içeriğini (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /recipe-ingredients/recipe/:recipeId

Açıklama: Belirli bir reçeteye ait içerikleri getirir.

Başarılı Yanıt (200 OK): GET /recipe-ingredients ile aynı formatta, sadece ilgili reçeteye ait içerikler döner.

22. Fiyat Geçmişi (/api/price-history)

GET /price-history

Açıklama: Tüm ürünlerin fiyat geçmişini listeler.

Query Parametreleri:

productId [number]: Ürün ID'si ile filtreleme.

startDate [DateTime]: Başlangıç tarihi ile filtreleme.

endDate [DateTime]: Bitiş tarihi ile filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
  "success": true,
   "data": {
     "priceHistory": [
           {
              "id": 1,
                "productId": 1,
               "product":{
                 "id":1,
               "name":"Kola"
             },
               "oldPrice": 40,
            "newPrice": 45,
                "startDate": "2023-10-26T00:00:00Z",
                "endDate": "2023-11-15T00:00:00Z"
            },
            {
            "id": 2,
            "productId": 2,
               "product":{
              "id":2,
             "name":"Ayran"
                },
           "oldPrice": 10,
            "newPrice": 15,
              "startDate": "2023-11-25T00:00:00Z",
               "endDate": null
        }
    // ... diğer fiyat geçmişi kayıtları
  ],
  "total": 100,
   "page": 1,
   "limit": 10,
    "totalPages": 10
   }
}

POST /price-history

Açıklama: Ürün fiyat geçmişi oluşturur. Fiyat değişimi olduğunda Product tablosunda güncelleme yapılırken buraya da yeni kayıt eklenmesi daha doğru olacaktır

İstek (application/json):

{
   "productId": 1,
     "oldPrice": 45,
     "newPrice": 50,
      "startDate": "2023-11-15T00:00:00Z"
}

Başarılı Yanıt (201 Created):

{
      "success": true,
      "data": {
            "id": 3, // Yeni kayıt ID'si
            "productId": 1,
         "oldPrice": 45,
           "newPrice": 50,
             "startDate": "2023-11-15T00:00:00Z",
           "endDate": null
       }

}
```

GET /price-history/{id}

Açıklama: Belirli bir fiyat geçmişi kaydını ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
     "success": true,
     "data": {
        "id": 1,
         "productId": 1,
      "oldPrice": 40,
         "newPrice": 45,
        "startDate": "2023-10-26T00:00:00Z",
      "endDate": "2023-11-15T00:00:00Z"
    }
 }

GET /price-history/product/:productId

Açıklama: Belirli bir ürüne ait fiyat geçmişini getirir.

Başarılı Yanıt (200 OK): GET /price-history ile aynı formatta, sadece ilgili ürüne ait kayıtlar döner.

23. Satın Alma Sipariş Kalemleri (/api/purchase-order-items)

GET /purchase-order-items

Açıklama: Tüm satın alma sipariş kalemlerini listeler.

Query Parametreleri:

purchaseOrderId [number]: Satın alma siparişi ID'si ile filtreleme.

productId [number]: Ürün ID'si ile filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
       "success": true,
         "data": {
          "purchaseOrderItems": [
           {
            "id": 1,
                 "purchaseOrderId": 1,
                  "productId": 1,
                   "product":{
                         "id":1,
                   "name":"Domates"
                },
            "quantity": 100,
               "unitPrice": 4.5,
              "totalPrice": 450
          },
       {
              "id": 2,
               "purchaseOrderId": 1,
             "productId": 2,
               "product":{
                  "id":2,
               "name":"Salatalık"
           },
               "quantity": 50,
             "unitPrice": 2,
                "totalPrice": 100
             }
        // ... diğer sipariş kalemleri
     ],
      "total": 50,
           "page": 1,
         "limit": 10,
          "totalPages": 5
     }
   }

POST /purchase-order-items

Açıklama: Yeni satın alma sipariş kalemi oluşturur.

İstek (application/json):

{
      "purchaseOrderId": 1,
      "productId": 3,
      "quantity": 25,
       "unitPrice": 5,
       "totalPrice": 125
 }

Başarılı Yanıt (201 Created):

{
         "success": true,
             "data": {
             "id": 3, // Yeni sipariş kalemi ID'si
           "purchaseOrderId": 1,
             "productId": 3,
           "quantity": 25,
          "unitPrice": 5,
            "totalPrice": 125
           }
   }

GET /purchase-order-items/{id}

Açıklama: Belirli bir satın alma sipariş kalemini ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
          "success": true,
        "data": {
       "id": 1,
     "purchaseOrderId": 1,
      "productId": 1,
        "quantity": 100,
       "unitPrice": 4.5,
       "totalPrice": 450
    }
  }

PUT /purchase-order-items/{id}

Açıklama: Belirli bir satın alma sipariş kalemini (ID'si ile) günceller.

İstek (application/json):

{
         "quantity": 75,
        "unitPrice": 4.8,
        "totalPrice": 360
     }

Başarılı Yanıt (200 OK):

{
  "success": true,
   "data": {
      "id": 1, // Güncellenen sipariş kalemi ID'si
         "purchaseOrderId": 1, // Hangi siparişe ait olduğu
      "productId": 1, // Hangi ürüne ait olduğu
    "quantity": 75,
      "unitPrice": 4.8,
       "totalPrice": 360
       }
}

DELETE /purchase-order-items/{id}

Açıklama: Belirli bir satın alma sipariş kalemini (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /purchase-order-items/order/:purchaseOrderId

Açıklama: Belirli bir satın alma siparişine ait tüm sipariş kalemlerini getirir.

Başarılı Yanıt (200 OK): GET /purchase-order-items ile aynı formatta.

24. Ürün-Tedarikçi İlişkileri (/api/product-suppliers)

GET /product-suppliers

Açıklama: Tüm ürün-tedarikçi ilişkilerini listeler.

Query Parametreleri:

productId [number]: Ürün ID'si ile filtreleme.

supplierId [number]: Tedarikçi ID'si ile filtreleme.

isPrimary [boolean]: Birincil tedarikçi olup olmamasına göre filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
     "success": true,
     "data": {
     "productSuppliers": [
     {
         "productId": 1,
           "product": {
                "id": 1,
               "name": "Domates"
             },
          "supplierId": 1,
         "supplier": {
            "id": 1,
            "name": "Tedarikçi A"
            },
          "isPrimary": true,
              "lastPurchasePrice": 4.5,
             "supplierProductCode": "DMT-001"
      },
     {
            "productId": 2,
           "product": {
             "id": 2,
             "name": "Salatalık"
               },
       "supplierId": 2,
        "supplier": {
            "id": 2,
              "name": "Tedarikçi B"
             },
           "isPrimary": false,
            "lastPurchasePrice": 2.5,
          "supplierProductCode": "SLT-002"
         }
         // ... diğer ürün-tedarikçi ilişkileri
       ],
         "total": 50,
        "page": 1,
        "limit": 10,
       "totalPages": 5
    }

}
```

POST /product-suppliers

Açıklama: Yeni ürün-tedarikçi ilişkisi oluşturur.

İstek (application/json):

{
       "productId": 1,
      "supplierId": 2,
        "isPrimary": false,
      "lastPurchasePrice": 4.8,
     "supplierProductCode": "DMT-002"
}

Başarılı Yanıt (201 Created):

{
    "success": true,
      "data": {
           "productId": 1,
             "supplierId": 2,
          "isPrimary": false,
            "lastPurchasePrice": 4.8,
        "supplierProductCode": "DMT-002"
     }
  }

GET /product-suppliers/:productId/:supplierId

Açıklama: Belirli bir ürün ve tedarikçi için ilişkiyi getirir.

Başarılı Yanıt (200 OK):

{
      "success": true,
     "data": {
      "productId": 1,
         "supplierId": 1,
        "isPrimary": true,
         "lastPurchasePrice": 4.5,
       "supplierProductCode": "DMT-001"
     }
  }

PUT /product-suppliers/:productId/:supplierId

Açıklama: Belirli bir ürün-tedarikçi ilişkisini günceller.

İstek (application/json):

{
    "isPrimary": false,
    "lastPurchasePrice": 4.2,
    "supplierProductCode": "DMT-003"
}

Başarılı Yanıt (200 OK):

{
    "success": true,
      "data": {
            "productId": 1,
            "supplierId": 1,
            "isPrimary": false,
         "lastPurchasePrice": 4.2,
          "supplierProductCode": "DMT-003"
  }
 }

DELETE /product-suppliers/:productId/:supplierId

Açıklama: Belirli bir ürün-tedarikçi ilişkisini siler.

Başarılı Yanıt (204 No Content)

GET /product-suppliers/product/:productId

Açıklama: Belirli bir ürüne ait tüm tedarikçi ilişkilerini getirir.

Başarılı Yanıt (200 OK): GET /product-suppliers ile aynı formatta, sadece ilgili ürüne ait kayıtlar döner.

GET /product-suppliers/supplier/:supplierId

Açıklama: Belirli bir tedarikçiye ait tüm ürün ilişkilerini getirir.

Başarılı Yanıt (200 OK): GET /product-suppliers ile aynı formatta, sadece ilgili tedarikçiye ait kayıtlar döner.

25. Restoran Ayarları (/api/settings)

GET /settings

Açıklama: Tüm restoran ayarlarını listeler.

Query Parametreleri:

restaurantId [number]: Restoran ID'si ile filtreleme.

page [number]: Sayfa numarası.

limit [number]: Sayfa başına kayıt sayısı.

Başarılı Yanıt (200 OK):

{
       "success": true,
         "data": {
         "settings": [
            {
                "id": 1,
                 "restaurantId": 1,
                  "restaurant": {
                    "id": 1,
                      "name": "Örnek Restoran 1"
                    },
                  "appName": "Restoran Yönetim Sistemi",
                 "appLogoUrl": null,
                 "currency": "TL",
               "timezone": "Europe/Istanbul",
               "dailyCloseTime": null,
                  "workingHours": null
             },
          {
            "id": 2,
            "restaurantId": 2,
             "restaurant": {
              "id": 2,
                 "name": "Örnek Restoran 2"
           },
           "appName": null,
          "appLogoUrl": "https://cdn.logo.com/img.png",
            "currency": "$",
            "timezone": "Europe/London",
          "dailyCloseTime": "02:00",
          "workingHours": "07:00-23:59"
        }
       ],
       "total": 2,
       "page": 1,
         "limit": 25,
        "totalPages": 1
 }
}

POST /settings

Açıklama: Yeni restoran ayarları oluşturur.

İstek (application/json):

{
       "restaurantId": 1,
          "appName": "Restoran Yönetim Sistemi",
            "appLogoUrl": null,
             "currency": "TL",
             "timezone": "Europe/Istanbul",
           "dailyCloseTime": "03:00",
             "workingHours": "08:00-00:00"
     }

Başarılı Yanıt (201 Created):

{
           "success": true,
             "data": {
             "id": 1,
              "restaurantId": 1,
              "appName": "Restoran Yönetim Sistemi",
               "appLogoUrl": null,
            "currency": "TL",
              "timezone": "Europe/Istanbul",
            "dailyCloseTime": "03:00",
                "workingHours": "08:00-00:00"
             }
    }

GET /settings/{id}

Açıklama: Belirli bir restoran ayarını ID'si ile getirir.

Başarılı Yanıt (200 OK):

{
 "success": true,
  "data": {
  "id": 1,
    "restaurantId": 1,
  "appName": "Restoran Yönetim Sistemi",
   "appLogoUrl": null,
  "currency": "TL",
     "timezone": "Europe/Istanbul",
     "dailyCloseTime": "03:00",
    "workingHours": "08:00-00:00"
   }
}

PUT /settings/{id}

Açıklama: Belirli bir restoran ayarını (ID'si ile) günceller.

İstek (application/json):

{
     "appName": "Yeni Restoran Yönetim Sistemi",
      "appLogoUrl": "https://cdn.logo.com/img-updated.png",
      "currency": "USD",
     "timezone": "Europe/London",
      "dailyCloseTime": "02:00",
        "workingHours": "07:00-23:59"
   }

Başarılı Yanıt (200 OK):

{
  "success": true,
     "data": {
         "id": 1,
            "restaurantId": 1,
            "appName": "Yeni Restoran Yönetim Sistemi",
           "appLogoUrl": "https://cdn.logo.com/img-updated.png",
            "currency": "USD",
        "timezone": "Europe/London",
        "dailyCloseTime": "02:00",
            "workingHours": "07:00-23:59"
          }

}
```

DELETE /settings/{id}

Açıklama: Belirli bir restoran ayarını (ID'si ile) siler.

Başarılı Yanıt (204 No Content)

GET /settings/restaurant/:restaurantId

Açıklama: Belirli bir restoranın ayarlarını getirir.

Başarılı Yanıt (200 OK): GET /settings/{id} ile aynı formatta.

Genel Öneriler:

Tutarlılık: Tüm endpoint'ler için tutarlı bir isimlendirme ve URL yapısı kullanmaya özen gösterin.

Hata Kodları: Hata durumlarında doğru HTTP durum kodlarını (400, 401, 403, 404, 500 vb.) ve anlamlı hata mesajları dönmeye dikkat edin.

Versiyonlama: API'yi versiyonlamak (/api/v1/restaurants, /api/v2/restaurants gibi) ileride yapılacak değişiklikler için esneklik sağlayacaktır.

Dokümantasyon: Her endpoint'in ne iş yaptığı, hangi parametreleri aldığı, nasıl bir yanıt döndüğü gibi bilgileri detaylı bir şekilde dokümante edin. Ayrıca, veri tiplerini (string, number, boolean, enum değerleri) ve örnek istek/yanıt formatlarını da ekleyin.

Güvenlik: Özellikle hassas verilerle işlem yaparken (kullanıcı bilgileri, ödemeler vb.) gerekli güvenlik önlemlerini alın.


Sayfalama: Çok sayıda kayıt dönmesi beklenen endpoint'lerde (örneğin, GET /orders, GET /products) sayfalama (page ve limit parametreleri) desteği ekleyin.

Filtreleme/Sıralama: GET isteklerinde, where, orderBy gibi sorgu parametreleri ile verilere filtre veya sıralama uygulanmasını sağlayabilirsiniz.

Üçüncü Taraf Entegrasyonları: Online sipariş platformları, ödeme sistemleri, e-fatura entegrasyonu gibi, dış sistemlerle yapılacak entegrasyonları da dikkate alarak API'yı tasarlayın.


Recipe ve RecipeIngredient Modelleri: Malzeme miktarları (quantity) için ondalıklı sayıları (Float) desteklemek faydalı olabilir (örneğin, 0.5 kg, 2.5 litre).

StockHistory Modeli: Bu model, stok hareketlerini izlemek için kullanılabilir. Ancak, hangi işlem sonucunda (satın alma, satış, sayım, transfer, fire) stok hareketinin oluştuğu bilgisi eksik. type alanı StockTransactionType enum'u ile (IN, OUT, ADJUSTMENT, TRANSFER, WASTE) bu bilgi eklenebilir ve StockHistory içerisinde sipariş için OUT (OrderItem a id si üzerinden) , satın alma için (PurchaseOrderItem id si üzerinden) , TRANSFER ve ADJUSTMENT için (StockTransfer tablosu oluşturulup onun üzerinden) id bilgisi eklenebilir.

Son Söz:

Bu detaylı API dokümantasyonu ve Prisma şeması incelemesi, umarım projenizin geliştirilmesinde size yardımcı olur. Başlangıç için sağlam bir temel oluşturduğunuzu düşünüyorum. İlerledikçe, yeni gereksinimler ve fikirler ortaya çıkacaktır. Bu durumda, API dokümantasyonunu ve Prisma şemasını güncelleyerek ilerlemeniz önemlidir.