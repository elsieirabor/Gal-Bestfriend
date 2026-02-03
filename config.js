/* ============================================
   SUPABASE CONFIGURATION
   ============================================ */

const SUPABASE_URL = 'https://oxvklcifwbsptpmxyqlv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dmtsY2lmd2JzcHRwbXh5cWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTc2NzksImV4cCI6MjA4NTczMzY3OX0.AJKz2FMrtOYy59DAkL0uS9NbQjVgMr-piiMphbzXBAc';

// Initialize Supabase client
// The UMD bundle exposes window.supabase with a createClient method
try {
    if (window.supabase && window.supabase.createClient) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully');
    } else {
        console.error('Supabase library not loaded. window.supabase:', window.supabase);
        window.supabaseClient = null;
    }
} catch (err) {
    console.error('Error initializing Supabase client:', err);
    window.supabaseClient = null;
}
