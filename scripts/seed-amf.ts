/**
 * Script de seed AMF — importe toutes les questions des JSON dans Supabase.
 * Idempotent : utilise un upsert sur la clé primaire `id`.
 *
 * Usage :
 *   npx ts-node -e "require('./scripts/seed-amf.ts')"
 *   ou : npx tsx scripts/seed-amf.ts
 *
 * Requiert les variables d'environnement :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (pour bypasser RLS en écriture)
 */

import { createClient } from '@supabase/supabase-js'
import { ALL_AMF_QUESTIONS_LOCAL } from '../lib/amf/content'

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('❌  Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const questions = ALL_AMF_QUESTIONS_LOCAL

  console.log(`📦  ${questions.length} questions à upserter…`)

  // Traitement par lots de 100 pour ne pas dépasser les limites Supabase
  const BATCH_SIZE = 100
  let inserted = 0
  let errors = 0

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('amf_questions')
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: false })

    if (error) {
      console.error(`❌  Erreur lot ${i}-${i + batch.length} :`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      console.log(`✅  Lot ${i + 1}–${i + batch.length} : OK`)
    }
  }

  console.log(`\n📊  Résumé : ${inserted} questions upsertées, ${errors} erreurs`)

  if (errors > 0) {
    process.exit(1)
  }
}

seed().catch((e) => {
  console.error('Erreur fatale :', e)
  process.exit(1)
})
