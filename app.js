// Initialize Lucide Icons
lucide.createIcons();

// Elements
const landing = document.getElementById('landing');
const appContainer = document.getElementById('app-container');
const startAppBtn = document.getElementById('start-app-btn');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = document.getElementById('progress-bar');
const uploadStatusText = document.getElementById('upload-status-text');
const settingsPanel = document.getElementById('settings-panel');
const renderBtn = document.getElementById('render-btn');
const hfApiKeyInput = document.getElementById('hf-api-key');

const tab2d = document.getElementById('tab-2d');
const tab3d = document.getElementById('tab-3d');
const tabRender = document.getElementById('tab-render');

const view2d = document.getElementById('view-2d');
const view3d = document.getElementById('view-3d');
const viewRender = document.getElementById('view-render');

const emptyState = document.getElementById('empty-state');
const mock2dPlan = document.getElementById('mock-2d-plan');
const scanLine = document.getElementById('scan-line');
const finalRenderImg = document.getElementById('final-render-img');
const renderLoading = document.getElementById('render-loading');

const download3dBtn = document.getElementById('download-3d-btn');
const downloadRenderBtn = document.getElementById('download-render-btn');

// Image Assets for Mocking
// These are Unsplash images used to mock the process
const mockImages = {
    plan2D: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
    renders: {
        modern: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
        japandi: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1200&h=800&fit=crop',
        industrial: 'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?w=1200&h=800&fit=crop',
        scandinavian: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=1200&h=800&fit=crop'
    }
};

let currentStyle = 'modern';
let threeSceneStarted = false;

// 1. Transition from Landing to App
startAppBtn.addEventListener('click', () => {
    gsap.to(landing, {
        opacity: 0,
        y: -50,
        duration: 0.6,
        onComplete: () => {
            landing.classList.add('hidden');
            appContainer.classList.remove('hidden');
            gsap.from(appContainer, { opacity: 0, y: 50, duration: 0.8 });
        }
    });
});

// 2. Handle File Upload Simulation
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-brand-500', 'bg-white/5');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-brand-500', 'bg-white/5');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-brand-500', 'bg-white/5');
    if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        startUploadProcess(e.dataTransfer.files[0].name);
    }
});

dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if(e.target.files && e.target.files.length > 0) {
        startUploadProcess(e.target.files[0].name);
    }
});

function startUploadProcess(filename = "blueprint.dwg") {
    uploadProgress.classList.remove('hidden');
    
    // Animate progress bar (Simulating processing CAD file)
    gsap.to(progressBar, {
        width: "100%",
        duration: 3.5,
        ease: "power1.inOut",
        onUpdate: function() {
            const progress = this.progress();
            if (progress < 0.3) uploadStatusText.innerText = `Reading ${filename}...`;
            else if (progress < 0.6) uploadStatusText.innerText = "Extracting 2D geometry...";
            else if (progress < 0.9) uploadStatusText.innerText = "Generating 3D volumes...";
            else uploadStatusText.innerText = "Ready!";
        },
        onComplete: () => {
            gsap.to(uploadProgress, { opacity: 0, duration: 0.5, onComplete: () => {
                uploadProgress.classList.add('hidden');
                uploadProgress.style.opacity = 1;
                show2DPlan();
            }});
        }
    });
}

function show2DPlan() {
    // Hide empty state
    emptyState.classList.add('hidden');
    
    // Show mocked 2D image
    mock2dPlan.classList.remove('hidden');
    mock2dPlan.src = mockImages.plan2D;
    
    gsap.to(mock2dPlan, { opacity: 1, scale: 1, duration: 1 });

    // Enable Settings
    settingsPanel.classList.add('active');
    renderBtn.disabled = false;
    
    // Enable 3D Tab
    tab3d.disabled = false;

    // Simulate scanning effect
    scanLine.classList.remove('hidden');
    gsap.to(scanLine, {
        top: '100%',
        duration: 2,
        ease: "linear",
        repeat: -1
    });

    // Auto-switch to 3D tab after a delay to show the "magic"
    setTimeout(() => {
        switchTab('3d');
    }, 3000);
}

