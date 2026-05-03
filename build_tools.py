import os

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

cwd = os.getcwd()
index_path = os.path.join(cwd, 'index.html')
index_content = read_file(index_path)

hero_marker = "<!-- 2. Hero Section -->"
footer_marker = "<!-- Footer -->"

header_raw = index_content[:index_content.find(hero_marker)]
footer_raw = index_content[index_content.find(footer_marker):]

tailwind_injection = """
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="lasikData.js"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            corePlugins: { preflight: false },
            theme: {
                extend: {
                    colors: {
                        primary: '#1a365d',
                        secondary: '#e2e8f0',
                        accent: '#3b82f6',
                        method_blue: '#0ea5e9',
                        method_teal: '#14b8a6',
                        method_indigo: '#6366f1',
                        method_purple: '#8b5cf6',
                        safe_green: '#10b981',
                        warn_orange: '#f59e0b',
                        danger_red: '#ef4444'
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .tw-app * { box-sizing: border-box; }
        .tw-app .card { background: white; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.06); transition: all 0.2s; }
        .dark .tw-app .card { background: #1e293b; border-color: rgba(255,255,255,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2); }
        .tw-app input { text-align: center; font-weight: bold; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; outline: none; transition: border-color 0.2s; }
        .dark .tw-app input { background: #0f172a; border-color: rgba(255,255,255,0.1); color: #f1f5f9; }
        .tw-app button.step-btn { width: 2.2rem; height: 2.2rem; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border-radius: 0.5rem; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; font-size: 1.2rem; font-weight: bold; color: #64748b; }
        .dark .tw-app button.step-btn { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #94a3b8; }
        .tw-app .active-eye { background: rgba(14, 165, 233, 0.15) !important; border-color: rgba(14, 165, 233, 0.5) !important; color: #0ea5e9 !important; font-weight: 800 !important; }
        .tw-app select { appearance: none; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; background: white; cursor: pointer; }
        .dark .tw-app select { background: #0f172a; border-color: rgba(255,255,255,0.1); color: #f1f5f9; }
    </style>
</head>
"""

header = header_raw.replace('</head>', tailwind_injection)
header = header.replace('<body', '<body class="dark"')

