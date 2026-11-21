import argparse, csv, json, os, shutil, subprocess, threading, time, xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime
import psutil

def log(m): print(f"[{datetime.now():%H:%M:%S}] {m}")

def list_tgs(jmx):
    root = ET.parse(jmx).getroot()
    return [(tg.get("testname","?"), tg.get("enabled","true")) for tg in root.iter("ThreadGroup")]

def filter_jmx(src, keyword, dst):
    tree = ET.parse(src); root = tree.getroot(); inner = root.find("hashTree").find("hashTree")
    children = list(inner); remove = []; i = 0
    while i < len(children):
        c = children[i]
        if c.tag == "ThreadGroup":
            name = (c.get("testname") or "").lower()
            if keyword.lower() in name:
                c.set("enabled", "true"); i += 1
                if i < len(children) and children[i].tag == "hashTree": i += 1
            else:
                remove.append(c); i += 1
                if i < len(children) and children[i].tag == "hashTree": remove.append(children[i]); i += 1
        else: i += 1
    for e in remove: inner.remove(e)
    tree.write(dst, encoding="UTF-8", xml_declaration=True)

class Monitor(threading.Thread):
    def __init__(self, out_csv, interval=5):
        super().__init__(daemon=True); self.out_csv, self.interval = out_csv, interval; self.stop_evt = threading.Event()
    def run(self):
        java = None
        for p in psutil.process_iter(["name"]):
            try:
                if "java" in (p.info["name"] or "").lower(): java = p; break
            except: pass
        psutil.cpu_percent(None)
        if java: java.cpu_percent(None)
        time.sleep(1)
        with open(self.out_csv, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f); w.writerow(["ts","sys_cpu","sys_mem","java_cpu","java_rss_mb"])
            while not self.stop_evt.is_set():
                try:
                    sc = psutil.cpu_percent(None); sm = psutil.virtual_memory().percent; jc = jr = 0.0
                    if java and java.is_running(): jc = java.cpu_percent(None); jr = java.memory_info().rss / (1024*1024)
                    w.writerow([datetime.now().isoformat(timespec="seconds"), round(sc,1), round(sm,1), round(jc,1), round(jr,1)]); f.flush()
                except: pass
                self.stop_evt.wait(self.interval)
    def stop(self): self.stop_evt.set()

def run_jmeter(jmeter, jmx, name, workdir):
    jtl = workdir / f"{name}.jtl"; rep = workdir / f"{name}-report"
    if rep.exists(): shutil.rmtree(rep)
    if jtl.exists(): jtl.unlink()
    cmd = [str(jmeter), "-n", "-t", str(jmx), "-Jhost=localhost", "-Jport=8084", "-JcontextPath=",
           "-JtestEmail=prueba@gmail.com", "-JtestPassword=12345678",
           "-Jjmeter.save.saveservice.response_data=false", "-Jjmeter.save.saveservice.samplerData=false",
           "-Jjmeter.save.saveservice.requestHeaders=false", "-Jjmeter.save.saveservice.responseHeaders=false",
           "-l", str(jtl), "-e", "-o", str(rep)]
    log(f"Ejecutando {name}...")
    mon = Monitor(workdir / f"{name}-system.csv"); mon.start()
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    with open(workdir / f"{name}-jmeter.log", "w", encoding="utf-8") as f:
        for line in p.stdout:
            f.write(line)
            if line.strip(): print(f"   > {line.rstrip()}")
    p.wait(); mon.stop()
    log(f"{name}: Terminado.")

def main():
    import sys
    jmeter = Path(r"C:\Users\Sanch\Downloads\DOWNLOAD\apache-jmeter-5.6.3\bin\jmeter.bat")
    jmx = Path(r"C:\Users\Sanch\Documents\NetBeansProjects\Sitial\performance-tests\Sitial-performance-tests.jmx")
    workdir = Path(r"C:\Users\Sanch\Documents\NetBeansProjects\Sitial\performance-tests\results")
    
    if not jmx.exists():
        log("ERROR: No se encuentra el JMX original."); return

    for tg_name, _ in list_tgs(jmx):
        low = tg_name.lower()
        for k in ("baseline","peak","soak"):
            if k in low:
                out = workdir / f"Sitial-{k}.jmx"
                filter_jmx(jmx, tg_name, out)
                run_jmeter(jmeter, out, k, workdir)

if __name__ == "__main__":
    main()
