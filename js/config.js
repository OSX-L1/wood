// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCAWVxXlTIzt9zvuCZADEVYi1xCtJ8hdcA",
    authDomain: "sunny1988-a4483.firebaseapp.com",
    projectId: "sunny1988-a4483",
    storageBucket: "sunny1988-a4483.firebasestorage.app",
    messagingSenderId: "436626327232",
    appId: "1:436626327232:web:b3b67dd892aff358624f25"
};

// --- GLOBAL VARIABLES ---
let db = null, auth = null;
let currentUser = null; 
let configListenerSet = false;
let tempQuotes = []; 
let currentEditingId = null; 
let currentEditingDocId = null; 
let tempConfig = null; 

// --- DEFAULT APP CONFIG ---
const DEFAULT_CONFIG = {
    appTitle: "SUNNY",
    theme: 'default',
    menus: [
        { id: 'WOOD', name: 'มู่ลี่ไม้', sub: '', icon: 'wood', active: true, bgImage: '' },
        { id: 'ALU', name: 'มู่ลี่อลูมิเนียม', sub: '25mm.', icon: 'alu', active: true, bgImage: '' },
        { id: 'PVC', name: 'ฉาก PVC', sub: '(ใบ 8.5/10 cm)', icon: 'pvc', active: true, bgImage: '' },
        { id: 'ROLLER', name: 'ม่านม้วน', sub: '', icon: 'roller', active: true, bgImage: '' }
    ],
    newsSettings: { speed: 3, showDate: true },
    newsItems: [],
    // UPDATED: เพิ่มการตั้งค่าราคาและสูตรสำหรับทุกหมวด (ยกเว้น Alu)
    calcSettings: { 
        enabled: true, 
        wood: {
            priceBasswood: 789,
            priceFoamwood: 750,
            factor: 1.2,
            minW: 0.80,
            minH: 1.00,
            maxW: 2.40
        },
        pvc: {
            factor: 1.2,
            minW: 1.00,
            stepStartH: 2.00
        },
        roller: { 
            fabricMult: 1.2, 
            minArea: 1.2, 
            eqExt: 1956, 
            railTop: 200, 
            railBot: 150, 
            sling: 69 
        } 
    },
    features: { experimental_mode: false }
};

let appConfig = DEFAULT_CONFIG;

// Load Config from LocalStorage (Fallback)
try {
    const saved = localStorage.getItem('sunny_app_config');
    if(saved) appConfig = JSON.parse(saved);
} catch(e) {
    console.error("Config corrupted, resetting:", e);
    localStorage.removeItem('sunny_app_config');
}

// Ensure defaults exist (Deep Merge)
if(!appConfig.calcSettings) appConfig.calcSettings = DEFAULT_CONFIG.calcSettings;
if(!appConfig.calcSettings.wood) appConfig.calcSettings.wood = DEFAULT_CONFIG.calcSettings.wood;
if(!appConfig.calcSettings.pvc) appConfig.calcSettings.pvc = DEFAULT_CONFIG.calcSettings.pvc;
if(!appConfig.calcSettings.roller) appConfig.calcSettings.roller = DEFAULT_CONFIG.calcSettings.roller;

if(!appConfig.theme) appConfig.theme = 'default';
if(!appConfig.features) appConfig.features = DEFAULT_CONFIG.features;

// --- INITIALIZATION FUNCTION ---
function initFirebase() {
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                console.log("Auth Status:", user.isAnonymous ? "Guest Mode" : "Member Mode (" + user.email + ")");
                
                if(typeof renderUserSidebar === 'function') renderUserSidebar(user);
                
                if (!configListenerSet) {
                    db.collection("app_settings").doc("config").onSnapshot((doc) => {
                        if (doc.exists) {
                            const newData = doc.data();
                            if(typeof checkAndNotifyNews === 'function') checkAndNotifyNews(newData.newsItems || []);
                            appConfig = newData;
                            
                            // Deep Merge Defaults incase new fields added
                            if(!appConfig.calcSettings) appConfig.calcSettings = DEFAULT_CONFIG.calcSettings;
                            if(!appConfig.calcSettings.wood) appConfig.calcSettings.wood = DEFAULT_CONFIG.calcSettings.wood;
                            if(!appConfig.calcSettings.pvc) appConfig.calcSettings.pvc = DEFAULT_CONFIG.calcSettings.pvc;
                            if(!appConfig.calcSettings.roller) appConfig.calcSettings.roller = DEFAULT_CONFIG.calcSettings.roller;

                            if(!appConfig.newsItems) appConfig.newsItems = [];
                            if(!appConfig.theme) appConfig.theme = 'default';
                            
                            localStorage.setItem('sunny_app_config', JSON.stringify(appConfig));
                            
                            if(typeof renderSidebar === 'function') renderSidebar(); 
                            if(typeof renderNews === 'function') renderNews(); 
                            if(typeof applyTheme === 'function') applyTheme(appConfig.theme);
                            if(currentSystem && typeof switchSystem === 'function') switchSystem(currentSystem);
                        } else { 
                            db.collection("app_settings").doc("config").set(appConfig); 
                        }
                    }, error => console.error("Config Listener Error:", error));
                    configListenerSet = true;
                }

            } else {
                console.log("No user, signing in anonymously...");
                auth.signInAnonymously().catch(e => console.error("Anon Auth Error:", e));
            }
        });
    } catch (e) { console.error("Firebase Init Error:", e); }
}
