/**
 * PORT-INTEL // Core Cybersecurity Threat Recon Logic
 * Operator: MAHESH
 * 
 * Provides interactive simulator features:
 * 1. Port scanning flow animations mimicking SYN, Connect, and UDP scan methodologies.
 * 2. Threat database search matching key penetration testing terms and defensive mitigations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const targetIpInput = document.getElementById('target-ip');
    const scanTypeSelect = document.getElementById('scan-type');
    const btnStartScan = document.getElementById('btn-start-scan');
    const terminalLog = document.getElementById('terminal-log');
    const scanResultsBody = document.getElementById('scan-results-body');
    const searchInput = document.getElementById('search-input');
    const btnSearch = document.getElementById('btn-search');
    const intelDisplay = document.getElementById('intel-display');
    const tagButtons = document.querySelectorAll('.tag-btn');
    const btnBrowseSource = document.getElementById('btn-browse-source');

    // Threat Intel Database
    const threatIntelDB = {
        'syn': {
            title: 'TCP SYN Scan (Half-Open)',
            content: 'Also known as a stealth scan. The scanner sends a SYN packet to target ports. If it receives a SYN-ACK, the port is open. Instead of establishing a full connection with an ACK, the scanner sends a Reset (RST) packet. This prevents the connection from being completed and logged by applications.',
            remediation: 'Defense: Deploy Intrusion Detection Systems (IDS/IPS) configured to trigger alerts on rapid SYN packets and block scanning IPs. Ensure firewalls drop unsolicited incoming traffic.'
        },
        'connect': {
            title: 'TCP Connect Scan',
            content: 'Completes a full three-way handshake (SYN -> SYN-ACK -> ACK). It does not require special administrative privileges (like raw socket control), but it is noisy because server logs will record every single connection established and aborted.',
            remediation: 'Defense: Regularly audit web and application server logs for abnormal bursts of closed connection sequences. Implement rate-limiting rules per source IP.'
        },
        'udp': {
            title: 'UDP Port Scan',
            content: 'Probes connectionless UDP ports by sending packets. If the target port is closed, the system usually replies with an ICMP Port Unreachable packet. If the port is open, there is typically no response. This scan is slow and easily rate-limited by modern OS kernels.',
            remediation: 'Defense: Filter outgoing ICMP Destination Unreachable packets at the boundary firewall to hinder scanning diagnostics, and disable unused UDP protocols.'
        },
        'owasp': {
            title: 'OWASP Top 10 Risks',
            content: 'The Open Web Application Security Project list highlights the 10 most critical security risks to web applications (e.g., Broken Access Control, Cryptographic Failures, Injection, and Server-Side Request Forgery).',
            remediation: 'Defense: Implement secure software development lifecycles (SSDLC), perform automated SAST/DAST reviews, and apply defensive coding practices.'
        },
        'shodan': {
            title: 'Shodan Search Engine',
            content: 'A search engine that lets users find devices (servers, routers, webcams, industrial controls) connected to the internet. It works by querying ports and gathering banner data, exposing unpatched systems to the public.',
            remediation: 'Defense: Restrict administrative interfaces to VPNs, audit public-facing assets frequently, use Shodan Monitor, and disable Universal Plug and Play (UPnP).'
        },
        'nmap': {
            title: 'Nmap (Network Mapper)',
            content: 'An open-source tool used for network discovery and security auditing. It sends raw packets to target hosts to deduce which ports are open, what operating systems are running, and what server applications are active.',
            remediation: 'Defense: Conduct defensive internal scanning audits using Nmap. Use its results to patch exposures before adversaries discover them.'
        },
        'sqli': {
            title: 'SQL Injection (SQLi)',
            content: 'An exploitation technique where an attacker inserts malicious SQL commands into database queries via user input fields, allowing unauthorized access, reading, or deletion of sensitive databases.',
            remediation: 'Defense: ALWAYS use Prepared Statements (Parameterized Queries). Perform server-side input sanitization and implement least privilege accounts for database links.'
        },
        'xss': {
            title: 'Cross-Site Scripting (XSS)',
            content: 'A web vulnerability where malicious JavaScript payloads are injected into trusted sites. When an unsuspecting user loads the page, their browser executes the payload, leading to cookie theft or session hijacking.',
            remediation: 'Defense: Implement Context-Aware HTML/JS output encoding. Define and enforce a rigid Content Security Policy (CSP) header.'
        }
    };

    // Preset Port Scanning Target Profiles
    const mockPorts = [
        { port: '21/tcp', service: 'FTP', status: 'Closed', risk: 'secure', remediation: 'Keep closed. Use SFTP (Port 22) instead.' },
        { port: '22/tcp', service: 'SSH', status: 'Open', risk: 'low', remediation: 'Disable password authentication; enforce SSH private key access.' },
        { port: '53/udp', service: 'DNS', status: 'Filtered', risk: 'secure', remediation: 'Ensure firewall blocks queries except from authorized resolving paths.' },
        { port: '80/tcp', service: 'HTTP', status: 'Open', risk: 'medium', remediation: 'Deploy Redirect headers. Migrate traffic to HTTPS (Port 443).' },
        { port: '443/tcp', service: 'HTTPS', status: 'Open', risk: 'secure', remediation: 'Implement modern TLS 1.3 configs. Disable legacy SSL, TLS 1.0, 1.1.' },
        { port: '8080/tcp', service: 'HTTP-Proxy / Alt', status: 'Open', risk: 'critical', remediation: 'Exposed debug interface detected. Bind to localhost or isolate behind authentication proxy.' }
    ];

    // Initialize terminal prompt status
    scrollTerminal();

    // 1. Port Scanner Simulator Logic
    btnStartScan.addEventListener('click', () => {
        const targetHost = targetIpInput.value.trim();
        const scanProfile = scanTypeSelect.value;

        if (!targetHost) {
            logToTerminal('[ERROR] Target input cannot be empty.', 'error-msg');
            return;
        }

        // Lock inputs during scanning
        setControlsState(false);
        
        // Reset console and table
        terminalLog.innerHTML = '';
        scanResultsBody.innerHTML = `<tr><td colspan="5" class="table-empty">Scanning target: <strong>${escapeHtml(targetHost)}</strong>...</td></tr>`;

        // Execution Steps for the simulated scans
        const steps = [];
        steps.push({ text: `[SYSTEM] Initiating threat reconnaissance scanning console...`, type: 'system-msg', delay: 400 });
        steps.push({ text: `[SYSTEM] Target IP resolution: ${escapeHtml(targetHost)}`, type: 'system-msg', delay: 800 });
        steps.push({ text: `[SYSTEM] Testing network latency ping... Response received in 18ms. Host is UP.`, type: 'success-msg', delay: 1200 });

        if (scanProfile === 'syn') {
            steps.push({ text: `[RECON] Selected: TCP SYN Scan (Stealth Mode)`, type: 'warning-msg', delay: 1700 });
            steps.push({ text: `[RECON] Sending TCP SYN probes to target port vectors...`, type: 'input-msg', delay: 2100 });
            
            // Loop through mock ports to simulate SYN scans
            mockPorts.forEach((portData, index) => {
                const flagSeq = `SYN [Seq=10${index}] -> SYN-ACK [Seq=20${index}, Ack=10${index}+1] -> RST`;
                steps.push({ 
                    text: `[PORT SCAN] Probe ${portData.port} (${portData.service}): ${flagSeq} => PORT STATE: ${portData.status.toUpperCase()}`,
                    type: portData.status === 'Open' ? 'success-msg' : (portData.status === 'Filtered' ? 'warning-msg' : 'terminal-prompt'),
                    delay: 2600 + (index * 400)
                });
            });
        } else if (scanProfile === 'connect') {
            steps.push({ text: `[RECON] Selected: TCP Connect Scan (Full Handshake Mode)`, type: 'warning-msg', delay: 1700 });
            steps.push({ text: `[RECON] Establishing complete socket connections...`, type: 'input-msg', delay: 2100 });

            mockPorts.forEach((portData, index) => {
                let handshake;
                if (portData.status === 'Open') {
                    handshake = `SYN -> SYN-ACK -> ACK [Established Connection] -> FIN-ACK`;
                } else if (portData.status === 'Filtered') {
                    handshake = `SYN -> [Timeout: No Response]`;
                } else {
                    handshake = `SYN -> RST-ACK [Refused Connection]`;
                }
                steps.push({ 
                    text: `[PORT SCAN] Connect ${portData.port} (${portData.service}): ${handshake} => PORT STATE: ${portData.status.toUpperCase()}`,
                    type: portData.status === 'Open' ? 'success-msg' : (portData.status === 'Filtered' ? 'warning-msg' : 'terminal-prompt'),
                    delay: 2600 + (index * 400)
                });
            });
        } else {
            // UDP Scan profile
            steps.push({ text: `[RECON] Selected: UDP Scan (Connectionless Mode)`, type: 'warning-msg', delay: 1700 });
            steps.push({ text: `[RECON] Distributing UDP packets to ports...`, type: 'input-msg', delay: 2100 });

            mockPorts.forEach((portData, index) => {
                let udpSequence;
                let finalStatus = portData.status;

                // UDP ports behave differently
                if (portData.port.includes('udp')) {
                    udpSequence = `UDP Packet Sent -> No response (Port likely listening)`;
                    finalStatus = 'Open/Filtered';
                } else {
                    udpSequence = `UDP Packet Sent -> ICMP Type 3 Code 3 (Port Unreachable)`;
                    finalStatus = 'Closed';
                }

                steps.push({ 
                    text: `[PORT SCAN] UDP Probe ${portData.port} (${portData.service}): ${udpSequence} => PORT STATE: ${finalStatus.toUpperCase()}`,
                    type: finalStatus.includes('Open') ? 'success-msg' : 'terminal-prompt',
                    delay: 2600 + (index * 400)
                });
            });
        }

        // Final completion steps
        const totalScanDelay = 2600 + (mockPorts.length * 400);
        steps.push({ text: `[SYSTEM] Scanner probes completed. Analyzing results database...`, type: 'system-msg', delay: totalScanDelay + 300 });
        steps.push({ text: `[SYSTEM] Recon analysis complete. Displaying network vulnerability assessment tables.`, type: 'success-msg', delay: totalScanDelay + 800 });

        // Queue terminal logs sequentially
        steps.forEach(step => {
            setTimeout(() => {
                logToTerminal(step.text, step.type);
            }, step.delay);
        });

        // Trigger results table update once scanning resolves
        setTimeout(() => {
            renderScanResults(scanProfile);
            setControlsState(true);
            logToTerminal('PORT-INTEL@SEC-OPERATOR:~$ ', 'terminal-prompt', true);
        }, totalScanDelay + 1000);
    });

    // Helper: Output log string to the terminal
    function logToTerminal(text, className, isPromptLine = false) {
        // Remove existing prompt line
        const promptLines = terminalLog.querySelectorAll('.terminal-prompt');
        promptLines.forEach(line => {
            if (line.innerHTML.includes('blink-cursor')) {
                line.remove();
            }
        });

        const lineDiv = document.createElement('div');
        lineDiv.className = `terminal-line ${className}`;
        
        if (isPromptLine) {
            lineDiv.innerHTML = `${text}<span class="blink-cursor">_</span>`;
        } else {
            lineDiv.textContent = text;
        }

        terminalLog.appendChild(lineDiv);
        scrollTerminal();
    }

    // Helper: Auto scroll to the base of the terminal window
    function scrollTerminal() {
        terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    // Helper: Enable or disable form controls
    function setControlsState(enabled) {
        targetIpInput.disabled = !enabled;
        scanTypeSelect.disabled = !enabled;
        btnStartScan.disabled = !enabled;
        if (enabled) {
            btnStartScan.classList.remove('disabled');
        } else {
            btnStartScan.classList.add('disabled');
        }
    }

    // Render Scanned Port Result List
    function renderScanResults(scanProfile) {
        scanResultsBody.innerHTML = '';
        
        mockPorts.forEach(portInfo => {
            const tr = document.createElement('tr');
            
            // Adjust details for UDP scanning compatibility
            let finalStatus = portInfo.status;
            let riskLevel = portInfo.risk;
            let description = portInfo.remediation;

            if (scanProfile === 'udp') {
                if (portInfo.port.includes('udp')) {
                    finalStatus = 'Open/Filtered';
                    riskLevel = 'medium';
                    description = 'UDP service responsive. Require ACL validation to confirm if port is truly open.';
                } else {
                    finalStatus = 'Closed';
                    riskLevel = 'secure';
                    description = 'Standard behavior. No UDP listener detected.';
                }
            }

            const riskText = riskLevel.toUpperCase();
            
            tr.innerHTML = `
                <td><strong>${portInfo.port}</strong></td>
                <td>${portInfo.service}</td>
                <td><span class="status-indicator-inline status-${finalStatus.toLowerCase().replace('/', '-')}">${finalStatus}</span></td>
                <td><span class="risk-badge risk-${riskLevel}">${riskText}</span></td>
                <td class="defensive-remediation">${description}</td>
            `;
            scanResultsBody.appendChild(tr);
        });
    }

    // 2. Threat Knowledge Search Logic
    function searchIntel(keyword) {
        const term = keyword.toLowerCase().trim();
        
        // Find match in database
        if (threatIntelDB[term]) {
            displayIntelCard(threatIntelDB[term]);
        } else {
            // Check for substring matches in database keys
            let foundKey = null;
            Object.keys(threatIntelDB).forEach(key => {
                if (key.includes(term) || threatIntelDB[key].title.toLowerCase().includes(term)) {
                    foundKey = key;
                }
            });

            if (foundKey) {
                displayIntelCard(threatIntelDB[foundKey]);
            } else {
                intelDisplay.className = 'intel-card empty';
                intelDisplay.innerHTML = `
                    <div class="intel-title" style="color: var(--neon-red)">Zero Records Found</div>
                    <div class="intel-content">No security documents matching "${escapeHtml(keyword)}" were discovered in the offline local database. Try selecting another quick-tag.</div>
                `;
            }
        }
    }

    // Display parsed data inside card
    function displayIntelCard(data) {
        intelDisplay.classList.remove('empty');
        intelDisplay.innerHTML = `
            <div class="intel-title">${escapeHtml(data.title)}</div>
            <div class="intel-content">${escapeHtml(data.content)}</div>
            <div class="intel-remediation">${escapeHtml(data.remediation)}</div>
        `;
    }

    // Bind tag click events
    tagButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const kw = btn.getAttribute('data-keyword');
            searchInput.value = btn.textContent;
            searchIntel(kw);
        });
    });

    // Bind input search events
    btnSearch.addEventListener('click', () => {
        const query = searchInput.value;
        if (query) {
            searchIntel(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            if (query) {
                searchIntel(query);
            }
        }
    });

    // 3. Sandbox Browser Logic
    const sandboxPanel = document.getElementById('sandbox-panel');
    const btnCloseBrowser = document.getElementById('btn-close-browser');
    const browserUrl = document.getElementById('browser-url');
    const btnToggleSandbox = document.getElementById('btn-toggle-sandbox');
    const browserIframe = document.getElementById('browser-iframe');
    const browserEmulated = document.getElementById('browser-emulated');
    const emulatedBody = document.getElementById('emulated-body-content');
    const gatewayCards = document.querySelectorAll('.gateway-card');

    const emulatedContent = {
        'nmap': {
            title: 'Nmap (Network Mapper) - Documentation & Commands Cheat Sheet',
            body: `
                <p>Network Mapper (Nmap) is an open-source tool for network exploration and security auditing. It is designed to rapidly scan large networks, determine hosts available on the network, services they are offering, and target operating systems.</p>
                
                <h4>🔑 Common Port Scanning CLI Sequences</h4>
                <ul>
                    <li><strong>TCP SYN Stealth Scan (-sS):</strong> Sends SYN packets to target ports. Fastest and less intrusive.
                        <pre>nmap -sS -p 1-1000 -v 192.168.1.1</pre>
                    </li>
                    <li><strong>TCP Connect Scan (-sT):</strong> Establishes standard three-way handshake. Loud but accurate.
                        <pre>nmap -sT -p 80,443 -v target.com</pre>
                    </li>
                    <li><strong>UDP Service Scan (-sU):</strong> Probes connectionless services. Unreliable and slow due to ICMP limiting.
                        <pre>nmap -sU -p 53,161 192.168.1.200</pre>
                    </li>
                </ul>

                <h4>🛡️ Defensive Mitigation Checklist</h4>
                <p>1. Restrict internal scanning paths with VLAN segmentations.<br>
                2. Install stateful firewall policies to drop incoming traffic scanning patterns.<br>
                3. Configure rate-limiting filters on network interfaces.</p>
            `
        },
        'owasp': {
            title: 'OWASP Top 10 Web Application Vulnerabilities Matrix',
            body: `
                <p>The Open Web Application Security Project (OWASP) serves as a baseline standard for modern web application security risks and secure development practices.</p>

                <h4>📌 The 10 Most Critical Web Threats (OWASP Top 10 - 2021)</h4>
                <ul>
                    <li><strong>A01:2021 - Broken Access Control:</strong> Access privileges are misconfigured, allowing users to execute admin actions.
                        <pre>Mitigation: Implement strict role-based access controls (RBAC) and verify access serverside.</pre>
                    </li>
                    <li><strong>A02:2021 - Cryptographic Failures:</strong> Unencrypted storage or transmission of keys and credentials.
                        <pre>Mitigation: Always encrypt passwords using bcrypt/argon2 and enforce HTTPS TLS 1.3.</pre>
                    </li>
                    <li><strong>A03:2021 - Injection (SQLi/XSS/Command):</strong> Injected commands are processed by interpreters directly.
                        <pre>Mitigation: Enforce Parameterized Queries/Prepared Statements in all databases.</pre>
                    </li>
                    <li><strong>A04:2021 - Insecure Design:</strong> Lack of threat modeling and secure design verification patterns.
                        <pre>Mitigation: Perform static analysis, threat modeling, and testing in development.</pre>
                    </li>
                </ul>
            `
        },
        'shodan': {
            title: 'Shodan Search Intelligence Sandbox Panel',
            body: `
                <p>Shodan aggregates global connection banners, cataloging the internet of things (IoT), open ports, exposed databases, webcams, and routers.</p>

                <h4>🔍 Search Syntax & Targeting Directives</h4>
                <ul>
                    <li><strong>Exposed SSH Servers (Port 22):</strong> Search SSH servers located in the US.
                        <pre>port:22 country:"US"</pre>
                    </li>
                    <li><strong>Industrial Control Systems (SCADA):</strong> Search exposed power controllers and grids.
                        <pre>port:502 product:"Modbus"</pre>
                    </li>
                    <li><strong>IIS Servers hosting legacy systems:</strong> Find unpatched systems.
                        <pre>Microsoft-IIS/8.5 country:"DE"</pre>
                    </li>
                </ul>

                <h4>🔒 Defensive Security Remediation</h4>
                <p>Do not expose administrative portals directly to public interfaces. Implement VPN gateways, Multi-Factor Authentication (MFA), and regularly rotate credentials.</p>
            `
        },
        'mitre': {
            title: 'MITRE ATT&CK Matrix Recon and Initial Access Framework',
            body: `
                <p>MITRE ATT&CK is a globally-accessible database of adversary tactics, techniques, and procedures (TTPs) based on real-world threat intelligence audits.</p>

                <h4>👣 Attack Lifecycle Vectors</h4>
                <ul>
                    <li><strong>Active Scanning (T1595):</strong> Attacker performs scans to understand target address ranges and services.
                        <pre>Defense: Implement honey-ports and block high-frequency probes.</pre>
                    </li>
                    <li><strong>Exploit Public-Facing Application (T1190):</strong> Penetration through software bugs.
                        <pre>Defense: Keep software patches updated and apply Web Application Firewalls (WAF).</pre>
                    </li>
                </ul>

                <h4>🎯 Incident Response & Cyber Killchain</h4>
                <p>Use the ATT&CK Matrix to benchmark defensive sensors, execute red-team threat simulations, and log unauthorized system execution flows.</p>
            `
        }
    };

    let sandboxEmulationMode = true; // Default to emulated decoy because external headers block frames

    gatewayCards.forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-url');
            const target = card.getAttribute('data-target');

            // Open sandbox panel
            sandboxPanel.style.display = 'block';
            browserUrl.value = url;
            browserIframe.src = url;
            
            // Re-enable toggle button for gateway links
            btnToggleSandbox.style.display = 'block';

            // Load emulated static text
            if (emulatedContent[target]) {
                const data = emulatedContent[target];
                emulatedBody.innerHTML = `
                    <h3>${data.title}</h3>
                    ${data.body}
                `;
            }

            // Apply active view depending on mode
            applySandboxView();

            // Smooth scroll to the sandbox panel
            sandboxPanel.scrollIntoView({ behavior: 'smooth' });
            logToTerminal(`[SYSTEM] Accessing secure sandbox web visualizer for ${url}...`, 'system-msg');
        });
    });

    // Code Fallback templates in case of CORS restriction under file:// protocol
    const codeFallbacks = {
        'index.html': `<!-- index.html - Core Layout Structure -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>PORT-INTEL // Cyber Threat & Recon Dashboard</title>
</head>
<body>
    <header class="main-header">
        <h1>PORT-INTEL <span class="version-tag">v2.6.b</span></h1>
        <!-- Operator Identity -->
        <span class="profile-name">MAHESH</span>
    </header>
    <main class="dashboard-grid">
        <!-- Input parameters grid -->
        <input type="text" id="target-ip" value="192.168.1.1">
        <!-- Interactive threat outputs terminal -->
        <div id="terminal-log"></div>
        <!-- Scanned ports analysis grid -->
        <table class="vector-table"></table>
    </main>
</body>
</html>`,
        'style.css': `/* style.css - Core Styling System Variables */
