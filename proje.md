# Restoran POS Sistemi Proje Analizi

## Proje Genel Yapısı
Bu proje, modern bir restoran yönetim sistemi olup, client-server mimarisi ile geliştirilmiştir. Proje iki ana bölümden oluşmaktadır:

### 1. Frontend (Client)
- **Teknoloji Stack:**
  - React + TypeScript
  - Vite build tool
  - Modern hooks yapısı
  - Redux store yönetimi
  - Form validasyonları
  - Özel hook'lar
  - Tema ve stil yönetimi
  - Axios HTTP client

#### Frontend Dizin Yapısı:
- `/src/components`: Yeniden kullanılabilir UI bileşenleri
  - `/common`: Ortak kullanılan bileşenler (Pagination, SearchBar vb.)
  - `/auth`: Kimlik doğrulama ile ilgili bileşenler
  - `/error`: Hata sayfaları ve bileşenleri
  - `/layout`: Sayfa düzeni bileşenleri
- `/src/pages`: Sayfa bileşenleri
  - `/auth`: Giriş, kayıt vb. sayfalar
  - `/error`: Hata sayfaları
  - `/dashboard`: Panel sayfaları
- `/src/routes`: Routing yapılandırması
- `/src/services`: API servisleri
  - `api.ts`: Temel API yapılandırması
  - `auth.service.ts`: Kimlik doğrulama servisi
  - `token.service.ts`: Token yönetimi
- `/src/hooks`: Özel React hooks
  - `usePermissions.ts`: Yetki kontrol hook'u
- `/src/store`: State management
  - `/loading`: Yükleme durumu yönetimi
- `/src/validations`: Form ve veri doğrulama şemaları
  - `order.schema.ts`: Sipariş doğrulama şeması
- `/src/types`: TypeScript tip tanımlamaları
  - `order.types.ts`: Sipariş tipleri
- `/src/utils`: Yardımcı fonksiyonlar
- `/src/config`: Yapılandırma dosyaları
  - `constants.ts`: Sabit değerler
- `/src/theme`: UI tema ayarları

### 2. Backend (Server)
- **Teknoloji Stack:**
  - Node.js + TypeScript
  - Express.js framework
  - Prisma ORM
  - JWT authentication
  - Middleware yapısı
  - Servis tabanlı mimari
  - PostgreSQL veritabanı

#### Backend Dizin Yapısı:
- `/src/routes`: API endpoint tanımlamaları
  - `account.routes.ts`: Hesap işlemleri
  - `account.transaction.routes.ts`: Hesap hareketleri
  - `auth.routes.ts`: Kimlik doğrulama
  - `bar.routes.ts`: Bar yönetimi
  - `branches.routes.ts`: Şube yönetimi
  - `card.payments.routes.ts`: Kart ödemeleri
  - `categories.routes.ts`: Kategori yönetimi
  - `customers.routes.ts`: Müşteri yönetimi
  - `discounts.routes.ts`: İndirim yönetimi
  - `kitchen.routes.ts`: Mutfak yönetimi
  - `orders.routes.ts`: Sipariş yönetimi
  - `order.item.routes.ts`: Sipariş ürünleri
  - `payment.routes.ts`: Ödeme işlemleri
  - `permissions.routes.ts`: Yetkilendirme
  - `price.history.routes.ts`: Fiyat geçmişi
  - `printer.routes.ts`: Yazıcı yönetimi
  - `products.routes.ts`: Ürün yönetimi
  - `product.option.routes.ts`: Ürün seçenekleri
  - `product.supplier.routes.ts`: Tedarikçi yönetimi
  - `purchase.orders.routes.ts`: Satın alma siparişleri
  - `recipes.routes.ts`: Tarif yönetimi
  - `reports.routes.ts`: Raporlama
  - `reservations.routes.ts`: Rezervasyon yönetimi
  - `restaurants.routes.ts`: Restoran yönetimi
  - `settings.routes.ts`: Ayarlar
  - `stock.routes.ts`: Stok yönetimi
  - `suppliers.routes.ts`: Tedarikçilerrrr
  - `tables.routes.ts`: Masa yönetimi
  - `users.routes.ts`: Kullanıcı yönetimi

