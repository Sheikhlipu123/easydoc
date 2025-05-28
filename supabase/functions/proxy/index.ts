import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key and check limits
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .single();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if key is active
    if (!keyData.active) {
      return new Response(
        JSON.stringify({ error: 'API key is inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check hourly limit
    const hourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: hourlyCount } = await supabase
      .from('api_usage')
      .select('id', { count: 'exact' })
      .eq('api_key_id', keyData.id)
      .gte('timestamp', hourAgo);

    if (hourlyCount >= keyData.hourly_limit) {
      return new Response(
        JSON.stringify({ error: 'Hourly limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check monthly limit
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString();
    const { count: monthlyCount } = await supabase
      .from('api_usage')
      .select('id', { count: 'exact' })
      .eq('api_key_id', keyData.id)
      .gte('timestamp', monthAgo);

    if (monthlyCount >= keyData.monthly_limit) {
      return new Response(
        JSON.stringify({ error: 'Monthly limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward the request to the actual API
    const startTime = Date.now();
    const apiResponse = await fetch('https://api.easydoc.sh' + new URL(req.url).pathname, {
      method: req.method,
      headers: {
        'Content-Type': req.headers.get('Content-Type') || 'application/json',
        'api-key': apiKey
      },
      body: req.body
    });

    // Log the API usage
    await supabase.from('api_usage').insert({
      api_key_id: keyData.id,
      endpoint: new URL(req.url).pathname,
      status_code: apiResponse.status,
      response_time: Date.now() - startTime
    });

    return new Response(
      await apiResponse.text(),
      {
        status: apiResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': apiResponse.headers.get('Content-Type') || 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});