:root {
    --bg-main: #0a0b10;
    --bg-panel: rgba(16, 20, 30, 0.75);
    --neon-cyan: #00ffcc;
    --neon-green: #39ff14;
    --font-cyber: 'Share Tech Mono', monospace;
}
.cyber-panel {
    background-color: var(--bg-panel);
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
}
@keyframes blink {
    50% { opacity: 0; }
}`,
        'app.js': `// app.js - Core Threat Scanning Sequenced Delay Simulation
btnStartScan.addEventListener('click', () => {
    const steps = [
        { text: '[SYSTEM] Initiating scan...', type: 'system-msg', delay: 400 },
        { text: '[SYSTEM] Target IP ping: 18ms...', type: 'success-msg', delay: 800 }
    ];
    // Queue terminal outputs dynamically
    steps.forEach(step => {
        setTimeout(() => logToTerminal(step.text, step.type), step.delay);
    });
});`
    };

    btnBrowseSource.addEventListener('click', () => {
        // Open sandbox panel
        sandboxPanel.style.display = 'block';
        browserUrl.value = 'source-code://local-inspector';
        browserIframe.style.display = 'none';
        browserEmulated.style.display = 'flex';
        
        // Hide standard toggle emulation button since this is a local system panel
        btnToggleSandbox.style.display = 'none';

        // Load Tabbed Viewer layout inside emulated body
        emulatedBody.innerHTML = `
            <div class="code-inspector-container">
                <h3>💻 LOCAL SOURCE CODE INSPECTOR</h3>
                <p class="panel-description">Inspect the active files of this training dashboard directly. Study the clean design structures and simulator events.</p>
                
                <div class="code-inspector-tabs">
                    <button class="code-tab-btn active" data-file="index.html">index.html</button>
                    <button class="code-tab-btn" data-file="style.css">style.css</button>
                    <button class="code-tab-btn" data-file="app.js">app.js</button>
                </div>

                <div id="cors-warning-container"></div>
                <pre class="code-viewer-pre"><code id="code-viewer-code">Loading file content...</code></pre>
            </div>
        `;

        // Load the initial file
        inspectFileContent('index.html');

        // Add event listeners for code tabs
        const tabBtns = emulatedBody.querySelectorAll('.code-tab-btn');
        tabBtns.forEach(tab => {
            tab.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tab.classList.add('active');
                inspectFileContent(tab.getAttribute('data-file'));
            });
        });

        // Smooth scroll to the sandbox panel
        sandboxPanel.scrollIntoView({ behavior: 'smooth' });
        logToTerminal(`[SYSTEM] Accessing Local Source Code Inspector...`, 'system-msg');
    });

    function inspectFileContent(filename) {
        const codeElement = emulatedBody.querySelector('#code-viewer-code');
        const warningContainer = emulatedBody.querySelector('#cors-warning-container');
        
        codeElement.textContent = `Loading ${filename}...`;
        warningContainer.innerHTML = '';

        // Attempt fetch
        fetch(filename)
            .then(res => {
                if (!res.ok) throw new Error('File not found');
                return res.text();
            })
            .then(data => {
                codeElement.textContent = data;
            })
            .catch(err => {
                // Render helpful CORS warning info
                warningContainer.innerHTML = `
                    <div class="cors-warning-box">
                        <div class="cors-warning-title">⚠️ CORS PROTOCOL RESTRICTION DETECTED</div>
                        <div class="cors-warning-desc">
                            Web browsers restrict direct JavaScript file reads (fetch) when loading HTML via the <strong>file://</strong> protocol. 
                            To view the full code dynamically inside this panel, host this project using a local dev server (e.g., <code>npx http-server</code>). 
                            Showing hardcoded core training snippet below.
                        </div>
                    </div>
                `;
                // Show fallback mock content
                codeElement.textContent = codeFallbacks[filename] || `// No backup content for ${filename}`;
            });
    }

    btnCloseBrowser.addEventListener('click', () => {
        sandboxPanel.style.display = 'none';
        browserIframe.src = '';
        logToTerminal(`[SYSTEM] Closed secure sandbox visualizer session.`, 'system-msg');
    });

    btnToggleSandbox.addEventListener('click', () => {
        sandboxEmulationMode = !sandboxEmulationMode;
        applySandboxView();
        
        const modeText = sandboxEmulationMode ? 'EMULATION (DECOY)' : 'LIVE IFRAME';
        logToTerminal(`[SYSTEM] Toggled sandbox browser mode to: ${modeText}`, 'warning-msg');
    });

    function applySandboxView() {
        if (sandboxEmulationMode) {
            browserIframe.style.display = 'none';
            browserEmulated.style.display = 'flex';
            btnToggleSandbox.textContent = 'SWITCH TO LIVE IFRAME';
        } else {
            browserIframe.style.display = 'block';
            browserEmulated.style.display = 'none';
            btnToggleSandbox.textContent = 'SWITCH TO EMULATION (DECOY)';
        }
    }

    // Helper: Escaping user-controlled strings to prevent simulation injections
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
