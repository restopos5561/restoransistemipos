# Hızlı Satış Sistemi Yol Haritası

## 1. Veritabanı ve Backend Hazırlıkları
- ✅ Şema güncellemeleri (iadeler için)
- ❌ Barkod desteği
- ❌ Sadakat programı
- ❌ Hediye kartları
- ❌ Promosyonlar
- ❌ Özel fiyatlar
- ❌ İade işlemleri

## 2. Backend Servisleri
- ✅ QuickSaleService oluşturulması
- ✅ Hızlı ürün arama
- ✅ Sepet yönetimi
- ✅ Ödeme işlemleri
- ✅ İade işlemleri
- ✅ Fiş yazdırma

## 3. QuickSalePage Bileşenleri
- ✅ Ana sayfa düzeni
- ✅ Ürün arama ve sepet yönetimi
- ✅ Müşteri işlemleri
- ✅ Sayısal tuş takımı
- ✅ Kategori yönetimi ve filtreleme
- ❌ Barkod okuyucu entegrasyonu
- ❌ Hızlı ürün seçimi
- ✅ İndirim uygulama
- ❌ Ücretsiz ürün ekleme
- ❌ Fiş yazdırma
- ✅ Ödeme işlemi
- ✅ Ürün silme veya miktar değiştirme
- ✅ Müşteri seçimi
- ❌ Özel fiyatlandırma
- ❌ Promosyon yönetimi
- ❌ Sadakat puanı kullanımı
- ❌ Varyantlı ürün yönetimi
- ❌ Ekstra tercihler
- ❌ Hızlı iade işlemi

## İlk 3 Gün Öncelikli Görevler
1. ✅ Backend servisleri oluşturma
2. ✅ Temel sayfa yapısı
3. ✅ Ürün arama ve sepet yönetimi
4. ✅ Müşteri işlemleri
5. ✅ Sayısal tuş takımı
6. ❌ Ödeme işlemleri entegrasyonu

## Teknik Detaylar

### API Endpoints
- ✅ POST /api/quick-sale/process
- ✅ GET /api/quick-sale/products/search?categoryId=:categoryId
- ✅ GET /api/quick-sale/products/popular?categoryId=:categoryId
- ✅ GET /api/quick-sale/products/barcode/:barcode
- ✅ GET /api/quick-sale/categories
- ❌ POST /api/quick-sale/promotions
- ❌ POST /api/quick-sale/print
- ❌ POST /api/quick-sale/discount

### Veritabanı İlişkileri
- ✅ Kategoriler (categories)
- ❌ Varyantlar (variants)
- ❌ Özel fiyatlar (special_prices)
- ❌ Sadakat puanları (loyalty_points)
- ✅ İndirimler

### Güvenlik Kontrolleri
- ❌ İndirim limitleri
- ❌ Ücretsiz ürün yetkileri
- ❌ İade yetkileri 