- `/src/controllers`: İş mantığı kontrolörleri
  - Her route için karşılık gelen controller dosyaları
  - Örnek: `auth.controller.ts` (390 satır)
  - `products.controller.ts` (200 satır)
  - `users.controller.ts` (229 satır)
  - `recipes.controller.ts` (413 satır)

- `/src/services`: İş mantığı servisleri
  - `user-permissions.service.ts`: Kullanıcı yetkileri
  - `auth.service.ts`: Kimlik doğrulama işlemleri
  - `orders.service.ts`: Sipariş işlemleri (563 satır)
  - `reports.service.ts`: Raporlama işlemleri (932 satır)
  - `stock.service.ts`: Stok yönetimi (594 satır)
  - Ve diğer iş mantığı servisleri

- `/prisma`: Veritabanı şema ve migration yönetimi
  - `schema.prisma`: Veritabanı şema tanımları (695 satır)
  - `/migrations`: Veritabanı migration dosyaları
  - `seed.ts`: Örnek veri oluşturma scripti (1174 satır)

- `/src/middleware`: Ara katman yazılımları
  - Kimlik doğrulama
  - Yetkilendirme
  - Hata yakalama
  - İstek doğrulama

- `/src/schemas`: Veri doğrulama şemaları
- `/src/utils`: Yardımcı fonksiyonlar
- `/src/errors`: Hata yönetimi
- `/src/config`: Yapılandırma dosyaları

## Önemli Özellikler ve İş Mantığı

### 1. Kullanıcı Yönetimi ve Güvenlik
- JWT tabanlı kimlik doğrulama
- Rol ve yetki bazlı erişim kontrolü
- Güvenli parola yönetimi
- Oturum yönetimi ve token yenileme

### 2. Restoran Yönetimi
- Çoklu şube desteği
- Masa ve rezervasyon yönetimi
- Menü ve ürün yönetimi
- Stok takibi ve tedarikçi yönetimi

### 3. Sipariş ve Ödeme Sistemi
- Masa bazlı sipariş yönetimi
- Çoklu ödeme yöntemi desteği
- Fiyat geçmişi ve muhasebe entegrasyonu
- İndirim ve promosyon yönetimi

### 4. Mutfak ve Bar Yönetimi
- Sipariş takip sistemi
- Malzeme ve stok kontrolü
- Tarif yönetimi
- Yazıcı entegrasyonu

### 5. Raporlama ve Analiz
- Detaylı satış raporları
- Stok ve envanter raporları
- Finansal raporlar
- Performans analizleri

## Veritabanı Yapısı
- İlişkisel veritabanı (PostgreSQL)
- Prisma ORM ile veritabanı yönetimi
- Kapsamlı veri modeli (695 satır şema)
- Otomatik migration yönetimi

## Deployment ve Çalıştırma
1. **Gereksinimler**
   - Node.js
   - npm veya yarn
   - PostgreSQL veritabanı
   - Redis (opsiyonel, caching için)

