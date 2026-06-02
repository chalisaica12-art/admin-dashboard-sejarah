// ============================================================
// KONFIGURASI SUPABASE — GANTI INI DENGAN MILIK KAMU
// Ambil dari: Supabase → Settings → API
// ============================================================

const SUPABASE_URL = 'https://aqemmcumctuxzmjtooxs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kaq_a9WJMDeCypJpOrZdZw_SX2Vg9Is';

// ============================================================
// Jangan ubah baris di bawah ini
// ============================================================
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);