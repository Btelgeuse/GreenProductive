import os
from PyInstaller.building.build_main import Analysis, PYZ, EXE
from PyInstaller.utils.hooks import collect_dynamic_libs, collect_data_files

# Project base path

project_path = os.getcwd()

# Collect Vosk and PyAudio binaries and package data
vosk_binaries = collect_dynamic_libs('vosk')
vosk_datas = collect_data_files('vosk')
pyaudio_binaries = collect_dynamic_libs('pyaudio')
# Include your Vosk model folder
# Format: (source_path_on_disk, destination_path_relative_to_executable)
model_datas = [
    ('models/vosk-model-small-en-us-0.15', 'models/vosk-model-small-en-us-0.15')
]
a = Analysis(
    ['backend/speech_service.py'],   # main script
    pathex=[project_path],
    binaries=vosk_binaries + pyaudio_binaries,
    datas=vosk_datas + model_datas,  # <-- model path
    hiddenimports=['vosk', 'pyaudio'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)



exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='speech_service',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,  # Disable UPX for safety with dynamic libraries
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch='arm64',  # Use 'x64' if your system/build is x64
    codesign_identity=None,
    entitlements_file=None,
)