2. **Kurulum Adımları**
   ```bash
   # Client kurulumu
   cd client
   npm install
   npm run dev

   # Server kurulumu
   cd server
   npm install
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

## Geliştirme ve Bakım
- TypeScript ile güçlü tip kontrolü
- ESLint ve Prettier kod formatı
- Modüler ve ölçeklenebilir mimari
- Kapsamlı API dokümantasyonu
- Otomatik veri doğrulama
- Test altyapısı desteği 

## Detaylı Modül Özellikleri

### 1. Kullanıcı ve Yetkilendirme Sistemi
#### Kullanıcı Yönetimi
- Kullanıcı rolleri:
  - Süper Admin: Tüm sistem yetkileri
  - Restoran Yöneticisi: Restoran bazlı yetkiler
  - Kasiyer: Sipariş ve ödeme yetkileri
  - Garson: Sipariş alma ve güncelleme yetkileri
  - Mutfak Personeli: Mutfak siparişlerini görüntüleme
  - Bar Personeli: Bar siparişlerini görüntüleme

#### Güvenlik Özellikleri
- JWT token yapısı:
  - Access Token (kısa süreli)
  - Refresh Token (uzun süreli)
  - Token rotasyonu
- Şifreleme ve güvenlik:
  - Bcrypt ile şifre hashleme
  - Rate limiting
  - CORS koruması
  - XSS koruması
  - SQL injection koruması

### 2. Restoran ve Şube Yönetimi
#### Şube Yönetimi
- Çoklu şube desteği
- Şube bazlı:
  - Menü yönetimi
  - Stok takibi
  - Personel yönetimi
  - Masa planları
  - Yazıcı ayarları
  - Raporlama

#### Masa Yönetimi
- Dinamik masa planı
- Masa durumları:
  - Boş
  - Dolu
  - Rezerveli
  - Temizlik bekliyor
- Masa birleştirme
- Masa transfer işlemleri
- QR kod ile sipariş alma

### 3. Menü ve Ürün Yönetimi
#### Ürün Özellikleri
- Kategori bazlı ürün yönetimi
- Ürün varyasyonları:
  - Boyut seçenekleri
  - Ekstra malzemeler
  - Özel notlar
- Fiyatlandırma:
  - Temel fiyat
  - Varyasyon fiyatları
  - Özel kampanya fiyatları
  - Fiyat geçmişi takibi

#### Stok Yönetimi
- Otomatik stok düşüşü
- Minimum stok uyarıları
- Stok giriş/çıkış takibi
- Malzeme bazlı maliyet hesaplama
- Fire takibi
- Tedarikçi entegrasyonu

### 4. Sipariş Sistemi
#### Sipariş Özellikleri
- Sipariş tipleri:
  - Masa siparişi
  - Paket servis
  - Al-götür
  - Online sipariş
- Sipariş durumları:
  - Beklemede
  - Hazırlanıyor
  - Hazır
  - Teslim edildi
  - İptal edildi
- Özel sipariş notları
- Garson çağırma sistemi
- Sipariş geçmişi

#### Mutfak/Bar Yönetimi
- Mutfak ekranı özellikleri:
  - Anlık sipariş görüntüleme
  - Hazırlama süreleri takibi
  - Öncelik sıralaması
- Yazıcı entegrasyonu:
  - Bölüm bazlı yazdırma
  - Adisyon yazdırma
  - Fiş yazdırma

### 5. Ödeme ve Muhasebe
#### Ödeme Yöntemleri
- Nakit ödeme
- Kredi kartı
- Yemek kartları
- Mobil ödeme
- Çoklu ödeme desteği
- Bahşiş yönetimi

#### Muhasebe Özellikleri
- Günlük kasa raporu
- Z raporu
- KDV raporları
- Gelir-gider takibi
- Maliyet analizi
- Kâr-zarar hesaplama

### 6. Rezervasyon Sistemi
- Online rezervasyon
- Telefon rezervasyonu
- Rezervasyon onaylama
- Rezervasyon hatırlatmaları
- Masa blokajı
- Özel etkinlik rezervasyonları

### 7. Müşteri İlişkileri
- Müşteri veritabanı
- Müşteri geçmişi
- Sadakat programı:
  - Puan sistemi
  - Özel teklifler
  - Doğum günü indirimleri
- Müşteri geri bildirimleri

### 8. Raporlama ve Analitik
#### Satış Raporları
- Günlük/Haftalık/Aylık satışlar
- Ürün bazlı satış analizi
- Garson performans raporu
- Peak saat analizi
- Masa doluluk oranları

#### Finansal Raporlar
- Gelir-gider raporu
- Kâr-zarar analizi
- Maliyet raporları
- Stok değer raporu
- Tedarikçi ödemeleri

#### İstatistiksel Analizler
- Trend analizi
- Sezonluk değişimler
- Müşteri davranış analizi
- Ürün popülerlik analizi

### 9. Entegrasyonlar
- Muhasebe yazılımı entegrasyonu
- E-Fatura entegrasyonu
- Online yemek sipariş platformları
- Ödeme sistemleri
- SMS/Email servisleri

### 10. Teknik Altyapı
#### Frontend Teknolojileri
- React 18
- TypeScript
- Redux Toolkit
- Material-UI
- Axios
- React Query
- Form validasyonu (Formik + Yup)
- PWA desteği

#### Backend Teknolojileri
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis (caching)
- WebSocket (realtime updates)
- JWT authentication

#### DevOps
- Docker konteynerizasyon
- CI/CD pipeline
- Otomatik yedekleme
- Monitoring ve logging
- Performans optimizasyonu

## Veritabanı Şeması Detayları

### Ana Tablolar ve İlişkileri

#### 1. Users (Kullanıcılar)
- id: UUID (Primary Key)
- email: String (Unique)
- password: String (Hashed)
- firstName: String
- lastName: String
- role: Enum (SUPER_ADMIN, RESTAURANT_ADMIN, CASHIER, WAITER, KITCHEN_STAFF, BAR_STAFF)
- status: Enum (ACTIVE, INACTIVE, BLOCKED)
- branchId: UUID (Foreign Key -> Branches)
- createdAt: DateTime
- updatedAt: DateTime

#### 2. Restaurants (Restoranlar)
- id: UUID (Primary Key)
- name: String
- description: String
- logo: String
- address: String
- phone: String
- email: String
- taxNumber: String
- status: Enum (ACTIVE, INACTIVE)
- createdAt: DateTime
- updatedAt: DateTime

#### 3. Branches (Şubeler)
- id: UUID (Primary Key)
- restaurantId: UUID (Foreign Key -> Restaurants)
- name: String
- address: String
- phone: String
- email: String
- status: Enum (ACTIVE, INACTIVE)
- settings: JSON
- createdAt: DateTime
- updatedAt: DateTime

#### 4. Products (Ürünler)
- id: UUID (Primary Key)
- branchId: UUID (Foreign Key -> Branches)
- categoryId: UUID (Foreign Key -> Categories)
- name: String
- description: String
- price: Decimal
- image: String
- barcode: String
- sku: String
- status: Enum (ACTIVE, INACTIVE)
- hasVariants: Boolean
- hasOptions: Boolean
- createdAt: DateTime
- updatedAt: DateTime

#### 5. Categories (Kategoriler)
- id: UUID (Primary Key)
- branchId: UUID (Foreign Key -> Branches)
- name: String
- description: String
- image: String
- parentId: UUID (Self Reference)
- order: Integer
- status: Enum (ACTIVE, INACTIVE)
- createdAt: DateTime
- updatedAt: DateTime

#### 6. Orders (Siparişler)
- id: UUID (Primary Key)
- branchId: UUID (Foreign Key -> Branches)
- tableId: UUID (Foreign Key -> Tables)
- customerId: UUID (Foreign Key -> Customers)
- userId: UUID (Foreign Key -> Users)
- orderNumber: String
- type: Enum (DINE_IN, TAKEAWAY, DELIVERY)
- status: Enum (PENDING, PREPARING, READY, DELIVERED, CANCELLED)
- totalAmount: Decimal
- discountAmount: Decimal
- taxAmount: Decimal
- finalAmount: Decimal
- notes: String
- createdAt: DateTime
- updatedAt: DateTime

#### 7. OrderItems (Sipariş Kalemleri)
- id: UUID (Primary Key)
- orderId: UUID (Foreign Key -> Orders)
- productId: UUID (Foreign Key -> Products)
- quantity: Integer
- unitPrice: Decimal
- totalPrice: Decimal
- notes: String
- status: Enum (PENDING, PREPARING, READY, DELIVERED, CANCELLED)
- createdAt: DateTime
- updatedAt: DateTime

#### 8. Tables (Masalar)
- id: UUID (Primary Key)
- branchId: UUID (Foreign Key -> Branches)
- number: String
- capacity: Integer
- status: Enum (EMPTY, OCCUPIED, RESERVED, CLEANING)
- qrCode: String
- location: JSON
- createdAt: DateTime
- updatedAt: DateTime

#### 9. Reservations (Rezervasyonlar)
- id: UUID (Primary Key)
- branchId: UUID (Foreign Key -> Branches)
- tableId: UUID (Foreign Key -> Tables)
- customerId: UUID (Foreign Key -> Customers)
- date: DateTime
- duration: Integer
- numberOfGuests: Integer
- status: Enum (PENDING, CONFIRMED, CANCELLED)
- notes: String
- createdAt: DateTime
- updatedAt: DateTime

#### 10. Payments (Ödemeler)
- id: UUID (Primary Key)
- orderId: UUID (Foreign Key -> Orders)
- amount: Decimal
- type: Enum (CASH, CREDIT_CARD, MEAL_CARD, MOBILE)
- status: Enum (PENDING, COMPLETED, FAILED, REFUNDED)
- transactionId: String
- notes: String
- createdAt: DateTime
- updatedAt: DateTime

#### 11. Customers (Müşteriler)
- id: UUID (Primary Key)
- firstName: String
- lastName: String
- email: String
- phone: String
- address: String
- loyaltyPoints: Integer
- birthDate: Date
- notes: String
- status: Enum (ACTIVE, INACTIVE)
- createdAt: DateTime
- updatedAt: DateTime

#### 12. Stock (Stok)
- id: UUID (Primary Key)
- branchId: UUID (Foreign Key -> Branches)
- productId: UUID (Foreign Key -> Products)
- quantity: Decimal
- unit: String
- minimumLevel: Decimal
- maximumLevel: Decimal
- createdAt: DateTime
- updatedAt: DateTime

#### 13. Suppliers (Tedarikçiler)
- id: UUID (Primary Key)
- name: String
- contactPerson: String
- email: String
- phone: String
- address: String
- taxNumber: String
- status: Enum (ACTIVE, INACTIVE)
- notes: String
- createdAt: DateTime
- updatedAt: DateTime

#### 14. Recipes (Tarifler)
- id: UUID (Primary Key)
- productId: UUID (Foreign Key -> Products)
- name: String
- description: String
- instructions: Text
- preparationTime: Integer
- cost: Decimal
- status: Enum (ACTIVE, INACTIVE)
- createdAt: DateTime
- updatedAt: DateTime

### İlişki Tabloları

#### ProductOptions (Ürün Seçenekleri)
- id: UUID (Primary Key)
- productId: UUID (Foreign Key -> Products)
- name: String
- price: Decimal
- status: Enum (ACTIVE, INACTIVE)

#### ProductVariants (Ürün Varyantları)
- id: UUID (Primary Key)
- productId: UUID (Foreign Key -> Products)
- name: String
- price: Decimal
- sku: String
- status: Enum (ACTIVE, INACTIVE)

#### RecipeIngredients (Tarif Malzemeleri)
- id: UUID (Primary Key)
- recipeId: UUID (Foreign Key -> Recipes)
- productId: UUID (Foreign Key -> Products)
- quantity: Decimal
- unit: String

#### StockMovements (Stok Hareketleri)
- id: UUID (Primary Key)
- stockId: UUID (Foreign Key -> Stock)
- type: Enum (IN, OUT, ADJUSTMENT)
- quantity: Decimal
- reason: String
- referenceId: UUID
- notes: String
- createdAt: DateTime 

## API Endpoint Detayları

### Kimlik Doğrulama ve Yetkilendirme
```
POST   /api/auth/login              # Kullanıcı girişi
POST   /api/auth/refresh-token      # Token yenileme
POST   /api/auth/logout             # Çıkış yapma
GET    /api/auth/me                 # Mevcut kullanıcı bilgisi
PUT    /api/auth/change-password    # Şifre değiştirme
```

### Kullanıcı Yönetimi
```
GET    /api/users                   # Kullanıcı listesi
POST   /api/users                   # Yeni kullanıcı oluşturma
GET    /api/users/:id              # Kullanıcı detayı
PUT    /api/users/:id              # Kullanıcı güncelleme
DELETE /api/users/:id              # Kullanıcı silme
GET    /api/users/:id/permissions  # Kullanıcı yetkileri
PUT    /api/users/:id/permissions  # Kullanıcı yetkilerini güncelleme
```

### Restoran ve Şube Yönetimi
```
GET    /api/restaurants            # Restoran listesi
POST   /api/restaurants           # Yeni restoran oluşturma
GET    /api/restaurants/:id       # Restoran detayı
PUT    /api/restaurants/:id       # Restoran güncelleme
DELETE /api/restaurants/:id       # Restoran silme