// 3. Style Selection
document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentStyle = e.currentTarget.dataset.style;
    });
});

// 4. Tab Switching Logic
function switchTab(tabId) {
    // Update active tab UI
    [tab2d, tab3d, tabRender].forEach(t => t.classList.remove('active-tab'));
    
    // Hide all views
    [view2d, view3d, viewRender].forEach(v => {
        v.style.opacity = '0';
        v.style.pointerEvents = 'none';
        setTimeout(() => v.style.zIndex = '0', 500); // lower z-index after fade out
    });

    // Show target view
    const showView = (btn, view, zIndex = 10) => {
        btn.classList.add('active-tab');
        view.style.zIndex = zIndex;
        setTimeout(() => {
            view.style.opacity = '1';
            view.style.pointerEvents = 'auto';
        }, 50);
    };

    if (tabId === '2d') {
        showView(tab2d, view2d);
    } else if (tabId === '3d') {
        showView(tab3d, view3d, 15);
        if (!threeSceneStarted) initThreeJS();
    } else if (tabId === 'render') {
        showView(tabRender, viewRender, 20);
    }
}

tab2d.addEventListener('click', () => switchTab('2d'));
tab3d.addEventListener('click', () => switchTab('3d'));
tabRender.addEventListener('click', () => switchTab('render'));

// 5. Render Action
renderBtn.addEventListener('click', async () => {
    tabRender.disabled = false;
    switchTab('render');
    
    // Reset states
    renderLoading.classList.remove('hidden');
    finalRenderImg.classList.add('hidden');
    finalRenderImg.classList.remove('scale-100');
    finalRenderImg.classList.add('scale-105');
    downloadRenderBtn.classList.add('hidden');
    
    // Disable render button temporarily
    const originalText = renderBtn.innerHTML;
    renderBtn.disabled = true;
    renderBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Processing...';
    lucide.createIcons();

    const apiKey = hfApiKeyInput ? hfApiKeyInput.value.trim() : "";

    // If User provided API key, we make a real call to HuggingFace SDXL
    if (apiKey) {
        renderLoading.querySelector('p:last-child').innerText = `Generating real AI Render (${currentStyle})...`;
        
        try {
            // Very specific prompt based on selected style
            const prompt = `Highly detailed, photorealistic interior design photography of an empty room furnished in ${currentStyle} style, modern architectural render, stunning natural lighting, 8k resolution, highly detailed textures, interior design magazine cover`;
            
            const response = await fetch(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
                {
                    headers: { Authorization: `Bearer ${apiKey}` },
                    method: "POST",
                    body: JSON.stringify({ inputs: prompt }),
                }
            );
            
            if (!response.ok) {
                throw new Error('API Request failed. Status: ' + response.status);
            }
            
            const blob = await response.blob();
            finalRenderImg.src = URL.createObjectURL(blob);
            
            renderLoading.classList.add('hidden');
            finalRenderImg.classList.remove('hidden');
            
            requestAnimationFrame(() => {
                finalRenderImg.classList.remove('scale-105');
                finalRenderImg.classList.add('scale-100');
            });

        } catch (error) {
            console.error(error);
            alert("Lỗi khi kết nối API HuggingFace! Vui lòng kiểm tra lại Token API hoặc do mạng.\nSẽ quay về ảnh mẫu.");
            // fallback to mock image and hide loading
            renderLoading.classList.add('hidden');
            finalRenderImg.src = mockImages.renders[currentStyle] || mockImages.renders.modern;
            finalRenderImg.classList.remove('hidden');
        } finally {
            // Restore button
            renderBtn.disabled = false;
            renderBtn.innerHTML = originalText;
            lucide.createIcons();
            downloadRenderBtn.classList.remove('hidden');
        }
        
    } else {
        // Fallback to Mock Data Simulation
        renderLoading.querySelector('p:last-child').innerText = 'Applying Modern style templates...';
        setTimeout(() => {
            renderLoading.classList.add('hidden');
            finalRenderImg.src = mockImages.renders[currentStyle] || mockImages.renders.modern;
            finalRenderImg.classList.remove('hidden');
            
            // Slight zoom out animation for reveal
            requestAnimationFrame(() => {
                finalRenderImg.classList.remove('scale-105');
                finalRenderImg.classList.add('scale-100');
            });

            // Restore button
            renderBtn.disabled = false;
            renderBtn.innerHTML = originalText;
            lucide.createIcons();
            downloadRenderBtn.classList.remove('hidden');
        }, 4500);
    }
});

