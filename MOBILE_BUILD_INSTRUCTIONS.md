# Instruksi Build APK Mobile

## Perubahan Terbaru

### 1. Plugin Barcode Scanner Baru
- ✅ Plugin lama (`@capacitor-community/barcode-scanner`) telah diganti dengan `@capacitor-mlkit/barcode-scanning`
- ✅ Plugin flash lama (`@capgo/capacitor-flash`) telah diganti dengan `@capawesome/capacitor-torch`
- ✅ Plugin baru mendukung:
  - Torch/Flash control yang lebih baik
  - Performa scan yang lebih cepat dengan ML Kit
  - Support Android dan iOS

### 2. UI Improvements
- ✅ Spacing header dengan kotak penjualan hari ini sudah dikurangi (lebih rapat)
- ✅ Scanner UI baru dengan kontrol torch/flash yang proper

### 3. Icon APK
- ✅ GitHub Actions workflow sudah diupdate untuk regenerate icon setiap build
- ✅ Icon akan muncul dengan benar pada APK file sebelum install

## Langkah-Langkah Build

### A. Build Lokal (Untuk Testing di Emulator/Device)

1. **Clone/Pull Project dari GitHub**
   ```bash
   git pull origin main
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Sync Capacitor** (PENTING!)
   ```bash
   npx cap sync android
   ```
   
   Ini akan:
   - Update plugin-plugin baru (barcode scanner & torch)
   - Sync native dependencies
   - Generate konfigurasi Android yang benar

4. **Build Web App**
   ```bash
   npm run build
   ```

5. **Sync Lagi** (pastikan semua assets tersinkronisasi)
   ```bash
   npx cap sync android
   ```

6. **Buka di Android Studio** atau **Run di device**
   ```bash
   # Opsi 1: Buka di Android Studio untuk build manual
   npx cap open android
   
   # Opsi 2: Run langsung di device/emulator
   npx cap run android
   ```

### B. Build dengan GitHub Actions (Otomatis)

GitHub Actions akan otomatis build APK setiap ada push ke branch `main`.

1. **Push code ke GitHub**
   ```bash
   git add .
   git commit -m "Update barcode scanner & UI improvements"
   git push origin main
   ```

2. **Monitor Build**
   - Buka repository di GitHub
   - Klik tab "Actions"
   - Lihat workflow "Build Android APK" yang sedang berjalan

3. **Download APK**
   - Setelah build selesai, klik pada run yang berhasil
   - Scroll ke bagian "Artifacts"
   - Download file "KasirQ-POS-apk"
   - Atau cek di "Releases" untuk release otomatis

## Troubleshooting

### Icon APK Tidak Muncul
- Pastikan file icon ada di folder `resources/` 
- Jika tidak ada, GitHub Actions akan skip generation
- Icon default akan digunakan

### Barcode Scanner Tidak Berfungsi
- Pastikan sudah menjalankan `npx cap sync android` setelah update dependencies
- Check bahwa plugin sudah terinstall:
  ```bash
  npm list @capacitor-mlkit/barcode-scanning
  npm list @capawesome/capacitor-torch
  ```

### Flash/Torch Tidak Berfungsi
- Flash hanya tersedia di device fisik (tidak di emulator)
- Check permission camera sudah diberikan
- Beberapa device lama mungkin tidak support torch API

### Build Error di GitHub Actions
- Check log di tab Actions untuk detail error
- Pastikan `capacitor.config.ts` sudah benar
- Verifikasi semua dependencies terinstall dengan benar

## Fitur Baru Plugin Barcode Scanner

### Keunggulan ML Kit Barcode Scanner
1. **Lebih Cepat**: Menggunakan ML Kit dari Google
2. **Support Torch**: Integrated torch control via `@capawesome/capacitor-torch`
3. **Better Detection**: Scan barcode lebih akurat dan cepat
4. **Cross Platform**: Work di Android & iOS

### Cara Menggunakan Flash saat Scan
1. Buka scanner barcode
2. Klik tombol "Flash" di kanan atas
3. Flash akan menyala untuk membantu scan di tempat gelap
4. Klik lagi untuk matikan flash

## Catatan Penting

- **ALWAYS run `npx cap sync` setelah:**
  - Install/update plugin Capacitor
  - Update `capacitor.config.ts`
  - Pull changes dari git yang mengubah native code
  
- **Icon APK:**
  - Jika menggunakan GitHub Actions, icon akan di-generate otomatis
  - Icon background color: `#3b82f6` (biru primary)
  
- **Testing:**
  - Test di device fisik untuk fitur camera & flash
  - Emulator mungkin tidak support semua fitur native

## Resources

- [Capacitor ML Kit Barcode Scanning Docs](https://capawesome.io/plugins/mlkit/barcode-scanning/)
- [Capacitor Torch Plugin Docs](https://capawesome.io/plugins/torch/)
- [GitHub Actions Workflow](.github/workflows/build-android.yml)