rsb_body = """
    <main style="padding-top: 100px; padding-bottom: 80px; min-height: 100vh;" id="app-container" class="tw-app bg-slate-50 dark:bg-slate-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Side Panel -->
                <div class="w-full lg:w-80 flex-shrink-0">
                    <div class="card p-5 space-y-5">
                        <div class="flex items-center gap-2">
                            <div class="w-1.5 h-5 rounded-full bg-blue-500"></div>
                            <span class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Thông số Input</span>
                        </div>
                        <div class="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div class="flex-1">
                                <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Năm sinh</label>
                                <input type="number" id="birthYear" value="2000" class="w-full h-10 text-base" onchange="calculate()">
                            </div>
                            <div class="flex-1">
                                <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Mắt</label>
                                <div class="flex gap-1 h-10">
                                    <button onclick="setEye('OD')" id="eye-OD" class="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold active-eye">OD</button>
                                    <button onclick="setEye('OS')" id="eye-OS" class="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold">OS</button>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase">Phương pháp</label>
                            <select id="method" class="w-full h-10 font-bold text-blue-500" onchange="onMethodChange()">
                                <option value="clear">CLEAR - Ziemer Z8</option>
                                <option value="smartsurf">SmartSurfAce - Schwind Amaris</option>
                                <option value="femto">FemtoLASIK - Schwind Amaris</option>
                                <option value="smartsight">SmartSight - Schwind Atos</option>
                            </select>
                        </div>
                        <div class="space-y-4">
                            <div class="step-input">
                                <div class="flex justify-between items-center mb-1"><label class="text-xs font-bold text-slate-600 dark:text-slate-300">CCT (Cornea)</label><span class="text-[10px] font-bold text-slate-400">μm</span></div>
                                <div class="flex gap-2"><button class="step-btn" onclick="step('cct', -1)">−</button><input type="number" id="cct" value="528" class="flex-1 h-10 text-lg"><button class="step-btn" onclick="step('cct', 1)">+</button></div>
                            </div>
                            <div class="step-input">
                                <div class="flex justify-between items-center mb-1"><label class="text-xs font-bold text-slate-600 dark:text-slate-300">Sphere (Cận)</label><span class="text-[10px] font-bold text-slate-400">D</span></div>
                                <div class="flex gap-2"><button class="step-btn" onclick="step('sphere', -0.25)">−</button><input type="number" id="sphere" value="-5.00" step="0.25" class="flex-1 h-10 text-lg"><button class="step-btn" onclick="step('sphere', 0.25)">+</button></div>
                            </div>
                            <div class="step-input">
                                <div class="flex justify-between items-center mb-1"><label class="text-xs font-bold text-slate-600 dark:text-slate-300">Cylinder (Loạn)</label><span class="text-[10px] font-bold text-slate-400">D</span></div>
                                <div class="flex gap-2"><button class="step-btn" onclick="step('cylinder', -0.25)">−</button><input type="number" id="cylinder" value="-0.75" step="0.25" class="flex-1 h-10 text-lg"><button class="step-btn" onclick="step('cylinder', 0.25)">+</button></div>
                            </div>
                            <div id="flap-group" class="step-input">
                                <div class="flex justify-between items-center mb-1"><label class="text-xs font-bold text-slate-600 dark:text-slate-300">Flap / Cap</label><span class="text-[10px] font-bold text-slate-400">μm</span></div>
                                <div class="flex gap-2"><button class="step-btn" onclick="step('flap', -5)">−</button><input type="number" id="flap" value="110" class="flex-1 h-10 text-lg"><button class="step-btn" onclick="step('flap', 5)">+</button></div>
                            </div>
                            <div class="step-input">
                                <div class="flex justify-between items-center mb-1"><label class="text-xs font-bold text-slate-600 dark:text-slate-300">OZ (Vùng quang)</label><span class="text-[10px] font-bold text-slate-400">mm</span></div>
                                <div class="flex gap-2"><button class="step-btn" onclick="step('oz', -0.1)">−</button><input type="number" id="oz" value="6.5" step="0.1" class="flex-1 h-10 text-lg"><button class="step-btn" onclick="step('oz', 0.1)">+</button></div>
                            </div>
                        </div>
                        <div id="clear-extras" class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <div class="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-2">Q-Value Adjustment</div>
                            <div class="step-input">
                                <label class="text-[10px] font-bold text-slate-400 uppercase">Kmean (ref 43.8)</label>
                                <div class="flex gap-2 mt-1"><button class="step-btn" onclick="step('kmean', -0.1)">−</button><input type="number" id="kmean" value="43.8" step="0.1" class="flex-1 h-9 text-sm"><button class="step-btn" onclick="step('kmean', 0.1)">+</button></div>
                            </div>
                            <div class="step-input">
                                <label class="text-[10px] font-bold text-slate-400 uppercase">Q value (ref -0.26)</label>
                                <div class="flex gap-2 mt-1"><button class="step-btn" onclick="step('qValue', -0.01)">−</button><input type="number" id="qValue" value="-0.26" step="0.01" class="flex-1 h-9 text-sm"><button class="step-btn" onclick="step('qValue', 0.01)">+</button></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Dashboard -->
                <div class="flex-1 space-y-6">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="card p-5"><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mô mất đi</div><div class="flex items-baseline gap-1"><span class="text-4xl font-black text-blue-500" id="res-ablation">--</span><span class="text-[10px] text-slate-400">μm</span></div></div>
                        <div class="card p-5" id="card-rsb"><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">RSB (Tồn dư)</div><div class="flex items-baseline gap-1"><span class="text-4xl font-black text-slate-300" id="res-rsb">--</span><span class="text-[10px] text-slate-400">μm</span></div><div class="text-xs font-bold mt-2" id="label-rsb">--</div></div>
                        <div class="card p-5" id="card-pta"><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PTA (%)</div><div class="flex items-baseline gap-1"><span class="text-4xl font-black text-slate-300" id="res-pta">--</span><span class="text-[10px] text-slate-400">%</span></div><div class="text-xs font-bold mt-2" id="label-pta">--</div></div>
                        <div class="card p-5 flex flex-col justify-between"><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đánh giá</div><div class="space-y-2 mt-4 text-center"><span class="text-xl font-black" id="res-status">--</span><div class="h-2 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 mt-2"><div class="flex-1 bg-red-400/40"></div><div class="flex-1 bg-amber-400/40"></div><div class="flex-1 bg-emerald-400/40"></div></div></div></div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="card overflow-hidden bg-black aspect-video"><iframe id="method-video" class="w-full h-full" src="" allowfullscreen></iframe></div>
                        <div class="card p-5">
                            <div class="flex justify-between items-center mb-4"><h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest">Tối ưu hóa OZ</h3><div class="text-[10px] text-blue-500 font-bold" id="oz-current-label">OZ: 6.5mm</div></div>
                            <div class="h-[250px] relative"><canvas id="ozChart"></canvas></div>
                        </div>
                    </div>

                    <div class="card p-6" id="recommendation-card">
                        <div class="flex items-center gap-3 mb-4"><div class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">✨</div><h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Khuyến nghị phẫu thuật</h3></div>
                        <div id="recommendation-content" class="text-sm"></div>
                    </div>
                    
                    <div id="nomogram-section" class="card p-6 bg-slate-900 text-white hidden">
                        <div class="flex justify-between items-center mb-6"><h3 class="text-sm font-bold uppercase tracking-widest text-teal-400">CLEAR Nomogram</h3><div class="px-2 py-1 bg-teal-500/20 border border-teal-500/30 rounded text-[10px] font-bold text-teal-400 uppercase">Auto Mode</div></div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="space-y-4">
                                <div class="flex justify-between text-xs mb-2"><span class="text-slate-400">Target (D)</span><span class="text-teal-400 font-bold" id="auto-target-val">--</span></div>
                                <div class="flex gap-2"><button class="flex-1 py-2 bg-slate-800 rounded border border-slate-700 font-black text-xl" onclick="step('nomTarget', -0.25)">−</button><div class="flex-[2] py-2 bg-slate-800 rounded border border-teal-500/50 text-center font-black text-2xl" id="nomTargetDisplay">0.00</div><button class="flex-1 py-2 bg-slate-800 rounded border border-slate-700 font-black text-xl" onclick="step('nomTarget', 0.25)">+</button></div>
                            </div>
                            <div class="space-y-4">
                                <div class="flex justify-between text-xs mb-2"><span class="text-slate-400">Sphere Adj (D)</span><span class="text-amber-400 font-bold" id="auto-adj-val">--</span></div>
                                <div class="flex gap-2"><button class="flex-1 py-2 bg-slate-800 rounded border border-slate-700 font-black text-xl" onclick="step('nomAdj', -0.1)">−</button><div class="flex-[2] py-2 bg-slate-800 rounded border border-amber-500/50 text-center font-black text-2xl" id="nomAdjDisplay">0.0</div><button class="flex-1 py-2 bg-slate-800 rounded border border-slate-700 font-black text-xl" onclick="step('nomAdj', 0.1)">+</button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        let state = { birthYear: 2000, eye: 'OD', method: 'clear', cct: 528, sphere: -5.00, cylinder: -0.75, flap: 110, oz: 6.5, kmean: 43.8, qValue: -0.26, nomTarget: 0.25, nomAdj: -0.3 };
        const VIDEOS = { clear: "https://www.youtube.com/embed/Zz_pL7X3l0Y", smartsurf: "https://www.youtube.com/embed/E-0N_6M1E5M", femto: "https://www.youtube.com/embed/WJ1Uo8U1XfM", smartsight: "https://www.youtube.com/embed/Zz_pL7X3l0Y" };

        function clearAdjustment() { return Math.round(((state.kmean - 43.8) / (-1.2) + (state.qValue - (-0.26)) / 0.045) * 10) / 10; }

        function calculate() {
            const ageAdj = (new Date().getFullYear() - state.birthYear) < 24 ? 1 : 0;
            const seRaw = state.sphere + state.cylinder;
            let abl = 0;
            if (state.method === 'clear') {
                const effectiveSE = Math.round((seRaw - state.nomTarget) * 4) / 4;
                const base = lookupClearZ8Depth(state.oz, String(effectiveSE));
                if (base === null) return renderError();
                abl = Math.round(base + clearAdjustment() + Math.round(state.nomAdj / 0.1 * 1.5 * 10) / 10 + ageAdj + 1);
            } else {
                const data = state.method === 'smartsurf' ? SMART_SURF_DATA : (state.method === 'femto' ? FEMTO_DATA : SMARTSIGHT_DATA);
                const base = lookupAblationDepth(data, state.oz, String(Math.round(seRaw * 4) / 4));
                if (base === null) return renderError();
                abl = base + (state.method === 'smartsurf' ? 2 : 1) + ageAdj;
            }
            const flapVal = (state.method === 'smartsurf') ? 0 : state.flap;
            const rsb = state.cct - flapVal - abl;
            const pta = Math.round((flapVal + abl) / state.cct * 1000) / 10;
            renderResults(abl, rsb, pta);
            updateNomogramDisplay(seRaw);
            debouncedUpdateChart();
        }

        function renderResults(abl, rsb, pta) {
            document.getElementById('res-ablation').innerText = abl;
            document.getElementById('res-rsb').innerText = rsb;
            document.getElementById('res-pta').innerText = pta;
            const rsbS = rsb < 250 ? 'danger' : (rsb <= 300 ? 'caution' : 'safe');
            const ptaS = pta > 40 ? 'danger' : (pta >= 35 ? 'caution' : 'safe');
            updateCard('rsb', rsbS, rsb < 250 ? 'NGUY HIỂM' : (rsb <= 300 ? 'THẬN TRỌNG' : 'AN TOÀN'));
            updateCard('pta', ptaS, pta > 40 ? 'NGUY HIỂM' : (pta >= 35 ? 'THẬN TRỌNG' : 'AN TOÀN'));
            const overall = (rsbS === 'danger' || ptaS === 'danger') ? 'NGUY HIỂM' : (rsbS === 'caution' || ptaS === 'caution') ? 'THẬN TRỌNG' : 'AN TOÀN';
            const statusEl = document.getElementById('res-status');
            statusEl.innerText = overall;
            statusEl.className = 'text-xl font-black ' + (overall === 'NGUY HIỂM' ? 'text-red-500' : (overall === 'THẬN TRỌNG' ? 'text-amber-500' : 'text-emerald-500'));
            renderRecommendations(rsb, pta, rsbS, ptaS);
        }

        function updateCard(id, status, label) {
            const colors = { safe: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5', caution: 'text-amber-500 border-amber-500/20 bg-amber-500/5', danger: 'text-red-500 border-red-500/20 bg-red-500/5' };
            document.getElementById('card-' + id).className = `card p-5 relative overflow-hidden border-2 ${colors[status]}`;
            document.getElementById('label-' + id).className = `text-xs font-bold mt-2 ${colors[status].split(' ')[0]}`;
            document.getElementById('label-' + id).innerText = label;
            document.getElementById('res-' + id).className = `text-4xl font-black ${colors[status].split(' ')[0]}`;
        }

        function renderRecommendations(rsb, pta, rsbS, ptaS) {
            let html = '<ul class="space-y-1">';
            if (rsbS === 'safe' && ptaS === 'safe') html += `<li class="text-emerald-500">✓ RSB ${rsb}μm — an toàn.</li>`;
            else if (rsbS === 'danger' || ptaS === 'danger') {
                if (rsbS === 'danger') html += `<li class="text-red-500 font-bold">✕ RSB ${rsb}μm nguy hiểm!</li>`;
                if (ptaS === 'danger') html += `<li class="text-red-500 font-bold">✕ PTA ${pta}% nguy hiểm (>40%)!</li>`;
            } else html += `<li class="text-amber-500 font-bold">⚠ Cảnh báo: Thông số ở ngưỡng thận trọng.</li>`;
            document.getElementById('recommendation-content').innerHTML = html + '</ul>';
        }

        function renderError() { document.getElementById('res-ablation').innerText = 'N/A'; document.getElementById('res-rsb').innerText = '--'; document.getElementById('res-pta').innerText = '--'; document.getElementById('recommendation-content').innerHTML = '<p class="text-red-500 font-bold">Dữ liệu ngoài phạm vi.</p>'; }

        function step(key, delta) {
            let v = parseFloat(document.getElementById(key)?.value || state[key]) + delta;
            if (['sphere', 'cylinder', 'nomTarget'].includes(key)) v = Math.round(v * 4) / 4;
            else if (['oz', 'kmean', 'nomAdj'].includes(key)) v = Math.round(v * 10) / 10;
            else if (key === 'qValue') v = Math.round(v * 100) / 100;
            if (document.getElementById(key)) document.getElementById(key).value = v;
            state[key] = v; calculate();
        }

        function setEye(eye) { state.eye = eye; document.getElementById('eye-OD').classList.toggle('active-eye', eye === 'OD'); document.getElementById('eye-OS').classList.toggle('active-eye', eye === 'OS'); calculate(); }

        function onMethodChange() {
            state.method = document.getElementById('method').value;
            document.getElementById('flap-group').style.display = (state.method === 'smartsurf') ? 'none' : 'block';
            document.getElementById('clear-extras').style.display = (state.method === 'clear') ? 'block' : 'none';
            document.getElementById('nomogram-section').style.display = (state.method === 'clear') ? 'block' : 'none';
            document.getElementById('method-video').src = VIDEOS[state.method];
            calculate();
        }

        function updateNomogramDisplay(seRaw) {
            if (state.method !== 'clear') return;
            document.getElementById('nomTargetDisplay').innerText = state.nomTarget.toFixed(2);
            document.getElementById('nomAdjDisplay').innerText = state.nomAdj.toFixed(1);
            document.getElementById('auto-target-val').innerText = 'Auto: ' + ((new Date().getFullYear() - state.birthYear) < 24 ? '+0.25' : '0.00');
        }

        let ozChart = null, chartTimeout = null;
        function debouncedUpdateChart() { if (chartTimeout) clearTimeout(chartTimeout); chartTimeout = setTimeout(updateChart, 100); }

        function updateChart() {
            const canvas = document.getElementById('ozChart'); if (!canvas) return;
            const ozRange = [6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5];
            const seKey = String(Math.round((state.sphere + state.cylinder) * 4) / 4);
            const flapVal = (state.method === 'smartsurf') ? 0 : state.flap;
            const dataPoints = ozRange.map(o => {
                let a = 0;
                if (state.method === 'clear') { const b = lookupClearZ8Depth(o, seKey); if (b === null) return null; a = Math.round(b + clearAdjustment() + 1); }
                else { const d = state.method === 'smartsurf' ? SMART_SURF_DATA : (state.method === 'femto' ? FEMTO_DATA : SMARTSIGHT_DATA); const b = lookupAblationDepth(d, o, seKey); if (b === null) return null; a = b + (state.method === 'smartsurf' ? 2 : 1); }
                return state.cct - flapVal - a;
            });
            if (ozChart) ozChart.destroy();
            ozChart = new Chart(canvas.getContext('2d'), {
                type: 'line',
                data: { labels: ozRange.map(v => v.toFixed(1)), datasets: [{ data: dataPoints, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 3, pointRadius: ozRange.map(v => Math.abs(v - state.oz) < 0.01 ? 6 : 0), pointBackgroundColor: '#3b82f6', tension: 0.3, fill: true, spanGaps: true }] },
                options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { y: { min: 150, max: 450, ticks: { font: { size: 9 }, color: '#94a3b8' } }, x: { ticks: { font: { size: 9 }, color: '#94a3b8' } } } }
            });
            document.getElementById('oz-current-label').innerText = 'OZ: ' + state.oz + 'mm | RSB: ' + document.getElementById('res-rsb').innerText + 'μm';
        }

        document.querySelectorAll('input').forEach(i => i.addEventListener('input', e => { state[e.target.id] = parseFloat(e.target.value); calculate(); }));
        document.body.classList.add('dark');
        onMethodChange();
    </script>
</body>
</html>
"""

full_html = header + rsb_body + footer_raw
write_file('rsb-calculator.html', full_html)
print("Fixed RSB Calculator with correct name references and body structure.")
