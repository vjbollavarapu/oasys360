from django.apps import AppConfig


class TaxOptimizationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tax_optimization'
    verbose_name = 'Tax Optimization'

    def ready(self):
        import tax_optimization.signals  # noqa

