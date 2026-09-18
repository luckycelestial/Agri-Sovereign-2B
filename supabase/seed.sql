-- ==============================================================================
-- Agri-Sovereign / Uzhavan-Sahayak — Demo & Local Test Seed Data
-- ==============================================================================

-- 1. Create Demo Farmer (Standalone, not tied to auth user yet)
insert into public.farmers (id, name, phone, district, state, preferred_language)
values 
    ('11111111-1111-1111-1111-111111111111', 'முத்துசாமி (Muthusamy)', '+919842109876', 'Coimbatore', 'Tamil Nadu', 'ta'),
    ('22222222-2222-2222-2222-222222222222', 'செல்வராஜ் (Selvaraj)', '+919443322110', 'Thanjavur', 'Tamil Nadu', 'ta')
on conflict (id) do nothing;

-- 2. Create Demo Fields
insert into public.fields (id, farmer_id, name, district, area_acres, soil_type, soil_ph, irrigation_source)
values 
    ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'வடக்கு தோட்டம் (North Field)', 'Coimbatore', 4.5, 'செம்மண் (Red Loam)', 6.8, 'சொட்டு நீர்ப்பாசனம் (Drip)'),
    ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'தெற்கு தோட்டம் (South Field)', 'Coimbatore', 2.0, 'கரிசல் மண் (Black Cotton)', 7.4, 'வாய்க்கால் பாசனம் (Canal)'),
    ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'ஆற்றுப்படுகை நிலம் (Riverbank Field)', 'Thanjavur', 6.0, 'வண்டல் மண் (Alluvial)', 6.5, 'காவிரி பாசனம் (River Canal)')
on conflict (id) do nothing;

-- 3. Create Demo Crops
insert into public.crops (id, farmer_id, field_id, crop_name, variety, stage, health_status)
values
    ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'மக்காச்சோளம் (Maize)', 'CO 6', 'பூக்கும் பருவம் (Tasseling)', 'good'),
    ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'தக்காளி (Tomato)', 'Shivam', 'காய்க்கும் பருவம் (Fruiting)', 'stressed'),
    ('44444444-4444-4444-4444-444444444443', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'நெல் (Paddy)', 'CR 1009 Sub 1', 'தூர்கட்டும் பருவம் (Tillering)', 'good')
on conflict (id) do nothing;

-- 4. Create Authorized WhatsApp Contact for Muthusamy
insert into public.whatsapp_contacts (id, farmer_id, jid, display_name, is_authorized, authorized_at)
values 
    ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '919842109876@s.whatsapp.net', 'Muthusamy Farmer', true, now())
on conflict (jid) do update set is_authorized = true;
