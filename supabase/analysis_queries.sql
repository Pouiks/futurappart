-- 1. Top Résidences par Leads (Demandes envoyées) au cours des 30 derniers jours
SELECT 
  r.name as residence_name,
  count(*) as lead_count
FROM events e
JOIN canon_residences r ON e.residence_id = r.id
WHERE e.event_type = 'request_sent'
  AND e.created_at > now() - interval '30 days'
GROUP BY r.name
ORDER BY lead_count DESC
LIMIT 20;

-- 2. Taux de transformation : Recommendation -> Request (par résidence)
WITH stats AS (
  SELECT 
    residence_id,
    SUM(CASE WHEN event_type = 'recommendation_shown' THEN 1 ELSE 0 END) as impressions,
    SUM(CASE WHEN event_type = 'request_sent' THEN 1 ELSE 0 END) as leads
  FROM events
  WHERE created_at > now() - interval '30 days'
  GROUP BY residence_id
)
SELECT 
  r.name,
  s.impressions,
  s.leads,
  CASE WHEN s.impressions > 0 THEN ROUND((s.leads::numeric / s.impressions) * 100, 2) ELSE 0 END as conversion_rate_percent
FROM stats s
JOIN canon_residences r ON s.residence_id = r.id
WHERE s.impressions > 10 -- Filtre bruit
ORDER BY conversion_rate_percent DESC;

-- 3. Tension par ville (Recherches vs Leads)
SELECT 
  COALESCE(city, 'Inconnu') as city,
  SUM(CASE WHEN event_type = 'search_submitted' THEN 1 ELSE 0 END) as searches,
  SUM(CASE WHEN event_type = 'request_sent' THEN 1 ELSE 0 END) as leads
FROM events
WHERE created_at > now() - interval '30 days'
GROUP BY city
ORDER BY searches DESC;

-- 4. Top Résidences par Intention (CTA Clicked vs Sent)
SELECT 
  r.name,
  SUM(CASE WHEN event_type = 'cta_clicked' THEN 1 ELSE 0 END) as clicks,
  SUM(CASE WHEN event_type = 'request_sent' THEN 1 ELSE 0 END) as sent
FROM events e
JOIN canon_residences r ON e.residence_id = r.id
WHERE e.created_at > now() - interval '30 days'
GROUP BY r.name
ORDER BY clicks DESC;

-- 5. EXEMPLE DE FILTRAGE AVANCE (via la vue analytics_events_flat)
-- Question: "Combien de T1 ont été recommandés à Lyon ?"
/*
SELECT count(*) 
FROM analytics_events_flat 
WHERE event_type = 'recommendation_shown'
  AND city = 'lyon' 
  AND unit_typology = 'STUDIO'; 
*/

-- Question: "Quelles typologies performent le mieux pour la résidence Kley ?"
/*
SELECT unit_typology, count(*) as leads
FROM analytics_events_flat
WHERE residence_name LIKE 'Kley%'
  AND event_type = 'request_sent'
GROUP BY unit_typology
ORDER BY leads DESC;
*/
