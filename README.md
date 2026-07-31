# GaziDuino 🚀

[English](#-english) | [Türkçe](#-türkçe)

---

## 🇬🇧 English

GaziDuino is a **fully equipped, modern, and mobile-friendly Web-based Arduino IDE** that runs directly inside your browser. It is designed to work seamlessly across desktop operating systems (Windows, Linux, macOS) as well as Android tablets and smartphones.

Powered by Python (Flask) and the official `arduino-cli` in the background, it performs everything a traditional IDE can do.

---

### ✨ Features

- **💻 Advanced Web Editor:** Code syntax highlighting, line numbers, automatic indentation, and advanced editing features.
- **📱 Seamless Android & OTG Support:** Upload code directly from your Android device with zero additional apps, drivers, or root access required! (See details below).
- **🌍 Massive Library Ecosystem:** Search and install from over **9,643+** official Arduino libraries with a single click.
- **🛠️ Broad Board Support:** Compatible with **37+** core architecture board packages including ESP32, ESP8266, Arduino AVR, STM32, RP2040, and many more.
- **📊 Live Serial Monitor:** Read and transmit data to your microcontrollers instantly via browser-native WebUSB and Web Serial APIs.
- **🚀 Automated Setup:** Automatically downloads and configures `arduino-cli` on Windows environments without manual intervention.

---

### Screenshots

#### Main Editor

![GaziDuino main editor screen](https://i.ibb.co/5hpzBwjB/Ekran-g-r-nt-s-2026-07-23-213510.png)

#### Board & Processor Settings

![GaziDuino Tools menu and board settings](https://i.ibb.co/chXJkw7b/Ekran-g-r-nt-s-2026-07-23-213637.png)

#### Serial Monitor

![GaziDuino serial monitor](https://i.ibb.co/TqxKsZXV/Ekran-g-r-nt-s-2026-07-23-213746.png)

#### Library Manager

![GaziDuino library manager](https://i.ibb.co/Kc1JB0rd/Ekran-g-r-nt-s-2026-07-23-213824.png)

#### Board Manager

![GaziDuino board manager](https://i.ibb.co/bMQ9BW8H/Ekran-g-r-nt-s-2026-07-23-213854.png)

#### AI Assistant

![GaziDuino AI assistant](https://i.ibb.co/QBKxv7m/Ekran-g-r-nt-s-2026-07-23-213922.png)

---

### 📱 Flashing via Android OTG (Key Feature!)

One of GaziDuino's primary innovations is flashing microcontrollers directly from Android devices **without installing any third-party apps**.

**How It Works:**
Users do not need to worry about installing drivers or native mobile apps.
1. Start the backend server (Python) on your PC, Raspberry Pi, or locally inside Termux on your phone.
2. Open the server URL (e.g., `http://192.168.1.X:5000`) using **Google Chrome** or **Microsoft Edge** on your Android device.
3. Connect your Arduino or ESP32 board using an **OTG cable**.
4. Tap the **Upload** button. Grant permission when the browser prompts "Connect to USB Device".
5. GaziDuino compiles the code on the server and flashes the resulting `.bin` / `.hex` binary directly to your board in seconds using WebUSB/Web Serial!

---

### ⚙️ Installation & Running

#### 🪟 Windows

1. [Download and install Python](https://www.python.org/downloads/) (Make sure to check "Add Python to PATH").
2. Open CMD or PowerShell and install Flask:
   pip install flask
3. Navigate to the project directory and run:
   python main.py
*(Note: On initial startup under Windows, GaziDuino will automatically fetch and unpack `arduino-cli` into the project directory).*

#### 🐧 Ubuntu / Debian-based Linux

1. Install essential packages:
   sudo apt update
   sudo apt install python3 python3-pip curl
2. Install `arduino-cli`:
   curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
3. Install Flask and launch:
   pip3 install flask
   python3 main.py

#### 📱 Termux (Running Server Locally on Android)

You can run the host server locally inside Termux on Android. **Please note:**

- **Standard Arduino (Uno, Nano):** Stock Termux environment is sufficient.
- **ESP32 or ESP8266:** Official cross-compilers require `glibc`. You **must install Ubuntu inside Termux** via `proot-distro`.

**Termux Ubuntu Setup (with ESP32 support):**
1. Open Termux, clone the repository, and set up Ubuntu:
   pkg update
   pkg install git proot-distro
   git clone https://github.com/Gazi-AI/GaziDuino.git
   proot-distro install ubuntu
   proot-distro login ubuntu
2. Inside the Ubuntu environment, install development packages:
   apt update
   apt install python3 python3-pip curl
   curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
   export PATH=$PATH:/root/bin
   pip3 install flask
3. Navigate to the project directory and launch the server:
   cd /data/data/com.termux/files/home/GaziDuino
   python3 main.py

---

### 🛠️ Usage Guide

1. Use the left navigation panel to manage project files.
2. Click the **Settings (Gear icon)** in the upper right to select your **Board**. If your board isn't listed, open the "Board Manager" tab to install its core package (e.g., ESP32).
3. Select your active **Port** from the top right menu.
4. Click **Verify (Checkmark)** to compile and check for syntax errors.
5. Click **Upload (Right Arrow)** to flash the compiled code directly to your device.
6. Open the **Serial Monitor (Plug icon)** in the bottom right to inspect or send serial communication logs.

---

### 📦 Library Manager
GaziDuino includes instant indexing for over **9,643** Arduino libraries:
- Open the Library Manager from the left panel.
- Search for a sensor or library module (e.g., `DHT11`, `Servo`, `LiquidCrystal`).
- Click **INSTALL** to download it directly.

---

*Developed by the Gazi-AI Team.*

---

## 🇹🇷 Türkçe

GaziDuino, tarayıcı üzerinden çalışan, **tam donanımlı, modern ve mobil uyumlu bir Web Tabanlı Arduino IDE** projesidir. Hem bilgisayarlarda (Windows, Linux, macOS) hem de Android tablet ve telefonlarda kusursuz çalışacak şekilde tasarlanmıştır.

Arka planda Python (Flask) ve resmi `arduino-cli` kullanarak gerçek bir IDE'nin yapabildiği her şeyi yapabilir.

---

### ✨ Özellikler

- **💻 Web Tabanlı Gelişmiş Editör:** Kod renklendirme, satır numaraları, otomatik girinti ve gelişmiş düzenleme özellikleri.
- **📱 Kusursuz Android & OTG Desteği:** Android cihazınızdan kod derleyip yüklemek için hiçbir ek uygulamaya, sürücüye (driver) veya root yetkisine ihtiyacınız yok! (Detaylar aşağıda).
- **🌍 Devasa Kütüphane Desteği:** Dünya çapında Arduino için yayınlanmış **9643+** kütüphaneyi tek tıkla arayıp indirebilirsiniz.
- **🛠️ Geniş Kart (Board) Yelpazesi:** ESP32, ESP8266, Arduino AVR, STM32, RP2040 ve daha birçok mimariyi kapsayan **37+** kart paketi desteği.
- **📊 Canlı Seri Port Monitörü (Serial Monitor):** WebUSB ve Web Serial teknolojileriyle cihazınızdan gelen verileri doğrudan tarayıcı üzerinden anlık okuyun ve cihaza veri gönderin.
- **🚀 Otomatik Kurulum:** Windows üzerinde `arduino-cli` programını kendi kendine indirip kurar.

---

### Ekran Görüntüleri

#### Ana editör

![GaziDuino ana editör ekranı](https://i.ibb.co/5hpzBwjB/Ekran-g-r-nt-s-2026-07-23-213510.png)

#### Kart ve işlemci ayarları

![GaziDuino Araçlar menüsü ve kart ayarları](https://i.ibb.co/chXJkw7b/Ekran-g-r-nt-s-2026-07-23-213637.png)

#### Seri port monitörü

![GaziDuino seri port monitörü](https://i.ibb.co/TqxKsZXV/Ekran-g-r-nt-s-2026-07-23-213746.png)

#### Kütüphane yöneticisi

![GaziDuino kütüphane yöneticisi](https://i.ibb.co/Kc1JB0rd/Ekran-g-r-nt-s-2026-07-23-213824.png)

#### Kart yöneticisi

![GaziDuino kart yöneticisi](https://i.ibb.co/bMQ9BW8H/Ekran-g-r-nt-s-2026-07-23-213854.png)

#### AI asistan

![GaziDuino AI asistanı](https://i.ibb.co/QBKxv7m/Ekran-g-r-nt-s-2026-07-23-213922.png)

---

### 📱 Android OTG ile Kod Yükleme (Önemli!)

GaziDuino'nun en büyük devrimlerinden biri Android cihazlar üzerinden **hiçbir üçüncü parti uygulama kurmadan** doğrudan donanıma kod atabilmesidir. 

**Nasıl Çalışır?**
Kullanıcıların Android'de "Sürücü kurmalıyım", "Uygulama indirmeliyim" gibi dertlerle **ilgilenmesine gerek yoktur.** 
1. Sunucuyu (Python) bilgisayarınızda, Raspberry Pi'de veya doğrudan telefonunuzdaki Termux üzerinde başlatın.
2. Android cihazınızın **Google Chrome** veya **Microsoft Edge** tarayıcısından sunucunun IP adresine (Örn: `http://192.168.1.X:5000`) girin.
3. Arduino veya ESP32 cihazınızı **OTG kablosu** ile Android cihazınıza bağlayın.
4. Sitedeki **Yükle** butonuna basın. Tarayıcı size "USB cihazına bağlanılsın mı?" diye soracaktır. İzin verin.
5. GaziDuino kodu sunucuda derleyecek ve elde ettiği `.bin` / `.hex` dosyasını tarayıcınızın WebUSB/Web Serial altyapısı ile saniyeler içinde cihaza flaşlayacaktır!

---

### ⚙️ Kurulum ve Çalıştırma

#### 🪟 Windows

1. [Python'u indirin ve kurun](https://www.python.org/downloads/) (Kurarken "Add Python to PATH" seçeneğini işaretlemeyi unutmayın).
2. Terminali (CMD veya PowerShell) açın ve Flask kütüphanesini kurun:
   pip install flask
3. Proje dizinine gidip uygulamayı başlatın:
   python main.py
*(Not: Windows üzerinde ilk kez çalıştırdığınızda GaziDuino resmi `arduino-cli` aracını otomatik olarak indirecek ve klasöre kuracaktır. Sizin ekstra bir şey yapmanıza gerek yoktur.)*

#### 🐧 Ubuntu / Debian tabanlı Linux

Linux ortamında `arduino-cli` aracı otomatik olarak sistem paket yöneticilerinden kurulabilir.

1. Gerekli araçları yükleyin:
   sudo apt update
   sudo apt install python3 python3-pip curl
2. Arduino-CLI'ı kurun:
   curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
3. Flask'ı kurun ve projeyi çalıştırın:
   pip3 install flask
   python3 main.py

#### 📱 Termux (Android Cihaz Üzerinde Sunucu Kurmak İsteyenler)

Termux üzerinde sunucu kurarak projeyi Android'de çalıştırabilirsiniz. Ancak **dikkat etmeniz gereken kritik bir nokta var:**

- **Eğer sadece Arduino Uno / Nano derleyecekseniz:** Düz Termux işinizi görür.
- **Eğer ESP32 veya ESP8266 derleyecekseniz:** Resmi derleyiciler (glibc) Termux ile doğrudan uyumlu olmadığı için Termux içerisine **Ubuntu (proot-distro)** kurmanız **zorunludur**.

**ESP32 Destekli Ubuntu (Termux) Kurulumu:**
1. Termux'u açın, projeyi dışarıda indirin ve Ubuntu kurun:
   pkg update
   pkg install git proot-distro
   git clone https://github.com/Gazi-AI/GaziDuino.git
   proot-distro install ubuntu
   proot-distro login ubuntu
2. Ubuntu içine girdikten sonra Linux araçlarını kurun:
   apt update
   apt install python3 python3-pip curl
   curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
   export PATH=$PATH:/root/bin
   pip3 install flask
3. Ubuntu içindeyken, Termux'un ana klasörüne (projeyi indirdiğimiz yere) gidin ve sunucuyu başlatın:
   cd /data/data/com.termux/files/home/GaziDuino
   python3 main.py

---

### 🛠️ Nasıl Kullanılır?

1. Sitenin sol tarafındaki menüden projenizi yönetebilirsiniz.
2. Sağ üst köşedeki **Çark (Ayarlar)** ikonuna tıklayarak kullanmak istediğiniz **Kartı (Board)** seçin. Eğer kartınız listede yoksa "Kart Yöneticisi" sekmesine girip kart paketini (Örn: ESP32) kurun.
3. Yine sağ üstten bağlanmak istediğiniz **Portu** seçin.
4. Kodunuzu yazdıktan sonra üstteki **Derle (Tik işareti)** butonuyla kodunuzda hata olup olmadığını kontrol edin.
5. **Yükle (Sağ ok işareti)** butonu ile kodunuzu direkt cihaza gönderin.
6. Sağ alt köşedeki **Seri Port (Fiş işareti)** ikonuna tıklayarak cihazdan gelen Serial verileri okuyabilirsiniz.

---

### 📦 Kütüphane Yöneticisi
GaziDuino içerisinde tam **9643 adet** Arduino kütüphanesi hazır olarak gelir! 
- Sol menüden Kütüphane Yöneticisi'ni açın.
- Arama kısmına istediğiniz sensörün veya modülün adını yazın (Örn: `DHT11`, `Servo`, `LiquidCrystal`).
- İlgili kütüphaneyi bulup **KUR** butonuna basmanız yeterlidir.

---

*Gazi-AI Ekibi tarafından geliştirilmiştir.*
