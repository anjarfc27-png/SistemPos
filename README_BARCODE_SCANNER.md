# Barcode Scanner - Migration Guide

## Summary of Changes

Kami telah mengganti plugin barcode scanner lama dengan plugin yang lebih modern dan powerful.

### Old Plugins (Removed)
- `@capacitor-community/barcode-scanner` ❌
- `@capgo/capacitor-flash` ❌

### New Plugins (Added)
- `@capacitor-mlkit/barcode-scanning` ✅
- `@capawesome/capacitor-torch` ✅

## Why the Change?

### Problems with Old Plugin
1. Flash control tidak reliable
2. Performa scan lambat
3. UI terlalu basic
4. Support platform terbatas

### Benefits of New Plugin
1. ✅ **ML Kit Integration**: Scan lebih cepat dan akurat dengan Google ML Kit
2. ✅ **Better Torch Control**: Dedicated torch plugin dengan API yang lebih baik
3. ✅ **Modern UI**: Support untuk custom scanner UI
4. ✅ **Cross Platform**: Android & iOS support yang lebih baik
5. ✅ **Active Maintenance**: Plugin aktif di-maintain oleh Capawesome team

## API Changes

### Old API (Before)
```typescript
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { CapacitorFlash } from '@capgo/capacitor-flash';

// Old scanning method
await BarcodeScanner.hideBackground();
const result = await BarcodeScanner.startScan();
if (result.hasContent) {
  console.log(result.content);
}
await BarcodeScanner.showBackground();

// Old flash control
await CapacitorFlash.switchOn({ intensity: 100 });
await CapacitorFlash.switchOff();
```

### New API (After)
```typescript
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Torch } from '@capawesome/capacitor-torch';

// New scanning method with listener
document.querySelector('body')?.classList.add('barcode-scanner-active');

const listener = await BarcodeScanner.addListener('barcodesScanned', async (event) => {
  if (event.barcodes && event.barcodes.length > 0) {
    const barcode = event.barcodes[0];
    console.log(barcode.displayValue || barcode.rawValue);
    
    await listener.remove();
    await BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('barcode-scanner-active');
  }
});

await BarcodeScanner.startScan();

// New torch control
const { available } = await Torch.isAvailable();
if (available) {
  await Torch.enable();  // Turn on
  await Torch.disable(); // Turn off
  await Torch.toggle();  // Toggle
}
```

## Key Differences

### 1. Event-Based Scanning
- **Old**: `await BarcodeScanner.startScan()` returns result directly
- **New**: Use listener pattern with `addListener('barcodesScanned', ...)`

### 2. Background Management
- **Old**: Manual `hideBackground()` / `showBackground()`
- **New**: Use CSS class `barcode-scanner-active` on body

### 3. Result Structure
- **Old**: `result.content` (simple string)
- **New**: `event.barcodes[0].displayValue` or `rawValue` (structured object)

### 4. Torch/Flash Control
- **Old**: `CapacitorFlash.switchOn/switchOff()`
- **New**: `Torch.enable/disable/toggle()`

### 5. Permission Handling
- **Old**: `BarcodeScanner.checkPermission({ force: true })`
- **New**: `BarcodeScanner.requestPermissions()` returns `{ camera: 'granted' | 'denied' }`

## Files Modified

### Components Updated
1. `src/components/POS/POSInterface.tsx`
2. `src/components/POS/AddProductForm.tsx`
3. `src/components/POS/QuickInvoice.tsx`

### New Files Created
1. `src/components/barcode/BarcodeScannerUI.tsx` - Reusable scanner UI component

### CSS Updated
1. `src/index.css` - Added support for `barcode-scanner-active` class

## Usage Example

Here's a complete example of using the new barcode scanner:

```typescript
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Torch } from '@capawesome/capacitor-torch';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

const handleBarcodeScan = async () => {
  if (!Capacitor.isNativePlatform()) {
    toast.error('Scanner hanya tersedia di aplikasi mobile');
    return;
  }

  try {
    // Request permissions
    const { camera } = await BarcodeScanner.requestPermissions();
    if (camera !== 'granted') {
      toast.error('Izin kamera diperlukan');
      return;
    }

    // Add CSS class to hide web content
    document.querySelector('body')?.classList.add('barcode-scanner-active');

    // Listen for scanned barcodes
    const listener = await BarcodeScanner.addListener('barcodesScanned', async (event) => {
      if (event.barcodes && event.barcodes.length > 0) {
        const barcode = event.barcodes[0];
        const scannedValue = barcode.displayValue || barcode.rawValue;
        
        // Clean up
        await listener.remove();
        await BarcodeScanner.stopScan();
        document.querySelector('body')?.classList.remove('barcode-scanner-active');
        
        // Turn off torch if enabled
        try {
          const { available } = await Torch.isAvailable();
          if (available) {
            const { enabled } = await Torch.isEnabled();
            if (enabled) await Torch.disable();
          }
        } catch (e) {
          console.log('Torch cleanup error:', e);
        }
        
        // Handle scanned barcode
        toast.success(`Scanned: ${scannedValue}`);
      }
    });

    // Start scanning
    await BarcodeScanner.startScan();
    
  } catch (error) {
    console.error('Barcode scan error:', error);
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('barcode-scanner-active');
    toast.error('Gagal scan barcode');
  }
};
```

## Testing

### Desktop/Browser
- Scanner akan show error: "Scanner hanya tersedia di aplikasi mobile"
- Ini normal, barcode scanner hanya work di native mobile apps

### Mobile Device
1. Build APK dan install di device
2. Buka fitur yang menggunakan scanner
3. Klik tombol scan barcode
4. Camera akan muncul dengan UI overlay
5. Arahkan ke barcode
6. Scan akan otomatis detect dan process

### Flash/Torch Testing
- Flash hanya tersedia di physical device (tidak di emulator)
- Klik tombol flash di UI scanner untuk toggle on/off
- Di tempat gelap, flash akan sangat membantu untuk scan

## Migration Checklist

- [x] Remove old plugins dari package.json
- [x] Install new plugins
- [x] Update all barcode scanner imports
- [x] Replace old API calls with new API
- [x] Update CSS for new scanner active class
- [x] Test scanner functionality
- [x] Test torch/flash functionality
- [x] Update GitHub Actions workflow
- [x] Create documentation

## Support & Resources

- **ML Kit Barcode Scanning**: https://capawesome.io/plugins/mlkit/barcode-scanning/
- **Torch Plugin**: https://capawesome.io/plugins/torch/
- **Capawesome Plugins**: https://capawesome.io/plugins/

## Need Help?

Jika ada masalah dengan scanner:

1. **Check console logs** untuk error details
2. **Verify permissions** - camera permission harus granted
3. **Run `npx cap sync`** setelah update dependencies
4. **Test di physical device** - bukan emulator
5. **Check plugin installation**: 
   ```bash
   npm list @capacitor-mlkit/barcode-scanning
   npm list @capawesome/capacitor-torch
   ```

---

*Last updated: 2025-01-16*