GET    /api/branches              # Şube listesi
POST   /api/branches             # Yeni şube oluşturma
GET    /api/branches/:id         # Şube detayı
PUT    /api/branches/:id         # Şube güncelleme
DELETE /api/branches/:id         # Şube silme
```

### Ürün ve Kategori Yönetimi
```
GET    /api/categories           # Kategori listesi
POST   /api/categories          # Yeni kategori oluşturma
GET    /api/categories/:id      # Kategori detayı
PUT    /api/categories/:id      # Kategori güncelleme
DELETE /api/categories/:id      # Kategori silme

GET    /api/products            # Ürün listesi
POST   /api/products           # Yeni ürün oluşturma
GET    /api/products/:id       # Ürün detayı
PUT    /api/products/:id       # Ürün güncelleme
DELETE /api/products/:id       # Ürün silme
```

### Sipariş Yönetimi
```
GET    /api/orders             # Sipariş listesi
POST   /api/orders            # Yeni sipariş oluşturma
GET    /api/orders/:id        # Sipariş detayı
PUT    /api/orders/:id        # Sipariş güncelleme
DELETE /api/orders/:id        # Sipariş silme

GET    /api/orders/:id/items  # Sipariş kalemleri
POST   /api/orders/:id/items  # Siparişe ürün ekleme
PUT    /api/orders/:id/items/:itemId  # Sipariş kalemi güncelleme
DELETE /api/orders/:id/items/:itemId  # Sipariş kalemi silme
```

### Masa ve Rezervasyon Yönetimi
```
GET    /api/tables            # Masa listesi
POST   /api/tables           # Yeni masa oluşturma
GET    /api/tables/:id       # Masa detayı
PUT    /api/tables/:id       # Masa güncelleme
DELETE /api/tables/:id       # Masa silme

