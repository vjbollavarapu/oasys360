from django.apps import AppConfig


class MarketingFormsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'marketing_forms'
    verbose_name = 'Marketing Forms'
    
    def ready(self):
        # Import signal handlers if needed
        pass