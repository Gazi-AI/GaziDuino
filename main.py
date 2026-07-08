import os
import sys
import shutil
import zipfile
import subprocess
import urllib.request
import webbrowser
import time
import threading
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.')

# Global serial monitor process reference (for stdin writing)
serial_monitor_proc = None

# Cache the last board options to share with AI agent tools
current_board_options = {
    "EraseFlash": "none",
    "EventsCore": "1",
    "FlashFreq": "80",
    "FlashMode": "qio",
    "FlashSize": "4M",
    "JTAGAdapter": "default",
    "LoopCore": "1",
    "PartitionScheme": "default",
    "PSRAM": "disabled",
    "UploadSpeed": "921600",
    "ZigbeeMode": "default",
    "DebugLevel": "none"
}

# Workspace directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SKETCH_DIR = os.path.join(BASE_DIR, "sketch_jul6a")
SKETCH_FILE = os.path.join(SKETCH_DIR, "sketch_jul6a.ino")
BUILD_DIR = os.path.join(BASE_DIR, "build")
cli_binary_name = "arduino-cli.exe" if os.name == 'nt' else "arduino-cli"
ARDUINO_CLI = os.path.join(BASE_DIR, cli_binary_name)

# Create sketch folder structure if not exists
if not os.path.exists(SKETCH_DIR):
    os.makedirs(SKETCH_DIR)
if not os.path.exists(BUILD_DIR):
    os.makedirs(BUILD_DIR)

DEFAULT_CODE = """void setup() {
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);
  delay(1000);
  digitalWrite(2, LOW);
  delay(1000);
}
"""

if not os.path.exists(SKETCH_FILE):
    with open(SKETCH_FILE, "w", encoding="utf-8") as f:
        f.write(DEFAULT_CODE)

# Check and Download Arduino CLI
def ensure_arduino_cli():
    # If in path, use it (Termux/Linux users usually have it in PATH)
    cli_path = shutil.which("arduino-cli")
    if cli_path:
        return cli_path
    
    if os.path.exists(ARDUINO_CLI):
        return ARDUINO_CLI

    if os.name != 'nt':
        print("[Arduino CLI] Bulunamadı. Termux veya Linux üzerinde 'pkg install arduino-cli' veya paket yöneticiniz ile manuel kurunuz.")
        return None

    print("[Arduino CLI] Bulunamadı. Windows 64-bit için indiriliyor...")
    url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip"
    zip_path = os.path.join(BASE_DIR, "arduino-cli.zip")
    
    try:
        urllib.request.urlretrieve(url, zip_path)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(BASE_DIR)
        
        # Clean up zip
        if os.path.exists(zip_path):
            os.remove(zip_path)
            
        print("[Arduino CLI] Başarıyla indirildi ve kuruldu.")
        
        # Initialize config
        subprocess.run([ARDUINO_CLI, "config", "init"], capture_output=True)
        return ARDUINO_CLI
    except Exception as e:
        print(f"[Arduino CLI] İndirme hatası: {e}")
        return None

# FQBN Map from UI boards to Arduino CLI FQBNs
FQBN_MAP = {
    "ESP32 Dev Module": "esp32:esp32:esp32",
    "Arduino Uno": "arduino:avr:uno",
    "Arduino Nano": "arduino:avr:nano",
    "Arduino Mega 2560": "arduino:avr:mega"
}

def build_fqbn_with_options(board, board_options):
    fqbn = FQBN_MAP.get(board, "arduino:avr:uno")
    if fqbn == "esp32:esp32:esp32" and board_options:
        opts = []
        for k, v in board_options.items():
            opts.append(f"{k}={v}")
        if opts:
            fqbn = f"{fqbn}:{','.join(opts)}"
    return fqbn

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

