const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== Testing Supabase Connection ===');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', anonKey?.substring(0, 30) + '...');
console.log('Service Key:', serviceKey?.substring(0, 30) + '...');
console.log('');

async function testConnection() {
  // Test 1: Service role key
  console.log('TEST 1: Service role key query...');
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Service role ERROR:', error);
    } else {
      console.log('✓ Service role SUCCESS! Found', data?.length || 0, 'records');
      if (data?.[0]) {
        console.log('  - ID:', data[0].id);
        console.log('  - Site title:', data[0].site_title);
      }
    }
  } catch (err) {
    console.error('❌ Service role EXCEPTION:', err.message);
  }

  console.log('');

  // Test 2: Anon key
  console.log('TEST 2: Anon key query...');
  try {
    const supabaseAnon = createClient(supabaseUrl, anonKey);
    const { data, error } = await supabaseAnon
      .from('admin_settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Anon key ERROR:', error);
    } else {
      console.log('✓ Anon key SUCCESS! Found', data?.length || 0, 'records');
    }
  } catch (err) {
    console.error('❌ Anon key EXCEPTION:', err.message);
  }

  console.log('');

  // Test 3: Check auth with service role
  console.log('TEST 3: Auth check with service role...');
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabaseAdmin.auth.getUser();
    
    if (error) {
      console.error('❌ Auth check ERROR:', error);
    } else {
      console.log('✓ Auth check result:', data);
    }
  } catch (err) {
    console.error('❌ Auth check EXCEPTION:', err.message);
  }
}

testConnection().then(() => {
  console.log('\n=== Tests Complete ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
