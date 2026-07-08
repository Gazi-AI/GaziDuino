# GaziDuino 🚀

GaziDuino, tarayıcı üzerinden çalışan, **tam donanımlı, modern ve mobil uyumlu bir Web Tabanlı Arduino IDE** projesidir. Hem bilgisayarlarda (Windows, Linux, macOS) hem de Android tablet ve telefonlarda kusursuz çalışacak şekilde tasarlanmıştır.

Arka planda Python (Flask) ve resmi `arduino-cli` kullanarak gerçek bir IDE'nin yapabildiği her şeyi yapabilir.

---

## ✨ Özellikler

- **💻 Web Tabanlı Gelişmiş Editör:** Kod renklendirme, satır numaraları, otomatik girinti ve gelişmiş düzenleme özellikleri.
- **📱 Kusursuz Android & OTG Desteği:** Android cihazınızdan kod derleyip yüklemek için hiçbir ek uygulamaya, sürücüye (driver) veya root yetkisine ihtiyacınız yok! (Detaylar aşağıda).
- **🌍 Devasa Kütüphane Desteği:** Dünya çapında Arduino için yayınlanmış **9643+** kütüphaneyi tek tıkla arayıp indirebilirsiniz.
- **🛠️ Geniş Kart (Board) Yelpazesi:** ESP32, ESP8266, Arduino AVR, STM32, RP2040 ve daha birçok mimariyi kapsayan **37+** kart paketi desteği.
- **📊 Canlı Seri Port Monitörü (Serial Monitor):** WebUSB ve Web Serial teknolojileriyle cihazınızdan gelen verileri doğrudan tarayıcı üzerinden anlık okuyun ve cihaza veri gönderin.
- **🚀 Otomatik Kurulum:** Windows üzerinde `arduino-cli` programını kendi kendine indirip kurar.

---

## 📱 Android OTG ile Kod Yükleme (Önemli!)

GaziDuino'nun en büyük devrimlerinden biri Android cihazlar üzerinden **hiçbir üçüncü parti uygulama kurmadan** doğrudan donanıma kod atabilmesidir. 

**Nasıl Çalışır?**
Kullanıcıların Android'de "Sürücü kurmalıyım", "Uygulama indirmeliyim" gibi dertlerle **ilgilenmesine gerek yoktur.** 
1. Sunucuyu (Python) bilgisayarınızda, Raspberry Pi'de veya doğrudan telefonunuzdaki Termux üzerinde başlatın.
2. Android cihazınızın **Google Chrome** veya **Microsoft Edge** tarayıcısından sunucunun IP adresine (Örn: `http://192.168.1.X:5000`) girin.
3. Arduino veya ESP32 cihazınızı **OTG kablosu** ile Android cihazınıza bağlayın.
4. Sitedeki **Yükle** butonuna basın. Tarayıcı size "USB cihazına bağlanılsın mı?" diye soracaktır. İzin verin.
5. GaziDuino kodu sunucuda derleyecek ve elde ettiği `.bin` / `.hex` dosyasını tarayıcınızın WebUSB/Web Serial altyapısı ile saniyeler içinde cihaza flaşlayacaktır!

---

## ⚙️ Kurulum ve Çalıştırma

### 🪟 Windows

1. [Python'u indirin ve kurun](https://www.python.org/downloads/) (Kurarken "Add Python to PATH" seçeneğini işaretlemeyi unutmayın).
2. Terminali (CMD veya PowerShell) açın ve Flask kütüphanesini kurun:
   ```bash
   pip install flask
   ```
3. Proje dizinine gidip uygulamayı başlatın:
   ```bash
   python main.py
   ```
*(Not: Windows üzerinde ilk kez çalıştırdığınızda GaziDuino resmi `arduino-cli` aracını otomatik olarak indirecek ve klasöre kuracaktır. Sizin ekstra bir şey yapmanıza gerek yoktur.)*

### 🐧 Ubuntu / Debian tabanlı Linux

Linux ortamında `arduino-cli` aracı otomatik olarak sistem paket yöneticilerinden kurulabilir.

1. Gerekli araçları yükleyin:
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip curl
   ```
2. Arduino-CLI'ı kurun:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
   ```
3. Flask'ı kurun ve projeyi çalıştırın:
   ```bash
   pip3 install flask
   python3 main.py
   ```

### 📱 Termux (Android Cihaz Üzerinde Sunucu Kurmak İsteyenler)

Termux üzerinde sunucu kurarak projeyi Android'de çalıştırabilirsiniz. Ancak **dikkat etmeniz gereken kritik bir nokta var:**

- **Eğer sadece Arduino Uno / Nano derleyecekseniz:** Düz Termux işinizi görür.
- **Eğer ESP32 veya ESP8266 derleyecekseniz:** Resmi derleyiciler (glibc) Termux ile doğrudan uyumlu olmadığı için Termux içerisine **Ubuntu (proot-distro)** kurmanız **zorunludur**.

**ESP32 Destekli Ubuntu (Termux) Kurulumu:**
1. Termux'u açın, projeyi dışarıda indirin ve Ubuntu kurun:
   ```bash
   pkg update
   pkg install git proot-distro
   git clone https://github.com/Gazi-AI/GaziDuino.git
   proot-distro install ubuntu
   proot-distro login ubuntu
   ```
2. Ubuntu içine girdikten sonra Linux araçlarını kurun:
   ```bash
   apt update
   apt install python3 python3-pip curl
   curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
   export PATH=$PATH:/root/bin
   pip3 install flask
   ```
3. Ubuntu içindeyken, Termux'un ana klasörüne (projeyi indirdiğimiz yere) gidin ve sunucuyu başlatın:
   ```bash
   cd /data/data/com.termux/files/home/GaziDuino
   python3 main.py
   ```

---

## 🛠️ Nasıl Kullanılır?

1. Sitenin sol tarafındaki menüden projenizi yönetebilirsiniz.
2. Sağ üst köşedeki **Çark (Ayarlar)** ikonuna tıklayarak kullanmak istediğiniz **Kartı (Board)** seçin. Eğer kartınız listede yoksa "Kart Yöneticisi" sekmesine girip kart paketini (Örn: ESP32) kurun.
3. Yine sağ üstten bağlanmak istediğiniz **Portu** seçin.
4. Kodunuzu yazdıktan sonra üstteki **Derle (Tik işareti)** butonuyla kodunuzda hata olup olmadığını kontrol edin.
5. **Yükle (Sağ ok işareti)** butonu ile kodunuzu direkt cihaza gönderin.
6. Sağ alt köşedeki **Seri Port (Fiş işareti)** ikonuna tıklayarak cihazdan gelen Serial verileri okuyabilirsiniz.

## 📦 Kütüphane Yöneticisi
GaziDuino içerisinde tam **9643 adet** Arduino kütüphanesi hazır olarak gelir! 
- Sol menüden Kütüphane Yöneticisi'ni açın.
- Arama kısmına istediğiniz sensörün veya modülün adını yazın (Örn: `DHT11`, `Servo`, `LiquidCrystal`).
- İlgili kütüphaneyi bulup **KUR** butonuna basmanız yeterlidir.

---
*Gazi-AI Ekibi tarafından geliştirilmiştir.*
