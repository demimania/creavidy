const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser() {
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'test2@creavidy.com',
        password: '123456',
        email_confirm: true
    });

    if (error) {
        console.error("Error creating user:", error.message);
    } else {
        console.log("User successfully created with ID:", data.user.id);
    }
}

createUser();
