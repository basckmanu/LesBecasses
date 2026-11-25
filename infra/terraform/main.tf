# Ressources Cloudflare du projet. À valider avec `terraform plan`
# (la syntaxe du provider v5 diffère de la v4).

# --- Stockage des MP3 / images ---
resource "cloudflare_r2_bucket" "media" {
  account_id = var.account_id
  name       = "podcast-media"
  location   = "WEUR"
}

# --- Base de données (épisodes, tags) ---
resource "cloudflare_d1_database" "main" {
  account_id = var.account_id
  name       = "podcast-db"
}


# TODO Infra :
# - domaine custom media.<domain> sur le bucket R2 + CORS (PUT, Content-Type)
# - Cloudflare Access sur /admin* et /api/admin/*
# - règles WAF : rate limiting sur /api/admin/*, Bot Fight Mode, cache /rss.xml
# - SPF / DKIM / DMARC