@app.route("/api/sketch", methods=["GET"])
def get_sketch():
    try:
        if os.path.exists(SKETCH_FILE):
            with open(SKETCH_FILE, "r", encoding="utf-8") as f:
                code = f.read()
        else:
            code = DEFAULT_CODE
        return jsonify({"code": code, "filename": "sketch_jul6a.ino"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/sketch", methods=["POST"])
def save_sketch():
    try:
        data = request.json or {}
        code = data.get("code", "")
        with open(SKETCH_FILE, "w", encoding="utf-8") as f:
            f.write(code)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/compile", methods=["POST"])
def compile_sketch():
    cli = ensure_arduino_cli()
    if not cli:
        return jsonify({"success": False, "log": ["Hata: arduino-cli bulunamadı veya indirilemedi."]}), 500
    
    data = request.json or {}
    board = data.get("board", "ESP32 Dev Module")
    board_options = data.get("board_options", {})
    global current_board_options
    current_board_options.update(board_options)
    fqbn = build_fqbn_with_options(board, board_options)
    
    # Save code first
    code = data.get("code", "")
    with open(SKETCH_FILE, "w", encoding="utf-8") as f:
        f.write(code)

    # Compile command (saving to build directory)
    cmd = [cli, "compile", "--fqbn", fqbn, "--build-path", BUILD_DIR, SKETCH_DIR]
    
    # Update index for esp32 if esp32 is selected
    if "esp32" in fqbn:
        # Check if esp32 platform is installed, if not, auto install it
        check_cmd = [cli, "core", "list"]
        core_list = subprocess.run(check_cmd, capture_output=True, text=True).stdout
        if "esp32:esp32" not in core_list:
            print("[Arduino CLI] ESP32 çekirdeği yükleniyor...")
            esp32_url = "https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json"
            subprocess.run([cli, "core", "update-index", "--additional-urls", esp32_url])
            subprocess.run([cli, "core", "install", "esp32:esp32", "--additional-urls", esp32_url])
    else:
        # Check avr core
        check_cmd = [cli, "core", "list"]
        core_list = subprocess.run(check_cmd, capture_output=True, text=True).stdout
        if "arduino:avr" not in core_list:
            print("[Arduino CLI] AVR çekirdeği yükleniyor...")
            subprocess.run([cli, "core", "update-index"])
            subprocess.run([cli, "core", "install", "arduino:avr"])

    print(f"[Arduino CLI] Derleniyor: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    log = []
    if result.stdout:
        log.extend(result.stdout.splitlines())
    if result.stderr:
        log.extend(result.stderr.splitlines())
        
    # Translate and simplify Termux-specific errors
    for i, line in enumerate(log):
        if "no versions available for the current OS" in line:
            log[i] = f"Hata: Bu kart için resmi derleyici (compiler) Android/Termux desteklemiyor! Lütfen 'Arduino Uno' veya 'Nano' seçerek deneyin. (Orijinal hata: {line})"
        elif "platform not installed" in line:
            log[i] = f"Hata: Platform yüklenemedi. Kartın işlemci mimarinizi (AArch64) desteklediğinden emin olun. (Orijinal hata: {line})"
        
    return jsonify({
        "success": result.returncode == 0,
        "log": log
    })

@app.route("/api/upload", methods=["POST"])
def upload_sketch():
    cli = ensure_arduino_cli()
    if not cli:
        return jsonify({"success": False, "log": ["Hata: arduino-cli bulunamadı."]}), 500
        
    data = request.json or {}
    board = data.get("board", "ESP32 Dev Module")
    default_port = "COM4" if os.name == 'nt' else "/dev/ttyUSB0"
    port = data.get("port", default_port)
    board_options = data.get("board_options", {})
    global current_board_options
    current_board_options.update(board_options)
    fqbn = build_fqbn_with_options(board, board_options)

    # 1. Compile first to build directory
    compile_cmd = [cli, "compile", "--fqbn", fqbn, "--build-path", BUILD_DIR, SKETCH_DIR]
    print(f"[Arduino CLI] Yükleme öncesi derleniyor: {' '.join(compile_cmd)}")
    compile_res = subprocess.run(compile_cmd, capture_output=True, text=True)
    
    log = []
    if compile_res.stdout:
        log.extend(compile_res.stdout.splitlines())
    if compile_res.stderr:
        log.extend(compile_res.stderr.splitlines())
        
    if compile_res.returncode != 0:
        return jsonify({
            "success": False,
            "log": log + ["Hata: Yükleme öncesi derleme başarısız oldu."]
        })

    # 2. Upload from the build directory using --input-dir
    upload_cmd = [cli, "upload", "-p", port, "--fqbn", fqbn, "--input-dir", BUILD_DIR, SKETCH_DIR]
    print(f"[Arduino CLI] Karta yükleniyor: {' '.join(upload_cmd)}")
    upload_res = subprocess.run(upload_cmd, capture_output=True, text=True)
    
    if upload_res.stdout:
        log.extend(upload_res.stdout.splitlines())
    if upload_res.stderr:
        log.extend(upload_res.stderr.splitlines())
        
    return jsonify({
        "success": upload_res.returncode == 0,
        "log": log
    })

def get_com_ports():
    ports = []
    cli = ensure_arduino_cli()
    if cli:
        try:
            import json
            result = subprocess.run([cli, "board", "list", "--format", "json"], capture_output=True, text=True)
            if result.returncode == 0:
                data = json.loads(result.stdout)
                if isinstance(data, list):
                    for item in data:
                        port_info = item.get("port", {})
                        address = port_info.get("address", "")
                        label = port_info.get("label", "")
                        boards = item.get("matching_boards", [])
                        board_name = boards[0].get("name", "") if boards else label or "Bilinmeyen Kart"
                        if address:
                            ports.append({"port": address, "board": board_name})
                if ports:
                    return ports
        except Exception as e:
            print(f"[COM Ports] CLI list error: {e}")

    # Fallback if arduino-cli fails
    if os.name == 'nt':
        # Windows registry fallback
        try:
            import winreg
            path = 'HARDWARE\\DEVICEMAP\\SERIALCOMM'
            try:
                key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, path)
                for i in range(1024):
                    try:
                        val = winreg.EnumValue(key, i)
                        ports.append({"port": val[1], "board": "Seri Cihaz"})
                    except OSError:
                        break
            except FileNotFoundError:
                # No serial ports connected at all, key doesn't exist. Ignore.
                pass
        except Exception as e:
            print(f"[COM Ports] Registry fallback error: {e}")
    else:
        # Linux/Termux fallback
        try:
            import glob
            tty_ports = glob.glob("/dev/ttyUSB*") + glob.glob("/dev/ttyACM*")
            for p in tty_ports:
                ports.append({"port": p, "board": "Seri Cihaz"})
        except Exception as e:
            print(f"[COM Ports] Linux fallback error: {e}")
            
    return ports

@app.route("/api/ports", methods=["GET"])
def list_ports():
    ports = get_com_ports()
    return jsonify({"ports": ports})

@app.route("/api/serial/stream")
def serial_stream():
    global serial_monitor_proc
    port = request.args.get("port", "")
    baud = request.args.get("baud", "115200")
    
    def generate():
        global serial_monitor_proc
        cli = ensure_arduino_cli()
        if not cli or not port:
            yield "data: [Hata] Geçersiz port veya derleyici bulunamadı.\n\n"
            return
            
        cmd = [cli, "monitor", "-p", port, "-c", f"baudrate={baud}"]
        print(f"[Serial Monitor] Başlatılıyor: {' '.join(cmd)}")
        
        # Prevent orphaning: kill any existing monitor before starting a new one
        if serial_monitor_proc:
            try:
                serial_monitor_proc.terminate()
                serial_monitor_proc.wait(timeout=2)
            except Exception:
                try:
                    serial_monitor_proc.kill()
                except Exception:
                    pass
            serial_monitor_proc = None
            
        try:
            serial_monitor_proc = subprocess.Popen(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                stdin=subprocess.PIPE, bufsize=1
            )
            while True:
                line_bytes = serial_monitor_proc.stdout.readline()
                if not line_bytes and serial_monitor_proc.poll() is not None:
                    break
                if line_bytes:
                    line = line_bytes.decode('utf-8', errors='replace')
                    yield f"data: {line}\n\n"
        except Exception as e:
            yield f"data: [Hata] {str(e)}\n\n"
        finally:
            proc = serial_monitor_proc
            if proc:
                print("[Serial Monitor] Kapatılıyor...")
                try:
                    proc.terminate()
                except Exception:
                    pass
            # Clear global only if it still points to the same proc
            if serial_monitor_proc is proc:
                serial_monitor_proc = None
                
    return app.response_class(generate(), mimetype="text/event-stream")

@app.route("/api/serial/send", methods=["POST"])
def serial_send():
    """Send a message to the connected serial port."""
    global serial_monitor_proc
    data = request.json or {}
    message = data.get("message", "")
    line_ending = data.get("lineEnding", "nl")
    
    if not serial_monitor_proc or serial_monitor_proc.poll() is not None:
        return jsonify({"success": False, "error": "Seri port bağlı değil."})
    
    if line_ending == "nl":
        message += "\n"
    elif line_ending == "cr":
        message += "\r"
    elif line_ending == "both":
        message += "\r\n"
    # "none" = no line ending
    
    try:
        serial_monitor_proc.stdin.write(message.encode('utf-8'))
        serial_monitor_proc.stdin.flush()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/api/serial/disconnect", methods=["POST", "GET"])
def serial_disconnect():
    global serial_monitor_proc
    proc = serial_monitor_proc
    if proc:
        print("[Serial Monitor] Explicit disconnect request. Terminating process...")
        try:
            proc.terminate()
            proc.wait(timeout=2)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
        if serial_monitor_proc is proc:
            serial_monitor_proc = None
        return jsonify({"success": True, "message": "Seri port bağlantısı kesildi."})
    return jsonify({"success": True, "message": "Bağlı seri port yok."})

@app.route("/api/core/install", methods=["POST"])
def install_core():
    """Install a board core via arduino-cli."""
    cli = ensure_arduino_cli()
    if not cli:
        return jsonify({"success": False, "log": ["arduino-cli bulunamadı."]})
    
    data = request.json or {}
    core = data.get("core", "")
    url = data.get("url", "")
    
    if not core:
        return jsonify({"success": False, "log": ["Geçersiz çekirdek adı."]})
    
    # Update index first
    if url:
        subprocess.run([cli, "core", "update-index", "--additional-urls", url], capture_output=True)
    else:
        subprocess.run([cli, "core", "update-index"], capture_output=True)
    
    cmd = [cli, "core", "install", core]
    if url:
        cmd.extend(["--additional-urls", url])
    
    print(f"[Core Install] {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    log = []
    if result.stdout: log.extend(result.stdout.splitlines())
    if result.stderr: log.extend(result.stderr.splitlines())
    
    return jsonify({"success": result.returncode == 0, "log": log})

@app.route("/api/core/uninstall", methods=["POST"])
def uninstall_core():
    """Uninstall a board core via arduino-cli."""
    cli = ensure_arduino_cli()
    if not cli:
        return jsonify({"success": False, "log": ["arduino-cli bulunamadı."]})
    
    data = request.json or {}
    core = data.get("core", "")
    
    cmd = [cli, "core", "uninstall", core]
    print(f"[Core Uninstall] {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    log = []
    if result.stdout: log.extend(result.stdout.splitlines())
    if result.stderr: log.extend(result.stderr.splitlines())
    
    return jsonify({"success": result.returncode == 0, "log": log})

@app.route("/api/library/install", methods=["POST"])
def install_library():
    """Install a library via arduino-cli."""
    cli = ensure_arduino_cli()
    if not cli:
        return jsonify({"success": False, "log": ["arduino-cli bulunamadı."]})
    
    data = request.json or {}
    library = data.get("library", "")
    version = data.get("version", "")
    
    if not library:
        return jsonify({"success": False, "log": ["Geçersiz kütüphane adı."]})
    
    lib_spec = f"{library}@{version}" if version else library
    cmd = [cli, "lib", "install", lib_spec]
    
    print(f"[Library Install] {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    log = []
    if result.stdout: log.extend(result.stdout.splitlines())
    if result.stderr: log.extend(result.stderr.splitlines())
    
    return jsonify({"success": result.returncode == 0, "log": log})

@app.route("/api/library/uninstall", methods=["POST"])
def uninstall_library():
    """Uninstall a library via arduino-cli."""
    cli = ensure_arduino_cli()
    if not cli:
        return jsonify({"success": False, "log": ["arduino-cli bulunamadı."]})
    
    data = request.json or {}
    library = data.get("library", "")
    
    cmd = [cli, "lib", "uninstall", library]
    print(f"[Library Uninstall] {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    log = []
    if result.stdout: log.extend(result.stdout.splitlines())
    if result.stderr: log.extend(result.stderr.splitlines())
    
    return jsonify({"success": result.returncode == 0, "log": log})

@app.route("/api/archive")
def archive_sketch():
    """Archive the sketch folder as a ZIP and send it for download."""
    import io
    mem_zip = io.BytesIO()
    with zipfile.ZipFile(mem_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(SKETCH_DIR):
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, os.path.dirname(SKETCH_DIR))
                zf.write(filepath, arcname)
    mem_zip.seek(0)
    from flask import send_file
    return send_file(mem_zip, mimetype='application/zip', as_attachment=True, download_name='sketch_jul6a.zip')

@app.route("/api/export-binary", methods=["POST"])
def export_binary():
    """Compile the sketch and return the binary filename for download."""
    cli = ensure_arduino_cli()
    if not cli:
        return jsonify({"success": False, "log": ["Hata: arduino-cli bulunamadı."]})
    
    data = request.json or {}
    board = data.get("board", "ESP32 Dev Module")
    code = data.get("code", "")
    board_options = data.get("board_options", {})
    fqbn = build_fqbn_with_options(board, board_options)
    
    # Save code
    with open(SKETCH_FILE, "w", encoding="utf-8") as f:
        f.write(code)
    
    # Compile
    cmd = [cli, "compile", "--fqbn", fqbn, "--build-path", BUILD_DIR, SKETCH_DIR]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    log = []
    if result.stdout:
        log.extend(result.stdout.splitlines())
    if result.stderr:
        log.extend(result.stderr.splitlines())
    
    if result.returncode != 0:
        return jsonify({"success": False, "log": log})
    
    # Find the binary file
    binary_name = None
    for f in os.listdir(BUILD_DIR):
        if f.endswith(".bin") or f.endswith(".hex"):
            binary_name = f
            break
    
    if binary_name:
        return jsonify({"success": True, "filename": binary_name, "log": log})
    else:
        return jsonify({"success": False, "log": log + ["Hata: Derlenmiş ikili dosya bulunamadı."]})

@app.route("/api/download-binary")
def download_binary():
    """Download a compiled binary file from the build directory."""
    filename = request.args.get("file", "")
    if not filename or ".." in filename:
        return jsonify({"error": "Geçersiz dosya adı"}), 400
    filepath = os.path.join(BUILD_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "Dosya bulunamadı"}), 404
    return send_from_directory(BUILD_DIR, filename, as_attachment=True)

@app.route("/api/board-info")
def board_info():
    """Get board info from arduino-cli for the given port."""
    cli = ensure_arduino_cli()
    port = request.args.get("port", "")
    if not cli:
        return jsonify({"info": ["Hata: arduino-cli bulunamadı."]})
    
    import json as json_module
    result = subprocess.run([cli, "board", "list", "--format", "json"], capture_output=True, text=True)
    info_lines = []
    
    if result.returncode == 0:
        try:
            data = json_module.loads(result.stdout)
            if isinstance(data, list):
                for item in data:
                    port_info = item.get("port", {})
                    address = port_info.get("address", "")
                    label = port_info.get("label", "")
                    protocol = port_info.get("protocol", "")
                    boards = item.get("matching_boards", [])
                    board_name = boards[0].get("name", "Bilinmeyen") if boards else "Bilinmeyen"
                    fqbn = boards[0].get("fqbn", "N/A") if boards else "N/A"
                    
                    info_lines.append(f"Port: {address} ({label})")
                    info_lines.append(f"  Protokol: {protocol}")
                    info_lines.append(f"  Kart: {board_name}")
                    info_lines.append(f"  FQBN: {fqbn}")
                    info_lines.append("")
        except Exception as e:
            info_lines.append(f"Hata: {str(e)}")
    else:
        info_lines.append("arduino-cli board list komutu başarısız oldu.")
        if result.stderr:
            info_lines.extend(result.stderr.splitlines())
    
    if not info_lines:
        info_lines.append("Bağlı kart bulunamadı.")
    
    return jsonify({"info": info_lines})


# ===================== FILE SYSTEM API =====================

def get_file_tree(root_path, rel_prefix=""):
    """Recursively build a file tree structure."""
    tree = []
    try:
        entries = sorted(os.listdir(root_path), key=lambda x: (not os.path.isdir(os.path.join(root_path, x)), x.lower()))
        for entry in entries:
            full_path = os.path.join(root_path, entry)
            rel_path = os.path.join(rel_prefix, entry) if rel_prefix else entry
            # Skip build dir, __pycache__, .git, etc.
            if entry in ('build', '__pycache__', '.git', 'node_modules', 'arduino-cli.exe', 'LICENSE.txt'):
                continue
            if os.path.isdir(full_path):
                children = get_file_tree(full_path, rel_path)
                tree.append({
                    "name": entry,
                    "path": rel_path.replace("\\", "/"),
                    "type": "folder",
                    "children": children
                })
            else:
                # Only show relevant file types
                ext = os.path.splitext(entry)[1].lower()
                if ext in ('.ino', '.cpp', '.c', '.h', '.hpp', '.txt', '.md', '.json', '.csv', '.py', '.js', '.css', '.html', '.cfg', '.ini', '.log', '.xml'):
                    tree.append({
                        "name": entry,
                        "path": rel_path.replace("\\", "/"),
                        "type": "file",
                        "ext": ext
                    })
    except Exception as e:
        print(f"[FileTree] Error: {e}")
    return tree

@app.route("/api/files", methods=["GET"])
def list_files():
    """Return the file tree of the sketch directory."""
    tree = get_file_tree(SKETCH_DIR)
    return jsonify({"tree": tree, "root": "sketch_jul6a"})

@app.route("/api/files/read", methods=["GET"])
def read_file():
    """Read a file's content."""
    rel_path = request.args.get("path", "")
    if not rel_path or ".." in rel_path:
        return jsonify({"error": "Geçersiz dosya yolu."}), 400
    full_path = os.path.join(SKETCH_DIR, rel_path)
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        return jsonify({"error": "Dosya bulunamadı."}), 404
    try:
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
        return jsonify({"content": content, "path": rel_path, "name": os.path.basename(rel_path)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/files/write", methods=["POST"])
def write_file():
    """Write content to a file."""
    data = request.json or {}
    rel_path = data.get("path", "")
    content = data.get("content", "")
    if not rel_path or ".." in rel_path:
        return jsonify({"error": "Geçersiz dosya yolu."}), 400
    full_path = os.path.join(SKETCH_DIR, rel_path)
    try:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        # If this is the main .ino file, also update the SKETCH_FILE reference
        if full_path == SKETCH_FILE:
            pass  # Already writing to the right place
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/files/create", methods=["POST"])
def create_file_or_folder():
    """Create a new file or folder."""
    data = request.json or {}
    rel_path = data.get("path", "")
    item_type = data.get("type", "file")  # "file" or "folder"
    if not rel_path or ".." in rel_path:
        return jsonify({"error": "Geçersiz yol."}), 400
    full_path = os.path.join(SKETCH_DIR, rel_path)
    if os.path.exists(full_path):
        return jsonify({"error": "Bu isimde bir dosya/klasör zaten var."}), 409
    try:
        if item_type == "folder":
            os.makedirs(full_path, exist_ok=True)
        else:
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            # Create with default content based on extension
            ext = os.path.splitext(rel_path)[1].lower()
            default_content = ""
            if ext == ".ino":
                default_content = "void setup() {\n  \n}\n\nvoid loop() {\n  \n}\n"
            elif ext == ".h":
                guard = os.path.basename(rel_path).upper().replace(".", "_")
                default_content = f"#ifndef {guard}\n#define {guard}\n\n\n\n#endif // {guard}\n"
            elif ext == ".cpp" or ext == ".c":
                default_content = "// " + os.path.basename(rel_path) + "\n\n"
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(default_content)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/files/delete", methods=["POST"])
def delete_file_or_folder():
    """Delete a file or folder."""
    data = request.json or {}
    rel_path = data.get("path", "")
    if not rel_path or ".." in rel_path:
        return jsonify({"error": "Geçersiz yol."}), 400
    full_path = os.path.join(SKETCH_DIR, rel_path)
    if not os.path.exists(full_path):
        return jsonify({"error": "Dosya/klasör bulunamadı."}), 404
    try:
        if os.path.isdir(full_path):
            shutil.rmtree(full_path)
        else:
            os.remove(full_path)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/files/rename", methods=["POST"])
def rename_file_or_folder():
    """Rename a file or folder."""
    data = request.json or {}
    old_path = data.get("oldPath", "")
    new_name = data.get("newName", "")
    if not old_path or not new_name or ".." in old_path or ".." in new_name:
        return jsonify({"error": "Geçersiz parametreler."}), 400
    full_old = os.path.join(SKETCH_DIR, old_path)
    parent_dir = os.path.dirname(full_old)
    full_new = os.path.join(parent_dir, new_name)
    if not os.path.exists(full_old):
        return jsonify({"error": "Kaynak bulunamadı."}), 404
    if os.path.exists(full_new):
        return jsonify({"error": "Bu isimde bir öğe zaten var."}), 409
    try:
        os.rename(full_old, full_new)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===================== AI CHAT PROXY =====================

# ===================== AGENTIC TOOLS DEFINITIONS =====================

GEMINI_TOOLS = [
    {
        "function_declarations": [
            {
                "name": "write_sketch_file",
                "description": "Writes content to a file inside the sketch directory. Automatically creates subfolders if they do not exist.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "path": {
                            "type": "STRING",
                            "description": "Relative path of the file, e.g. 'sketch_jul6a.ino' or 'utility.h'"
                        },
                        "content": {
                            "type": "STRING",
                            "description": "The full code content of the file."
                        }
                    },
                    "required": ["path", "content"]
                }
            },
            {
                "name": "read_sketch_file",
                "description": "Reads the content of a file in the sketch folder.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "path": {
                            "type": "STRING",
                            "description": "Relative path of the file, e.g. 'sketch_jul6a.ino'"
                        }
                    },
                    "required": ["path"]
                }
            },
            {
                "name": "list_sketch_files",
                "description": "Lists all files and folders in the sketch folder recursively.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {}
                }
            },
            {
                "name": "list_com_ports",
                "description": "Lists all available COM ports and detected boards.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {}
                }
            },
            {
                "name": "compile_sketch",
                "description": "Compiles the Arduino sketch. Specify the board name (e.g. 'Arduino Uno', 'ESP32 Dev Module', 'Arduino Nano', 'Arduino Mega 2560').",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "board": {
                            "type": "STRING",
                            "description": "Board name"
                        }
                    },
                    "required": ["board"]
                }
            },
            {
                "name": "upload_sketch",
                "description": "Uploads the compiled sketch to the board on a specific port.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "board": {
                            "type": "STRING",
                            "description": "Board name"
                        },
                        "port": {
                            "type": "STRING",
                            "description": "COM port, e.g. 'COM4' or '/dev/ttyUSB0'"
                        }
                    },
                    "required": ["board", "port"]
                }
            },
            {
                "name": "install_board_core",
                "description": "Installs a board core package (e.g., 'esp32:esp32', 'arduino:avr').",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "core": {
                            "type": "STRING",
                            "description": "Core identifier, e.g. 'esp32:esp32'"
                        },
                        "url": {
                            "type": "STRING",
                            "description": "Optional manager URL for the core package"
                        }
                    },
                    "required": ["core"]
                }
            },
            {
                "name": "install_library",
                "description": "Installs an Arduino library.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "library": {
                            "type": "STRING",
                            "description": "Library name, e.g. 'DHT sensor library'"
                        },
                        "version": {
                            "type": "STRING",
                            "description": "Optional version tag, e.g. '1.4.6'"
                        }
                    },
                    "required": ["library"]
                }
            },
            {
                "name": "read_serial_monitor",
                "description": "Reads data from the specified serial port for a duration to verify sketch output.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "port": {
                            "type": "STRING",
                            "description": "COM port, e.g. 'COM4' or '/dev/ttyUSB0'"
                        },
                        "baud": {
                            "type": "INTEGER",
                            "description": "Baud rate, default 115200"
                        },
                        "duration_seconds": {
                            "type": "INTEGER",
                            "description": "Duration in seconds to monitor, default 5"
                        }
                    },
                    "required": ["port"]
                }
            },
            {
                "name": "edit_sketch_file",
                "description": "Edits a file by finding and replacing specific text. Much more token-efficient than rewriting the entire file. Use this when you only need to change a portion of existing code. You can make multiple replacements in one call by providing arrays of old_content and new_content with matching indices.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "path": {
                            "type": "STRING",
                            "description": "Relative path of the file, e.g. 'sketch_jul6a.ino'"
                        },
                        "old_content": {
                            "type": "STRING",
                            "description": "The exact text to find and replace. Must match exactly including whitespace and newlines."
                        },
                        "new_content": {
                            "type": "STRING",
                            "description": "The replacement text."
                        }
                    },
                    "required": ["path", "old_content", "new_content"]
                }
            }
        ]
    }
]

