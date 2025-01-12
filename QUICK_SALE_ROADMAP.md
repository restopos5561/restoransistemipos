# Hızlı Satış Sistemi Yol Haritası

## 1. Veritabanı ve Backend Hazırlıkları ✅
- [x] Şema güncellemeleri (iadeler için)
- [x] QuickSaleService oluşturuldu
- [x] Hızlı ürün arama ve barkod desteği
- [x] Sepet yönetimi ve sipariş oluşturma
- [x] Ödeme işlemleri ve entegrasyonu
- [x] İade işlemleri için altyapı

## 2. Backend Servisler ✅
- [x] QuickSaleService
  - [x] Hızlı satış işlemi (processQuickSale)
  - [x] Ürün arama (searchProducts)
  - [x] Popüler ürünleri getirme (getPopularProducts)
  - [x] Barkod doğrulama (validateBarcode)
- [x] OrdersService entegrasyonu
- [x] PaymentService entegrasyonu
- [x] StockService entegrasyonu

## 3. QuickSalePage Bileşenleri 🚧
- [x] Ana sayfa düzeni
  - [x] Ürün arama ve seçim alanı
  - [x] Sepet görünümü
  - [x] Ödeme alanı
- [x] Sepet yönetimi
  - [x] Ürün ekleme/çıkarma
  - [x] Miktar değiştirme
  - [x] Ara toplam hesaplama
- [x] Ürün arama
  - [x] Metin bazlı arama
  - [x] Barkod okuyucu entegrasyonu
  - [x] Popüler ürünler listesi
- [ ] Ödeme işlemleri
  - [ ] Nakit ödeme
  - [ ] Kredi kartı entegrasyonu
  - [ ] Yemek kartı entegrasyonu
- [x] Müşteri işlemleri
  - [x] Müşteri seçimi/arama
  - [x] Müşteri bilgisi gösterimi
- [ ] İade işlemleri
  - [ ] Fiş numarası ile arama
  - [ ] Kısmi/tam iade seçenekleri

## İlk 3 Gün İçin Öncelikli Görevler
1. ✅ Backend servisleri oluşturma
2. ✅ Temel sayfa yapısını kurma
3. ✅ Ürün arama ve sepet yönetimini tamamlama
4. 🚧 Ödeme işlemlerini entegre etme
5. ✅ Müşteri işlemlerini ekleme

## Teknik Detaylar
- API Endpoint'leri:
  - ✅ POST /api/quick-sale/process
  - ✅ GET /api/quick-sale/products/search
  - ✅ GET /api/quick-sale/products/popular
  - ✅ GET /api/quick-sale/products/barcode/:barcode

- Veritabanı İlişkileri:
  - Order -> Payment
  - Order -> Customer
  - Order -> OrderItems
  - OrderItems -> Product
  - Product -> Stock

- Güvenlik Kontrolleri:
  - Kullanıcı yetkilendirme
  - İşlem doğrulama
  - Stok kontrolü 