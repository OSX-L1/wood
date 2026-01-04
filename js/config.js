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
let currentUser = null; // Holds the logged in user object
let configListenerSet = false;
let tempQuotes = []; // Store loaded quotes for easy access
let currentEditingId = null; // ID for local storage edit
let currentEditingDocId = null; // Doc ID for firestore edit
let tempConfig = null; // For Admin editing

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
    calcSettings: { enabled: true, factors: { fabricMult: 1.2, minArea: 1.2, eqExt: 1956, railTop: 200, railBot: 150, sling: 69 } },
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

// Ensure defaults exist
if(!appConfig.calcSettings) appConfig.calcSettings = DEFAULT_CONFIG.calcSettings;
if(!appConfig.theme) appConfig.theme = 'default';
if(!appConfig.features) appConfig.features = DEFAULT_CONFIG.features;

// --- INITIALIZATION FUNCTION ---
function initFirebase() {
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // Listen to Auth State Changes
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                currentUser = user;
                console.log("Auth Status:", user.isAnonymous ? "Guest Mode" : "Member Mode (" + user.email + ")");
                
                // Update UI to show User Profile (Function in ui.js)
                if(typeof renderUserSidebar === 'function') renderUserSidebar(user);
                
                // Load App Config (Realtime)
                if (!configListenerSet) {
                    db.collection("app_settings").doc("config").onSnapshot((doc) => {
                        if (doc.exists) {
                            const newData = doc.data();
                            if(typeof checkAndNotifyNews === 'function') checkAndNotifyNews(newData.newsItems || []);
                            appConfig = newData;
                            
                            // Fallbacks
                            if(!appConfig.calcSettings) appConfig.calcSettings = DEFAULT_CONFIG.calcSettings;
                            if(!appConfig.newsItems) appConfig.newsItems = [];
                            if(!appConfig.theme) appConfig.theme = 'default';
                            
                            localStorage.setItem('sunny_app_config', JSON.stringify(appConfig));
                            
                            // Call UI updates if functions exist
                            if(typeof renderSidebar === 'function') renderSidebar(); 
                            if(typeof renderNews === 'function') renderNews(); 
                            if(typeof applyTheme === 'function') applyTheme(appConfig.theme);
                            if(currentSystem && typeof switchSystem === 'function') switchSystem(currentSystem);
                        } else { 
                            // Create default config if missing
                            db.collection("app_settings").doc("config").set(appConfig); 
                        }
                    }, error => console.error("Config Listener Error:", error));
                    configListenerSet = true;
                }

            } else {
                // No user, sign in anonymously
                console.log("No user, signing in anonymously...");
                auth.signInAnonymously().catch(e => console.error("Anon Auth Error:", e));
            }
        });
    } catch (e) { console.error("Firebase Init Error:", e); }
}
