# GaziDuino Web IDE

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

GaziDuino, tarayıcı üzerinden çalışan bağımsız ve modern bir Web IDE'dir. Arduino CLI altyapısını kullanarak Windows, Linux ve Android (Termux) üzerinde otonom yapay zeka destekli kod derleme, Web Serial API ile donanım kontrolü ve USB OTG özellikleri sunar.

## Özellikler
- **Çapraz Platform (Cross-Platform):** Windows, Linux ve Android (Termux) üzerinde yerel olarak çalışır.
- **Yapay Zeka Destekli Otonom Geliştirme:** Derleme, hata ayıklama ve kod yükleme süreçlerini AI asistanıyla yönetin.
- **Web Serial API (Android OTG):** Kısıtlayıcı işletim sistemlerinde (Android vb.) Root gerektirmeden USB OTG üzerinden seri port ile iletişim kurun.
- **Yerel Arduino CLI Entegrasyonu:** Arka planda Arduino CLI gücünü kullanır.

## Kurulum ve Kullanım

### Windows
1. Depoyu klonlayın ve klasöre girin.
2. `python main.py` komutunu çalıştırın. Eksik bağımlılıklar (Arduino CLI vb.) otomatik olarak indirilecektir.
3. Tarayıcınızdan `http://127.0.0.1:5000` adresine gidin.

### Android (Termux)
```bash
pkg update && pkg install python wget tar -y
pip install flask
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=$PREFIX/bin sh
arduino-cli config init && arduino-cli core update-index
python main.py
```

## Yasal Uyarı / Trademark Disclaimer
Bu proje **bağımsız ve resmi olmayan (unofficial)** bir açık kaynak projesidir. "Arduino", Arduino SA şirketinin tescilli ticari markasıdır. GaziDuino projesinin Arduino SA ile hiçbir resmi bağı, ortaklığı veya sponsorluğu bulunmamaktadır. Bu araç sadece açık kaynaklı Arduino CLI aracını sarmalayan (wrapper) bir Web arayüzüdür.

## Lisans
Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
