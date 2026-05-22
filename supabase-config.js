(function() {
    if (window.supabase && window.supabase.auth) {
        console.log('Supabase уже загружен');
        return;
    }
    
    const SUPABASE_URL = 'https://siuhiudiwoouazmrdcxg.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWhpdWRpd29vdWF6bXJkY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjg1NjcsImV4cCI6MjA4NDc0NDU2N30.N2PAYsDYEUUcGUD-C4-sZ-Qht30u7omxktCoFECl588';
    
    try {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false
            },
            global: {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                }
            },
            db: {
                schema: 'public'
            }
        });
        
        window.supabase.auth.getSession().then(({ data }) => {
            console.log('✅ Supabase подключен. Сессия:', data.session ? 'есть' : 'нет');
        }).catch(error => {
            console.error('❌ Ошибка проверки сессии:', error);
        });
        
        console.log('✅ Supabase успешно инициализирован');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации Supabase:', error);
    }
})();