def tool_read_serial_monitor(port, baud=115200, duration_seconds=5):
    global serial_monitor_proc
    if serial_monitor_proc:
        try:
            serial_monitor_proc.terminate()
            serial_monitor_proc = None
        except Exception:
            pass
            
    cli = ensure_arduino_cli()
    if not cli:
        return {"error": "arduino-cli bulunamadı."}
    
    cmd = [cli, "monitor", "-p", port, "-c", f"baudrate={baud}"]
    try:
        proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            stdin=subprocess.PIPE, bufsize=1
        )
        import time
        import threading
        
        output_lines = []
        def read_loop():
            try:
                for line_bytes in proc.stdout:
                    line = line_bytes.decode('utf-8', errors='replace')
                    output_lines.append(line)
            except Exception:
                pass
                
        t = threading.Thread(target=read_loop)
        t.daemon = True
        t.start()
        
        time.sleep(duration_seconds)
        proc.terminate()
        return {"output": "".join(output_lines)}
    except Exception as e:
        return {"error": str(e)}

def execute_tool(name, args):
    try:
        if name == "write_sketch_file":
            path = args.get("path", "")
            content = args.get("content", "")
            if not path:
                path = "sketch_jul6a.ino"
            
            # Strip sketch directory prefix if model provides it
            if path.startswith("sketch_jul6a/") or path.startswith(SKETCH_DIR + "/"):
                path = path.split("/", 1)[-1]
            elif path.startswith("sketch_jul6a\\") or path.startswith(SKETCH_DIR + "\\"):
                path = path.split("\\", 1)[-1]
                
            if ".." in path:
                return {"error": "Geçersiz dosya yolu."}
            full_path = os.path.join(SKETCH_DIR, path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            return {"success": True, "message": f"{path} dosyası başarıyla yazıldı."}
            
        elif name == "read_sketch_file":
            path = args.get("path", "")
            if not path or ".." in path:
                return {"error": "Geçersiz dosya yolu."}
            full_path = os.path.join(SKETCH_DIR, path)
            if not os.path.exists(full_path):
                return {"error": "Dosya bulunamadı."}
            with open(full_path, "r", encoding="utf-8") as f:
                return {"content": f.read()}
                
        elif name == "edit_sketch_file":
            path = args.get("path", "")
            old_content = args.get("old_content", "")
            new_content = args.get("new_content", "")
            if not path:
                path = "sketch_jul6a.ino"
            
            # Strip sketch directory prefix if model provides it
            if path.startswith("sketch_jul6a/") or path.startswith(SKETCH_DIR + "/"):
                path = path.split("/", 1)[-1]
            elif path.startswith("sketch_jul6a\\") or path.startswith(SKETCH_DIR + "\\"):
                path = path.split("\\", 1)[-1]
                
            if ".." in path:
                return {"error": "Geçersiz dosya yolu."}
            full_path = os.path.join(SKETCH_DIR, path)
            if not os.path.exists(full_path):
                return {"error": f"Dosya bulunamadı: {path}"}
            
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            if old_content not in content:
                return {"error": "Değiştirilecek hedef metin ('old_content') dosyada bulunamadı. Lütfen tam olarak eşleştiğinden emin olun."}
                
            updated_content = content.replace(old_content, new_content)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(updated_content)
            return {"success": True, "message": f"{path} dosyasındaki metin başarıyla değiştirildi."}
                
        elif name == "list_sketch_files":
            files = []
            for root, dirs, filenames in os.walk(SKETCH_DIR):
                for f in filenames:
                    rel = os.path.relpath(os.path.join(root, f), SKETCH_DIR)
                    files.append(rel.replace("\\", "/"))
            return {"files": files}
            
        elif name == "list_com_ports":
            ports = get_com_ports()
            return {"ports": ports}
            
        elif name == "compile_sketch":
            board = args.get("board", "ESP32 Dev Module")
            cli = ensure_arduino_cli()
            if not cli:
                return {"error": "arduino-cli bulunamadı."}
            fqbn = build_fqbn_with_options(board, current_board_options)
            
            # Update index/install core automatically if needed
            if "esp32" in fqbn:
                check_cmd = [cli, "core", "list"]
                core_list = subprocess.run(check_cmd, capture_output=True, text=True).stdout
                if "esp32:esp32" not in core_list:
                    esp32_url = "https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json"
                    subprocess.run([cli, "core", "update-index", "--additional-urls", esp32_url])
                    subprocess.run([cli, "core", "install", "esp32:esp32", "--additional-urls", esp32_url])
            else:
                check_cmd = [cli, "core", "list"]
                core_list = subprocess.run(check_cmd, capture_output=True, text=True).stdout
                if "arduino:avr" not in core_list:
                    subprocess.run([cli, "core", "update-index"])
                    subprocess.run([cli, "core", "install", "arduino:avr"])

            cmd = [cli, "compile", "--fqbn", fqbn, "--build-path", BUILD_DIR, SKETCH_DIR]
            res = subprocess.run(cmd, capture_output=True, text=True)
            return {"success": res.returncode == 0, "stdout": res.stdout, "stderr": res.stderr}
            
        elif name == "upload_sketch":
            board = args.get("board", "ESP32 Dev Module")
            default_port = "COM4" if os.name == 'nt' else "/dev/ttyUSB0"
            port = args.get("port", default_port)
            cli = ensure_arduino_cli()
            if not cli:
                return {"error": "arduino-cli bulunamadı."}
            fqbn = build_fqbn_with_options(board, current_board_options)
            
            # Explicitly terminate background serial monitor if it is holding the COM port
            global serial_monitor_proc
            if serial_monitor_proc:
                try:
                    serial_monitor_proc.terminate()
                    serial_monitor_proc.wait(timeout=2)
                except Exception:
                    try:
                        serial_monitor_proc.kill()
                    except Exception:
                        pass
                serial_monitor_proc = None
            
            # compile first
            compile_cmd = [cli, "compile", "--fqbn", fqbn, "--build-path", BUILD_DIR, SKETCH_DIR]
            subprocess.run(compile_cmd, capture_output=True)
            
            # upload
            cmd = [cli, "upload", "-p", port, "--fqbn", fqbn, "--input-dir", BUILD_DIR, SKETCH_DIR]
            res = subprocess.run(cmd, capture_output=True, text=True)
            return {"success": res.returncode == 0, "stdout": res.stdout, "stderr": res.stderr}
            
        elif name == "install_board_core":
            core = args.get("core", "")
            url = args.get("url", "")
            cli = ensure_arduino_cli()
            if not cli:
                return {"error": "arduino-cli bulunamadı."}
            if url:
                subprocess.run([cli, "core", "update-index", "--additional-urls", url])
                cmd = [cli, "core", "install", core, "--additional-urls", url]
            else:
                subprocess.run([cli, "core", "update-index"])
                cmd = [cli, "core", "install", core]
            res = subprocess.run(cmd, capture_output=True, text=True)
            return {"success": res.returncode == 0, "stdout": res.stdout, "stderr": res.stderr}
            
        elif name == "install_library":
            library = args.get("library", "")
            version = args.get("version", "")
            cli = ensure_arduino_cli()
            if not cli:
                return {"error": "arduino-cli bulunamadı."}
            lib_spec = f"{library}@{version}" if version else library
            cmd = [cli, "lib", "install", lib_spec]
            res = subprocess.run(cmd, capture_output=True, text=True)
            return {"success": res.returncode == 0, "stdout": res.stdout, "stderr": res.stderr}
            
        elif name == "read_serial_monitor":
            port = args.get("port")
            baud = args.get("baud", 115200)
            duration = args.get("duration_seconds", 5)
            return tool_read_serial_monitor(port, baud, duration)
            
    except Exception as e:
        return {"error": str(e)}

# ===================== AI CHAT PROXY =====================

@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    """Proxy AI chat requests to Gemini API with agentic tool loop support."""
    import json as json_module
    data = request.json or {}
    api_key = data.get("apiKey", "")
    model = data.get("model", "gemini-3.5-flash")
    messages = data.get("messages", [])
    temperature = data.get("temperature", 0.7)
    max_tokens = data.get("maxTokens", 4096)
    system_prompt = data.get("systemPrompt", "")
    code_context = data.get("codeContext", "")

    if not api_key:
        return jsonify({"error": "API anahtarı gerekli. Ayarlardan API key girin."}), 400
    if not messages:
        return jsonify({"error": "Mesaj gerekli."}), 400

    # Build contents array
    contents = []
    
    auto_run = data.get("autoRun", False)

    # Add system instruction
    base_system = (
        "Sen bir Arduino ve gömülü sistemler uzmanı AI asistansın. GaziDuino IDE'de çalışıyorsun. "
        "Şu anki aktif eskiz dizini: 'sketch_jul6a' ve ana eskiz dosyası: 'sketch_jul6a.ino'. "
        "Yazmak istediğin ana kodları her zaman 'sketch_jul6a.ino' dosya adına yazmalısın. "
        "[KRİTİK TALİMAT]: 'write_sketch_file' aracını çağırırken yazacağın kodu kesinlikle EKSİKSİZ, "
        "tamamlanmış ve tüm satırlarıyla birlikte tek seferde yazmalısın. Asla yarım bırakma, asla "
        "'// kodun geri kalanı buraya gelecek' gibi geçici yorumlar (placeholders) kullanma. Kodun tamamını tek bir araç çağrısında gönder!"
        "Sana verilen araçları (tools) kullanarak kullanıcının isteklerini yerine getirebilirsin. "
        "Kod yazmak, derlemek, karta yüklemek, kütüphane kurmak gibi işlemleri otonom yapabilirsin. "
        "Kullanıcıya Arduino programlama, elektronik devre tasarımı, sensör kullanımı ve kod hata ayıklama konularında yardımcı ol. "
        "Yanıtlarını Türkçe ver."
    )
    if auto_run:
        base_system += (
            "\n\n[KRİTİK TALİMAT]: 'Otomatik Çalıştır' (Auto Run) modu etkindir. Kullanıcı bir kod istediğinde, "
            "hata düzeltmemi istediğinde veya kodu karta yüklememi istediğinde, açıklamalar yapmak yerine "
            "doğrudan write_sketch_file, compile_sketch veya upload_sketch araçlarını çalıştır. Kod açıklamalarını "
            "veya nasıl çalıştırılacağı talimatlarını metin olarak yazma, her şeyi araçlarla otonom olarak hallet!"
        )
    else:
        base_system += (
            "\n\n[TALİMAT]: Kullanıcıya ne yapacağını açıkla ve araçları çalıştırmadan önce bilgi ver."
        )

    if system_prompt:
        base_system += "\n\nEk talimatlar: " + system_prompt
    if code_context:
        base_system += f"\n\nKullanıcının şu anda editörde açık olan kodu:\n```cpp\n{code_context}\n```"
    
    system_instruction = {"parts": [{"text": base_system}]}

    for msg in messages:
        role = "user" if msg.get("role") == "user" else "model"
        # Skip function calling messages from history if they don't conform,
        # but to keep it simple, map normal messages
        if msg.get("content"):
            contents.append({
                "role": role,
                "parts": [{"text": msg.get("content", "")}]
            })

    payload = {
        "contents": contents,
        "tools": GEMINI_TOOLS,
        "generationConfig": {
            "temperature": temperature
        }
    }
    if max_tokens and int(max_tokens) > 0:
        payload["generationConfig"]["maxOutputTokens"] = int(max_tokens)
        
    if system_instruction:
        payload["systemInstruction"] = system_instruction

    def generate():
        nonlocal contents
        try:
            max_turns = 10
            for turn in range(max_turns):
                gen_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                req_data = json_module.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    gen_url,
                    data=req_data,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                import ssl
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                
                with urllib.request.urlopen(req, timeout=120, context=ctx) as response:
                    res_body = response.read().decode('utf-8')
                    res_json = json_module.loads(res_body)
                    
                candidates = res_json.get("candidates", [])
                if not candidates:
                    yield "data: " + json_module.dumps({'error': 'Boş model yanıtı.'}) + "\n\n"
                    return
                
                # Check if output was truncated
                finish_reason = candidates[0].get("finishReason", "")
                if finish_reason == "MAX_TOKENS":
                    yield "data: " + json_module.dumps({'text': '\n⚠️ **Uyarı:** Model çıktısı token limiti nedeniyle kesildi. AI Ayarlarından "Maks Token" değerini artırmayı deneyin.\n'}) + "\n\n"
                    
                content_obj = candidates[0].get("content", {})
                parts = content_obj.get("parts", [])
                if not parts:
                    yield "data: " + json_module.dumps({'error': 'Boş model parçası.'}) + "\n\n"
                    return
                
                # Check for functionCall
                function_call = None
                for part in parts:
                    if isinstance(part, dict) and "functionCall" in part:
                        function_call = part["functionCall"]
                        break
                        
                if function_call:
                    name = function_call.get("name", "")
                    if ":" in name:
                        name = name.split(":")[-1]
                    args = function_call.get("args", {})
                    
                    # Yield tool run status
                    msg_text = f"\n* **[Araç]** `{name}` parametrelerle çalıştırılıyor: `{json_module.dumps(args)}`...\n"
                    yield "data: " + json_module.dumps({'text': msg_text}) + "\n\n"
                    
                    # Execute tool
                    tool_result = execute_tool(name, args)
                    
                    # Stream output logs
                    if "stdout" in tool_result and tool_result["stdout"]:
                        yield "data: " + json_module.dumps({'text': '```\n' + tool_result['stdout'] + '\n```\n'}) + "\n\n"
                    if "stderr" in tool_result and tool_result["stderr"]:
                        yield "data: " + json_module.dumps({'text': '```stderr\n' + tool_result['stderr'] + '\n```\n'}) + "\n\n"
                    if "output" in tool_result and tool_result["output"]:
                        yield "data: " + json_module.dumps({'text': '```output\n' + tool_result['output'] + '\n```\n'}) + "\n\n"
                    if "error" in tool_result and tool_result["error"]:
                        yield "data: " + json_module.dumps({'text': '❌ Hata: ' + tool_result['error'] + '\n'}) + "\n\n"
                        
                    # Yield reload triggers if file written or edited
                    if name in ("write_sketch_file", "edit_sketch_file") and "error" not in tool_result:
                        # Normalize the reload path exactly like execute_tool does
                        reload_path = args.get('path', 'sketch_jul6a.ino')
                        if not reload_path:
                            reload_path = 'sketch_jul6a.ino'
                        if reload_path.startswith("sketch_jul6a/") or reload_path.startswith(SKETCH_DIR + "/"):
                            reload_path = reload_path.split("/", 1)[-1]
                        elif reload_path.startswith("sketch_jul6a\\") or reload_path.startswith(SKETCH_DIR + "\\"):
                            reload_path = reload_path.split("\\", 1)[-1]
                        yield "data: " + json_module.dumps({'reloadTree': True, 'reloadEditor': reload_path}) + "\n\n"
                    
                    # Append model's call and response to history
                    contents.append(content_obj)
                    contents.append({
                        "role": "tool",
                        "parts": [{
                            "functionResponse": {
                                "name": name,
                                "response": {"result": tool_result}
                            }
                        }]
                    })
                    payload["contents"] = contents
                    
                else:
                    text_response = parts[0].get("text", "")
                    yield "data: " + json_module.dumps({'text': text_response}) + "\n\n"
                    return
            
            yield "data: " + json_module.dumps({'text': '\n⚠️ Maksimum ajan adım sayısına ulaşıldı.'}) + "\n\n"
                            
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            yield "data: " + json_module.dumps({'error': f'Gemini API Hatası ({e.code}): {err_body}'}) + "\n\n"
        except Exception as e:
            reason = getattr(e, 'reason', '')
            error_msg = f"{type(e).__name__}: {str(e)}"
            if reason:
                error_msg += f" (Sebep: {reason})"
            yield "data: " + json_module.dumps({'error': error_msg}) + "\n\n"

    return app.response_class(generate(), mimetype="text/event-stream")


# Background System Resource Monitor Thread
system_cpu_usage = 0.0
system_gpu_usage = None

def system_usage_monitor():
    global system_cpu_usage, system_gpu_usage
    
    # Try importing psutil once
    has_psutil = False
    try:
        import psutil
        psutil.cpu_percent(interval=None) # dummy initialization call
        has_psutil = True
    except Exception:
        pass

    while True:
        try:
            # 1. CPU Usage
            if has_psutil:
                import psutil
                system_cpu_usage = psutil.cpu_percent(interval=0.5)
            else:
                if os.name == 'nt':
                    res = subprocess.run(['wmic', 'cpu', 'get', 'LoadPercentage'], capture_output=True, text=True)
                    lines = res.stdout.strip().split('\n')
                    if len(lines) > 1:
                        system_cpu_usage = float(lines[1].strip())
                else:
                    with open("/proc/stat", "r") as f:
                        fields = [float(column) for column in f.readline().strip().split()[1:]]
                    idle, total = fields[3], sum(fields)
                    time.sleep(0.5)
                    with open("/proc/stat", "r") as f:
                        fields2 = [float(column) for column in f.readline().strip().split()[1:]]
                    idle2, total2 = fields2[3], sum(fields2)
                    diff_idle = idle2 - idle
                    diff_total = total2 - total
                    if diff_total > 0:
                        system_cpu_usage = (1.0 - (diff_idle / diff_total)) * 100.0
        except Exception:
            pass

        try:
            # 2. GPU Usage
            gpu_val = None
            try:
                res = subprocess.run(['nvidia-smi', '--query-gpu=utilization.gpu', '--format=csv,noheader,nounits'], capture_output=True, text=True)
                if res.returncode == 0:
                    gpu_val = float(res.stdout.strip())
            except Exception:
                pass

            if gpu_val is None:
                try:
                    if os.path.exists("/sys/class/kgsl/kgsl-3d0/gpu_busy_percent"):
                        with open("/sys/class/kgsl/kgsl-3d0/gpu_busy_percent", "r") as f:
                            gpu_val = float(f.read().strip())
                    elif os.path.exists("/sys/class/kgsl/kgsl-3d0/gpubusy"):
                        with open("/sys/class/kgsl/kgsl-3d0/gpubusy", "r") as f:
                            parts = f.read().strip().split()
                            if len(parts) == 2 and float(parts[1]) > 0:
                                gpu_val = (float(parts[0]) / float(parts[1])) * 100.0
                except Exception:
                    pass
            system_gpu_usage = gpu_val
        except Exception:
            pass
        
        time.sleep(0.5)

t_monitor = threading.Thread(target=system_usage_monitor, daemon=True)
t_monitor.start()

@app.route("/api/system-usage")
def system_usage():
    global system_cpu_usage, system_gpu_usage
    return jsonify({
        "cpu": round(system_cpu_usage, 1),
        "gpu": round(system_gpu_usage, 1) if system_gpu_usage is not None else None
    })


def main():
    # Ensure CLI downloaded on start
    ensure_arduino_cli()
    webbrowser.open("http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False, threaded=True)

if __name__ == "__main__":
    main()