// 6. Three.js Initialization (Procedural Mock 3D Room)
let scene, camera, renderer, controls;

function initThreeJS() {
    if (threeSceneStarted) return;
    threeSceneStarted = true;

    const canvas = document.getElementById('three-canvas');
    const container = document.getElementById('view-3d');

    scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0f18');
    
    // Add fog
    scene.fog = new THREE.FogExp2('#0a0f18', 0.02);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 15);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    
    const spotLight = new THREE.SpotLight(0x14b8a6, 2);
    spotLight.position.set(-5, 10, -5);
    spotLight.angle = Math.PI/4;
    scene.add(spotLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x14b8a6, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Procedurally Generate a "House" from the "CAD File"
    createBuildingMaterial();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    animate();
}

function createBuildingMaterial() {
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0 // Start invisible for animation
    });
    
    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 15);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create some walls forming rooms
    const walls = [];
    
    function addWall(w, h, d, x, y, z) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, wallMaterial.clone());
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        walls.push(mesh);
    }

    // Outer walls
    addWall(20, 3, 0.5, 0, 1.5, -7.25); // Back
    addWall(20, 3, 0.5, 0, 1.5, 7.25);  // Front
    addWall(0.5, 3, 14, -9.75, 1.5, 0); // Left
    addWall(0.5, 3, 14, 9.75, 1.5, 0);  // Right

    // Inner walls
    addWall(0.5, 3, 7, -3, 1.5, -3.5);
    addWall(6, 3, 0.5, -6.5, 1.5, 0);

    // Add some wireframe blocks representing furniture
    const furnitureGeo = new THREE.BoxGeometry(2, 1, 3);
    const furnitureMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6, wireframe: true, transparent: true, opacity: 0 });
    const sofa = new THREE.Mesh(furnitureGeo, furnitureMat);
    sofa.position.set(3, 0.5, 2);
    scene.add(sofa);
    walls.push(sofa);

    // Animate walls growing up (extrusion effect)
    walls.forEach((wall, index) => {
        wall.scale.y = 0.01;
        wall.position.y = 0;
        gsap.to(wall.scale, {
            y: 1,
            duration: 1.5,
            delay: index * 0.1,
            ease: "back.out(1.2)"
        });
        gsap.to(wall.position, {
            y: (wall.geometry.parameters.height || 1) / 2,
            duration: 1.5,
            delay: index * 0.1,
            ease: "back.out(1.2)"
        });
        gsap.to(wall.material, {
            opacity: wall.material.wireframe ? 0.8 : 0.9,
            duration: 1,
            delay: index * 0.1
        });
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 7. Download Logic
// Download Rendered Image
downloadRenderBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = finalRenderImg.src;
    link.download = `make3d-render-${currentStyle}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Download 3D Model (.GLB)
download3dBtn.addEventListener('click', () => {
    if (!scene) return;
    
    // Change button text temporarily
    const originalContent = download3dBtn.innerHTML;
    download3dBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Processing...';
    lucide.createIcons();
    
    const exporter = new THREE.GLTFExporter();
    exporter.parse(scene, function (gltf) {
        const blob = new Blob([gltf], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = 'make3d-model.glb';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Restore button
        download3dBtn.innerHTML = originalContent;
        lucide.createIcons();
    }, { binary: true });
});