GET    /api/reservations     # Rezervasyon listesi
POST   /api/reservations    # Yeni rezervasyon oluşturma
GET    /api/reservations/:id # Rezervasyon detayı
PUT    /api/reservations/:id # Rezervasyon güncelleme
DELETE /api/reservations/:id # Rezervasyon silme
```

### Ödeme İşlemleri
```
GET    /api/payments         # Ödeme listesi
POST   /api/payments        # Yeni ödeme oluşturma
GET    /api/payments/:id    # Ödeme detayı
PUT    /api/payments/:id    # Ödeme güncelleme
POST   /api/payments/:id/refund # Ödeme iadesi
```

### Stok Yönetimi
```
GET    /api/stock           # Stok listesi
POST   /api/stock          # Stok girişi
GET    /api/stock/:id      # Stok detayı
PUT    /api/stock/:id      # Stok güncelleme
DELETE /api/stock/:id      # Stok silme

GET    /api/stock/movements # Stok hareketleri
POST   /api/stock/adjust   # Stok düzeltme
```

### Müşteri Yönetimi
```
GET    /api/customers       # Müşteri listesi
POST   /api/customers      # Yeni müşteri oluşturma
GET    /api/customers/:id  # Müşteri detayı
PUT    /api/customers/:id  # Müşteri güncelleme
DELETE /api/customers/:id  # Müşteri silme

GET    /api/customers/:id/orders     # Müşteri siparişleri
GET    /api/customers/:id/points     # Müşteri puanları
POST   /api/customers/:id/points/add # Puan ekleme
```

### Raporlama
```
GET    /api/reports/sales          # Satış raporları
GET    /api/reports/inventory      # Envanter raporları
GET    /api/reports/financial      # Finansal raporlar
GET    /api/reports/performance    # Performans raporları
GET    /api/reports/customers      # Müşteri raporları
```

### Ayarlar ve Yapılandırma
```
GET    /api/settings              # Ayarlar listesi
PUT    /api/settings             # Ayarları güncelleme
GET    /api/settings/printers    # Yazıcı ayarları
PUT    /api/settings/printers    # Yazıcı ayarlarını güncelleme
``` 