output "d1_database_id" {
  description = "À reporter dans wrangler.toml"
  value       = cloudflare_d1_database.main.id
}
