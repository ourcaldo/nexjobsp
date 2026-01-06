| table_schema | table_name                      | column_name                        | data_type                | is_nullable | column_default                  | ordinal_position |
| ------------ | ------------------------------- | ---------------------------------- | ------------------------ | ----------- | ------------------------------- | ---------------- |
| public       | admin_settings                  | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | admin_settings                  | site_title                         | text                     | YES         | null                            | 8                |
| public       | admin_settings                  | site_tagline                       | text                     | YES         | null                            | 9                |
| public       | admin_settings                  | site_description                   | text                     | YES         | null                            | 10               |
| public       | admin_settings                  | site_url                           | text                     | YES         | null                            | 11               |
| public       | admin_settings                  | ga_id                              | text                     | YES         | null                            | 12               |
| public       | admin_settings                  | gtm_id                             | text                     | YES         | null                            | 13               |
| public       | admin_settings                  | supabase_storage_endpoint          | text                     | YES         | null                            | 14               |
| public       | admin_settings                  | supabase_storage_region            | text                     | YES         | null                            | 15               |
| public       | admin_settings                  | supabase_storage_access_key        | text                     | YES         | null                            | 16               |
| public       | admin_settings                  | supabase_storage_secret_key        | text                     | YES         | null                            | 17               |
| public       | admin_settings                  | location_page_title_template       | text                     | YES         | null                            | 18               |
| public       | admin_settings                  | location_page_description_template | text                     | YES         | null                            | 19               |
| public       | admin_settings                  | category_page_title_template       | text                     | YES         | null                            | 20               |
| public       | admin_settings                  | category_page_description_template | text                     | YES         | null                            | 21               |
| public       | admin_settings                  | jobs_title                         | text                     | YES         | null                            | 22               |
| public       | admin_settings                  | jobs_description                   | text                     | YES         | null                            | 23               |
| public       | admin_settings                  | articles_title                     | text                     | YES         | null                            | 24               |
| public       | admin_settings                  | articles_description               | text                     | YES         | null                            | 25               |
| public       | admin_settings                  | login_page_title                   | text                     | YES         | null                            | 26               |
| public       | admin_settings                  | login_page_description             | text                     | YES         | null                            | 27               |
| public       | admin_settings                  | signup_page_title                  | text                     | YES         | null                            | 28               |
| public       | admin_settings                  | signup_page_description            | text                     | YES         | null                            | 29               |
| public       | admin_settings                  | profile_page_title                 | text                     | YES         | null                            | 30               |
| public       | admin_settings                  | profile_page_description           | text                     | YES         | null                            | 31               |
| public       | admin_settings                  | home_og_image                      | text                     | YES         | null                            | 32               |
| public       | admin_settings                  | jobs_og_image                      | text                     | YES         | null                            | 33               |
| public       | admin_settings                  | articles_og_image                  | text                     | YES         | null                            | 34               |
| public       | admin_settings                  | default_job_og_image               | text                     | YES         | null                            | 35               |
| public       | admin_settings                  | default_article_og_image           | text                     | YES         | null                            | 36               |
| public       | admin_settings                  | popup_ad_url                       | text                     | YES         | null                            | 37               |
| public       | admin_settings                  | popup_ad_enabled                   | boolean                  | YES         | false                           | 38               |
| public       | admin_settings                  | popup_ad_load_settings             | jsonb                    | YES         | '[]'::jsonb                     | 39               |
| public       | admin_settings                  | popup_ad_max_executions            | integer                  | YES         | 0                               | 40               |
| public       | admin_settings                  | popup_ad_device                    | text                     | YES         | 'All'::text                     | 41               |
| public       | admin_settings                  | sidebar_archive_ad_code            | text                     | YES         | null                            | 42               |
| public       | admin_settings                  | sidebar_single_ad_code             | text                     | YES         | null                            | 43               |
| public       | admin_settings                  | single_top_ad_code                 | text                     | YES         | null                            | 44               |
| public       | admin_settings                  | single_bottom_ad_code              | text                     | YES         | null                            | 45               |
| public       | admin_settings                  | single_middle_ad_code              | text                     | YES         | null                            | 46               |
| public       | admin_settings                  | sitemap_update_interval            | integer                  | YES         | 300                             | 47               |
| public       | admin_settings                  | auto_generate_sitemap              | boolean                  | YES         | true                            | 48               |
| public       | admin_settings                  | last_sitemap_update                | timestamp with time zone | YES         | null                            | 49               |
| public       | admin_settings                  | robots_txt                         | text                     | YES         | null                            | 50               |
| public       | admin_settings                  | created_at                         | timestamp with time zone | NO          | now()                           | 51               |
| public       | admin_settings                  | updated_at                         | timestamp with time zone | NO          | now()                           | 52               |
| public       | admin_settings                  | cms_endpoint                       | text                     | YES         | 'https://cms.nexjob.tech'::text | 53               |
| public       | admin_settings                  | cms_token                          | text                     | YES         | null                            | 54               |
| public       | admin_settings                  | cms_timeout                        | integer                  | YES         | 10000                           | 55               |
| public       | nxdb_article_categories         | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_article_categories         | name                               | text                     | NO          | null                            | 2                |
| public       | nxdb_article_categories         | slug                               | text                     | NO          | null                            | 3                |
| public       | nxdb_article_categories         | description                        | text                     | YES         | ''::text                        | 4                |
| public       | nxdb_article_categories         | created_at                         | timestamp with time zone | NO          | now()                           | 5                |
| public       | nxdb_article_categories         | updated_at                         | timestamp with time zone | NO          | now()                           | 6                |
| public       | nxdb_article_category_relations | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_article_category_relations | article_id                         | uuid                     | NO          | null                            | 2                |
| public       | nxdb_article_category_relations | category_id                        | uuid                     | NO          | null                            | 3                |
| public       | nxdb_article_category_relations | created_at                         | timestamp with time zone | NO          | now()                           | 4                |
| public       | nxdb_article_tag_relations      | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_article_tag_relations      | article_id                         | uuid                     | NO          | null                            | 2                |
| public       | nxdb_article_tag_relations      | tag_id                             | uuid                     | NO          | null                            | 3                |
| public       | nxdb_article_tag_relations      | created_at                         | timestamp with time zone | NO          | now()                           | 4                |
| public       | nxdb_article_tags               | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_article_tags               | name                               | text                     | NO          | null                            | 2                |
| public       | nxdb_article_tags               | slug                               | text                     | NO          | null                            | 3                |
| public       | nxdb_article_tags               | created_at                         | timestamp with time zone | NO          | now()                           | 4                |
| public       | nxdb_article_tags               | updated_at                         | timestamp with time zone | NO          | now()                           | 5                |
| public       | nxdb_articles                   | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_articles                   | title                              | text                     | NO          | null                            | 2                |
| public       | nxdb_articles                   | slug                               | text                     | NO          | null                            | 3                |
| public       | nxdb_articles                   | content                            | text                     | NO          | null                            | 4                |
| public       | nxdb_articles                   | excerpt                            | text                     | NO          | null                            | 5                |
| public       | nxdb_articles                   | status                             | text                     | NO          | 'draft'::text                   | 6                |
| public       | nxdb_articles                   | author_id                          | uuid                     | YES         | null                            | 7                |
| public       | nxdb_articles                   | featured_image                     | text                     | YES         | null                            | 8                |
| public       | nxdb_articles                   | seo_title                          | text                     | YES         | null                            | 9                |
| public       | nxdb_articles                   | meta_description                   | text                     | YES         | null                            | 10               |
| public       | nxdb_articles                   | schema_types                       | ARRAY                    | YES         | ARRAY[]::text[]                 | 11               |
| public       | nxdb_articles                   | post_date                          | timestamp with time zone | NO          | now()                           | 12               |
| public       | nxdb_articles                   | published_at                       | timestamp with time zone | YES         | null                            | 13               |
| public       | nxdb_articles                   | created_at                         | timestamp with time zone | NO          | now()                           | 14               |
| public       | nxdb_articles                   | updated_at                         | timestamp with time zone | NO          | now()                           | 15               |
| public       | nxdb_page_categories            | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_page_categories            | name                               | text                     | NO          | null                            | 2                |
| public       | nxdb_page_categories            | slug                               | text                     | NO          | null                            | 3                |
| public       | nxdb_page_categories            | description                        | text                     | YES         | ''::text                        | 4                |
| public       | nxdb_page_categories            | created_at                         | timestamp with time zone | NO          | now()                           | 5                |
| public       | nxdb_page_categories            | updated_at                         | timestamp with time zone | NO          | now()                           | 6                |
| public       | nxdb_page_category_relations    | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_page_category_relations    | page_id                            | uuid                     | NO          | null                            | 2                |
| public       | nxdb_page_category_relations    | category_id                        | uuid                     | NO          | null                            | 3                |
| public       | nxdb_page_category_relations    | created_at                         | timestamp with time zone | NO          | now()                           | 4                |
| public       | nxdb_page_tag_relations         | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_page_tag_relations         | page_id                            | uuid                     | NO          | null                            | 2                |
| public       | nxdb_page_tag_relations         | tag_id                             | uuid                     | NO          | null                            | 3                |
| public       | nxdb_page_tag_relations         | created_at                         | timestamp with time zone | NO          | now()                           | 4                |
| public       | nxdb_page_tags                  | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_page_tags                  | name                               | text                     | NO          | null                            | 2                |
| public       | nxdb_page_tags                  | slug                               | text                     | NO          | null                            | 3                |
| public       | nxdb_page_tags                  | created_at                         | timestamp with time zone | NO          | now()                           | 4                |
| public       | nxdb_page_tags                  | updated_at                         | timestamp with time zone | NO          | now()                           | 5                |
| public       | nxdb_pages                      | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | nxdb_pages                      | title                              | text                     | NO          | null                            | 2                |
| public       | nxdb_pages                      | slug                               | text                     | NO          | null                            | 3                |
| public       | nxdb_pages                      | content                            | text                     | NO          | null                            | 4                |
| public       | nxdb_pages                      | excerpt                            | text                     | NO          | null                            | 5                |
| public       | nxdb_pages                      | status                             | text                     | NO          | 'draft'::text                   | 6                |
| public       | nxdb_pages                      | author_id                          | uuid                     | YES         | null                            | 7                |
| public       | nxdb_pages                      | featured_image                     | text                     | YES         | null                            | 8                |
| public       | nxdb_pages                      | seo_title                          | text                     | YES         | null                            | 9                |
| public       | nxdb_pages                      | meta_description                   | text                     | YES         | null                            | 10               |
| public       | nxdb_pages                      | schema_types                       | ARRAY                    | YES         | ARRAY[]::text[]                 | 11               |
| public       | nxdb_pages                      | post_date                          | timestamp with time zone | NO          | now()                           | 12               |
| public       | nxdb_pages                      | published_at                       | timestamp with time zone | YES         | null                            | 13               |
| public       | nxdb_pages                      | created_at                         | timestamp with time zone | NO          | now()                           | 14               |
| public       | nxdb_pages                      | updated_at                         | timestamp with time zone | NO          | now()                           | 15               |
| public       | popup_templates                 | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | popup_templates                 | template_key                       | text                     | NO          | null                            | 2                |
| public       | popup_templates                 | title                              | text                     | NO          | null                            | 3                |
| public       | popup_templates                 | content                            | text                     | NO          | null                            | 4                |
| public       | popup_templates                 | button_text                        | text                     | NO          | null                            | 5                |
| public       | popup_templates                 | created_at                         | timestamp with time zone | NO          | now()                           | 6                |
| public       | popup_templates                 | updated_at                         | timestamp with time zone | NO          | now()                           | 7                |
| public       | profiles                        | id                                 | uuid                     | NO          | null                            | 1                |
| public       | profiles                        | email                              | text                     | NO          | null                            | 2                |
| public       | profiles                        | full_name                          | text                     | YES         | null                            | 3                |
| public       | profiles                        | phone                              | text                     | YES         | null                            | 4                |
| public       | profiles                        | birth_date                         | date                     | YES         | null                            | 5                |
| public       | profiles                        | gender                             | text                     | YES         | null                            | 6                |
| public       | profiles                        | location                           | text                     | YES         | null                            | 7                |
| public       | profiles                        | photo_url                          | text                     | YES         | null                            | 8                |
| public       | profiles                        | bio                                | text                     | YES         | null                            | 9                |
| public       | profiles                        | role                               | text                     | NO          | 'user'::text                    | 10               |
| public       | profiles                        | created_at                         | timestamp with time zone | NO          | now()                           | 11               |
| public       | profiles                        | updated_at                         | timestamp with time zone | NO          | now()                           | 12               |
| public       | user_bookmarks                  | id                                 | uuid                     | NO          | gen_random_uuid()               | 1                |
| public       | user_bookmarks                  | user_id                            | uuid                     | NO          | null                            | 2                |
| public       | user_bookmarks                  | job_id                             | text                     | NO          | null                            | 3                |
| public       | user_bookmarks                  | created_at                         | timestamp with time zone | NO          | now()                           | 4                |